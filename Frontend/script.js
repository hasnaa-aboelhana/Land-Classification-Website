// Points to our own backend — no CORS issues
const API = "/predict";

const CLASSES = {
  AnnualCrop:           { icon: "🌾", color: "#c8d93a", desc: "Seasonally harvested crops like wheat and corn." },
  Forest:               { icon: "🌲", color: "#3ddc6e", desc: "Dense tree cover, natural woodland areas." },
  HerbaceousVegetation: { icon: "🌿", color: "#6fcf6f", desc: "Low-lying plants, grass, and shrubs." },
  Highway:              { icon: "🛣️",  color: "#a0a0a0", desc: "Major roads and transport infrastructure." },
  Industrial:           { icon: "🏭", color: "#c47b3a", desc: "Factories, warehouses, and industrial zones." },
  Pasture:              { icon: "🐄", color: "#d4b86a", desc: "Grassland used for grazing livestock." },
  PermanentCrop:        { icon: "🍇", color: "#b07fc8", desc: "Orchards, vineyards, and perennial crops." },
  Residential:          { icon: "🏘️",  color: "#e07070", desc: "Housing areas and suburban neighborhoods." },
  River:                { icon: "🏞️",  color: "#3b9fe0", desc: "Rivers, streams, and waterways." },
  SeaLake:              { icon: "🌊", color: "#1a7abf", desc: "Open water bodies — sea or lakes." },
};

// ── build legend ──────────────────────────────────────────────
const legendGrid = document.getElementById("legend-grid");
Object.entries(CLASSES).forEach(([name, meta]) => {
  const item = document.createElement("div");
  item.className = "legend-item";
  item.innerHTML = `
    <div class="legend-dot" style="background:${meta.color}"></div>
    ${meta.icon} ${name}
  `;
  legendGrid.appendChild(item);
});

// ── element refs ──────────────────────────────────────────────
const dropzone      = document.getElementById("dropzone");
const fileInput     = document.getElementById("file-input");
const previewSec    = document.getElementById("preview-section");
const previewImg    = document.getElementById("preview-img");
const metaName      = document.getElementById("meta-name");
const metaSize      = document.getElementById("meta-size");
const metaDims      = document.getElementById("meta-dims");
const classifyBtn   = document.getElementById("classify-btn");
const loading       = document.getElementById("loading");
const errorMsg      = document.getElementById("error-msg");
const resultSec     = document.getElementById("result-section");
const resultBadge   = document.getElementById("result-badge");
const resultClass   = document.getElementById("result-class");
const confidenceBar = document.getElementById("confidence-bar");
const confidencePct = document.getElementById("confidence-pct");
const resultDesc    = document.getElementById("result-desc");
const resetBtn      = document.getElementById("reset-btn");

let selectedFile = null;

// ── helpers ───────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function hideResult() {
  resultSec.classList.remove("visible");
  resetBtn.classList.remove("visible");
  confidenceBar.style.width = "0%";
}

function showResult(prediction, confidence) {
  const meta = CLASSES[prediction] || { icon: "🌍", color: "#3ddc6e", desc: "" };

  resultBadge.textContent = meta.icon;
  resultBadge.style.background = meta.color + "22";
  resultBadge.style.borderColor = meta.color + "55";

  resultClass.textContent = prediction;
  resultClass.style.color = meta.color;

  resultDesc.textContent = meta.desc;

  const pct = Math.round(confidence * 100);
  confidencePct.textContent = pct + "%";
  confidencePct.style.color = meta.color;

  resultSec.classList.add("visible");
  resetBtn.classList.add("visible");

  // Animate bar after paint
  setTimeout(() => {
    confidenceBar.style.width = pct + "%";
    confidenceBar.style.background = meta.color;
  }, 50);
}

// ── file handling ─────────────────────────────────────────────
function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  selectedFile = file;

  const url = URL.createObjectURL(file);
  previewImg.src = url;
  metaName.textContent = file.name;
  metaSize.textContent = formatSize(file.size);

  const tmp = new Image();
  tmp.onload = () => {
    metaDims.textContent = `${tmp.width} × ${tmp.height} px`;
    URL.revokeObjectURL(url);
  };
  tmp.src = url;

  dropzone.style.display = "none";
  previewSec.classList.add("visible");
  classifyBtn.classList.add("visible");
  hideResult();
  errorMsg.classList.remove("visible");
}

fileInput.addEventListener("change", e => handleFile(e.target.files[0]));

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  dropzone.classList.add("drag-over");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");
  handleFile(e.dataTransfer.files[0]);
});

// ── classify ──────────────────────────────────────────────────
classifyBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  classifyBtn.disabled = true;
  loading.classList.add("visible");
  errorMsg.classList.remove("visible");
  hideResult();

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(API, { method: "POST", body: formData });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }

    const data = await res.json();
    showResult(data.prediction, data.confidence);

  } catch (err) {
    errorMsg.textContent = `Error: ${err.message}`;
    errorMsg.classList.add("visible");
  } finally {
    loading.classList.remove("visible");
    classifyBtn.disabled = false;
  }
});

// ── reset ─────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  previewSec.classList.remove("visible");
  classifyBtn.classList.remove("visible");
  dropzone.style.display = "";
  hideResult();
  errorMsg.classList.remove("visible");
});
