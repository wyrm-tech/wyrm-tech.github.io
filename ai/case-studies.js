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
    const previewUnit = study.querySelector("[data-roi-preview-unit]");
    const previewPeriod = study.querySelector("[data-roi-preview-period]");
    const previewRoi = study.querySelector("[data-roi-preview-roi]");
    const previewRoiValue = study.querySelector("[data-roi-preview-roi-value]");
    const equation = calculator.querySelector("[data-roi-equation]");
    const status = calculator.querySelector("[data-roi-status]");
    const salesDescription = calculator.querySelector("[data-roi-sales-description]");
    const reset = calculator.querySelector(".roi-reset");
    const model = calculator.dataset.roiModel || "time";

    const read = (input) => {
      const value = input.valueAsNumber;
      const valid = Number.isFinite(value) && value >= 0 && input.validity.valid;
      const hasInput = input.value !== "" || input.validity.badInput;
      input.setAttribute("aria-invalid", String(hasInput && !valid));
      return valid ? value : null;
    };

    const render = () => {
      const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, read(input)]));
      const { volume, minutes, rate, baseRate, targetRate, closeRate, avgSale, margin, monthlyCost, setupCost } = values;
      const revenueModel = model === "conversion" || model === "new-leads";
      const assumptionKeys = model === "conversion" ? ["volume", "baseRate", "targetRate", "avgSale", "margin"] : model === "new-leads" ? ["volume", "closeRate", "avgSale", "margin"] : ["volume", "minutes", "rate"];
      previewLabel.textContent = revenueModel ? "Illustrative added revenue" : "Projected time value";
      previewUnit.textContent = " / month";
      previewPeriod.textContent = revenueModel ? "before project costs" : "before costs";
      if (previewRoi) previewRoi.hidden = true;
      outputs.netValue.textContent = "—";
      outputs.roi.textContent = "—";

      if (assumptionKeys.some((key) => values[key] === null)) {
        Object.values(outputs).forEach((output) => {
          output.textContent = "—";
        });
        preview.textContent = "—";
        previewUnit.textContent = "";
        previewPeriod.textContent = "";
        equation.textContent = revenueModel ? "Complete the sales assumptions to calculate an estimate." : "Complete the three time-savings fields to calculate an estimate.";
        status.textContent = revenueModel ? "Use valid amounts in the sales assumptions. Rates and margin must be between 0% and 100%." : "Use valid, non-negative amounts in the time-savings fields.";
        return;
      }

      let annualBenefit;
      if (revenueModel) {
        const salesCount = model === "conversion" ? volume * ((targetRate - baseRate) / 100) : volume * (closeRate / 100);
        const monthlyRevenue = salesCount * avgSale;
        const annualRevenue = monthlyRevenue * 12;
        annualBenefit = annualRevenue * (margin / 100);
        outputs.salesCount.textContent = number.format(Math.abs(salesCount));
        salesDescription.textContent = `${salesCount < 0 ? "fewer" : "additional"} ${calculator.dataset.unit}`;
        outputs.monthlyRevenue.textContent = currency.format(monthlyRevenue);
        outputs.annualRevenue.textContent = currency.format(annualRevenue);
        outputs.annualProfit.textContent = currency.format(annualBenefit);
        previewLabel.textContent = monthlyRevenue < 0 ? "Illustrative revenue change" : "Illustrative added revenue";
        preview.textContent = currency.format(monthlyRevenue);
        equation.textContent = model === "conversion"
          ? `${number.format(volume)} ${calculator.dataset.sourceUnit} × (${number.format(targetRate)}% − ${number.format(baseRate)}%) × ${currency.format(avgSale)} per ${calculator.dataset.saleUnit} = ${currency.format(monthlyRevenue)} / month in revenue change.`
          : `${number.format(volume)} additional qualified inquiries × ${number.format(closeRate)}% inquiry-to-sale rate × ${currency.format(avgSale)} first sale = ${currency.format(monthlyRevenue)} / month in added revenue.`;
      } else {
        // Value net time saved after human review. Costs are counted once over a full year.
        const monthlyHours = (volume * minutes) / 60;
        const monthlyValue = monthlyHours * rate;
        annualBenefit = monthlyValue * 12;
        outputs.hours.textContent = monthlyHours > 0 && monthlyHours < 0.1 ? "<0.1" : hours.format(monthlyHours);
        outputs.monthlyValue.textContent = currency.format(monthlyValue);
        outputs.annualValue.textContent = currency.format(annualBenefit);
        preview.textContent = currency.format(monthlyValue);
        equation.textContent = `${number.format(volume)} ${calculator.dataset.unit} × ${number.format(minutes)} minutes ÷ 60 × ${currency.format(rate)} per hour = ${currency.format(monthlyValue)} / month in time value.`;
      }

      if ([monthlyCost, setupCost].includes(null)) {
        status.textContent = revenueModel ? "Enter both costs as $0 or more to see net contribution and ROI." : "Enter both costs as $0 or more to see net value and ROI.";
        return;
      }

      const annualCost = monthlyCost * 12 + setupCost;
      const netValue = annualBenefit - annualCost;
      outputs.netValue.textContent = currency.format(netValue);

      if (annualCost === 0) {
        outputs.roi.textContent = "Not defined";
        if (revenueModel) {
          previewRoi.hidden = false;
          previewRoiValue.textContent = "Not defined";
        } else {
          previewLabel.textContent = "Projected ROI";
          preview.textContent = "Not defined";
          previewUnit.textContent = "";
          previewPeriod.textContent = "";
        }
        status.textContent = `ROI needs a total cost greater than $0. ${revenueModel ? "Net contribution" : "Net value"} above uses the costs you entered.`;
        return;
      }

      outputs.roi.textContent = `${percent.format((netValue / annualCost) * 100)}%`;
      if (revenueModel) {
        previewRoi.hidden = false;
        previewRoiValue.textContent = outputs.roi.textContent;
        status.textContent = `ROI uses estimated gross profit after ${currency.format(annualCost)} in year-one project costs. Sales and margin may differ from this example.`;
      } else {
        previewLabel.textContent = "Projected ROI";
        preview.textContent = outputs.roi.textContent;
        previewUnit.textContent = "";
        previewPeriod.textContent = " in year one";
        status.textContent =
          netValue < 0
            ? `With ${currency.format(annualCost)} in year-one costs, the modeled time value does not cover the investment.`
            : `After ${currency.format(annualCost)} in year-one costs. ROI values freed capacity; it does not guarantee cash savings.`;
      }
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
