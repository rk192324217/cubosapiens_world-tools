/* ============================================================
   Cubo HTML Formatter — script.js
   Sections:
   1.  Element References
   2.  State & Storage Keys
   3.  Theme Toggle
   4.  Indent Selector
   5.  Format HTML
   6.  Minify HTML
   7.  Clear
   8.  Copy Output
   9.  Download
   10. Upload / File Input
   11. Drag & Drop
   12. Live Preview
   13. Statistics
   14. Line Numbers
   15. Status Updates
   16. Search
   17. Fullscreen
   18. Options (Auto Copy, Wrap Lines)
   19. Keyboard Shortcuts
   20. Persistence (localStorage)
   21. Syntax Highlighting
   22. Toast Helper
   23. Debounce Utility
   24. Initialization
   ============================================================ */


/* ── 1. Element References ── */
const themeToggle     = document.getElementById('themeToggle');
const htmlInput       = document.getElementById('htmlInput');
const htmlOutput      = document.getElementById('htmlOutput');
const inputWrap       = document.getElementById('inputWrap');
const outputWrap      = document.getElementById('outputWrap');
const inputLineNums   = document.getElementById('inputLineNums');
const outputLineNums  = document.getElementById('outputLineNums');
const statusDot       = document.getElementById('statusDot');
const statusText      = document.getElementById('statusText');
const statusMeta      = document.getElementById('statusMeta');
const btnFormat       = document.getElementById('btnFormat');
const btnMinify       = document.getElementById('btnMinify');
const btnClear        = document.getElementById('btnClear');
const btnCopy         = document.getElementById('btnCopy');
const btnDownload     = document.getElementById('btnDownload');
const btnUpload       = document.getElementById('btnUpload');
const btnFullscreen   = document.getElementById('btnFullscreen');
const fileInput       = document.getElementById('fileInput');
const editorGrid      = document.getElementById('editorGrid');
const toastEl         = document.getElementById('toast');
const dragOverlay     = document.getElementById('dragOverlay');
const previewFrame    = document.getElementById('previewFrame');
const btnRefreshPrev  = document.getElementById('btnRefreshPreview');
const optAutoCopy     = document.getElementById('optAutoCopy');
const optWrapLines    = document.getElementById('optWrapLines');

// Statistics
const statLines = document.getElementById('statLines');
const statChars = document.getElementById('statChars');
const statTags  = document.getElementById('statTags');
const statSize  = document.getElementById('statSize');
const statTime  = document.getElementById('statTime');

// Search
const btnSearchToggle = document.getElementById('btnSearchToggle');
const searchInputWrap = document.getElementById('searchInputWrap');
const searchInput     = document.getElementById('searchInput');
const searchCount     = document.getElementById('searchCount');
const btnSearchPrev   = document.getElementById('btnSearchPrev');
const btnSearchNext   = document.getElementById('btnSearchNext');
const btnSearchClose  = document.getElementById('btnSearchClose');


/* ── 2. State & Storage Keys ── */
const STORAGE = {
  THEME:     'cubo-html-theme',
  LAST_HTML: 'cubo-html-last',
  INDENT:    'cubo-html-indent',
  AUTO_COPY: 'cubo-html-autocopy',
  WRAP:      'cubo-html-wrap'
};

let currentIndent   = 4;
let lastFormatted   = '';
let isFullscreen    = false;
let searchMatches   = [];
let searchIndex     = -1;
let dragCounter     = 0;


/* ── 3. Theme Toggle ── */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE.THEME, theme);
}

function loadTheme() {
  const saved = localStorage.getItem(STORAGE.THEME);
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
});


/* ── 4. Indent Selector ── */
document.querySelectorAll('.seg-btn[data-indent]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-indent]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentIndent = btn.dataset.indent === 'tab' ? '\t' : parseInt(btn.dataset.indent, 10);
    localStorage.setItem(STORAGE.INDENT, btn.dataset.indent);

    if (htmlInput.value.trim()) {
      formatHTML();
    }
  });
});


/* ── 5. Format HTML ── */
function formatHTML() {
  const raw = htmlInput.value;
  if (!raw.trim()) {
    updateStatus('idle', 'Paste HTML to get started');
    return;
  }

  const startTime = performance.now();

  try {
    const formatted = beautifyHTML(raw, currentIndent);
    const elapsed = (performance.now() - startTime).toFixed(1);

    lastFormatted = formatted;
    renderHighlightedOutput(formatted);
    buildLineNumbers(outputLineNums, formatted);
    updatePreview(formatted);
    updateStats(formatted, elapsed);
    updateStatus('valid', 'Formatted successfully', `${elapsed} ms`);
    saveLastHTML(raw);

    if (optAutoCopy.checked) {
      copyToClipboard(formatted);
      showToast('Formatted & Copied');
    } else {
      showToast('Formatted Successfully');
    }
  } catch (err) {
    updateStatus('error', 'Unable to properly format HTML. The document may contain malformed tags.');
    showToast('Formatting error — check your HTML');
  }
}

btnFormat.addEventListener('click', formatHTML);


/* ── 6. Minify HTML ── */
function minifyHTML() {
  const raw = htmlInput.value;
  if (!raw.trim()) {
    updateStatus('idle', 'Paste HTML to get started');
    return;
  }

  const startTime = performance.now();
  const minified  = raw
    .replace(/<!--[\s\S]*?-->/g, '')       // Remove comments
    .replace(/\n\s*/g, '')                  // Remove newlines + leading whitespace
    .replace(/\s{2,}/g, ' ')               // Collapse multiple spaces
    .replace(/>\s+</g, '><')               // Remove space between tags
    .trim();

  const elapsed = (performance.now() - startTime).toFixed(1);

  lastFormatted = minified;
  renderHighlightedOutput(minified);
  buildLineNumbers(outputLineNums, minified);
  updatePreview(minified);
  updateStats(minified, elapsed);
  updateStatus('valid', 'Minified successfully', `${elapsed} ms`);
  saveLastHTML(raw);
  showToast('Minified Successfully');
}

btnMinify.addEventListener('click', minifyHTML);


/* ── 7. Clear ── */
function clearAll() {
  htmlInput.value = '';
  htmlOutput.textContent = '';
  lastFormatted = '';
  buildLineNumbers(inputLineNums, '');
  buildLineNumbers(outputLineNums, '');
  clearPreview();
  resetStats();
  updateStatus('idle', 'Paste HTML to get started');
  clearSearch();
  showToast('Cleared');
}

btnClear.addEventListener('click', clearAll);


/* ── 8. Copy Output ── */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

btnCopy.addEventListener('click', async () => {
  if (!lastFormatted) {
    showToast('Nothing to copy');
    return;
  }
  await copyToClipboard(lastFormatted);
  showToast('Copied');
});


/* ── 9. Download ── */
function downloadOutput() {
  if (!lastFormatted) {
    showToast('Nothing to download');
    return;
  }
  const blob = new Blob([lastFormatted], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'formatted.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded');
}

btnDownload.addEventListener('click', downloadOutput);


/* ── 10. Upload / File Input ── */
btnUpload.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readHTMLFile(file);
  fileInput.value = '';
});

function readHTMLFile(file) {
  if (!file.name.match(/\.(html|htm)$/i)) {
    showToast('Please upload an HTML file');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    htmlInput.value = e.target.result;
    buildLineNumbers(inputLineNums, e.target.result);
    updateStatus('idle', `Loaded: ${file.name}`);
    showToast('File Uploaded');
  };
  reader.onerror = () => {
    showToast('Error reading file');
  };
  reader.readAsText(file);
}


/* ── 11. Drag & Drop ── */
document.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragCounter++;
  dragOverlay.classList.add('active');
});

document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    dragOverlay.classList.remove('active');
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  dragCounter = 0;
  dragOverlay.classList.remove('active');

  const file = e.dataTransfer.files[0];
  if (file) readHTMLFile(file);
});


/* ── 12. Live Preview ── */
function updatePreview(html) {
  try {
    const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Auto-resize iframe
    requestAnimationFrame(() => {
      try {
        const h = doc.documentElement.scrollHeight;
        previewFrame.style.height = Math.max(240, Math.min(h + 32, 600)) + 'px';
      } catch { /* cross-origin guard */ }
    });
  } catch {
    // Silently fail
  }
}

function clearPreview() {
  try {
    const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    doc.open();
    doc.write('');
    doc.close();
    previewFrame.style.height = '240px';
  } catch { /* guard */ }
}

btnRefreshPrev.addEventListener('click', () => {
  if (lastFormatted) {
    updatePreview(lastFormatted);
    showToast('Preview Refreshed');
  }
});


/* ── 13. Statistics ── */
function updateStats(html, timeMs) {
  const lines = html.split('\n').length;
  const chars = html.length;
  const tags  = (html.match(/<[a-zA-Z][^>]*>/g) || []).length;
  const bytes = new Blob([html]).size;

  statLines.textContent = lines.toLocaleString();
  statChars.textContent = chars.toLocaleString();
  statTags.textContent  = tags.toLocaleString();
  statSize.textContent  = formatBytes(bytes);
  statTime.textContent  = `${timeMs} ms`;
}

function resetStats() {
  statLines.textContent = '0';
  statChars.textContent = '0';
  statTags.textContent  = '0';
  statSize.textContent  = '0 B';
  statTime.textContent  = '0 ms';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}


/* ── 14. Line Numbers ── */
function buildLineNumbers(container, text) {
  const count = text ? text.split('\n').length : 1;
  const nums  = [];
  for (let i = 1; i <= count; i++) nums.push(i);
  container.textContent = nums.join('\n');
}

// Sync line-number scroll with textarea/pre
htmlInput.addEventListener('scroll', () => {
  inputLineNums.scrollTop = htmlInput.scrollTop;
});

htmlOutput.addEventListener('scroll', () => {
  outputLineNums.scrollTop = htmlOutput.scrollTop;
});


/* ── 15. Status Updates ── */
function updateStatus(type, message, meta) {
  statusDot.className = 'status-dot';
  if (type === 'valid') statusDot.classList.add('valid');
  else if (type === 'error') statusDot.classList.add('error');

  statusText.textContent = message;
  statusMeta.textContent = meta || '';
}


/* ── 16. Search ── */
btnSearchToggle.addEventListener('click', openSearch);
btnSearchClose.addEventListener('click', closeSearch);

btnSearchPrev.addEventListener('click', () => navigateSearch(-1));
btnSearchNext.addEventListener('click', () => navigateSearch(1));

searchInput.addEventListener('input', debounce(performSearch, 200));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    navigateSearch(e.shiftKey ? -1 : 1);
  }
  if (e.key === 'Escape') closeSearch();
});

function openSearch() {
  searchInputWrap.classList.add('open');
  searchInput.focus();
}

function closeSearch() {
  searchInputWrap.classList.remove('open');
  searchInput.value = '';
  searchCount.textContent = '';
  clearSearchHighlights();
  searchMatches = [];
  searchIndex = -1;
}

function clearSearch() {
  searchInput.value = '';
  searchCount.textContent = '';
  clearSearchHighlights();
  searchMatches = [];
  searchIndex = -1;
}

function performSearch() {
  clearSearchHighlights();
  const query = searchInput.value.trim();
  if (!query || !lastFormatted) {
    searchCount.textContent = '';
    searchMatches = [];
    searchIndex = -1;
    return;
  }

  // Re-render with highlights
  const escaped = escapeHTML(lastFormatted);
  const regex   = new RegExp(escapeRegex(escapeHTML(query)), 'gi');
  let matchIdx  = 0;

  const highlighted = escaped.replace(regex, (match) => {
    matchIdx++;
    return `<span class="search-highlight" data-match="${matchIdx}">${match}</span>`;
  });

  htmlOutput.innerHTML = highlighted;
  searchMatches = htmlOutput.querySelectorAll('.search-highlight');
  searchIndex = searchMatches.length > 0 ? 0 : -1;

  searchCount.textContent = searchMatches.length > 0
    ? `${searchIndex + 1}/${searchMatches.length}`
    : 'No matches';

  if (searchMatches.length > 0) {
    searchMatches[0].classList.add('active');
    searchMatches[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function navigateSearch(dir) {
  if (searchMatches.length === 0) return;

  searchMatches[searchIndex]?.classList.remove('active');
  searchIndex = (searchIndex + dir + searchMatches.length) % searchMatches.length;
  searchMatches[searchIndex].classList.add('active');
  searchMatches[searchIndex].scrollIntoView({ block: 'center', behavior: 'smooth' });
  searchCount.textContent = `${searchIndex + 1}/${searchMatches.length}`;
}

function clearSearchHighlights() {
  // Re-render without highlights if we have formatted content
  if (lastFormatted && htmlOutput.querySelector('.search-highlight')) {
    renderHighlightedOutput(lastFormatted);
  }
}


/* ── 17. Fullscreen ── */
btnFullscreen.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  editorGrid.classList.toggle('fullscreen', isFullscreen);
  btnFullscreen.querySelector('i').className = isFullscreen
    ? 'fa-solid fa-compress'
    : 'fa-solid fa-expand';
}


/* ── 18. Options ── */
optAutoCopy.addEventListener('change', () => {
  localStorage.setItem(STORAGE.AUTO_COPY, optAutoCopy.checked);
});

optWrapLines.addEventListener('change', () => {
  htmlOutput.classList.toggle('wrap', optWrapLines.checked);
  localStorage.setItem(STORAGE.WRAP, optWrapLines.checked);
});


/* ── 19. Keyboard Shortcuts ── */
document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;

  // Ctrl+Shift+F — Format
  if (mod && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    formatHTML();
    return;
  }

  // Ctrl+L — Clear
  if (mod && e.key === 'l') {
    e.preventDefault();
    clearAll();
    return;
  }

  // Ctrl+O — Upload
  if (mod && e.key === 'o') {
    e.preventDefault();
    fileInput.click();
    return;
  }

  // Esc — Exit fullscreen
  if (e.key === 'Escape' && isFullscreen) {
    toggleFullscreen();
    return;
  }
});


/* ── 20. Persistence ── */
function saveLastHTML(html) {
  try {
    localStorage.setItem(STORAGE.LAST_HTML, html);
  } catch { /* quota exceeded guard */ }
}

function loadPreferences() {
  // Theme
  loadTheme();

  // Indent
  const savedIndent = localStorage.getItem(STORAGE.INDENT);
  if (savedIndent) {
    currentIndent = savedIndent === 'tab' ? '\t' : parseInt(savedIndent, 10);
    document.querySelectorAll('.seg-btn[data-indent]').forEach(b => {
      b.classList.toggle('active', b.dataset.indent === savedIndent);
    });
  }

  // Auto copy
  const savedAC = localStorage.getItem(STORAGE.AUTO_COPY);
  if (savedAC === 'true') optAutoCopy.checked = true;

  // Wrap lines
  const savedWrap = localStorage.getItem(STORAGE.WRAP);
  if (savedWrap === 'true') {
    optWrapLines.checked = true;
    htmlOutput.classList.add('wrap');
  }

  // Last HTML
  const savedHTML = localStorage.getItem(STORAGE.LAST_HTML);
  if (savedHTML) {
    htmlInput.value = savedHTML;
    buildLineNumbers(inputLineNums, savedHTML);
    updateStatus('idle', 'Previous session restored');
  }
}


/* ── 21. Syntax Highlighting ── */
function renderHighlightedOutput(html) {
  htmlOutput.innerHTML = syntaxHighlight(html);
}

function syntaxHighlight(html) {
  const escaped = escapeHTML(html);

  return escaped
    // HTML comments
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="syn-comment">$1</span>')
    // DOCTYPE
    .replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi,
      '<span class="syn-doctype">$1</span>')
    // Tag names (opening and closing)
    .replace(/(&lt;\/?)([\w-]+)/g,
      '<span class="syn-tag">$1$2</span>')
    // Closing >
    .replace(/(\/?&gt;)/g,
      '<span class="syn-tag">$1</span>')
    // Attributes: name="value"
    .replace(/([\w-]+)(=)(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g,
      '<span class="syn-attr">$1</span>$2<span class="syn-str">$3</span>');
}


/* ── 22. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}


/* ── 23. Debounce Utility ── */
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}


/* ── 24. Initialization ── */

// Input listener — update line numbers on type
htmlInput.addEventListener('input', debounce(() => {
  buildLineNumbers(inputLineNums, htmlInput.value);
}, 150));

// Load preferences on startup
loadPreferences();
buildLineNumbers(inputLineNums, htmlInput.value || '');


/* ============================================================
   HTML Beautifier Engine
   ============================================================
   A lightweight, dependency-free HTML formatter.
   Handles: nested tags, self-closing tags, comments, doctype,
   inline elements, pre/script/style preservation.
   ============================================================ */

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data',
  'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'ruby',
  's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time',
  'u', 'var', 'wbr'
]);

const RAW_CONTENT_TAGS = new Set(['script', 'style', 'pre', 'code', 'textarea']);

function beautifyHTML(html, indent) {
  const indentStr = indent === '\t' ? '\t' : ' '.repeat(typeof indent === 'number' ? indent : 4);

  // Tokenize the HTML
  const tokens = tokenize(html);
  const lines  = [];
  let depth    = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'comment' || token.type === 'doctype') {
      lines.push(indentStr.repeat(depth) + token.value.trim());
      continue;
    }

    if (token.type === 'raw') {
      // Pre/script/style content — preserve as-is, just indent the wrapper
      const rawLines = token.value.split('\n');
      rawLines.forEach(line => {
        lines.push(indentStr.repeat(depth) + line.trimEnd());
      });
      continue;
    }

    if (token.type === 'text') {
      const trimmed = token.value.trim();
      if (trimmed) {
        lines.push(indentStr.repeat(depth) + trimmed);
      }
      continue;
    }

    if (token.type === 'close') {
      depth = Math.max(0, depth - 1);
      lines.push(indentStr.repeat(depth) + token.value.trim());
      continue;
    }

    if (token.type === 'open') {
      const tagName = getTagName(token.value);

      lines.push(indentStr.repeat(depth) + token.value.trim());

      // Increase depth for non-void, non-self-closing tags
      if (!VOID_ELEMENTS.has(tagName) && !token.value.trim().endsWith('/>')) {
        depth++;
      }
      continue;
    }

    // Self-closing or unknown
    lines.push(indentStr.repeat(depth) + token.value.trim());
  }

  return lines.filter(l => l.trim() !== '').join('\n');
}

function tokenize(html) {
  const tokens = [];
  let pos = 0;

  while (pos < html.length) {
    // Comment
    if (html.startsWith('<!--', pos)) {
      const end = html.indexOf('-->', pos);
      if (end === -1) {
        tokens.push({ type: 'comment', value: html.slice(pos) });
        break;
      }
      tokens.push({ type: 'comment', value: html.slice(pos, end + 3) });
      pos = end + 3;
      continue;
    }

    // DOCTYPE
    if (html.slice(pos, pos + 9).toUpperCase() === '<!DOCTYPE') {
      const end = html.indexOf('>', pos);
      if (end === -1) {
        tokens.push({ type: 'doctype', value: html.slice(pos) });
        break;
      }
      tokens.push({ type: 'doctype', value: html.slice(pos, end + 1) });
      pos = end + 1;
      continue;
    }

    // Closing tag
    if (html.startsWith('</', pos)) {
      const end = html.indexOf('>', pos);
      if (end === -1) {
        tokens.push({ type: 'close', value: html.slice(pos) });
        break;
      }
      tokens.push({ type: 'close', value: html.slice(pos, end + 1) });
      pos = end + 1;
      continue;
    }

    // Opening tag
    if (html[pos] === '<' && /[a-zA-Z]/.test(html[pos + 1] || '')) {
      const end = findTagEnd(html, pos);
      const tag = html.slice(pos, end + 1);
      const tagName = getTagName(tag);

      tokens.push({ type: 'open', value: tag });
      pos = end + 1;

      // Raw content tags — grab everything until closing tag
      if (RAW_CONTENT_TAGS.has(tagName)) {
        const closeTag = `</${tagName}>`;
        const closeIdx = html.toLowerCase().indexOf(closeTag.toLowerCase(), pos);
        if (closeIdx !== -1) {
          const rawContent = html.slice(pos, closeIdx);
          if (rawContent.trim()) {
            tokens.push({ type: 'raw', value: rawContent });
          }
          tokens.push({ type: 'close', value: html.slice(closeIdx, closeIdx + closeTag.length) });
          pos = closeIdx + closeTag.length;
        }
      }
      continue;
    }

    // Text content
    const nextTag = html.indexOf('<', pos);
    if (nextTag === -1) {
      const remaining = html.slice(pos);
      if (remaining.trim()) {
        tokens.push({ type: 'text', value: remaining });
      }
      break;
    }

    const text = html.slice(pos, nextTag);
    if (text.trim()) {
      tokens.push({ type: 'text', value: text });
    }
    pos = nextTag;
  }

  return tokens;
}

function findTagEnd(html, start) {
  let inQuote = false;
  let quoteChar = '';
  for (let i = start + 1; i < html.length; i++) {
    const ch = html[i];
    if (inQuote) {
      if (ch === quoteChar) inQuote = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
      continue;
    }
    if (ch === '>') return i;
  }
  return html.length - 1;
}

function getTagName(tag) {
  const match = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
  return match ? match[1].toLowerCase() : '';
}


/* ── Utility ── */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
