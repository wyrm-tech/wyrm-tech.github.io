(() => {
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const hours = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
  const percent = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

  document.querySelectorAll("[data-roi]").forEach((calculator) => {
    const fields = Object.fromEntries([...calculator.querySelectorAll("[data-roi-input]")].map((input) => [input.dataset.roiInput, input]));
    const outputs = Object.fromEntries([...calculator.querySelectorAll("[data-roi-output]")].map((output) => [output.dataset.roiOutput, output]));
    const study = calculator.closest(".case-study");
    const preview = study.querySelector("[data-roi-preview]");
    const previewLabel = study.querySelector("[data-roi-preview-label]");
    const equation = calculator.querySelector("[data-roi-equation]");
    const status = calculator.querySelector("[data-roi-status]");
    const reset = calculator.querySelector(".roi-reset");

    const read = (input) => {
      const value = input.valueAsNumber;
      const valid = Number.isFinite(value) && value >= 0 && input.validity.valid;
      const hasInput = input.value !== "" || input.validity.badInput;
      input.setAttribute("aria-invalid", String(hasInput && !valid));
      return valid ? value : null;
    };

    const render = () => {
      const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, read(input)]));
      const { volume, minutes, rate, monthlyCost, setupCost } = values;
      previewLabel.textContent = "Projected ROI";
      outputs.netValue.textContent = "—";
      outputs.roi.textContent = "—";

      if ([volume, minutes, rate].includes(null)) {
        Object.values(outputs).forEach((output) => {
          output.textContent = "—";
        });
        preview.textContent = "—";
        equation.textContent = "Complete the three time-savings fields to calculate an estimate.";
        status.textContent = "Use valid, non-negative amounts in the time-savings fields.";
        return;
      }

      // Value net time saved after human review. Costs are counted once over a full year.
      const monthlyHours = (volume * minutes) / 60;
      const monthlyValue = monthlyHours * rate;
      const annualValue = monthlyValue * 12;
      outputs.hours.textContent = monthlyHours > 0 && monthlyHours < 0.1 ? "<0.1" : hours.format(monthlyHours);
      outputs.monthlyValue.textContent = currency.format(monthlyValue);
      outputs.annualValue.textContent = currency.format(annualValue);
      preview.textContent = currency.format(monthlyValue);
      equation.textContent = `${number.format(volume)} ${calculator.dataset.unit} × ${number.format(minutes)} minutes ÷ 60 × ${currency.format(rate)} per hour = ${currency.format(monthlyValue)} / month in time value.`;

      if ([monthlyCost, setupCost].includes(null)) {
        status.textContent = "Enter both costs as $0 or more to see net value and ROI.";
        return;
      }

      const annualCost = monthlyCost * 12 + setupCost;
      const netValue = annualValue - annualCost;
      outputs.netValue.textContent = currency.format(netValue);

      if (annualCost === 0) {
        outputs.roi.textContent = "Not defined";
        status.textContent = "ROI needs a total cost greater than $0. Net value above uses the costs you entered.";
        return;
      }

      outputs.roi.textContent = `${percent.format((netValue / annualCost) * 100)}%`;
      status.textContent =
        netValue < 0
          ? `With ${currency.format(annualCost)} in year-one costs, the modeled time value does not cover the investment.`
          : `After ${currency.format(annualCost)} in year-one costs. ROI values freed capacity; it does not guarantee cash savings.`;
    };

    calculator.querySelectorAll("fieldset").forEach((fieldset) => {
      fieldset.disabled = false;
    });
    reset.hidden = false;
    calculator.addEventListener("input", render);
    reset.addEventListener("click", () => {
      Object.values(fields).forEach((input) => {
        input.value = input.defaultValue;
      });
      render();
    });
    render();
  });
})();
