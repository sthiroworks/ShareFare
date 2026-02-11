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

const defaults = {
  distance: 0,
  fuelPrice: 0,
  fuelEfficiency: 0.1,
  fuelCost: 0,
  tollCost: 0,
  parkingCost: 0,
  otherCost: 0,
  nonFuelCost: 0,
  totalCost: 0,
  peopleCount: 1,
  perPersonCost: 0
};

const toNumber = (input, fallback) => {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
};

const clampMin = (value, min) => (value < min ? min : value);

const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const normalizeByStep = (input, value) => {
  const step = Number(input.step);
  if (Number.isFinite(step) && step > 0 && step < 1) {
    const decimals = String(step).split(".")[1]?.length || 1;
    return roundTo(value, decimals);
  }
  return Math.round(value);
};

const updateTotals = () => {
  const distance = toNumber(fields.distance, defaults.distance);
  const fuelPrice = toNumber(fields.fuelPrice, defaults.fuelPrice);
  let fuelEfficiency = toNumber(fields.fuelEfficiency, defaults.fuelEfficiency);
  const tollCost = toNumber(fields.tollCost, defaults.tollCost);
  const parkingCost = toNumber(fields.parkingCost, defaults.parkingCost);
  const otherCost = toNumber(fields.otherCost, defaults.otherCost);
  let peopleCount = toNumber(fields.peopleCount, defaults.peopleCount);

  fuelEfficiency = clampMin(fuelEfficiency, defaults.fuelEfficiency);
  peopleCount = clampMin(peopleCount, defaults.peopleCount);

  if (fields.fuelEfficiency.value !== String(fuelEfficiency)) {
    fields.fuelEfficiency.value = String(fuelEfficiency);
  }

  if (fields.peopleCount.value !== String(peopleCount)) {
    fields.peopleCount.value = String(peopleCount);
  }

  const fuelCost = Math.round((distance / fuelEfficiency) * fuelPrice);
  const nonFuelCost = tollCost + parkingCost + otherCost;
  const totalCost = fuelCost + nonFuelCost;
  const perPersonCost = Math.round(totalCost / peopleCount);

  fields.fuelCost.value = String(fuelCost);
  fields.nonFuelCost.value = String(nonFuelCost);
  fields.totalCost.value = String(totalCost);
  fields.perPersonCost.value = String(perPersonCost);
};

const adjustField = (targetId, delta) => {
  const input = document.getElementById(targetId);
  if (!input) return;

  const min = input.min ? Number(input.min) : -Infinity;
  const current = toNumber(input, 0);
  const next = clampMin(current + delta, min);
  input.value = String(normalizeByStep(input, next));
  updateTotals();
};

const applySample = () => {
  fields.distance.value = "500";
  fields.fuelEfficiency.value = "11.5";
  fields.fuelPrice.value = "129";
  fields.parkingCost.value = "1000";
  fields.tollCost.value = "7000";
  fields.otherCost.value = "100";
  fields.peopleCount.value = "4";
  updateTotals();
};

const applyClear = () => {
  fields.distance.value = String(defaults.distance);
  fields.fuelEfficiency.value = String(defaults.fuelEfficiency);
  fields.fuelPrice.value = String(defaults.fuelPrice);
  fields.fuelCost.value = String(defaults.fuelCost);
  fields.parkingCost.value = String(defaults.parkingCost);
  fields.tollCost.value = String(defaults.tollCost);
  fields.otherCost.value = String(defaults.otherCost);
  fields.nonFuelCost.value = String(defaults.nonFuelCost);
  fields.peopleCount.value = String(defaults.peopleCount);
  fields.totalCost.value = String(defaults.totalCost);
  fields.perPersonCost.value = String(defaults.perPersonCost);
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".calc__input").forEach((input) => {
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

  updateTotals();
});
