/* ══════════════════════════════════════════════════════
   app.js — UI controller, library, events
   ══════════════════════════════════════════════════════ */

/* ── View switching ─────────────────────────────────── */
function switchView(name) {
  document.querySelectorAll('.view').forEach(function(v) {
    if (v.id === name) { v.classList.remove('exit'); v.classList.add('active'); }
    else { v.classList.remove('active'); v.classList.add('exit'); setTimeout(function() { v.classList.remove('exit'); }, 400); }
  });
  // Show keyboard shortcut hint when reader opens (once per session)
  if (name === 'reader') _showShortcutHint();
}

/* ── Toast ──────────────────────────────────────────── */
let _toastTimer;
function showToast(html) {
  const t = document.getElementById('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2600);
}

/* ── Helpers ────────────────────────────────────────── */
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
function fmtBytes(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
function _esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Library Render ─────────────────────────────────── */
async function renderLibrary() {
  const books    = await dbGetAll();
  const progress = getAllProgress();
  const grid      = document.getElementById('booksGrid');
  const contSec   = document.getElementById('continueSection');
  const contStrip = document.getElementById('continueStrip');
  const cachePill = document.getElementById('cachePill');
  const cacheInfo = document.getElementById('cacheInfo');
  const bookCount = document.getElementById('bookCount');

  if (books.length === 0) {
    grid.innerHTML = '<div class="empty-state"><i class="fa-regular fa-face-smile-wink"></i><p>No books yet — add one above!</p></div>';
    contSec.style.display   = 'none';
    cachePill.style.display = 'none';
    bookCount.textContent   = '';
    return;
  }

  const totalBytes = books.reduce(function(s, b) { return s + (b.size || 0); }, 0);
  cachePill.style.display = 'flex';
  cacheInfo.textContent   = books.length + ' book' + (books.length !== 1 ? 's' : '') + ' · ' + fmtBytes(totalBytes);
  bookCount.textContent   = books.length;

  const recent = books
    .filter(function(b) { return progress[b.id]; })
    .sort(function(a, b) { return (progress[b.id]?.ts || 0) - (progress[a.id]?.ts || 0); })
    .slice(0, 3);

  if (recent.length > 0) {
    contSec.style.display = 'block';
    contStrip.innerHTML = recent.map(function(b) {
      const p   = progress[b.id];
      const pct = p ? Math.round((p.page / p.total) * 100) : 0;
      const icon = b.type === 'pdf'
        ? '<i class="fa-regular fa-file-pdf"></i>'
        : b.type === 'cbz'
          ? '<i class="fa-solid fa-book-open-reader"></i>'
          : '<i class="fa-solid fa-book-open"></i>';
      return '<div class="continue-card" onclick="openBook(\'' + b.id + '\')" tabindex="0"' +
             ' onkeydown="if(event.key===\'Enter\')openBook(\'' + b.id + '\')"' +
             ' role="button" aria-label="Resume ' + _esc(b.name) + '">' +
             '<div class="cc-type" title="' + b.type.toUpperCase() + '">' + icon + '</div>' +
             '<div class="cc-info">' +
             '<div class="cc-title">' + _esc(b.name) + '</div>' +
             '<div class="cc-sub">' +
             (b.type === 'pdf' ? 'Page ' : b.type === 'cbz' ? 'Page ' : 'Chapter ') + p.page + ' of ' + p.total +
             ' &bull; ' + timeAgo(p.ts) + '</div>' +
             '<div class="cc-bar"><div class="cc-fill" style="width:' + pct + '%"></div></div>' +
             '</div>' +
             '<div class="resume-pill">Resume <i class="fa-solid fa-arrow-right"></i></div>' +
             '</div>';
    }).join('');
  } else {
    contSec.style.display = 'none';
  }

  grid.innerHTML = books.map(function(b, idx) {
    const p         = progress[b.id];
    const pct       = p ? Math.round((p.page / p.total) * 100) : 0;
    const typeLabel = b.type.toUpperCase();
    const delay     = 'animation-delay:' + (idx * 0.06) + 's';
    const coverHTML = b.coverData
      ? '<img class="book-cover-img" src="' + b.coverData + '" alt="Cover of ' + _esc(b.name) + '" loading="lazy">'
      : '<div class="cover-placeholder">' + _esc(b.name) + '</div>';
    return '<div class="book-card" style="' + delay + '" onclick="openBook(\'' + b.id + '\')"' +
           ' tabindex="0" role="button" aria-label="Open ' + _esc(b.name) + '"' +
           ' onkeydown="if(event.key===\'Enter\')openBook(\'' + b.id + '\')">' +
           '<button class="book-delete" aria-label="Delete ' + _esc(b.name) + '"' +
           ' onclick="event.stopPropagation();confirmDelete(\'' + b.id + '\',\'' + _esc(b.name) + '\')">' +
           '<i class="fa-solid fa-xmark"></i></button>' +
           '<div class="book-cover">' + coverHTML +
           '<div class="cover-type-badge">' + typeLabel + '</div></div>' +
           '<div class="book-meta">' +
           '<div class="book-title">' + _esc(b.name) + '</div>' +
           '<div class="book-progress-info">' +
           (p ? ((b.type === 'epub' ? 'ch.' : 'p.') + p.page + '/' + p.total)
              : '<i class="fa-regular fa-clock" style="font-size:10px"></i> Not started') +
           '</div>' +
           '<div class="book-progress-bar"><div class="book-progress-fill" style="width:' + pct + '%"></div></div>' +
           '<div class="book-progress-label">' + pct + '% &bull; ' + fmtBytes(b.size || 0) + '</div>' +
           '</div></div>';
  }).join('');
}

/* ── Delete modal ───────────────────────────────────── */
let _pendingDeleteId = null;

function confirmDelete(id, name) {
  _pendingDeleteId = id;
  document.getElementById('modalTitle').textContent = 'Delete "' + name + '"?';
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('modalOverlay').setAttribute('aria-hidden', 'false');
  document.getElementById('modalConfirm').focus();
}

document.getElementById('modalCancel').addEventListener('click', function() {
  _pendingDeleteId = null;
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modalOverlay').setAttribute('aria-hidden', 'true');
});

document.getElementById('modalConfirm').addEventListener('click', async function() {
  if (!_pendingDeleteId) return;
  await dbDelete(_pendingDeleteId);
  deleteProgress(_pendingDeleteId);
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modalOverlay').setAttribute('aria-hidden', 'true');
  showToast('<i class="fa-solid fa-trash-can"></i> Book removed');
  _pendingDeleteId = null;
  renderLibrary();
});

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === e.currentTarget) {
    _pendingDeleteId = null;
    e.currentTarget.classList.remove('show');
    e.currentTarget.setAttribute('aria-hidden', 'true');
  }
});

/* ── Back to library ────────────────────────────────── */
document.getElementById('btnBack').addEventListener('click', function() {
  // Exit fullscreen first if active
  if (document.fullscreenElement) document.exitFullscreen().catch(function(){});
  flushSave();
  currentBook  = null;
  pdfDoc       = null;
  epubChapters = [];
  epubZip      = null;
  cbzImages    = [];
  switchView('library');
  renderLibrary();
});

/* ── Reader navigation ──────────────────────────────── */
document.getElementById('btnPrev').addEventListener('click', function() { navigate(-1); });
document.getElementById('btnNext').addEventListener('click', function() { navigate(1); });

document.getElementById('pageInput').addEventListener('change', function() {
  const v = parseInt(this.value, 10);
  if (!isNaN(v)) jumpToPage(v);
});

const progressTrack = document.getElementById('progressTrack');
progressTrack.addEventListener('click', function(e) {
  const rect = progressTrack.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const page = Math.max(1, Math.min(totalPages, Math.round(pct * (totalPages - 1)) + 1));
  jumpToPage(page);
});
progressTrack.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight') navigate(1);
  if (e.key === 'ArrowLeft')  navigate(-1);
});

/* ── Zoom ───────────────────────────────────────────── */
document.getElementById('btnZoomIn').addEventListener('click', function() { zoomIn(); });
document.getElementById('btnZoomOut').addEventListener('click', function() { zoomOut(); });

/* ── Continuous scroll toggle ───────────────────────── */
document.getElementById('btnScroll').addEventListener('click', function() { toggleContinuousMode(); });

/* ── Fullscreen ─────────────────────────────────────── */
const readerEl   = document.getElementById('reader');
const btnFull    = document.getElementById('btnFullscreen');

function _updateFullscreenIcon() {
  const isFs = !!document.fullscreenElement;
  btnFull.innerHTML = isFs
    ? '<i class="fa-solid fa-compress" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-expand" aria-hidden="true"></i>';
  btnFull.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen');
  readerEl.classList.toggle('is-fullscreen', isFs);
}

btnFull.addEventListener('click', function() {
  if (!document.fullscreenElement) {
    readerEl.requestFullscreen().catch(function(err) {
      showToast('<i class="fa-solid fa-circle-exclamation"></i> Fullscreen not available');
    });
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener('fullscreenchange', _updateFullscreenIcon);

/* ── TOC toggle (EPUB) ──────────────────────────────── */
document.getElementById('btnToc').addEventListener('click', function() {
  const sb     = document.getElementById('epubSidebar');
  const isOpen = sb.classList.toggle('open');
  this.setAttribute('aria-pressed', isOpen);
  sb.setAttribute('aria-hidden', !isOpen);
});

/* ── Keyboard shortcuts ─────────────────────────────── */
document.addEventListener('keydown', function(e) {
  const inReader = document.getElementById('reader').classList.contains('active');
  const inInput  = e.target.tagName === 'INPUT';
  if (!inReader || inInput) return;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); navigate(1); }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); navigate(-1); }
  if (e.key === 'Escape')    { document.getElementById('btnBack').click(); }
  if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
  if (e.key === '-')         { e.preventDefault(); zoomOut(); }
  if (e.key === '0')         { e.preventDefault(); _applyZoom(1.0); }
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); btnFull.click(); }
  if (e.key === 'c' || e.key === 'C') { e.preventDefault(); toggleContinuousMode(); }
});

/* ── Upload: file input ─────────────────────────────── */
document.getElementById('fileInput').addEventListener('change', async function() {
  for (const file of this.files) await ingestFile(file);
  this.value = '';
  renderLibrary();
});

/* ── Upload: drag & drop ────────────────────────────── */
const uploadArea = document.getElementById('uploadArea');
uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); uploadArea.classList.add('drag'); });
uploadArea.addEventListener('dragleave', function(e) { if (!uploadArea.contains(e.relatedTarget)) uploadArea.classList.remove('drag'); });
uploadArea.addEventListener('drop', async function(e) {
  e.preventDefault();
  uploadArea.classList.remove('drag');
  const files = Array.from(e.dataTransfer.files || []).filter(function(f) { return f.name.match(/\.(pdf|epub|cbz)$/i); });
  for (const file of files) await ingestFile(file);
  renderLibrary();
});
uploadArea.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('fileInput').click(); }
});

/* ── Pinch-to-zoom (mobile) ─────────────────────────── */
let _pinchStart = null;
document.getElementById('canvasWrap').addEventListener('touchstart', function(e) {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    _pinchStart = { dist: Math.sqrt(dx*dx + dy*dy), zoom: currentZoom };
  }
}, { passive: true });
document.getElementById('canvasWrap').addEventListener('touchmove', function(e) {
  if (e.touches.length === 2 && _pinchStart) {
    const dx   = e.touches[0].clientX - e.touches[1].clientX;
    const dy   = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const newZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, _pinchStart.zoom * (dist / _pinchStart.dist)));
    currentZoom = Math.round(newZ * 100) / 100;
    _updateZoomBadge();
    // Live-update CBZ and EPUB without re-render for performance
    if (currentBook?.type === 'cbz') {
      document.querySelectorAll('.cbz-page-img').forEach(function(img) { img.style.transform = 'scale(' + currentZoom + ')'; });
    } else if (currentBook?.type === 'epub') {
      document.querySelectorAll('.epub-content').forEach(function(div) { div.style.fontSize = (currentZoom * 100) + '%'; });
    }
  }
}, { passive: true });
document.getElementById('canvasWrap').addEventListener('touchend', function(e) {
  if (_pinchStart && currentBook?.type === 'pdf') {
    // Re-render PDF at new zoom on pinch end
    if (continuousMode) _renderPDFContinuous(); else _renderPDFPage(currentPage);
  }
  _pinchStart = null;
}, { passive: true });

/* ── Touch swipe (single finger, page-by-page only) ─── */
let _touchStartX = null;
document.getElementById('canvasWrap').addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) _touchStartX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('canvasWrap').addEventListener('touchend', function(e) {
  if (_touchStartX === null || e.changedTouches.length !== 1) { _touchStartX = null; return; }
  const dx = e.changedTouches[0].clientX - _touchStartX;
  if (Math.abs(dx) > 60 && !continuousMode) navigate(dx < 0 ? 1 : -1);
  _touchStartX = null;
}, { passive: true });

/* ── Save on hide / unload ──────────────────────────── */
document.addEventListener('visibilitychange', function() { if (document.hidden) flushSave(); });
window.addEventListener('beforeunload', function() { flushSave(); });

/* ── Keyboard shortcut hint (shown once per session) ── */
function _showShortcutHint() {
  if (sessionStorage.getItem('cubo_hint_shown')) return;
  sessionStorage.setItem('cubo_hint_shown', '1');
  const hint = document.createElement('div');
  hint.className = 'shortcut-hint';
  hint.innerHTML =
    '<strong><i class="fa-solid fa-keyboard"></i> Shortcuts</strong>' +
    '<kbd>←</kbd><kbd>→</kbd> Page &nbsp; ' +
    '<kbd>+</kbd><kbd>-</kbd> Zoom<br>' +
    '<kbd>C</kbd> Continuous &nbsp; <kbd>F</kbd> Fullscreen<br>' +
    '<kbd>0</kbd> Reset zoom &nbsp; <kbd>Esc</kbd> Library';
  document.body.appendChild(hint);
  setTimeout(function() {
    hint.style.transition = 'opacity 0.5s';
    hint.style.opacity = '0';
    setTimeout(function() { hint.remove(); }, 600);
  }, 5000);
}

/* ── Init ───────────────────────────────────────────── */
(async function() {
  try {
    await openDB();
    renderLibrary();
  } catch (err) {
    console.error('[CuboPDF] DB init failed:', err);
    showToast('<i class="fa-solid fa-circle-exclamation"></i> Storage error — try a different browser');
  }
})();