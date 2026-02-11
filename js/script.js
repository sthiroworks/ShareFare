// DOM bindings
const fields = {
  distance: document.getElementById("distance"),
  fuelPrice: document.getElementById("fuel-price"),
  fuelEfficiency: document.getElementById("fuel-efficiency"),
  fuelCost: document.getElementById("fuel-cost"),
  tollCost: document.getElementById("toll-cost"),
  parkingCost: document.getElementById("parking-cost"),
  otherCost: document.getElementById("other-cost"),
  nonFuelCost: document.getElementById("non-fuel-cost"),
  totalCost: document.getElementById("total-cost"),
  peopleCount: document.getElementById("people-count"),
  perPersonCost: document.getElementById("per-person-cost")
};

// Default values for calculations
const defaults = {
  distance: 100,
  fuelPrice: 150,
  fuelEfficiency: 10,
  fuelCost: 0,
  tollCost: 1000,
  parkingCost: 0,
  otherCost: 0,
  nonFuelCost: 0,
  totalCost: 0,
  peopleCount: 4,
  perPersonCost: 0
};

// Minimum input constraints
const minValues = {
  fuelEfficiency: 1.0,
  peopleCount: 1
};

// Values used by the clear action
const clearValues = {
  distance: "0",
  fuelEfficiency: "1.0",
  fuelPrice: "0",
  tollCost: "0",
  parkingCost: "0",
  otherCost: "0",
  peopleCount: "1"
};

// Read-only outputs
const outputFields = ["fuelCost", "nonFuelCost", "totalCost", "perPersonCost"];

// Safe number parse with fallback
const toNumber = (input, fallback) => {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
};

// Lower-bound clamp
const clampMin = (value, min) => (value < min ? min : value);

// Set field value with consistent string conversion
const setFieldValue = (fieldKey, value) => {
  fields[fieldKey].value = String(value);
};

// Enforce min and sync input UI
const normalizeMin = (fieldKey, value, min) => {
  const normalized = clampMin(value, min);
  if (fields[fieldKey].value !== String(normalized)) {
    fields[fieldKey].value = String(normalized);
  }
  return normalized;
};

// Decimal rounding helper
const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// Normalize by input step (supports decimal steps)
const normalizeByStep = (input, value) => {
  const step = Number(input.step);
  if (Number.isFinite(step) && step > 0 && step < 1) {
    const decimals = String(step).split(".")[1]?.length || 1;
    return roundTo(value, decimals);
  }
  return Math.round(value);
};

// Main calculation pipeline
const updateTotals = () => {
  const distance = toNumber(fields.distance, defaults.distance);
  const fuelPrice = toNumber(fields.fuelPrice, defaults.fuelPrice);
  let fuelEfficiency = toNumber(fields.fuelEfficiency, defaults.fuelEfficiency);
  const tollCost = toNumber(fields.tollCost, defaults.tollCost);
  const parkingCost = toNumber(fields.parkingCost, defaults.parkingCost);
  const otherCost = toNumber(fields.otherCost, defaults.otherCost);
  let peopleCount = toNumber(fields.peopleCount, defaults.peopleCount);

  fuelEfficiency = normalizeMin(
    "fuelEfficiency",
    fuelEfficiency,
    minValues.fuelEfficiency
  );
  peopleCount = normalizeMin("peopleCount", peopleCount, minValues.peopleCount);

  const fuelCost = Math.round((distance / fuelEfficiency) * fuelPrice);
  const nonFuelCost = tollCost + parkingCost + otherCost;
  const totalCost = fuelCost + nonFuelCost;
  const perPersonCost = Math.round(totalCost / peopleCount);

  setFieldValue("fuelCost", fuelCost);
  setFieldValue("nonFuelCost", nonFuelCost);
  setFieldValue("totalCost", totalCost);
  setFieldValue("perPersonCost", perPersonCost);
};

// Step adjust buttons
const adjustField = (targetId, delta) => {
  const input = document.getElementById(targetId);
  if (!input) return;

  const min = input.min ? Number(input.min) : -Infinity;
  const current = toNumber(input, 0);
  const next = clampMin(current + delta, min);
  input.value = String(normalizeByStep(input, next));
  updateTotals();
};

// Sample preset
const applySample = () => {
  setFieldValue("distance", "500");
  setFieldValue("fuelEfficiency", "11.5");
  setFieldValue("fuelPrice", "129");
  setFieldValue("parkingCost", "1000");
  setFieldValue("tollCost", "7000");
  setFieldValue("otherCost", "100");
  setFieldValue("peopleCount", "4");
  updateTotals();
};

// Clear to minimums/zeros
const applyClear = () => {
  Object.entries(clearValues).forEach(([fieldKey, value]) => {
    setFieldValue(fieldKey, value);
  });
  outputFields.forEach((fieldKey) => {
    setFieldValue(fieldKey, "0");
  });
};

// Wiring
document.addEventListener("DOMContentLoaded", () => {
  // 計算関係のマッピング（出力 -> 入力）
  const dependencyMap = {
    fuelCost: ["distance", "fuelPrice", "fuelEfficiency"],
    nonFuelCost: ["tollCost", "parkingCost", "otherCost"],
    totalCost: ["fuelCost", "nonFuelCost"],
    perPersonCost: ["totalCost", "peopleCount"]
  };

  // 逆マッピング（入力 -> 出力）
  const reverseDependencyMap = {};
  Object.entries(dependencyMap).forEach(([output, inputs]) => {
    inputs.forEach((input) => {
      if (!reverseDependencyMap[input]) {
        reverseDependencyMap[input] = [];
      }
      reverseDependencyMap[input].push(output);
    });
  });

  // ホバーでハイライト
  const setupHighlight = () => {
    Object.entries(fields).forEach(([fieldId, element]) => {
      // 出力フィールドのホバー
      if (element.readOnly && dependencyMap[fieldId]) {
        element.addEventListener("mouseenter", () => {
          dependencyMap[fieldId].forEach((inputId) => {
            fields[inputId]?.classList.add("calc_input--active");
          });
        });
        element.addEventListener("mouseleave", () => {
          dependencyMap[fieldId].forEach((inputId) => {
            fields[inputId]?.classList.remove("calc_input--active");
          });
        });
      }

      // 入力フィールドのホバー
      if (!element.readOnly && reverseDependencyMap[fieldId]) {
        element.addEventListener("mouseenter", () => {
          reverseDependencyMap[fieldId].forEach((outputId) => {
            fields[outputId]?.classList.add("calc_input--active");
          });
        });
        element.addEventListener("mouseleave", () => {
          reverseDependencyMap[fieldId].forEach((outputId) => {
            fields[outputId]?.classList.remove("calc_input--active");
          });
        });
      }
    });
  };

  document.querySelectorAll(".calc_input").forEach((input) => {
    if (input.readOnly) return;
    input.addEventListener("input", updateTotals);
  });

  document.querySelectorAll("[data-delta]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      const delta = Number(button.dataset.delta);
      if (!target || !Number.isFinite(delta)) return;
      adjustField(target, delta);
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "sample") {
        applySample();
        return;
      }
      if (action === "clear") {
        applyClear();
        updateTotals();
      }
    });
  });

  setupHighlight();
  updateTotals();
});
