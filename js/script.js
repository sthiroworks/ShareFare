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

// Breakdown chart bindings
const breakdown = {
  fuelFill: document.getElementById("breakdown-fuel-fill"),
  fuelValue: document.getElementById("breakdown-fuel-value"),
  fuelPercent: document.getElementById("breakdown-fuel-percent"),
  tollFill: document.getElementById("breakdown-toll-fill"),
  tollValue: document.getElementById("breakdown-toll-value"),
  tollPercent: document.getElementById("breakdown-toll-percent"),
  parkingFill: document.getElementById("breakdown-parking-fill"),
  parkingValue: document.getElementById("breakdown-parking-value"),
  parkingPercent: document.getElementById("breakdown-parking-percent"),
  otherFill: document.getElementById("breakdown-other-fill"),
  otherValue: document.getElementById("breakdown-other-value"),
  otherPercent: document.getElementById("breakdown-other-percent")
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

const updateBreakdown = (items, total) => {
  if (!breakdown.fuelFill) return;
  const safeTotal = total > 0 ? total : 0;
  const entries = [
    {
      value: items.fuel,
      fill: breakdown.fuelFill,
      label: breakdown.fuelValue,
      percent: breakdown.fuelPercent
    },
    {
      value: items.toll,
      fill: breakdown.tollFill,
      label: breakdown.tollValue,
      percent: breakdown.tollPercent
    },
    {
      value: items.parking,
      fill: breakdown.parkingFill,
      label: breakdown.parkingValue,
      percent: breakdown.parkingPercent
    },
    {
      value: items.other,
      fill: breakdown.otherFill,
      label: breakdown.otherValue,
      percent: breakdown.otherPercent
    }
  ];

  entries.forEach((entry) => {
    const amount = Number(entry.value) || 0;
    const ratio = safeTotal > 0 ? (amount / safeTotal) * 100 : 0;
    entry.fill.style.width = `${ratio.toFixed(1)}%`;
    entry.label.textContent = amount.toLocaleString();
    entry.percent.textContent = `${Math.round(ratio)}%`;
  });
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
  updateBreakdown(
    {
      fuel: fuelCost,
      toll: tollCost,
      parking: parkingCost,
      other: otherCost
    },
    totalCost
  );
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

// ============================================
// プリセット機能
// ============================================

const STORAGE_KEY = "sharefare_presets";

// プリセットをLocalStorageから読み込み
const loadPresets = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load presets:", e);
    return [];
  }
};

// プリセットをLocalStorageに保存
const savePresets = (presets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error("Failed to save presets:", e);
    alert("プリセットの保存に失敗しました");
  }
};

// 現在の設定値を取得
const getCurrentSettings = () => ({
  distance: fields.distance.value,
  fuelPrice: fields.fuelPrice.value,
  fuelEfficiency: fields.fuelEfficiency.value,
  tollCost: fields.tollCost.value,
  parkingCost: fields.parkingCost.value,
  otherCost: fields.otherCost.value,
  peopleCount: fields.peopleCount.value
});

// 設定値を読み込み
const applySettings = (settings) => {
  Object.entries(settings).forEach(([key, value]) => {
    if (fields[key]) {
      fields[key].value = value;
    }
  });
  updateTotals();
};

// プリセット一覧を表示
const renderPresets = () => {
  const presets = loadPresets();
  const container = document.getElementById("presets-list");

  if (presets.length === 0) {
    container.innerHTML =
      '<p class="presets_empty">プリセットが保存されていません</p>';
    return;
  }

  container.innerHTML = presets
    .map((preset, index) => {
      const s = preset.settings;
      const fuelCost = Math.round(
        (s.distance / s.fuelEfficiency) * s.fuelPrice
      );
      const total =
        fuelCost +
        parseInt(s.tollCost || 0) +
        parseInt(s.parkingCost || 0) +
        parseInt(s.otherCost || 0);
      const perPerson = Math.round(total / parseInt(s.peopleCount || 1));

      return `
      <div class="preset-item">
        <div class="preset-item_info">
          <div class="preset-item_name">${escapeHtml(preset.name)}</div>
          <div class="preset-item_details">
            走行距離:${s.distance}km / ガ代:${s.fuelPrice}円 / 燃:${s.fuelEfficiency}km/L / 高速代:${s.tollCost}円 / 駐車代:${s.parkingCost}円 / 他:${s.otherCost}円 / ${s.peopleCount}人 / ${total.toLocaleString()}円(${perPerson.toLocaleString()}円/人)
          </div>
          <div class="preset-item_date">
            ${preset.createdAt ? "作成日:" + formatDateTime(preset.createdAt) : ""}
          </div>
        </div>
        <div class="preset-item_actions">
          <button
            class="calc_button calc_button--mini"
            type="button"
            data-preset-load="${index}"
          >
            読込
          </button>
          <button
            class="calc_button calc_button--mini"
            type="button"
            data-preset-edit="${index}"
          >
            編集
          </button>
          <button
            class="calc_button calc_button--mini calc_button--delete"
            type="button"
            data-preset-delete="${index}"
          >
            削除
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  // イベント設定
  container.querySelectorAll("[data-preset-load]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.presetLoad);
      const preset = presets[index];
      if (preset) {
        applySettings(preset.settings);
        const presetName = preset.name ? `「${preset.name}」` : "";
        showToast(`プリセット${presetName}を読み込みました`);
      }
    });
  });

  container.querySelectorAll("[data-preset-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.presetDelete);
      if (confirm("このプリセットを削除しますか?")) {
        deletePreset(index);
      }
    });
  });

  container.querySelectorAll("[data-preset-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.presetEdit);
      const preset = presets[index];
      if (preset) {
        openModal({ mode: "edit", index, name: preset.name });
      }
    });
  });
};

// プリセットを削除
const deletePreset = (index) => {
  const presets = loadPresets();
  presets.splice(index, 1);
  savePresets(presets);
  renderPresets();
};

// HTMLエスケープ
const escapeHtml = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

// 日時をyyyy/mm/dd hh:mm:ss形式にフォーマット
const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

// モーダル制御
const modal = document.getElementById("preset-modal");
const modalInput = document.getElementById("preset-name");
const modalTitle = document.querySelector(".modal_title");
const modalOverlay = document.getElementById("modal-overlay");
const modalCancel = document.getElementById("modal-cancel");
const modalSave = document.getElementById("modal-save");
const toast = document.getElementById("toast");
let toastTimer;
let editingPresetIndex = null;

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--show");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toast.classList.remove("toast--show");
  }, 2200);
};

const openModal = ({ mode = "create", index = null, name = "" } = {}) => {
  modal.classList.add("modal--open");
  editingPresetIndex = mode === "edit" ? index : null;
  modalInput.value = name || "";
  if (modalTitle) {
    modalTitle.textContent =
      mode === "edit" ? "プリセット名を編集" : "プリセットを保存";
  }
  modalSave.textContent = mode === "edit" ? "更新" : "保存";
  setTimeout(() => modalInput.focus(), 100);
};

const closeModal = () => {
  modal.classList.remove("modal--open");
  editingPresetIndex = null;
};

const saveNewPreset = () => {
  const name = modalInput.value.trim();
  if (!name) {
    alert("プリセット名を入力してください");
    return;
  }

  const presets = loadPresets();
  const nowIso = new Date().toISOString();
  const existingIndex = presets.findIndex((preset) => preset.name === name);
  const wasEditing = editingPresetIndex !== null;
  let didOverwrite = false;

  const willOverwrite = wasEditing
    ? existingIndex !== -1 && existingIndex !== editingPresetIndex
    : existingIndex !== -1;

  if (willOverwrite) {
    const ok = confirm("同名のプリセットがあります。上書きしますか?");
    if (!ok) return;
  }

  if (wasEditing) {
    const currentPreset = presets[editingPresetIndex];
    if (!currentPreset) {
      closeModal();
      return;
    }

    if (existingIndex !== -1 && existingIndex !== editingPresetIndex) {
      presets[existingIndex] = {
        ...presets[existingIndex],
        name,
        settings: currentPreset.settings,
        createdAt: currentPreset.createdAt
      };
      presets.splice(editingPresetIndex, 1);
      didOverwrite = true;
    } else {
      presets[editingPresetIndex].name = name;
    }
  } else {
    if (existingIndex !== -1) {
      presets[existingIndex] = {
        ...presets[existingIndex],
        name,
        settings: getCurrentSettings(),
        createdAt: nowIso
      };
      didOverwrite = true;
    } else {
      presets.push({
        name,
        settings: getCurrentSettings(),
        createdAt: nowIso
      });
    }
  }

  savePresets(presets);
  renderPresets();
  closeModal();

  if (didOverwrite) {
    showToast("同名プリセットを上書きしました");
  } else if (wasEditing) {
    showToast("プリセット名を更新しました");
  }

  // プリセットセクションを開く
  const presetsContent = document.getElementById("presets-content");
  const presetsToggle = document.getElementById("presets-toggle");
  if (!presetsContent.classList.contains("presets_content--open")) {
    presetsContent.classList.add("presets_content--open");
    presetsToggle.querySelector(".presets_toggle-icon").textContent = "▲";
  }
};

// イベントリスナー
document.addEventListener("DOMContentLoaded", () => {
  // プリセット保存ボタン
  document
    .querySelector('[data-action="save-preset"]')
    ?.addEventListener("click", () => openModal({ mode: "create" }));

  // モーダル閉じる
  modalOverlay?.addEventListener("click", closeModal);
  modalCancel?.addEventListener("click", closeModal);

  // モーダル保存
  modalSave?.addEventListener("click", saveNewPreset);

  // Enter キーで保存
  modalInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveNewPreset();
    }
  });

  // プリセットセクションの開閉
  document.getElementById("presets-toggle")?.addEventListener("click", () => {
    const content = document.getElementById("presets-content");
    const icon = document.querySelector(".presets_toggle-icon");
    content.classList.toggle("presets_content--open");
    icon.textContent = content.classList.contains("presets_content--open")
      ? "▲"
      : "▼";
  });

  // 初期表示
  renderPresets();
});
