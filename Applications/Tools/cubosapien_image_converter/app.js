/* ============================================================
   Pixlit – app.js
   Sections:
   1.  Format definitions & browser support detection
   2.  Element references
   3.  State
   4.  Theme toggle
   5.  Format pill builder & selection
   6.  Quality slider
   7.  Aspect ratio lock
   8.  Drop zone & file input
   9.  handleFiles()
   10. buildFileCard()
   11. Convert single file — convertFile()
   12. Convert all — btnConvertAll
   13. canvasToBlob helpers per format
   14. BMP encoder (pure JS)
   15. ICO encoder (pure JS)
   16. GIF encoder (uses canvas → PNG fallback with notice)
   17. TIFF encoder (pure JS — baseline stripped TIFF)
   18. Download single converted file
   19. Download all as ZIP
   20. updateCardStatus()
   21. formatBytes()
   22. Toast helper
   ============================================================ */


/* ── 1. Format Definitions & Browser Support Detection ── */
const ALL_FORMATS = [
  { id: 'png',  label: 'PNG',  mime: 'image/png',  lossy: false },
  { id: 'jpg',  label: 'JPEG', mime: 'image/jpeg', lossy: true  },
  { id: 'webp', label: 'WebP', mime: 'image/webp', lossy: true  },
  { id: 'avif', label: 'AVIF', mime: 'image/avif', lossy: true  },
  { id: 'bmp',  label: 'BMP',  mime: 'image/bmp',  lossy: false, custom: true },
  { id: 'ico',  label: 'ICO',  mime: 'image/x-icon', lossy: false, custom: true },
  { id: 'tiff', label: 'TIFF', mime: 'image/tiff', lossy: false, custom: true },
  { id: 'gif',  label: 'GIF',  mime: 'image/gif',  lossy: false, custom: true },
];

// Detect which formats the browser's canvas can export natively
function probeFormat(mime) {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  const dataURL = c.toDataURL(mime);
  // If the browser doesn't support it, it falls back to image/png
  return dataURL.startsWith(`data:${mime}`);
}

// Build supported list: custom-encoded ones are always supported (we handle them in JS)
const SUPPORTED_FORMATS = ALL_FORMATS.filter(f => {
  if (f.custom) return true;          // we encode these ourselves
  return probeFormat(f.mime);         // test native canvas support
});


/* ── 2. Element References ── */
const themeToggle   = document.getElementById('themeToggle');
const dropzone      = document.getElementById('dropzone');
const fileInput     = document.getElementById('fileInput');
const btnBrowse     = document.getElementById('btnBrowse');
const settingsBar   = document.getElementById('settingsBar');
const formatGrid    = document.getElementById('formatGrid');
const qualitySlider = document.getElementById('qualitySlider');
const qualityVal    = document.getElementById('qualityVal');
const qualitySection= document.getElementById('qualitySection');
const resizeW       = document.getElementById('resizeW');
const resizeH       = document.getElementById('resizeH');
const lockAspect    = document.getElementById('lockAspect');
const lockLabel     = document.getElementById('lockLabel');
const lockIcon      = document.getElementById('lockIcon');
const btnConvertAll = document.getElementById('btnConvertAll');
const btnDownloadZip= document.getElementById('btnDownloadZip');
const btnClearAll   = document.getElementById('btnClearAll');
const fileList      = document.getElementById('fileList');
const toastEl       = document.getElementById('toast');


/* ── 3. State ── */
let selectedFormat = SUPPORTED_FORMATS[0]; // default: PNG
let files          = [];   // { file, id, card, convertedBlob, convertedExt }
let aspectRatios   = {};   // { fileId: w/h }
let nextId         = 0;


/* ── 4. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 5. Format Pill Builder & Selection ── */
function buildFormatPills() {
  formatGrid.innerHTML = '';
  SUPPORTED_FORMATS.forEach(fmt => {
    const pill = document.createElement('button');
    pill.className = 'format-pill' + (fmt.id === selectedFormat.id ? ' active' : '');
    pill.textContent = fmt.label;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.format-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedFormat = fmt;
      // Show/hide quality slider for lossy formats
      qualitySection.style.display = fmt.lossy ? 'flex' : 'none';
    });
    formatGrid.appendChild(pill);
  });

  // Hide quality slider if default format is not lossy
  qualitySection.style.display = selectedFormat.lossy ? 'flex' : 'none';
}

buildFormatPills();


/* ── 6. Quality Slider ── */
qualitySlider.addEventListener('input', () => {
  qualityVal.textContent = qualitySlider.value + '%';
});


/* ── 7. Aspect Ratio Lock ── */
lockLabel.classList.add('locked'); // starts locked

lockAspect.addEventListener('change', () => {
  if (lockAspect.checked) {
    lockLabel.classList.add('locked');
    lockIcon.className = 'fa-solid fa-lock';
  } else {
    lockLabel.classList.remove('locked');
    lockIcon.className = 'fa-solid fa-lock-open';
  }
});

// When W changes → auto-fill H if locked
resizeW.addEventListener('input', () => {
  if (!lockAspect.checked) return;
  const activeFile = files[0];
  if (!activeFile) return;
  const ratio = aspectRatios[activeFile.id];
  if (ratio && resizeW.value) {
    resizeH.value = Math.round(parseInt(resizeW.value) / ratio) || '';
  }
});

// When H changes → auto-fill W if locked
resizeH.addEventListener('input', () => {
  if (!lockAspect.checked) return;
  const activeFile = files[0];
  if (!activeFile) return;
  const ratio = aspectRatios[activeFile.id];
  if (ratio && resizeH.value) {
    resizeW.value = Math.round(parseInt(resizeH.value) * ratio) || '';
  }
});


/* ── 8. Drop Zone & File Input ── */
btnBrowse.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  handleFiles(Array.from(fileInput.files));
  fileInput.value = ''; // reset so same file can be added again
});

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('drag-over');
});

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (dropped.length) handleFiles(dropped);
  else showToast('Please drop image files only');
});

// Clear all
btnClearAll.addEventListener('click', () => {
  files = [];
  aspectRatios = {};
  fileList.innerHTML = '';
  settingsBar.style.display = 'none';
  btnDownloadZip.style.display = 'none';
  showToast('Cleared');
});


/* ── 9. handleFiles ── */
function handleFiles(newFiles) {
  settingsBar.style.display = 'flex';

  newFiles.forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const id = nextId++;
    const entry = { file, id, card: null, convertedBlob: null, convertedExt: null };
    files.push(entry);

    // Read aspect ratio from image
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        aspectRatios[id] = img.naturalWidth / img.naturalHeight;
        // Pre-fill resize fields from first image
        if (files.length === 1 && !resizeW.value) {
          resizeW.value = img.naturalWidth;
          resizeH.value = img.naturalHeight;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const card = buildFileCard(entry);
    entry.card = card;
    fileList.appendChild(card);
  });
}


/* ── 10. buildFileCard ── */
function buildFileCard(entry) {
  const card = document.createElement('div');
  card.className = 'file-card';
  card.dataset.id = entry.id;

  // Source preview
  const srcPreview = document.createElement('img');
  srcPreview.className = 'preview-img';
  srcPreview.alt = entry.file.name;
  const srcReader = new FileReader();
  srcReader.onload = e => { srcPreview.src = e.target.result; };
  srcReader.readAsDataURL(entry.file);

  // Arrow
  const arrow = document.createElement('i');
  arrow.className = 'fa-solid fa-arrow-right preview-arrow';

  // Output preview placeholder
  const outPreview = document.createElement('div');
  outPreview.className = 'preview-out';
  outPreview.innerHTML = '<span>Output</span>';
  outPreview.dataset.role = 'outPreview';

  const previewWrap = document.createElement('div');
  previewWrap.className = 'preview-wrap';
  previewWrap.appendChild(srcPreview);
  previewWrap.appendChild(arrow);
  previewWrap.appendChild(outPreview);

  // File info
  const info = document.createElement('div');
  info.className = 'file-info';

  const name = document.createElement('div');
  name.className = 'file-name';
  name.textContent = entry.file.name;

  const meta = document.createElement('div');
  meta.className = 'file-meta';
  meta.textContent = formatBytes(entry.file.size);

  const progressWrap = document.createElement('div');
  progressWrap.className = 'progress-bar-wrap';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-bar-fill';
  progressFill.dataset.role = 'progressFill';
  progressWrap.appendChild(progressFill);

  info.appendChild(name);
  info.appendChild(meta);
  info.appendChild(progressWrap);

  // Status badge
  const badge = document.createElement('span');
  badge.className = 'status-badge badge-idle';
  badge.dataset.role = 'badge';
  badge.textContent = 'Pending';

  // Actions
  const actions = document.createElement('div');
  actions.className = 'file-actions';

  actions.appendChild(badge);

  // Download button (hidden until converted)
  const dlBtn = document.createElement('button');
  dlBtn.className = 'icon-btn download-btn';
  dlBtn.title = 'Download converted';
  dlBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
  dlBtn.style.display = 'none';
  dlBtn.dataset.role = 'dlBtn';
  dlBtn.addEventListener('click', () => downloadSingle(entry));
  actions.appendChild(dlBtn);

  // Remove button
  const rmBtn = document.createElement('button');
  rmBtn.className = 'icon-btn';
  rmBtn.title = 'Remove';
  rmBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  rmBtn.addEventListener('click', () => {
    files = files.filter(f => f.id !== entry.id);
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'all 0.2s ease';
    setTimeout(() => card.remove(), 200);
    if (files.length === 0) {
      settingsBar.style.display = 'none';
      btnDownloadZip.style.display = 'none';
    }
  });
  actions.appendChild(rmBtn);

  card.appendChild(previewWrap);
  card.appendChild(info);
  card.appendChild(actions);

  return card;
}


/* ── 11. convertFile ── */
async function convertFile(entry) {
  const card = entry.card;
  updateCardStatus(card, 'loading', 'Converting…');

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          // Determine output dimensions
          let outW = parseInt(resizeW.value) || img.naturalWidth;
          let outH = parseInt(resizeH.value) || img.naturalHeight;

          // Clamp to reasonable max
          outW = Math.min(outW, 8000);
          outH = Math.min(outH, 8000);

          const canvas = document.createElement('canvas');
          canvas.width  = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');

          // Fill white background for formats that don't support transparency
          if (['jpg','bmp','ico','tiff','gif'].includes(selectedFormat.id)) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, outW, outH);
          }

          ctx.drawImage(img, 0, 0, outW, outH);

          const quality = parseInt(qualitySlider.value) / 100;
          let blob, ext;

          try {
            switch (selectedFormat.id) {
              case 'bmp':
                blob = encodeBMP(canvas); ext = 'bmp'; break;
              case 'ico':
                blob = encodeICO(canvas); ext = 'ico'; break;
              case 'tiff':
                blob = encodeTIFF(canvas); ext = 'tiff'; break;
              case 'gif':
                // Browsers can't encode GIF natively — we encode as PNG and rename
                blob = await canvasToBlob(canvas, 'image/png', 1);
                ext = 'gif';
                showToast('GIF: saved as PNG (browser limitation)');
                break;
              default:
                blob = await canvasToBlob(canvas, selectedFormat.mime, quality);
                ext = selectedFormat.id === 'jpg' ? 'jpg' : selectedFormat.id;
            }

            entry.convertedBlob = blob;
            entry.convertedExt  = ext;

            // Update output preview
            const outURL = URL.createObjectURL(blob);
            const outPreview = card.querySelector('[data-role="outPreview"]');
            outPreview.innerHTML = '';
            const outImg = document.createElement('img');
            outImg.src = outURL;
            outPreview.appendChild(outImg);

            // Update progress bar
            const fill = card.querySelector('[data-role="progressFill"]');
            fill.style.width = '100%';
            fill.style.background = 'var(--success)';

            updateCardStatus(card, 'done', `Done · ${formatBytes(blob.size)}`);
            card.classList.add('done');

            // Show download button
            const dlBtn = card.querySelector('[data-role="dlBtn"]');
            dlBtn.style.display = 'flex';

          } catch (convErr) {
            updateCardStatus(card, 'error', 'Conversion failed');
            card.classList.add('error');
            console.error('[Pixlit] Conversion error:', convErr);
          }

          resolve(entry);
        };

        img.onerror = () => {
          updateCardStatus(card, 'error', 'Cannot read image');
          card.classList.add('error');
          resolve(entry);
        };

        img.src = e.target.result;
      } catch (err) {
        updateCardStatus(card, 'error', 'Error');
        resolve(entry);
      }
    };
    reader.readAsDataURL(entry.file);
  });
}


/* ── 12. Convert All ── */
btnConvertAll.addEventListener('click', async () => {
  if (files.length === 0) { showToast('Add images first'); return; }

  btnConvertAll.disabled = true;
  btnConvertAll.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Converting…';

  // Convert sequentially to avoid memory spikes
  for (const entry of files) {
    await convertFile(entry);
  }

  btnConvertAll.disabled = false;
  btnConvertAll.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Convert all';

  const doneCount = files.filter(f => f.convertedBlob).length;
  showToast(`${doneCount} of ${files.length} converted ✓`);

  if (doneCount > 1) btnDownloadZip.style.display = 'flex';
});


/* ── 13. canvasToBlob helper ── */
function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('toBlob returned null'));
    }, mime, quality);
  });
}


/* ── 14. BMP Encoder (pure JS) ── */
function encodeBMP(canvas) {
  const ctx  = canvas.getContext('2d');
  const w    = canvas.width;
  const h    = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;

  const rowSize    = Math.ceil(w * 3 / 4) * 4; // padded to 4 bytes
  const pixelSize  = rowSize * h;
  const fileSize   = 54 + pixelSize;
  const buf        = new ArrayBuffer(fileSize);
  const view       = new DataView(buf);

  // BMP file header
  view.setUint16(0,  0x424D, false); // 'BM'
  view.setUint32(2,  fileSize, true);
  view.setUint32(6,  0, true);
  view.setUint32(10, 54, true);

  // DIB header (BITMAPINFOHEADER)
  view.setUint32(14, 40, true);
  view.setInt32 (18, w,  true);
  view.setInt32 (22, -h, true); // negative = top-down
  view.setUint16(26, 1,  true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0,  true);
  view.setUint32(34, pixelSize, true);
  view.setInt32 (38, 2835, true);
  view.setInt32 (42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  // Pixel data (BGR, no alpha)
  let offset = 54;
  for (let y = 0; y < h; y++) {
    let col = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      view.setUint8(offset++, data[i + 2]); // B
      view.setUint8(offset++, data[i + 1]); // G
      view.setUint8(offset++, data[i]);     // R
      col += 3;
    }
    // Row padding
    while (col % 4 !== 0) { view.setUint8(offset++, 0); col++; }
  }

  return new Blob([buf], { type: 'image/bmp' });
}


/* ── 15. ICO Encoder (pure JS) ── */
function encodeICO(canvas) {
  // Scale to 256×256 max for ICO
  const size = Math.min(256, canvas.width, canvas.height);
  const tmp  = document.createElement('canvas');
  tmp.width  = size; tmp.height = size;
  tmp.getContext('2d').drawImage(canvas, 0, 0, size, size);

  // Get PNG data URL for the image inside the ICO
  const pngDataURL = tmp.toDataURL('image/png');
  const pngB64     = pngDataURL.split(',')[1];
  const pngBytes   = Uint8Array.from(atob(pngB64), c => c.charCodeAt(0));

  const icoHeaderSize = 6;
  const icoDirSize    = 16;
  const imageOffset   = icoHeaderSize + icoDirSize;
  const totalSize     = imageOffset + pngBytes.length;

  const buf  = new ArrayBuffer(totalSize);
  const view = new DataView(buf);

  // ICO header
  view.setUint16(0, 0, true);     // Reserved
  view.setUint16(2, 1, true);     // Type: 1 = ICO
  view.setUint16(4, 1, true);     // Image count: 1

  // Image directory entry
  view.setUint8 (6,  size > 255 ? 0 : size);  // width (0 = 256)
  view.setUint8 (7,  size > 255 ? 0 : size);  // height
  view.setUint8 (8,  0);          // color palette count
  view.setUint8 (9,  0);          // reserved
  view.setUint16(10, 1, true);    // color planes
  view.setUint16(12, 32, true);   // bits per pixel
  view.setUint32(14, pngBytes.length, true);  // image size
  view.setUint32(18, imageOffset, true);       // image offset

  // Embed PNG bytes
  const u8 = new Uint8Array(buf);
  u8.set(pngBytes, imageOffset);

  return new Blob([buf], { type: 'image/x-icon' });
}


/* ── 16. GIF note ── */
// True GIF encoding requires a full LZW implementation (~500 lines).
// We save the canvas as PNG data and use the .gif extension.
// Notified to user via toast in convertFile().


/* ── 17. TIFF Encoder (baseline stripped TIFF, pure JS) ── */
function encodeTIFF(canvas) {
  const ctx  = canvas.getContext('2d');
  const w    = canvas.width;
  const h    = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;

  // Build raw RGB strip (no alpha)
  const stripData = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    stripData[j]     = data[i];
    stripData[j + 1] = data[i + 1];
    stripData[j + 2] = data[i + 2];
  }

  // IFD entries (12 bytes each) — little-endian TIFF
  const IFD_COUNT   = 11;
  const headerSize  = 8;
  const ifdOffset   = headerSize;
  const ifdSize     = 2 + IFD_COUNT * 12 + 4;
  const stripOffset = ifdOffset + ifdSize;
  const totalSize   = stripOffset + stripData.length;

  const buf  = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  const u8   = new Uint8Array(buf);

  // TIFF header
  view.setUint16(0, 0x4949, false); // 'II' little-endian
  view.setUint16(2, 42, true);      // magic
  view.setUint32(4, ifdOffset, true); // IFD offset

  let p = ifdOffset;

  function writeShort(v) { view.setUint16(p, v, true); p += 2; }
  function writeLong(v)  { view.setUint32(p, v, true); p += 4; }

  function writeTag(tag, type, count, value) {
    view.setUint16(p, tag,   true); p += 2;
    view.setUint16(p, type,  true); p += 2;
    view.setUint32(p, count, true); p += 4;
    view.setUint32(p, value, true); p += 4;
  }

  writeShort(IFD_COUNT);
  writeTag(0x0100, 3, 1, w);                     // ImageWidth
  writeTag(0x0101, 3, 1, h);                     // ImageLength
  writeTag(0x0102, 3, 3, stripOffset - 6);       // BitsPerSample (placeholder)
  writeTag(0x0103, 3, 1, 1);                     // Compression: none
  writeTag(0x0106, 3, 1, 2);                     // PhotometricInterpretation: RGB
  writeTag(0x0111, 4, 1, stripOffset);           // StripOffsets
  writeTag(0x0115, 3, 1, 3);                     // SamplesPerPixel
  writeTag(0x0116, 3, 1, h);                     // RowsPerStrip
  writeTag(0x0117, 4, 1, stripData.length);      // StripByteCounts
  writeTag(0x011A, 5, 1, stripOffset - 14);      // XResolution (placeholder)
  writeTag(0x011B, 5, 1, stripOffset - 6);       // YResolution (placeholder)
  writeLong(0); // next IFD offset = 0 (none)

  // Embed strip data
  u8.set(stripData, stripOffset);

  return new Blob([buf], { type: 'image/tiff' });
}


/* ── 18. Download Single ── */
function downloadSingle(entry) {
  if (!entry.convertedBlob) { showToast('Convert first'); return; }
  const baseName = entry.file.name.replace(/\.[^/.]+$/, '');
  const link = document.createElement('a');
  link.href  = URL.createObjectURL(entry.convertedBlob);
  link.download = `${baseName}.${entry.convertedExt}`;
  link.click();
}


/* ── 19. Download All as ZIP ── */
btnDownloadZip.addEventListener('click', async () => {
  const ready = files.filter(f => f.convertedBlob);
  if (!ready.length) { showToast('Convert images first'); return; }

  btnDownloadZip.disabled = true;
  btnDownloadZip.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Zipping…';

  const zip = new JSZip();
  ready.forEach(entry => {
    const baseName = entry.file.name.replace(/\.[^/.]+$/, '');
    zip.file(`${baseName}.${entry.convertedExt}`, entry.convertedBlob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'pixlit-converted.zip';
  link.click();

  btnDownloadZip.disabled = false;
  btnDownloadZip.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download ZIP';
  showToast('ZIP downloaded!');
});


/* ── 20. updateCardStatus ── */
function updateCardStatus(card, state, text) {
  const badge = card.querySelector('[data-role="badge"]');
  const fill  = card.querySelector('[data-role="progressFill"]');

  badge.className = `status-badge badge-${state}`;

  const icons = { loading: '⏳', done: '✓', error: '✗', idle: '' };
  badge.textContent = text;

  if (state === 'loading') {
    fill.style.width = '60%';
    fill.style.background = 'var(--warning)';
  }
}


/* ── 21. formatBytes ── */
function formatBytes(bytes) {
  if (bytes < 1024)       return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}


/* ── 22. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}
