/* ============================================================
   Paletto – app.js
   Sections:
   1.  Element references
   2.  State
   3.  Theme toggle
   4.  Base color picker
   5.  Harmony segmented control
   6.  Generate button
   7.  generatePalette()
   8.  Harmony algorithms (hsl math)
   9.  renderPalette()
   10. buildSwatch()
   11. copySwatch()
   12. removeSwatch()
   13. Custom color add
   14. History (save / render / restore / clear)
   15. Export PNG
   16. Export JSON
   17. Utility: hex ↔ hsl conversions
   18. Toast helper
   ============================================================ */


/* ── 1. Element References ── */
const themeToggle      = document.getElementById('themeToggle');
const baseColorInput   = document.getElementById('baseColor');
const basePreview      = document.getElementById('basePreview');
const baseHexDisplay   = document.getElementById('baseHexDisplay');
const colorPickWrap    = document.querySelector('.color-pick-wrap');
const btnGenerate      = document.getElementById('btnGenerate');
const btnExportPNG     = document.getElementById('btnExportPNG');
const btnExportJSON    = document.getElementById('btnExportJSON');
const paletteEl        = document.getElementById('palette');
const addColorBtn      = document.getElementById('addColorBtn');
const customColorPicker= document.getElementById('customColorPicker');
const historyList      = document.getElementById('historyList');
const historyEmpty     = document.getElementById('historyEmpty');
const btnClearHistory  = document.getElementById('btnClearHistory');
const toastEl          = document.getElementById('toast');


/* ── 2. State ── */
let currentHarmony = 'analogous';
let currentColors  = [];          // array of hex strings in active palette
let history        = [];          // last 5 palettes [ [hex,...], ... ]


/* ── 3. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 4. Base Color Picker ── */
// Clicking the visual wrap opens the hidden native color input
colorPickWrap.addEventListener('click', () => baseColorInput.click());

baseColorInput.addEventListener('input', () => {
  const hex = baseColorInput.value;
  basePreview.style.background = hex;
  baseHexDisplay.textContent   = hex;
});

// Initialise preview on load
basePreview.style.background = baseColorInput.value;


/* ── 5. Harmony Segmented Control ── */
document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentHarmony = btn.dataset.harmony;
  });
});


/* ── 6. Generate Button ── */
btnGenerate.addEventListener('click', generatePalette);

// Generate on load
generatePalette();


/* ── 7. generatePalette ── */
function generatePalette() {
  const baseHex = baseColorInput.value;
  const baseHSL = hexToHSL(baseHex);

  let colors = [];

  if (currentHarmony === 'random') {
    colors = Array.from({ length: 5 }, () => randomHex());
  } else {
    colors = buildHarmony(baseHSL, currentHarmony);
  }

  currentColors = colors;
  renderPalette(colors);
  saveToHistory(colors);
}


/* ── 8. Harmony Algorithms ── */
function buildHarmony(hsl, type) {
  const { h, s, l } = hsl;

  const offsets = {
    analogous:      [0, 30, 60, -30, -60],
    complementary:  [0, 180, 20, 200, -20],
    triadic:        [0, 120, 240, 60, 180],
  };

  return offsets[type].map((offset, i) => {
    const newH = (h + offset + 360) % 360;
    // Vary lightness slightly for visual interest
    const lightnessShift = (i % 2 === 0) ? 0 : (i % 3 === 0 ? -10 : 8);
    const newL = Math.max(10, Math.min(90, l + lightnessShift));
    return hslToHex(newH, s, newL);
  });
}

function randomHex() {
  const h = Math.floor(Math.random() * 360);
  const s = 45 + Math.floor(Math.random() * 40);   // 45–85% saturation
  const l = 35 + Math.floor(Math.random() * 35);   // 35–70% lightness
  return hslToHex(h, s, l);
}


/* ── 9. renderPalette ── */
function renderPalette(colors) {
  paletteEl.innerHTML = '';
  colors.forEach((hex, i) => {
    const swatch = buildSwatch(hex, i);
    paletteEl.appendChild(swatch);
  });
}


/* ── 10. buildSwatch ── */
function buildSwatch(hex, index = 0) {
  const div = document.createElement('div');
  div.className = 'swatch';
  div.style.background = hex;
  div.style.animationDelay = `${index * 0.06}s`;
  div.dataset.hex = hex;

  // Hex label
  const label = document.createElement('div');
  label.className = 'swatch-label';
  label.innerHTML = `
    ${hex}
    <i class="fa-regular fa-copy swatch-copy-icon"></i>
  `;

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'swatch-remove';
  removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  removeBtn.title = 'Remove color';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeSwatch(div, hex);
  });

  // Click swatch body to copy
  div.addEventListener('click', () => copySwatch(hex, div));

  div.appendChild(label);
  div.appendChild(removeBtn);
  return div;
}


/* ── 11. copySwatch ── */
async function copySwatch(hex, swatchEl) {
  try {
    await navigator.clipboard.writeText(hex);
    swatchEl.classList.add('copied');
    showToast(`${hex} copied!`);
    setTimeout(() => swatchEl.classList.remove('copied'), 1200);
  } catch {
    showToast('Copy failed');
  }
}


/* ── 12. removeSwatch ── */
function removeSwatch(swatchEl, hex) {
  if (currentColors.length <= 1) {
    showToast('Need at least one color');
    return;
  }
  currentColors = currentColors.filter(c => c !== hex);
  swatchEl.style.animation = 'none';
  swatchEl.style.opacity   = '0';
  swatchEl.style.transform = 'scaleY(0.8)';
  swatchEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  setTimeout(() => swatchEl.remove(), 200);
}


/* ── 13. Custom Color Add ── */
addColorBtn.addEventListener('click', () => customColorPicker.click());

// 'change' fires only when the user closes/commits the picker —
// NOT on every drag step like 'input' would. This prevents dozens
// of swatches being added while sliding through the colour spectrum.
customColorPicker.addEventListener('change', () => {
  const hex = customColorPicker.value;
  currentColors.push(hex);
  const swatch = buildSwatch(hex, currentColors.length - 1);
  paletteEl.appendChild(swatch);
  showToast(`${hex} added`);
  // Reset so the same color can be picked again if needed
  customColorPicker.value = '#000000';
});


/* ── 14. History ── */
function saveToHistory(colors) {
  // Avoid saving duplicate of last entry
  if (history.length > 0 &&
      JSON.stringify(history[0]) === JSON.stringify(colors)) return;

  history.unshift([...colors]);
  if (history.length > 5) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.appendChild(historyEmpty);
    return;
  }

  history.forEach((palette, i) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.title = 'Click to restore';

    const dots = document.createElement('div');
    dots.className = 'history-swatches';
    palette.forEach(hex => {
      const dot = document.createElement('div');
      dot.className = 'history-dot';
      dot.style.background = hex;
      dots.appendChild(dot);
    });

    const meta = document.createElement('span');
    meta.className = 'history-meta';
    meta.textContent = `${palette.length} colors`;

    const restore = document.createElement('span');
    restore.className = 'history-restore';
    restore.textContent = 'Restore →';

    item.appendChild(dots);
    item.appendChild(meta);
    item.appendChild(restore);

    item.addEventListener('click', () => {
      currentColors = [...palette];
      renderPalette(currentColors);
      showToast('Palette restored!');
    });

    historyList.appendChild(item);
  });
}

btnClearHistory.addEventListener('click', () => {
  history = [];
  renderHistory();
  showToast('History cleared');
});


/* ── 15. Export PNG ── */
btnExportPNG.addEventListener('click', () => {
  if (currentColors.length === 0) { showToast('Generate a palette first'); return; }

  const W = 1200;
  const H = 400;
  const swatchW = Math.floor(W / currentColors.length);

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  currentColors.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * swatchW, 0, swatchW, H - 60);

    // Hex label
    ctx.fillStyle = isLight(hex) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
    ctx.font = '500 16px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hex.toUpperCase(), i * swatchW + swatchW / 2, H - 75);
  });

  // Footer bar
  ctx.fillStyle = '#1d1d1f';
  ctx.fillRect(0, H - 60, W, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px DM Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Made with Paletto', 24, H - 22);

  const link = document.createElement('a');
  link.download = 'paletto-palette.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('PNG exported!');
});


/* ── 16. Export JSON ── */
btnExportJSON.addEventListener('click', () => {
  if (currentColors.length === 0) { showToast('Generate a palette first'); return; }

  const data = {
    palette: currentColors.map((hex, i) => ({
      index: i + 1,
      hex: hex.toUpperCase(),
      hsl: hexToHSL(hex),
      rgb: hexToRGB(hex)
    })),
    harmony: currentHarmony,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'paletto-palette.json';
  a.click();
  showToast('JSON exported!');
});


/* ── 17. Utility: Color Conversions ── */

// hex → { h, s, l }
function hexToHSL(hex) {
  let { r, g, b } = hexToRGB(hex);
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// { h, s, l } → hex
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// hex → { r, g, b }
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Returns true if a color is "light" (for contrast decisions)
function isLight(hex) {
  const { r, g, b } = hexToRGB(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
}


/* ── 18. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}