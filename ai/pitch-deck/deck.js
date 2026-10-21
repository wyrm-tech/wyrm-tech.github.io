(() => {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const chapterLinks = Array.from(document.querySelectorAll(".deck-sidebar nav a"));
  const previous = document.getElementById("previous-slide");
  const next = document.getElementById("next-slide");
  const notes = document.getElementById("presenter-notes");
  const notesToggle = document.getElementById("notes-toggle");
  const viewToggle = document.getElementById("view-toggle");
  const fullscreenToggle = document.getElementById("fullscreen-toggle");
  const seatInput = document.getElementById("guild-seats");
  const billingInput = document.getElementById("guild-billing");
  let currentIndex = Math.max(0, slides.findIndex((slide) => `#${slide.id}` === window.location.hash));
  let readAll = false;

  function renderSlide({ moveFocus = false, scroll = false } = {}) {
    slides.forEach((slide, index) => { slide.hidden = !readAll && index !== currentIndex; });
    chapterLinks.forEach((link, index) => {
      if (index === currentIndex) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === slides.length - 1;
    const number = String(currentIndex + 1).padStart(2, "0");
    const status = document.getElementById("slide-status");
    status.replaceChildren(document.createTextNode(`${number} / ${slides.length} `));
    const title = document.createElement("span");
    title.textContent = slides[currentIndex].dataset.title;
    status.append(title);
    document.getElementById("deck-progress").style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    const points = slides[currentIndex].querySelector(".talking-points").content.cloneNode(true);
    document.getElementById("notes-content").replaceChildren(points);
    if (moveFocus) {
      const heading = slides[currentIndex].querySelector("h1, h2");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    if (scroll) {
      if (readAll) slides[currentIndex].scrollIntoView({ block: "start", behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(slides.length - 1, index));
    history.pushState(null, "", `#${slides[currentIndex].id}`);
    renderSlide({ moveFocus: true, scroll: true });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const index = slides.findIndex((slide) => `#${slide.id}` === link.getAttribute("href"));
    if (index < 0) return;
    event.preventDefault();
    goTo(index);
  });
  previous.addEventListener("click", () => goTo(currentIndex - 1));
  next.addEventListener("click", () => goTo(currentIndex + 1));
  window.addEventListener("hashchange", () => {
    const index = slides.findIndex((slide) => `#${slide.id}` === location.hash);
    if (index >= 0) { currentIndex = index; renderSlide({ moveFocus: true, scroll: true }); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !notes.hidden) { setNotes(false); notesToggle.focus(); return; }
    if (event.ctrlKey || event.metaKey || event.altKey || readAll || event.target.closest("input, select, textarea, button, a, [contenteditable=true]")) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); goTo(currentIndex + 1); }
    if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); goTo(currentIndex - 1); }
    if (event.key === "Home") { event.preventDefault(); goTo(0); }
    if (event.key === "End") { event.preventDefault(); goTo(slides.length - 1); }
  });

  function setNotes(show) {
    notes.hidden = !show;
    notesToggle.setAttribute("aria-pressed", String(show));
  }
  notesToggle.addEventListener("click", () => setNotes(notes.hidden));
  document.getElementById("notes-close").addEventListener("click", () => { setNotes(false); notesToggle.focus(); });
  viewToggle.addEventListener("click", () => {
    readAll = !readAll;
    document.body.classList.toggle("read-all", readAll);
    viewToggle.setAttribute("aria-pressed", String(readAll));
    viewToggle.textContent = readAll ? "Slide view" : "Read all";
    renderSlide({ scroll: true });
  });
  // In reading mode, keep chapter navigation and talking points with the visible slide.
  let scrollQueued = false;
  window.addEventListener("scroll", () => {
    if (!readAll || scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const focusLine = window.innerHeight * 0.35;
      const index = slides.findIndex((slide) => {
        const bounds = slide.getBoundingClientRect();
        return bounds.top <= focusLine && bounds.bottom > focusLine;
      });
      if (index >= 0 && index !== currentIndex) {
        currentIndex = index;
        history.replaceState(null, "", `#${slides[currentIndex].id}`);
        renderSlide();
      }
    });
  }, { passive: true });

  fullscreenToggle.hidden = !document.fullscreenEnabled;
  fullscreenToggle.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      document.getElementById("deck-message").textContent = "Full screen is unavailable in this browser. You can continue using the slide controls.";
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const active = Boolean(document.fullscreenElement);
    fullscreenToggle.setAttribute("aria-pressed", String(active));
    fullscreenToggle.textContent = active ? "Exit full screen ⤢" : "Full screen ⤢";
  });
  document.getElementById("print-deck").addEventListener("click", () => window.print());

  // Pricing snapshot verified against Stripe on 2026-10-21. Volume tiers apply
  // the selected per-seat rate to every seat. Annual prices are 10× monthly.
  const guildPrices = {
    essential: [100, 95, 90, 85, 80, 75],
    select: [300, 285, 270, 255, 240, 225],
    signature: [1000, 950, 900, 850, 800, 750],
  };
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  function updateGuild() {
    const seats = Number(seatInput.value);
    if (!Number.isInteger(seats) || seats < 3 || seats > 99) {
      seatInput.setAttribute("aria-invalid", "true");
      document.getElementById("guild-tier").textContent = "Enter a whole number from 3 to 99.";
      document.querySelectorAll("[data-guild-plan]").forEach((plan) => {
        plan.querySelector("[data-total]").textContent = "—";
        plan.querySelector("[data-interval]").textContent = "";
        plan.querySelector("[data-per-seat]").textContent = "Enter 3–99 people to see pricing.";
        plan.querySelector("[data-savings]").textContent = "";
      });
      return;
    }
    seatInput.removeAttribute("aria-invalid");
    const tier = Math.min(5, Math.floor((seats - 1) / 3));
    const yearly = billingInput.value === "year";
    const interval = yearly ? "year" : "month";
    const multiplier = yearly ? 10 : 1;
    document.getElementById("seat-minus").disabled = seats <= 3;
    document.getElementById("seat-plus").disabled = seats >= 99;
    document.getElementById("guild-tier").textContent = `${seats} seats · ${tier ? `${tier * 5}% lower per-person rate` : "base rate"}`;
    document.querySelectorAll("[data-guild-plan]").forEach((plan) => {
      const perSeat = guildPrices[plan.dataset.guildPlan][tier];
      const monthly = perSeat * seats;
      plan.querySelector("[data-total]").textContent = money.format(monthly * multiplier);
      plan.querySelector("[data-interval]").textContent = ` / ${interval}`;
      plan.querySelector("[data-per-seat]").textContent = `${money.format(perSeat * multiplier)} per person / ${interval} · ${seats} people`;
      plan.querySelector("[data-savings]").textContent = yearly
        ? `Billed yearly · save ${money.format(monthly * 2)}/year vs monthly`
        : `${money.format(monthly * 10)} billed yearly · save ${money.format(monthly * 2)}/year`;
    });
  }
  seatInput.addEventListener("input", updateGuild);
  function normalizeSeats() {
    const number = Number(seatInput.value);
    seatInput.value = String(Math.max(3, Math.min(99, Number.isFinite(number) ? Math.round(number) : 3)));
    updateGuild();
  }
  seatInput.addEventListener("change", normalizeSeats);
  seatInput.addEventListener("blur", normalizeSeats);
  document.getElementById("seat-minus").addEventListener("click", () => { seatInput.value = String(Math.max(3, (Number(seatInput.value) || 3) - 1)); updateGuild(); });
  document.getElementById("seat-plus").addEventListener("click", () => { seatInput.value = String(Math.min(99, (Number(seatInput.value) || 3) + 1)); updateGuild(); });
  billingInput.addEventListener("change", updateGuild);

  document.body.classList.add("presentation-mode");
  document.querySelector(".deck-tools").hidden = false;
  document.querySelector(".deck-footer").hidden = false;
  document.getElementById("guild-controls").hidden = false;
  updateGuild();
  renderSlide();
})();
