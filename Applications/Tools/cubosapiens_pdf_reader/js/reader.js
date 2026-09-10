/* ══════════════════════════════════════════════════════
   reader.js — PDF, EPUB & CBZ rendering engine
   Features: zoom, continuous scroll, page-by-page mode
   ══════════════════════════════════════════════════════ */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ── State ─────────────────────────────────────────── */
let currentBook    = null;
let pdfDoc         = null;
let cbzImages      = [];
let epubChapters   = [];
let epubZip        = null;
let epubOpfBase    = '';
let currentPage    = 1;
let totalPages     = 1;
let currentZoom    = 1.0;
let continuousMode = false;
let _saveTimer     = null;
let _scrollObserver = null;
let _renderingContinuous = false;

const ZOOM_MIN  = 0.5;
const ZOOM_MAX  = 3.0;
const ZOOM_STEP = 0.25;

/* ═══ PUBLIC: open book by ID ═══════════════════════ */
async function openBook(id) {
  const book = await dbGet(id);
  if (!book) { showToast('<i class="fa-solid fa-circle-exclamation"></i> Book not found'); return; }

  currentBook  = book;
  pdfDoc       = null;
  cbzImages    = [];
  epubChapters = [];
  epubZip      = null;
  currentZoom  = 1.0;
  _teardownScrollObserver();

  switchView('reader');

  document.getElementById('readerTitle').textContent = book.name;
  document.getElementById('pageInfo').textContent    = '';
  document.getElementById('btnToc').style.display    = 'none';
  document.getElementById('epubSidebar').classList.remove('open');
  document.getElementById('btnToc').setAttribute('aria-pressed', 'false');
  _updateZoomBadge();

  const wrap = document.getElementById('canvasWrap');
  wrap.innerHTML = `
    <div class="loader" id="loader" aria-live="polite">
      <div class="loader-panels">
        <div class="loader-panel"></div>
        <div class="loader-panel"></div>
        <div class="loader-panel"></div>
      </div>
      <span>Opening book<span class="loader-dots">...</span></span>
    </div>`;

  const saved = getProgress(id);

  try {
    if (book.type === 'pdf')       await _openPDF(book, saved);
    else if (book.type === 'cbz')  await _openCBZ(book, saved);
    else                           await _openEPUB(book, saved);
  } catch (err) {
    console.error('[CuboPDF] open error:', err);
    wrap.innerHTML = `<div class="loader"><span style="color:#c00">
      <i class="fa-solid fa-circle-exclamation"></i> Could not open file</span></div>`;
    showToast('<i class="fa-solid fa-circle-exclamation"></i> Could not open file');
  }
}

/* ─── Safe byte copy ────────────────────────────── */
function _toBytes(data) {
  if (data instanceof Uint8Array)  return data.slice();
  if (data instanceof ArrayBuffer) return new Uint8Array(data).slice();
  throw new Error('Unknown data type');
}

/* ═══ PDF ═══════════════════════════════════════════ */
async function _openPDF(book, saved) {
  pdfDoc = await pdfjsLib.getDocument({ data: _toBytes(book.data) }).promise;
  totalPages  = pdfDoc.numPages;
  currentPage = saved ? Math.min(saved.page, totalPages) : 1;
  document.getElementById('pageInput').max = totalPages;
  document.getElementById('navTotal').textContent = '/ ' + totalPages;
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'none';
  if (continuousMode) await _renderPDFContinuous();
  else                await _renderPDFPage(currentPage);
}

async function _renderPDFPage(num) {
  _teardownScrollObserver();
  const wrap = document.getElementById('canvasWrap');
  wrap.innerHTML = '';
  wrap.classList.remove('continuous');

  const cv = document.createElement('canvas');
  cv.id = 'pdfCanvas';
  wrap.appendChild(cv);

  const page     = await pdfDoc.getPage(num);
  const baseVP   = page.getViewport({ scale: 1 });
  const avail    = Math.max(wrap.clientWidth - 48, 300);
  const fitScale = avail / baseVP.width;
  const vp       = page.getViewport({ scale: fitScale * currentZoom });

  cv.width  = vp.width;
  cv.height = vp.height;
  cv.style.maxWidth = '100%';
  await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;

  wrap.scrollTop = 0;
  _updateNav();
  _scheduleSave();
}

async function _renderPDFContinuous() {
  if (_renderingContinuous) return;
  _renderingContinuous = true;
  _teardownScrollObserver();
  const wrap  = document.getElementById('canvasWrap');
  wrap.innerHTML = '';
  wrap.classList.add('continuous');
  const avail = Math.max(wrap.clientWidth - 48, 300);

  for (let i = 1; i <= totalPages; i++) {
    const page     = await pdfDoc.getPage(i);
    const baseVP   = page.getViewport({ scale: 1 });
    const fitScale = avail / baseVP.width;
    const vp       = page.getViewport({ scale: fitScale * currentZoom });

    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.dataset.page = i;

    const cv = document.createElement('canvas');
    cv.width  = vp.width;
    cv.height = vp.height;
    cv.style.maxWidth = '100%';
    cv.style.display  = 'block';
    wrapper.appendChild(cv);
    wrap.appendChild(wrapper);
    page.render({ canvasContext: cv.getContext('2d'), viewport: vp });
  }

  _scrollToPage(currentPage);
  _setupScrollObserver();
  _updateNav();
  _renderingContinuous = false;
}

/* ═══ CBZ ════════════════════════════════════════════ */
async function _openCBZ(book, saved) {
  const zip     = await JSZip.loadAsync(_toBytes(book.data));
  const imgExts = /\.(jpe?g|png|gif|webp|avif)$/i;
  const entries = Object.keys(zip.files)
    .filter(n => !zip.files[n].dir && imgExts.test(n))
    .sort(_naturalSort);

  if (entries.length === 0) throw new Error('No images found in CBZ');

  cbzImages = [];
  for (const name of entries) {
    const blob = await zip.files[name].async('blob');
    cbzImages.push({ name, blobUrl: URL.createObjectURL(blob) });
  }

  totalPages  = cbzImages.length;
  currentPage = saved ? Math.min(saved.page, totalPages) : 1;
  document.getElementById('pageInput').max = totalPages;
  document.getElementById('navTotal').textContent = '/ ' + totalPages;
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'none';

  if (continuousMode) _renderCBZContinuous();
  else                _renderCBZPage(currentPage);
}

function _renderCBZPage(num) {
  _teardownScrollObserver();
  const wrap = document.getElementById('canvasWrap');
  wrap.innerHTML = '';
  wrap.classList.remove('continuous');

  const img = document.createElement('img');
  img.src = cbzImages[num - 1].blobUrl;
  img.alt = 'Page ' + num;
  img.className = 'cbz-page-img';
  img.style.transform = 'scale(' + currentZoom + ')';
  img.style.transformOrigin = 'top center';
  wrap.appendChild(img);
  wrap.scrollTop = 0;
  _updateNav();
  _scheduleSave();
}

function _renderCBZContinuous() {
  _teardownScrollObserver();
  const wrap = document.getElementById('canvasWrap');
  wrap.innerHTML = '';
  wrap.classList.add('continuous');

  cbzImages.forEach(function(imgData, i) {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.dataset.page = i + 1;

    const img = document.createElement('img');
    img.src = imgData.blobUrl;
    img.alt = 'Page ' + (i + 1);
    img.className = 'cbz-page-img';
    img.loading = 'lazy';
    img.style.transform = 'scale(' + currentZoom + ')';
    img.style.transformOrigin = 'top center';
    wrapper.appendChild(img);
    wrap.appendChild(wrapper);
  });

  _scrollToPage(currentPage);
  _setupScrollObserver();
  _updateNav();
}

function _naturalSort(a, b) {
  var re = /(\d+)/g;
  var partsA = a.split(re), partsB = b.split(re);
  for (var i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    var pa = partsA[i] || '', pb = partsB[i] || '';
    var na = parseInt(pa, 10), nb = parseInt(pb, 10);
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
    if (pa !== pb) return pa < pb ? -1 : 1;
  }
  return 0;
}

/* ═══ EPUB ═══════════════════════════════════════════ */
async function _openEPUB(book, saved) {
  epubZip = await JSZip.loadAsync(_toBytes(book.data));

  const containerXml = await epubZip.files['META-INF/container.xml']?.async('text');
  const opfPath = containerXml?.match(/full-path="([^"]+\.opf)"/)?.[1];
  if (!opfPath) throw new Error('No OPF found');

  epubOpfBase = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
  const opfXml = await epubZip.files[opfPath]?.async('text');
  const parser  = new DOMParser();
  const opfDoc  = parser.parseFromString(opfXml, 'application/xml');

  const manifest = {};
  opfDoc.querySelectorAll('manifest item').forEach(function(it) {
    manifest[it.getAttribute('id')] = {
      href: epubOpfBase + it.getAttribute('href'),
      type: it.getAttribute('media-type'),
    };
  });

  const spineIds = Array.from(opfDoc.querySelectorAll('spine itemref')).map(function(i) { return i.getAttribute('idref'); });
  epubChapters = spineIds
    .map(function(sid, idx) { return { href: manifest[sid]?.href, idx: idx }; })
    .filter(function(c) { return c.href && epubZip.files[c.href]; });

  totalPages  = epubChapters.length;
  currentPage = saved ? Math.min(saved.page, totalPages) : 1;

  const tocNames = {};
  const ncxId   = opfDoc.querySelector('spine')?.getAttribute('toc');
  const ncxHref = ncxId ? manifest[ncxId]?.href : null;
  if (ncxHref && epubZip.files[ncxHref]) {
    const ncxXml = await epubZip.files[ncxHref].async('text');
    const ncxDoc = parser.parseFromString(ncxXml, 'application/xml');
    ncxDoc.querySelectorAll('navPoint').forEach(function(np) {
      const src   = np.querySelector('content')?.getAttribute('src')?.split('#')[0];
      const label = np.querySelector('navLabel text')?.textContent?.trim();
      if (src) tocNames[epubOpfBase + src] = label;
    });
  }

  epubChapters = epubChapters.map(function(c, i) {
    return Object.assign({}, c, { name: tocNames[c.href] || ('Chapter ' + (i + 1)) });
  });

  const list = document.getElementById('chapterList');
  list.innerHTML = epubChapters.map(function(c, i) {
    return '<div class="chapter-item" id="ch_' + i + '" role="listitem" tabindex="0"' +
           ' onclick="jumpToChapter(' + (i + 1) + ')"' +
           ' onkeydown="if(event.key===\'Enter\')jumpToChapter(' + (i + 1) + ')">' +
           c.name + '</div>';
  }).join('');

  document.getElementById('btnToc').style.display = 'flex';
  document.getElementById('pageInput').max = totalPages;
  document.getElementById('navTotal').textContent = '/ ' + totalPages;
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'none';

  if (continuousMode) await _renderEPUBContinuous();
  else                await _renderEPUBChapter(currentPage);
}

async function _renderEPUBChapter(num) {
  _teardownScrollObserver();
  const ch = epubChapters[num - 1];
  if (!ch) return;

  const html = await epubZip.files[ch.href]?.async('text');
  if (!html) { showToast('Could not load chapter'); return; }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script, link[rel="stylesheet"], style').forEach(function(el) { el.remove(); });

  for (const img of parsed.querySelectorAll('img')) {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;
    const chDir   = ch.href.includes('/') ? ch.href.substring(0, ch.href.lastIndexOf('/') + 1) : '';
    const imgPath = (chDir + src).replace(/\/\.\//g, '/');
    const file    = epubZip.files[imgPath];
    if (file) img.src = URL.createObjectURL(await file.async('blob'));
  }

  const wrap = document.getElementById('canvasWrap');
  wrap.innerHTML = '';
  wrap.classList.remove('continuous');

  const div = document.createElement('div');
  div.className = 'epub-content';
  div.style.fontSize = (currentZoom * 100) + '%';
  div.innerHTML = parsed.body.innerHTML;
  wrap.appendChild(div);
  wrap.scrollTop = 0;

  document.querySelectorAll('.chapter-item').forEach(function(el, i) {
    el.classList.toggle('active', i === num - 1);
  });
  document.getElementById('ch_' + (num - 1))?.scrollIntoView({ block: 'nearest' });

  currentPage = num;
  _updateNav();
  _scheduleSave();
}

async function _renderEPUBContinuous() {
  _teardownScrollObserver();
  const wrap = document.getElementById('canvasWrap');
  wrap.innerHTML = '';
  wrap.classList.add('continuous');

  for (let i = 0; i < epubChapters.length; i++) {
    const ch   = epubChapters[i];
    const html = await epubZip.files[ch.href]?.async('text');
    if (!html) continue;

    const parsed = new DOMParser().parseFromString(html, 'text/html');
    parsed.querySelectorAll('script, link[rel="stylesheet"], style').forEach(function(el) { el.remove(); });

    for (const img of parsed.querySelectorAll('img')) {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;
      const chDir   = ch.href.includes('/') ? ch.href.substring(0, ch.href.lastIndexOf('/') + 1) : '';
      const imgPath = (chDir + src).replace(/\/\.\//g, '/');
      const file    = epubZip.files[imgPath];
      if (file) img.src = URL.createObjectURL(await file.async('blob'));
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper epub-chapter-wrapper';
    wrapper.dataset.page = i + 1;

    const div = document.createElement('div');
    div.className = 'epub-content';
    div.style.fontSize = (currentZoom * 100) + '%';
    div.innerHTML = parsed.body.innerHTML;
    wrapper.appendChild(div);
    wrap.appendChild(wrapper);
  }

  _scrollToPage(currentPage);
  _setupScrollObserver();
  _updateNav();
}

function jumpToChapter(num) {
  if (!currentBook || currentBook.type !== 'epub') return;
  currentPage = num;
  if (continuousMode) { _scrollToPage(num); _updateNav(); }
  else                _renderEPUBChapter(num);
}

/* ═══ CONTINUOUS SCROLL OBSERVER ════════════════════ */
function _setupScrollObserver() {
  _teardownScrollObserver();
  const wrap = document.getElementById('canvasWrap');
  _scrollObserver = new IntersectionObserver(function(entries) {
    var best = null, bestRatio = -1;
    entries.forEach(function(e) {
      if (e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = e.target; }
    });
    if (best && bestRatio > 0.1) {
      var p = parseInt(best.dataset.page, 10);
      if (p && p !== currentPage) {
        currentPage = p;
        _updateNav();
        _scheduleSave();
        document.querySelectorAll('.chapter-item').forEach(function(el, i) {
          el.classList.toggle('active', i === currentPage - 1);
        });
      }
    }
  }, { root: wrap, threshold: [0.1, 0.3, 0.5, 0.7, 0.9] });
  wrap.querySelectorAll('.page-wrapper').forEach(function(el) { _scrollObserver.observe(el); });
}

function _teardownScrollObserver() {
  if (_scrollObserver) { _scrollObserver.disconnect(); _scrollObserver = null; }
}

function _scrollToPage(num) {
  const wrap   = document.getElementById('canvasWrap');
  const target = wrap.querySelector('.page-wrapper[data-page="' + num + '"]');
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
}

/* ═══ ZOOM ═══════════════════════════════════════════ */
function zoomIn()  { _applyZoom(Math.min(ZOOM_MAX, Math.round((currentZoom + ZOOM_STEP) * 100) / 100)); }
function zoomOut() { _applyZoom(Math.max(ZOOM_MIN, Math.round((currentZoom - ZOOM_STEP) * 100) / 100)); }

async function _applyZoom(newZoom) {
  if (newZoom === currentZoom) return;
  currentZoom = newZoom;
  _updateZoomBadge();
  if (!currentBook) return;

  if (currentBook.type === 'pdf') {
    if (continuousMode) await _renderPDFContinuous();
    else                await _renderPDFPage(currentPage);
  } else if (currentBook.type === 'cbz') {
    document.querySelectorAll('.cbz-page-img').forEach(function(img) {
      img.style.transform = 'scale(' + currentZoom + ')';
    });
  } else {
    document.querySelectorAll('.epub-content').forEach(function(div) {
      div.style.fontSize = (currentZoom * 100) + '%';
    });
  }
}

function _updateZoomBadge() {
  const badge = document.getElementById('zoomBadge');
  if (badge) {
    badge.textContent = Math.round(currentZoom * 100) + '%';
    // Flash animation to confirm zoom change
    badge.classList.remove('flash');
    void badge.offsetWidth; // reflow to restart animation
    badge.classList.add('flash');
    setTimeout(function() { badge.classList.remove('flash'); }, 300);
  }
  const btnOut = document.getElementById('btnZoomOut');
  const btnIn  = document.getElementById('btnZoomIn');
  if (btnOut) btnOut.disabled = currentZoom <= ZOOM_MIN;
  if (btnIn)  btnIn.disabled  = currentZoom >= ZOOM_MAX;
}

/* ═══ CONTINUOUS TOGGLE ══════════════════════════════ */
async function toggleContinuousMode() {
  continuousMode = !continuousMode;
  const btn = document.getElementById('btnScroll');
  if (btn) { btn.setAttribute('aria-pressed', continuousMode); btn.classList.toggle('active', continuousMode); }
  showToast(continuousMode
    ? '<i class="fa-solid fa-scroll"></i> Continuous scroll on'
    : '<i class="fa-solid fa-file"></i> Page-by-page mode');
  if (!currentBook) return;
  if (currentBook.type === 'pdf') {
    if (continuousMode) await _renderPDFContinuous(); else await _renderPDFPage(currentPage);
  } else if (currentBook.type === 'cbz') {
    if (continuousMode) _renderCBZContinuous(); else _renderCBZPage(currentPage);
  } else {
    if (continuousMode) await _renderEPUBContinuous(); else await _renderEPUBChapter(currentPage);
  }
}

/* ═══ NAVIGATION ═════════════════════════════════════ */
async function navigate(delta) {
  const next = Math.max(1, Math.min(totalPages, currentPage + delta));
  if (continuousMode) { currentPage = next; _scrollToPage(next); _updateNav(); return; }
  if (next === currentPage && (next <= 1 || next >= totalPages)) return;
  currentPage = next;
  await _renderPage(currentPage);
}

async function jumpToPage(num) {
  const target = Math.max(1, Math.min(totalPages, num));
  currentPage  = target;
  if (continuousMode) { _scrollToPage(target); _updateNav(); }
  else                await _renderPage(target);
}

async function _renderPage(num) {
  if (currentBook?.type === 'pdf')      await _renderPDFPage(num);
  else if (currentBook?.type === 'cbz') _renderCBZPage(num);
  else                                  await _renderEPUBChapter(num);
}

function _updateNav() {
  const pct = totalPages > 1 ? ((currentPage - 1) / (totalPages - 1)) * 100 : 100;
  document.getElementById('progressThumb').style.width   = pct + '%';
  document.getElementById('progressDot').style.left      = 'calc(' + pct + '% - 7px)';
  document.getElementById('progressTrack').setAttribute('aria-valuenow', currentPage);
  document.getElementById('pageInput').value             = currentPage;
  document.getElementById('pageInfo').textContent        = currentPage + ' / ' + totalPages;
  document.getElementById('btnPrev').disabled = !continuousMode && currentPage <= 1;
  document.getElementById('btnNext').disabled = !continuousMode && currentPage >= totalPages;
}

/* ═══ SAVE ═══════════════════════════════════════════ */
function _scheduleSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() {
    if (currentBook) saveProgress(currentBook.id, currentPage, totalPages, currentBook.type);
  }, 700);
}

function flushSave() {
  clearTimeout(_saveTimer);
  if (currentBook) saveProgress(currentBook.id, currentPage, totalPages, currentBook.type);
}

/* ═══ INGEST ═════════════════════════════════════════ */
async function ingestFile(file) {
  // Derive type from extension first, then fall back to MIME type
  // so files named correctly always work regardless of OS MIME mapping
  const ext = file.name.split('.').pop().toLowerCase();
  let type;
  if (ext === 'epub' || file.type === 'application/epub+zip') {
    type = 'epub';
  } else if (ext === 'cbz' || file.type === 'application/x-cbz' || file.type === 'application/vnd.comicbook+zip' || file.type === 'application/zip') {
    // Note: many OSes report CBZ as application/zip or application/octet-stream
    // so we trust the .cbz extension over the MIME type
    type = ext === 'cbz' ? 'cbz' : null;
  } else if (ext === 'pdf' || file.type === 'application/pdf') {
    type = 'pdf';
  }

  // If extension doesn't match any known type, reject
  if (!type || !file.name.match(/\.(pdf|epub|cbz)$/i)) {
    showToast('<i class="fa-solid fa-triangle-exclamation"></i> Only PDF, EPUB and CBZ supported');
    return;
  }

  const id  = 'book_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const rawBuf   = await file.arrayBuffer();
  const srcBytes = new Uint8Array(rawBuf);
  let coverData  = null;

  if (type === 'pdf') {
    try {
      const pdf = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
      const pg  = await pdf.getPage(1);
      const vp  = pg.getViewport({ scale: 0.6 });
      const cv  = document.createElement('canvas');
      cv.width = vp.width; cv.height = vp.height;
      await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
      coverData = cv.toDataURL('image/jpeg', 0.65);
    } catch (_) {}
  } else if (type === 'cbz') {
    try {
      const zip   = await JSZip.loadAsync(srcBytes.slice());
      const imgExts = /\.(jpe?g|png|gif|webp)$/i;
      const names = Object.keys(zip.files)
        .filter(function(n) { return !zip.files[n].dir && imgExts.test(n); })
        .sort(_naturalSort);
      if (names[0]) {
        const blob = await zip.files[names[0]].async('blob');
        coverData  = await new Promise(function(r) {
          const fr = new FileReader(); fr.onload = function(e) { r(e.target.result); }; fr.readAsDataURL(blob);
        });
      }
    } catch (_) {}
  } else {
    try {
      const zip = await JSZip.loadAsync(srcBytes.slice());
      const key = Object.keys(zip.files).find(function(f) {
        return /cover.*\.(jpe?g|png)/i.test(f) || /images\/(cover|front)/i.test(f);
      });
      if (key) {
        const blob = await zip.files[key].async('blob');
        coverData  = await new Promise(function(r) {
          const fr = new FileReader(); fr.onload = function(e) { r(e.target.result); }; fr.readAsDataURL(blob);
        });
      }
    } catch (_) {}
  }

  const cleanName = file.name.replace(/\.(pdf|epub|cbz)$/i, '');
  await dbPut({ id: id, name: cleanName, type: type, size: file.size, coverData: coverData, data: srcBytes.slice(), added: Date.now() });
  showToast('<i class="fa-solid fa-check"></i> "' + cleanName + '" added');
}