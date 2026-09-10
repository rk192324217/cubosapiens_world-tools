/* ============================================================
   cuboShape – app.js
   Sections:
   1.  State
   2.  Preset data
   3.  Element references
   4.  Theme toggle
   5.  File upload & drop zone
   6.  loadImage()
   7.  Tab switching
   8.  ── RESIZE TAB ──
       8a. Dimension inputs + aspect lock
       8b. Percentage scale buttons
       8c. Preset tabs & list
       8d. Format & quality
       8e. Apply resize & download
       8f. Bulk resize
       8g. Render resize preview
   9.  ── CROP TAB ──
       9a. Draw image on crop canvas
       9b. Aspect ratio buttons
       9c. Crop box drag logic
       9d. Apply crop & download
       9e. Reset crop
   10. ── SHAPE TAB ──
       10a. Shape button selection
       10b. Radius slider
       10c. Background selector
       10d. drawShape() — all 11 shapes
       10e. Apply shape & download
   11. ── TRANSFORM TAB ──
       11a. Rotate buttons + slider
       11b. Flip flags
       11c. drawTransform()
       11d. Apply transform & download
       11e. Reset transform
   12. download() helper
   13. formatBytes()
   14. Toast helper
   ============================================================ */


/* ── 1. State ── */
let srcImage   = null;   // HTMLImageElement of loaded source
let srcFile    = null;   // original File object
let aspectRatio = 1;

// Resize
let rszLocked = true;

// Crop
let cropRatio  = 'free';
let cropBox    = { x: 20, y: 20, w: 200, h: 150 }; // in display pixels
let cropDrag   = null;  // { type, startX, startY, origBox }
let cropScale  = 1;     // display-to-natural pixel ratio

// Shape
let activeShape   = 'none';
let shapeBg       = 'transparent';
let customBgHex   = '#e34949';
let cornerRadius  = 0;

// Transform
let rotAngle  = 0;
let flipH     = false;
let flipV     = false;


/* ── 2. Preset Data ── */
const PRESETS = {
  social: [
    { name: 'Instagram Post',   w: 1080, h: 1080 },
    { name: 'Instagram Story',  w: 1080, h: 1920 },
    { name: 'Facebook Cover',   w: 820,  h: 312  },
    { name: 'Twitter Post',     w: 1200, h: 675  },
    { name: 'LinkedIn Banner',  w: 1584, h: 396  },
    { name: 'YouTube Thumb',    w: 1280, h: 720  },
    { name: 'Pinterest Pin',    w: 1000, h: 1500 },
  ],
  web: [
    { name: 'Full HD',          w: 1920, h: 1080 },
    { name: '4K UHD',           w: 3840, h: 2160 },
    { name: 'HD Ready',         w: 1280, h: 720  },
    { name: 'Square (512)',     w: 512,  h: 512  },
    { name: 'Favicon',          w: 32,   h: 32   },
    { name: 'App Icon (512)',   w: 512,  h: 512  },
    { name: 'Open Graph',       w: 1200, h: 630  },
  ],
  print: [
    { name: 'A4 (300dpi)',      w: 2480, h: 3508 },
    { name: 'A5 (300dpi)',      w: 1748, h: 2480 },
    { name: 'Letter (300dpi)', w: 2550, h: 3300 },
    { name: 'Postcard',         w: 1800, h: 1200 },
    { name: 'Business Card',    w: 1050, h: 600  },
    { name: 'Poster A3',        w: 3508, h: 4961 },
  ],
  device: [
    { name: 'iPhone 15',        w: 1179, h: 2556 },
    { name: 'iPhone 15 Plus',   w: 1290, h: 2796 },
    { name: 'iPad Pro 12.9"',   w: 2048, h: 2732 },
    { name: 'MacBook Air',      w: 2560, h: 1664 },
    { name: 'Galaxy S24',       w: 1080, h: 2340 },
    { name: 'Pixel 8',          w: 1080, h: 2400 },
  ],
};


/* ── 3. Element References ── */
const themeToggle    = document.getElementById('themeToggle');
const dropzone       = document.getElementById('dropzone');
const fileInput      = document.getElementById('fileInput');
const btnBrowse      = document.getElementById('btnBrowse');
const workspace      = document.getElementById('workspace');
const fileNameLabel  = document.getElementById('fileNameLabel');
const fileDimsLabel  = document.getElementById('fileDimsLabel');
const btnChangeImage = document.getElementById('btnChangeImage');

// Resize
const rszW          = document.getElementById('rszW');
const rszH          = document.getElementById('rszH');
const lockBtn       = document.getElementById('lockBtn');
const lockIcon      = document.getElementById('lockIcon');
const rszFormat     = document.getElementById('rszFormat');
const rszQuality    = document.getElementById('rszQuality');
const rszQualityVal = document.getElementById('rszQualityVal');
const qualityWrap   = document.getElementById('qualityWrap');
const rszCanvas     = document.getElementById('rszCanvas');
const rszMeta       = document.getElementById('rszMeta');
const btnApplyResize= document.getElementById('btnApplyResize');
const btnBulkResize = document.getElementById('btnBulkResize');
const bulkInput     = document.getElementById('bulkInput');
const presetList    = document.getElementById('presetList');

// Crop
const cropCanvas    = document.getElementById('cropCanvas');
const cropOverlay   = document.getElementById('cropOverlay');
const cropBoxEl     = document.getElementById('cropBox');
const cropInfo      = document.getElementById('cropInfo');
const btnApplyCrop  = document.getElementById('btnApplyCrop');
const btnResetCrop  = document.getElementById('btnResetCrop');

// Shape
const shapeCanvas   = document.getElementById('shapeCanvas');
const radiusSlider  = document.getElementById('radiusSlider');
const radiusVal     = document.getElementById('radiusVal');
const btnApplyShape = document.getElementById('btnApplyShape');
const customBgColor = document.getElementById('customBgColor');
const customBgSwatch= document.getElementById('customBgSwatch');

// Transform
const transformCanvas   = document.getElementById('transformCanvas');
const customAngle       = document.getElementById('customAngle');
const angleSlider       = document.getElementById('angleSlider');
const btnRot90L         = document.getElementById('btnRot90L');
const btnRot90R         = document.getElementById('btnRot90R');
const btnRot180         = document.getElementById('btnRot180');
const btnFlipH          = document.getElementById('btnFlipH');
const btnFlipV          = document.getElementById('btnFlipV');
const btnApplyTransform = document.getElementById('btnApplyTransform');
const btnResetTransform = document.getElementById('btnResetTransform');

const toastEl = document.getElementById('toast');


/* ── 4. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 5. File Upload & Drop Zone ── */
btnBrowse.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
dropzone.addEventListener('click', () => fileInput.click());
btnChangeImage.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
  fileInput.value = '';
});

dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault(); dropzone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) loadImage(f);
  else showToast('Please drop an image file');
});


/* ── 6. loadImage ── */
function loadImage(file) {
  srcFile = file;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    srcImage  = img;
    aspectRatio = img.naturalWidth / img.naturalHeight;

    fileNameLabel.textContent = file.name;
    fileDimsLabel.textContent = `${img.naturalWidth} × ${img.naturalHeight}px · ${formatBytes(file.size)}`;

    rszW.value = img.naturalWidth;
    rszH.value = img.naturalHeight;
    rotAngle = 0; flipH = false; flipV = false;
    angleSlider.value = 0; customAngle.value = 0;

    dropzone.style.display = 'none';
    workspace.style.display = 'block';

    renderResizePreview();
    initCropCanvas();
    drawShape();
    drawTransform();
    initLassoCanvas();
  };
  img.src = url;
}


/* ── 7. Tab Switching + Global Format Bar ── */
const globalFmtBar     = document.getElementById('globalFmtBar');
const gfmtQualityWrap  = document.getElementById('gfmtQualityWrap');
const gfmtQuality      = document.getElementById('gfmtQuality');
const gfmtQualityVal   = document.getElementById('gfmtQualityVal');

let globalFmt     = 'png';
let globalQuality = 0.92;

// Tabs that show the global format bar (not resize — it has its own)
const GLOBAL_FMT_TABS = ['crop', 'shape', 'lasso', 'transform'];

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Show/hide global format bar
    globalFmtBar.style.display = GLOBAL_FMT_TABS.includes(tab) ? 'flex' : 'none';

    // Init lasso canvas when switching to lasso tab
    if (tab === 'lasso' && srcImage) initLassoCanvas();
  });
});

// Global format pill selection
document.querySelectorAll('.gfmt-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.gfmt-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    globalFmt = pill.dataset.fmt;
    const lossy = ['jpeg', 'webp'].includes(globalFmt);
    gfmtQualityWrap.style.display = lossy ? 'flex' : 'none';
  });
});

gfmtQuality.addEventListener('input', () => {
  globalQuality = parseInt(gfmtQuality.value) / 100;
  gfmtQualityVal.textContent = gfmtQuality.value + '%';
});


/* ── loadImage — also init lasso ── */
// (patch: also call initLassoCanvas on image load)
const _origLoadImage = loadImage;


/* ══════════════════════════════════════
   ── 8. RESIZE TAB ──
══════════════════════════════════════ */

/* 8a. Dimension inputs + aspect lock */
lockBtn.classList.add('locked');

lockBtn.addEventListener('click', () => {
  rszLocked = !rszLocked;
  lockBtn.classList.toggle('locked', rszLocked);
  lockIcon.className = rszLocked ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
});

rszW.addEventListener('input', () => {
  if (rszLocked && srcImage) {
    rszH.value = Math.round(parseInt(rszW.value) / aspectRatio) || '';
  }
  renderResizePreview();
});

rszH.addEventListener('input', () => {
  if (rszLocked && srcImage) {
    rszW.value = Math.round(parseInt(rszH.value) * aspectRatio) || '';
  }
  renderResizePreview();
});

/* 8b. Percentage scale buttons */
document.querySelectorAll('.pct-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pct-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (!srcImage) return;
    const pct = parseInt(btn.dataset.pct) / 100;
    rszW.value = Math.round(srcImage.naturalWidth  * pct);
    rszH.value = Math.round(srcImage.naturalHeight * pct);
    renderResizePreview();
  });
});

/* 8c. Preset tabs & list */
let activePresetGroup = 'social';

document.querySelectorAll('.preset-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.preset-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activePresetGroup = tab.dataset.group;
    renderPresetList();
  });
});

function renderPresetList() {
  presetList.innerHTML = '';
  (PRESETS[activePresetGroup] || []).forEach(p => {
    const item = document.createElement('div');
    item.className = 'preset-item';
    item.innerHTML = `<span>${p.name}</span><span class="preset-dims">${p.w} × ${p.h}</span>`;
    item.addEventListener('click', () => {
      rszW.value = p.w; rszH.value = p.h;
      rszLocked = false;
      lockBtn.classList.remove('locked');
      lockIcon.className = 'fa-solid fa-lock-open';
      renderResizePreview();
    });
    presetList.appendChild(item);
  });
}

renderPresetList();

/* 8d. Format & quality */
rszQuality.addEventListener('input', () => {
  rszQualityVal.textContent = rszQuality.value + '%';
});

rszFormat.addEventListener('change', () => {
  const lossy = ['jpeg','webp','avif'].includes(rszFormat.value);
  qualityWrap.style.display = lossy ? 'flex' : 'none';
  renderResizePreview();
});

/* 8e. Apply resize & download */
btnApplyResize.addEventListener('click', () => {
  if (!srcImage) return;
  const w = parseInt(rszW.value) || srcImage.naturalWidth;
  const h = parseInt(rszH.value) || srcImage.naturalHeight;
  const fmt = rszFormat.value;
  const q   = parseInt(rszQuality.value) / 100;

  const c   = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(srcImage, 0, 0, w, h);

  download(c, fmt, q, srcFile.name.replace(/\.[^.]+$/, '') + `_${w}x${h}`);
  showToast(`Downloaded ${w}×${h} ${fmt.toUpperCase()}`);
});

/* 8f. Bulk resize */
btnBulkResize.addEventListener('click', () => bulkInput.click());

bulkInput.addEventListener('change', async () => {
  if (!bulkInput.files.length) return;
  const w   = parseInt(rszW.value);
  const h   = parseInt(rszH.value);
  const fmt = rszFormat.value;
  const q   = parseInt(rszQuality.value) / 100;

  if (!w || !h) { showToast('Set dimensions first'); return; }

  const zip = new JSZip();

  const promises = Array.from(bulkInput.files).map(file => new Promise(res => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob(blob => {
          const name = file.name.replace(/\.[^.]+$/, '') + `_${w}x${h}.${fmt}`;
          zip.file(name, blob);
          res();
        }, `image/${fmt}`, q);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }));

  await Promise.all(promises);
  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `cuboShape-bulk-${w}x${h}.zip`;
  a.click();
  showToast(`${bulkInput.files.length} images resized & zipped!`);
  bulkInput.value = '';
});

/* 8g. Render resize preview */
function renderResizePreview() {
  if (!srcImage) return;
  const w   = Math.min(parseInt(rszW.value) || srcImage.naturalWidth, 8000);
  const h   = Math.min(parseInt(rszH.value) || srcImage.naturalHeight, 8000);
  const fmt = rszFormat.value;

  rszCanvas.width  = w;
  rszCanvas.height = h;
  const ctx = rszCanvas.getContext('2d');
  ctx.drawImage(srcImage, 0, 0, w, h);

  rszMeta.textContent = `${w} × ${h}px · ${fmt.toUpperCase()}`;
}


/* ══════════════════════════════════════
   ── 9. CROP TAB ──
══════════════════════════════════════ */

/* 9a. Draw image on crop canvas */
function initCropCanvas() {
  if (!srcImage) return;

  const maxW = 600, maxH = 480;
  const scale = Math.min(maxW / srcImage.naturalWidth, maxH / srcImage.naturalHeight, 1);
  cropScale = 1 / scale;

  cropCanvas.width  = Math.round(srcImage.naturalWidth  * scale);
  cropCanvas.height = Math.round(srcImage.naturalHeight * scale);

  const ctx = cropCanvas.getContext('2d');
  ctx.drawImage(srcImage, 0, 0, cropCanvas.width, cropCanvas.height);

  // Set crop overlay to match canvas
  cropOverlay.style.width  = cropCanvas.width  + 'px';
  cropOverlay.style.height = cropCanvas.height + 'px';

  // Default crop box = 80% of canvas
  cropBox = {
    x: cropCanvas.width  * 0.1,
    y: cropCanvas.height * 0.1,
    w: cropCanvas.width  * 0.8,
    h: cropCanvas.height * 0.8,
  };

  updateCropBoxEl();
  updateCropInfo();
}

function updateCropBoxEl() {
  cropBoxEl.style.left   = cropBox.x + 'px';
  cropBoxEl.style.top    = cropBox.y + 'px';
  cropBoxEl.style.width  = cropBox.w + 'px';
  cropBoxEl.style.height = cropBox.h + 'px';
}

function updateCropInfo() {
  const nx = Math.round(cropBox.x * cropScale);
  const ny = Math.round(cropBox.y * cropScale);
  const nw = Math.round(cropBox.w * cropScale);
  const nh = Math.round(cropBox.h * cropScale);
  cropInfo.textContent = `${nx}, ${ny}  →  ${nw} × ${nh} px`;
}

/* 9b. Aspect ratio buttons */
document.querySelectorAll('.ratio-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cropRatio = btn.dataset.ratio;
    if (cropRatio !== 'free') applyCropRatio();
  });
});

function applyCropRatio() {
  const [rw, rh] = cropRatio.split(':').map(Number);
  const ratio    = rw / rh;
  const cx       = cropCanvas.width  / 2;
  const cy       = cropCanvas.height / 2;
  let w = Math.min(cropCanvas.width * 0.8, cropCanvas.height * 0.8 * ratio);
  let h = w / ratio;
  cropBox = { x: cx - w / 2, y: cy - h / 2, w, h };
  updateCropBoxEl();
  updateCropInfo();
}

/* 9c. Crop box drag logic */
const cropStage = document.getElementById('cropStage');

cropBoxEl.addEventListener('mousedown', startDrag);
cropBoxEl.querySelectorAll('.crop-handle').forEach(h => {
  h.addEventListener('mousedown', e => {
    e.stopPropagation();
    const corner = Array.from(h.classList).find(c => ['tl','tr','bl','br'].includes(c));
    startResize(e, corner);
  });
});

// Touch support
cropBoxEl.addEventListener('touchstart', e => startDrag(e.touches[0]), { passive: true });
cropBoxEl.querySelectorAll('.crop-handle').forEach(h => {
  h.addEventListener('touchstart', e => {
    e.stopPropagation();
    const corner = Array.from(h.classList).find(c => ['tl','tr','bl','br'].includes(c));
    startResize(e.touches[0], corner);
  }, { passive: true });
});

function startDrag(e) {
  cropDrag = { type: 'move', startX: e.clientX, startY: e.clientY, origBox: { ...cropBox } };
}

function startResize(e, corner) {
  cropDrag = { type: 'resize', corner, startX: e.clientX, startY: e.clientY, origBox: { ...cropBox } };
}

document.addEventListener('mousemove', onCropMove);
document.addEventListener('mouseup',   () => { cropDrag = null; });
document.addEventListener('touchmove', e => onCropMove(e.touches[0]), { passive: true });
document.addEventListener('touchend',  () => { cropDrag = null; });

function onCropMove(e) {
  if (!cropDrag) return;
  const dx = e.clientX - cropDrag.startX;
  const dy = e.clientY - cropDrag.startY;
  const ob = cropDrag.origBox;
  const cw = cropCanvas.width, ch = cropCanvas.height;

  if (cropDrag.type === 'move') {
    cropBox.x = Math.max(0, Math.min(cw - ob.w, ob.x + dx));
    cropBox.y = Math.max(0, Math.min(ch - ob.h, ob.y + dy));
    cropBox.w = ob.w; cropBox.h = ob.h;
  } else {
    let { x, y, w, h } = ob;
    const c = cropDrag.corner;

    if (c === 'br') { w = Math.max(30, ob.w + dx); h = Math.max(30, ob.h + dy); }
    if (c === 'bl') { x = Math.min(ob.x + ob.w - 30, ob.x + dx); w = ob.w - (x - ob.x); h = Math.max(30, ob.h + dy); }
    if (c === 'tr') { y = Math.min(ob.y + ob.h - 30, ob.y + dy); w = Math.max(30, ob.w + dx); h = ob.h - (y - ob.y); }
    if (c === 'tl') { x = Math.min(ob.x + ob.w - 30, ob.x + dx); y = Math.min(ob.y + ob.h - 30, ob.y + dy); w = ob.w - (x - ob.x); h = ob.h - (y - ob.y); }

    // Lock ratio if not free
    if (cropRatio !== 'free') {
      const [rw, rh] = cropRatio.split(':').map(Number);
      h = w * rh / rw;
    }

    cropBox = {
      x: Math.max(0, Math.min(x, cw - 30)),
      y: Math.max(0, Math.min(y, ch - 30)),
      w: Math.min(w, cw - Math.max(0, x)),
      h: Math.min(h, ch - Math.max(0, y)),
    };
  }

  updateCropBoxEl();
  updateCropInfo();
}

/* 9d. Apply crop & download */
btnApplyCrop.addEventListener('click', () => {
  if (!srcImage) return;
  const sx = Math.round(cropBox.x * cropScale);
  const sy = Math.round(cropBox.y * cropScale);
  const sw = Math.round(cropBox.w * cropScale);
  const sh = Math.round(cropBox.h * cropScale);

  const c = document.createElement('canvas');
  c.width = sw; c.height = sh;
  c.getContext('2d').drawImage(srcImage, sx, sy, sw, sh, 0, 0, sw, sh);
  download(c, 'png', 1, srcFile.name.replace(/\.[^.]+$/, '') + '_cropped');
  showToast('Cropped image downloaded!');
});

/* 9e. Reset crop */
btnResetCrop.addEventListener('click', initCropCanvas);


/* ══════════════════════════════════════
   ── 10. SHAPE TAB ──
══════════════════════════════════════ */

/* 10a. Shape selection */
document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeShape = btn.dataset.shape;
    drawShape();
  });
});

/* 10b. Radius slider */
radiusSlider.addEventListener('input', () => {
  cornerRadius = parseInt(radiusSlider.value);
  radiusVal.textContent = cornerRadius + 'px (% of min side)';
  drawShape();
});

/* 10c. Background selector */
document.querySelectorAll('.bg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    shapeBg = btn.dataset.bg;
    if (shapeBg === 'custom') customBgColor.click();
    drawShape();
  });
});

customBgColor.addEventListener('change', () => {
  customBgHex = customBgColor.value;
  customBgSwatch.style.background = customBgHex;
  shapeBg = 'custom';
  drawShape();
});

/* 10d. drawShape() */
function drawShape() {
  if (!srcImage) return;

  const size = Math.min(srcImage.naturalWidth, srcImage.naturalHeight);
  const c    = shapeCanvas;
  c.width    = srcImage.naturalWidth;
  c.height   = srcImage.naturalHeight;
  const ctx  = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  // Background fill
  if (shapeBg !== 'transparent') {
    ctx.fillStyle = shapeBg === 'white' ? '#ffffff'
                  : shapeBg === 'black' ? '#000000'
                  : customBgHex;
    ctx.fillRect(0, 0, c.width, c.height);
  }

  const cx = c.width  / 2;
  const cy = c.height / 2;
  const r  = size / 2;

  ctx.save();
  ctx.beginPath();

  switch (activeShape) {
    case 'none':
      if (cornerRadius > 0) {
        const rad = (cornerRadius / 100) * Math.min(c.width, c.height);
        roundedRect(ctx, 0, 0, c.width, c.height, rad);
      } else {
        ctx.rect(0, 0, c.width, c.height);
      }
      break;
    case 'circle':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;
    case 'hexagon':
      polygon(ctx, cx, cy, r, 6, -Math.PI / 6);
      break;
    case 'star':
      star(ctx, cx, cy, r, r * 0.45, 5);
      break;
    case 'diamond':
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.65, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r * 0.65, cy);
      ctx.closePath();
      break;
    case 'shield':
      shieldPath(ctx, cx, cy, r);
      break;
    case 'triangle':
      polygon(ctx, cx, cy, r, 3, -Math.PI / 2);
      break;
    case 'pentagon':
      polygon(ctx, cx, cy, r, 5, -Math.PI / 2);
      break;
    case 'arrow':
      arrowPath(ctx, c.width, c.height);
      break;
    case 'heart':
      heartPath(ctx, cx, cy, r);
      break;
    case 'blob':
      blobPath(ctx, cx, cy, r);
      break;
    default:
      ctx.rect(0, 0, c.width, c.height);
  }

  ctx.clip();
  ctx.drawImage(srcImage, 0, 0, c.width, c.height);
  ctx.restore();
}

/* Shape helpers */
function polygon(ctx, cx, cy, r, sides, startAngle = 0) {
  for (let i = 0; i <= sides; i++) {
    const angle = startAngle + (i / sides) * Math.PI * 2;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
}

function star(ctx, cx, cy, outerR, innerR, points) {
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r     = i % 2 === 0 ? outerR : innerR;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
}

function shieldPath(ctx, cx, cy, r) {
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.85, cy - r * 0.4);
  ctx.lineTo(cx + r * 0.85, cy + r * 0.2);
  ctx.quadraticCurveTo(cx + r * 0.85, cy + r * 0.7, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.85, cy + r * 0.7, cx - r * 0.85, cy + r * 0.2);
  ctx.lineTo(cx - r * 0.85, cy - r * 0.4);
  ctx.closePath();
}

function arrowPath(ctx, w, h) {
  const m = Math.min(w, h);
  const ox = (w - m) / 2, oy = (h - m) / 2;
  ctx.moveTo(ox + m * 0.05, oy + m * 0.3);
  ctx.lineTo(ox + m * 0.55, oy + m * 0.3);
  ctx.lineTo(ox + m * 0.55, oy + m * 0.1);
  ctx.lineTo(ox + m * 0.95, oy + m * 0.5);
  ctx.lineTo(ox + m * 0.55, oy + m * 0.9);
  ctx.lineTo(ox + m * 0.55, oy + m * 0.7);
  ctx.lineTo(ox + m * 0.05, oy + m * 0.7);
  ctx.closePath();
}

function heartPath(ctx, cx, cy, r) {
  const s = r * 0.9;
  ctx.moveTo(cx, cy + s * 0.3);
  ctx.bezierCurveTo(cx, cy - s * 0.1, cx - s, cy - s * 0.1, cx - s, cy - s * 0.35);
  ctx.bezierCurveTo(cx - s, cy - s * 0.8, cx, cy - s * 0.8, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx, cy - s * 0.8, cx + s, cy - s * 0.8, cx + s, cy - s * 0.35);
  ctx.bezierCurveTo(cx + s, cy - s * 0.1, cx, cy - s * 0.1, cx, cy + s * 0.3);
  ctx.lineTo(cx, cy + s * 0.85);
  ctx.closePath();
}

function blobPath(ctx, cx, cy, r) {
  // Smooth organic blob using bezier curves
  const pts = [
    [0,   -r],
    [r * 0.7,  -r * 0.5],
    [r * 0.9,   r * 0.3],
    [r * 0.4,   r * 0.85],
    [-r * 0.4,  r * 0.9],
    [-r * 0.9,  r * 0.3],
    [-r * 0.8, -r * 0.4],
  ];
  ctx.moveTo(cx + pts[0][0], cy + pts[0][1]);
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const mx   = (curr[0] + next[0]) / 2;
    const my   = (curr[1] + next[1]) / 2;
    ctx.quadraticCurveTo(cx + curr[0], cy + curr[1], cx + mx, cy + my);
  }
  ctx.closePath();
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* 10e. Apply shape & download */
btnApplyShape.addEventListener('click', () => {
  if (!srcImage) return;
  drawShape();
  const name = srcFile.name.replace(/\.[^.]+$/, '') + `_${activeShape}`;
  downloadCanvas(shapeCanvas, name);
  showToast('Shape downloaded!');
});


/* ══════════════════════════════════════
   ── 11. TRANSFORM TAB ──
══════════════════════════════════════ */

/* 11a. Rotate */
btnRot90L.addEventListener('click', () => { rotAngle -= 90; syncAngleInputs(); drawTransform(); });
btnRot90R.addEventListener('click', () => { rotAngle += 90; syncAngleInputs(); drawTransform(); });
btnRot180.addEventListener('click', () => { rotAngle += 180; syncAngleInputs(); drawTransform(); });

angleSlider.addEventListener('input', () => {
  rotAngle = parseInt(angleSlider.value);
  customAngle.value = rotAngle;
  drawTransform();
});

customAngle.addEventListener('input', () => {
  rotAngle = parseInt(customAngle.value) || 0;
  angleSlider.value = Math.max(-180, Math.min(180, rotAngle));
  drawTransform();
});

function syncAngleInputs() {
  rotAngle = ((rotAngle % 360) + 360) % 360;
  if (rotAngle > 180) rotAngle -= 360;
  customAngle.value = rotAngle;
  angleSlider.value = Math.max(-180, Math.min(180, rotAngle));
}

/* 11b. Flip */
btnFlipH.addEventListener('click', () => { flipH = !flipH; drawTransform(); });
btnFlipV.addEventListener('click', () => { flipV = !flipV; drawTransform(); });

/* 11c. drawTransform */
function drawTransform() {
  if (!srcImage) return;

  const rad  = rotAngle * Math.PI / 180;
  const cosA = Math.abs(Math.cos(rad));
  const sinA = Math.abs(Math.sin(rad));
  const nw   = srcImage.naturalWidth;
  const nh   = srcImage.naturalHeight;
  const outW = Math.round(nw * cosA + nh * sinA);
  const outH = Math.round(nw * sinA + nh * cosA);

  const c   = transformCanvas;
  c.width   = outW;
  c.height  = outH;
  const ctx = c.getContext('2d');

  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate(rad);
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  ctx.drawImage(srcImage, -nw / 2, -nh / 2, nw, nh);
  ctx.restore();
}

/* 11d. Apply transform & download */
btnApplyTransform.addEventListener('click', () => {
  if (!srcImage) return;
  drawTransform();
  const suffix = `_r${rotAngle}${flipH ? '_fh' : ''}${flipV ? '_fv' : ''}`;
  downloadCanvas(transformCanvas, srcFile.name.replace(/\.[^.]+$/, '') + suffix);
  showToast('Transformed image downloaded!');
});

/* 11e. Reset transform */
btnResetTransform.addEventListener('click', () => {
  rotAngle = 0; flipH = false; flipV = false;
  angleSlider.value = 0; customAngle.value = 0;
  drawTransform();
  showToast('Transform reset');
});


/* ── 12. download() helpers ── */
function download(canvas, fmt, quality, name) {
  const mime = fmt === 'jpg' ? 'image/jpeg' : `image/${fmt}`;
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${fmt === 'jpeg' ? 'jpg' : fmt}`;
    a.click();
  }, mime, quality);
}

// For Crop / Shape / Lasso / Transform — uses the global format bar selection
function downloadWithGlobalFmt(canvas, baseName) {
  const fmt     = globalFmt;
  const quality = ['jpeg','webp'].includes(fmt) ? globalQuality : 1;
  const mime    = fmt === 'jpeg' ? 'image/jpeg' : `image/${fmt}`;
  const ext     = fmt === 'jpeg' ? 'jpg' : fmt;
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}.${ext}`;
    a.click();
  }, mime, quality);
}

// Legacy alias — now routes through global format
function downloadCanvas(canvas, name) {
  downloadWithGlobalFmt(canvas, name);
}


/* ══════════════════════════════════════
   ── 15. LASSO CUT TAB ──
══════════════════════════════════════ */

/* State */
let lassoNodes    = [];    // [{x, y}] in canvas display coordinates
let lassoNatNodes = [];    // [{x, y}] in natural image coordinates
let lassoClosed   = false;
let lassoScale    = 1;     // natural → display
let lassoBg       = 'transparent';
let featherRadius = 0;

/* Element refs */
const lassoCanvas      = document.getElementById('lassoCanvas');
const lassoCtx         = lassoCanvas.getContext('2d');
const lassoNodeCount   = document.getElementById('lassoNodeCount');
const lassoArea        = document.getElementById('lassoArea');
const btnApplyLasso    = document.getElementById('btnApplyLasso');
const btnUndoNode      = document.getElementById('btnUndoNode');
const btnResetLasso    = document.getElementById('btnResetLasso');
const featherSlider    = document.getElementById('featherSlider');
const featherVal       = document.getElementById('featherVal');

/* Init lasso canvas with the loaded image */
function initLassoCanvas() {
  if (!srcImage) return;

  // Scale image to fit container (max 700×520)
  const maxW = 700, maxH = 520;
  const scale = Math.min(maxW / srcImage.naturalWidth, maxH / srcImage.naturalHeight, 1);
  lassoScale = 1 / scale;

  lassoCanvas.width  = Math.round(srcImage.naturalWidth  * scale);
  lassoCanvas.height = Math.round(srcImage.naturalHeight * scale);

  // Reset state when loading a new image
  lassoNodes    = [];
  lassoNatNodes = [];
  lassoClosed   = false;
  btnApplyLasso.disabled = true;
  lassoNodeCount.textContent = '0';
  lassoArea.textContent      = '—';

  drawLassoFrame();
}

/* Draw the current state: image + polygon overlay */
function drawLassoFrame() {
  lassoCtx.clearRect(0, 0, lassoCanvas.width, lassoCanvas.height);

  // Draw source image
  lassoCtx.drawImage(srcImage, 0, 0, lassoCanvas.width, lassoCanvas.height);

  if (lassoNodes.length === 0) return;

  // Dim the image outside the polygon when closed
  if (lassoClosed) {
    lassoCtx.save();
    lassoCtx.fillStyle = 'rgba(0,0,0,0.45)';
    lassoCtx.fillRect(0, 0, lassoCanvas.width, lassoCanvas.height);

    lassoCtx.globalCompositeOperation = 'destination-out';
    lassoCtx.beginPath();
    lassoCtx.moveTo(lassoNodes[0].x, lassoNodes[0].y);
    lassoNodes.forEach((n, i) => { if (i > 0) lassoCtx.lineTo(n.x, n.y); });
    lassoCtx.closePath();
    lassoCtx.fill();
    lassoCtx.restore();
  }

  // Draw polygon lines
  lassoCtx.save();
  lassoCtx.strokeStyle = '#e34949';
  lassoCtx.lineWidth   = 2;
  lassoCtx.setLineDash([6, 3]);
  lassoCtx.lineDashOffset = Date.now() / 50; // animated march
  lassoCtx.beginPath();
  lassoCtx.moveTo(lassoNodes[0].x, lassoNodes[0].y);
  lassoNodes.forEach((n, i) => { if (i > 0) lassoCtx.lineTo(n.x, n.y); });
  if (lassoClosed) lassoCtx.closePath();
  lassoCtx.stroke();
  lassoCtx.restore();

  // Draw nodes
  lassoNodes.forEach((n, i) => {
    lassoCtx.beginPath();
    lassoCtx.arc(n.x, n.y, i === 0 ? 7 : 5, 0, Math.PI * 2);
    lassoCtx.fillStyle   = i === 0 ? '#e34949' : '#ffffff';
    lassoCtx.strokeStyle = '#e34949';
    lassoCtx.lineWidth   = 2;
    lassoCtx.fill();
    lassoCtx.stroke();
  });

  // Animate marching ants
  if (!lassoClosed) {
    requestAnimationFrame(drawLassoFrame);
  }
}

/* Handle canvas click — add node or close path */
lassoCanvas.addEventListener('click', e => {
  if (lassoClosed) return;

  const rect = lassoCanvas.getBoundingClientRect();
  const x    = (e.clientX - rect.left) * (lassoCanvas.width  / rect.width);
  const y    = (e.clientY - rect.top)  * (lassoCanvas.height / rect.height);

  // Check if clicking near the first node to close
  if (lassoNodes.length >= 3) {
    const first = lassoNodes[0];
    const dist  = Math.hypot(x - first.x, y - first.y);
    if (dist < 14) {
      closeLassoPath();
      return;
    }
  }

  lassoNodes.push({ x, y });
  lassoNatNodes.push({ x: x * lassoScale, y: y * lassoScale });
  lassoNodeCount.textContent = lassoNodes.length;
  drawLassoFrame();
});

function closeLassoPath() {
  lassoClosed = true;
  btnApplyLasso.disabled = false;
  lassoNodeCount.textContent = lassoNodes.length;
  updateLassoArea();
  drawLassoFrame();
  showToast('Path closed — click Cut & Download');
}

function updateLassoArea() {
  // Shoelace formula for polygon area in natural pixels
  let area = 0;
  const n  = lassoNatNodes.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += lassoNatNodes[i].x * lassoNatNodes[j].y;
    area -= lassoNatNodes[j].x * lassoNatNodes[i].y;
  }
  const px = Math.round(Math.abs(area) / 2);
  lassoArea.textContent = px.toLocaleString() + ' px²';
}

/* Undo last node */
btnUndoNode.addEventListener('click', () => {
  if (lassoClosed) {
    lassoClosed = false;
    btnApplyLasso.disabled = true;
  }
  lassoNodes.pop();
  lassoNatNodes.pop();
  lassoNodeCount.textContent = lassoNodes.length;
  drawLassoFrame();
});

/* Reset */
btnResetLasso.addEventListener('click', () => {
  lassoNodes    = [];
  lassoNatNodes = [];
  lassoClosed   = false;
  btnApplyLasso.disabled = true;
  lassoNodeCount.textContent = '0';
  lassoArea.textContent      = '—';
  if (srcImage) drawLassoFrame();
});

/* Lasso background selector */
document.querySelectorAll('.lasso-bg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lasso-bg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    lassoBg = btn.dataset.lbg;
  });
});

/* Feather slider */
featherSlider.addEventListener('input', () => {
  featherRadius = parseInt(featherSlider.value);
  featherVal.textContent = featherRadius + 'px';
});

/* Keyboard shortcuts for lasso */
document.addEventListener('keydown', e => {
  // Only act when lasso tab is active
  if (!document.getElementById('tab-lasso').classList.contains('active')) return;

  if (e.key === 'Enter' && !lassoClosed && lassoNodes.length >= 3) {
    closeLassoPath();
  }
  if (e.key === 'Escape') {
    btnResetLasso.click();
  }
  if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
    btnUndoNode.click();
  }
});

/* Apply lasso — cut subject and export with chosen background */
btnApplyLasso.addEventListener('click', () => {
  if (!srcImage || !lassoClosed || lassoNatNodes.length < 3) return;

  // Find bounding box of the polygon in natural pixels
  const xs = lassoNatNodes.map(n => n.x);
  const ys = lassoNatNodes.map(n => n.y);
  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxX = Math.min(srcImage.naturalWidth,  Math.ceil(Math.max(...xs)));
  const maxY = Math.min(srcImage.naturalHeight, Math.ceil(Math.max(...ys)));
  const outW = maxX - minX;
  const outH = maxY - minY;

  // Offscreen canvas at full natural resolution
  const out    = document.createElement('canvas');
  out.width    = outW;
  out.height   = outH;
  const octx   = out.getContext('2d');

  // Fill background if not transparent
  if (lassoBg === 'white') { octx.fillStyle = '#ffffff'; octx.fillRect(0, 0, outW, outH); }
  if (lassoBg === 'black') { octx.fillStyle = '#000000'; octx.fillRect(0, 0, outW, outH); }

  // Clip to polygon (offset by bounding box origin)
  octx.save();
  octx.beginPath();
  lassoNatNodes.forEach((n, i) => {
    i === 0
      ? octx.moveTo(n.x - minX, n.y - minY)
      : octx.lineTo(n.x - minX, n.y - minY);
  });
  octx.closePath();

  // Feather: blur canvas before clip for soft edges
  if (featherRadius > 0) {
    octx.filter = `blur(${featherRadius}px)`;
  }

  octx.clip();
  octx.filter = 'none';
  octx.drawImage(srcImage, -minX, -minY, srcImage.naturalWidth, srcImage.naturalHeight);
  octx.restore();

  const baseName = (srcFile ? srcFile.name.replace(/\.[^.]+$/, '') : 'cut') + '_lasso';
  downloadWithGlobalFmt(out, baseName);
  showToast('Cut image downloaded!');
});


/* ── 13. formatBytes ── */
function formatBytes(b) {
  if (b < 1024)        return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}


/* ── 14. Toast Helper ── */
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}