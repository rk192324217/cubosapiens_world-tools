/* ============================================================
   QRaft – app.js
   Sections:
   1. State
   2. Element references
   3. Theme toggle
   4. Segmented control (error correction)
   5. Size slider
   6. Colour pickers
   7. Quick links
   8. Keyboard shortcut (Enter)
   9. Generate QR
   10. Download QR (with logo composite)
   11. Copy to clipboard
   12. Toast helper
   13. Canvas helper – roundRect
   ============================================================ */


/* ── 1. State ── */
let qrInstance  = null;   // holds the QRCode object
let currentEC   = 'M';    // error-correction level: L | M | Q | H
let hasGenerated = false;  // whether a QR has been drawn at least once
let customLogoSrc = 'assets/logo.png';
let bgColor = '#ffffff';

const backgroundColorOptions = [
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Soft Cream', value: '#fdfbf7' },
  { name: 'Pastel Mint', value: '#e6f7ed' },
  { name: 'Pastel Blue', value: '#e6f0fa' },
  { name: 'Pastel Pink', value: '#fce4ec' },
  { name: 'Light Lavender', value: '#f3e5f5' },
  { name: 'Soft Yellow', value: '#fffde7' },
];

/* ── 2. Element References ── */
const htmlEl       = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const urlInput     = document.getElementById('urlInput');
const btnGenerate  = document.getElementById('btnGenerate');
const qrStage      = document.getElementById('qrStage');
const qrRender     = document.getElementById('qr-render');
const qrPlaceholder= document.getElementById('qrPlaceholder');
const qrLogo       = document.getElementById('qrLogo');
const qrActions    = document.getElementById('qrActions');
const sizeSlider   = document.getElementById('sizeSlider');
const sizeVal      = document.getElementById('sizeVal');
const bgPalette      = document.getElementById('bgPalette');
const lightColorHint= document.getElementById('lightColorHint');
const logoUpload    = document.getElementById('logoUpload');
const logoUploadText= document.getElementById('logoUploadText');
const logoUploadLabel=document.getElementById('logoUploadLabel');
const logoResetBtn  = document.getElementById('logoResetBtn');
const qrLogoImg     = document.getElementById('qrLogoImg');
const btnDownload  = document.getElementById('btnDownload');
const btnCopy      = document.getElementById('btnCopy');
const toastEl      = document.getElementById('toast');


/* ── 3. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  htmlEl.dataset.theme = htmlEl.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 4. Segmented Control (Error Correction) ── */
document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Deactivate all, activate clicked
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentEC = btn.dataset.ec;

    // Regenerate if a QR already exists
    if (hasGenerated) generateQR();
  });
});


/* ── 5. Size Slider ── */
sizeSlider.addEventListener('input', () => {
  sizeVal.textContent = sizeSlider.value + ' px';
  if (hasGenerated) generateQR();
});


/* ── 6. Curated Background Palette ── */
function setBgColor(nextColor) {
  bgColor = nextColor;
  lightColorHint.textContent = nextColor;
  renderBackgroundPalette();

  if (hasGenerated) generateQR();
}

function renderBackgroundPalette() {
  bgPalette.innerHTML = '';

  backgroundColorOptions.forEach(color => {
    const isSelected = bgColor === color.value;
    const swatch = document.createElement('button');

    swatch.type = 'button';
    swatch.className = `bg-swatch${isSelected ? ' selected' : ''}`;
    swatch.style.backgroundColor = color.value;
    swatch.title = color.name;
    swatch.setAttribute('aria-label', `Use ${color.name} background`);
    swatch.setAttribute('aria-pressed', String(isSelected));

    if (isSelected) {
      swatch.innerHTML = `
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M7.6 13.4 3.9 9.7l1.4-1.4 2.3 2.3 7.1-7.1 1.4 1.4-8.5 8.5z"></path>
        </svg>
      `;
    }

    swatch.addEventListener('click', () => setBgColor(color.value));
    bgPalette.appendChild(swatch);
  });
}

renderBackgroundPalette();

/* ── 6b. Logo Upload ── */
logoUpload.addEventListener('change', () => {
  const file = logoUpload.files[0];
  if (!file) return;

  // Validate it's an image
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    customLogoSrc = e.target.result;         // store as base64 data URL
    qrLogoImg.src = customLogoSrc;           // update the visible overlay
    logoUploadText.textContent = file.name;  // show filename in the button
    logoUploadLabel.classList.add('has-logo');
    logoResetBtn.style.display = 'inline';   // show Reset link
    showToast('Logo updated!');
    if (hasGenerated) generateQR();
  };
  reader.readAsDataURL(file);
});

// Reset logo back to default assets/logo.png
logoResetBtn.addEventListener('click', () => {
  customLogoSrc = 'assets/logo.png';
  qrLogoImg.src = customLogoSrc;
  logoUpload.value = '';
  logoUploadText.textContent = 'Upload your logo';
  logoUploadLabel.classList.remove('has-logo');
  logoResetBtn.style.display = 'none';
  showToast('Logo reset to default');
  if (hasGenerated) generateQR();
});
/* ── 7. Quick Links ── */
document.querySelectorAll('[data-quick]').forEach(btn => {
  btn.addEventListener('click', () => {
    urlInput.value = btn.dataset.quick;
    generateQR();
  });
});


/* ── 8. Keyboard Shortcut ── */
urlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') generateQR();
});

btnGenerate.addEventListener('click', generateQR);


/* ── 9. Generate QR ── */
function generateQR() {
  const url = urlInput.value.trim();

  if (!url) {
    showToast('Please enter a URL first');
    return;
  }

const size  = parseInt(sizeSlider.value);
  const dark  = '#000000';       // always black — only background is user-editable
  const light = bgColor;

  // Clear previous QR canvas / image
  qrRender.innerHTML = '';
  qrInstance = null;

  // Pulse-ring burst effect on the stage
  addPulseRing();

  // Create wrapper div that QRCode.js will append its canvas into
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:12px;';
  qrRender.appendChild(wrap);

  try {
    qrInstance = new QRCode(wrap, {
      text:         url,
      width:        size,
      height:       size,
      colorDark:    dark,
      colorLight:   light,
      correctLevel: QRCode.CorrectLevel[currentEC]
    });

    // Pop-in animation on the wrapper
    wrap.classList.add('qr-reveal');

    // Show centre logo overlay
    qrLogo.classList.add('visible');

    // Enable action buttons
    qrActions.classList.add('enabled');

    hasGenerated = true;
    showToast('QR code generated successfully! ');

  } catch (err) {
    // Show inline error
    qrRender.innerHTML = '<div class="qr-placeholder"><p style="color:var(--red)">Invalid URL – please try again</p></div>';
    console.error('[QRaft] QR generation error:', err);
  }
}


/* ── 10. Download QR (with logo composite) ── */
btnDownload.addEventListener('click', () => {
  const canvas = document.querySelector('#qr-render canvas');

  if (!canvas) {
    showToast('Generate a QR first');
    return;
  }

  const size = parseInt(sizeSlider.value);

  // Draw onto an offscreen canvas so we can composite the logo
  const offscreen = document.createElement('canvas');
  offscreen.width  = size;
  offscreen.height = size;
  const ctx = offscreen.getContext('2d');

  // 1. Draw the QR
  ctx.drawImage(canvas, 0, 0, size, size);
// 2. Draw the logo (your PNG or user-uploaded image) at the centre
  const logoSize = Math.round(size * 0.18);
  const logoX    = (size - logoSize) / 2;
  const logoY    = (size - logoSize) / 2;
  const logoRadius = logoSize * 0.22;

  const logoImg = new Image();
  logoImg.onload = () => {
    // White rounded background behind logo
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, logoX - 4, logoY - 4, logoSize + 8, logoSize + 8, logoRadius + 2);
    ctx.fill();

    // Clip to rounded rect then draw logo
    ctx.save();
    roundRect(ctx, logoX, logoY, logoSize, logoSize, logoRadius);
    ctx.clip();
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Trigger download after logo is drawn
    const link    = document.createElement('a');
    link.download = 'qraft-code.png';
    link.href     = offscreen.toDataURL('image/png');
    link.click();
    showToast('Preparing your file for download...');
  };

  // If logo fails to load, download QR without it
  logoImg.onerror = () => {
    const link    = document.createElement('a');
    link.download = 'qraft-code.png';
    link.href     = offscreen.toDataURL('image/png');
    link.click();
    showToast('Downloaded (logo not found)');
  };

  logoImg.src = customLogoSrc;
});


/* ── 11. Copy to Clipboard ── */
btnCopy.addEventListener('click', async () => {
  const canvas = document.querySelector('#qr-render canvas');

  if (!canvas) {
    showToast('Generate a QR first');
    return;
  }

  canvas.toBlob(async blob => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('Copied to clipboard!');
    } catch (err) {
      showToast('Copy not supported in this browser');
      console.warn('[QRaft] Clipboard error:', err);
    }
  });
});


/* ── 12. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}


/* ── 13. Canvas Helper – Pulse Ring ── */
function addPulseRing() {
  const ring = document.createElement('div');
  ring.className = 'pulse-ring';
  qrStage.appendChild(ring);
  // Remove after animation ends so it doesn't pile up in the DOM
  setTimeout(() => ring.remove(), 700);
}


/* ── 14. Canvas Helper – roundRect (for download composite) ── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
  ctx.lineTo(x,     y + r);
  ctx.quadraticCurveTo(x,     y,     x + r, y);
  ctx.closePath();
}
