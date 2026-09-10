/* ============================================================
   JSONify – app.js
   Sections:
   1.  Element references
   2.  State
   3.  Theme toggle
   4.  Indent selector
   5.  View tabs (Formatted / Tree)
   6.  Input listener — live validate on type
   7.  Format (beautify)
   8.  Minify
   9.  Clear
   10. Copy output
   11. Download
   12. validateJSON()
   13. formatJSON()
   14. syntaxHighlight()
   15. buildLineNumbers()
   16. updateStatus()
   17. Tree view builder
   18. buildTreeNode()
   19. Toast helper
   ============================================================ */


/* ── 1. Element References ── */
const themeToggle    = document.getElementById('themeToggle');
const jsonInput      = document.getElementById('jsonInput');
const jsonOutput     = document.getElementById('jsonOutput');
const inputWrap      = document.getElementById('inputWrap');
const outputWrap     = document.getElementById('outputWrap');
const inputLineNums  = document.getElementById('inputLineNums');
const outputLineNums = document.getElementById('outputLineNums');
const treeView       = document.getElementById('treeView');
const statusBar      = document.getElementById('statusBar');
const statusDot      = document.getElementById('statusDot');
const statusText     = document.getElementById('statusText');
const statusMeta     = document.getElementById('statusMeta');
const btnFormat      = document.getElementById('btnFormat');
const btnMinify      = document.getElementById('btnMinify');
const btnClear       = document.getElementById('btnClear');
const btnCopy        = document.getElementById('btnCopy');
const btnDownload    = document.getElementById('btnDownload');
const toastEl        = document.getElementById('toast');


/* ── 2. State ── */
let currentIndent  = 4;       // spaces or 'tab'
let currentView    = 'formatted';
let lastValidJSON  = null;    // last successfully parsed object


/* ── 3. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 4. Indent Selector ── */
document.querySelectorAll('.seg-btn[data-indent]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-indent]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentIndent = btn.dataset.indent === 'tab' ? '\t' : parseInt(btn.dataset.indent);
    // Re-format if we already have valid JSON
    if (lastValidJSON !== null) formatJSON();
  });
});


/* ── 5. View Tabs ── */
document.querySelectorAll('.view-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentView = tab.dataset.view;

    if (currentView === 'formatted') {
      outputWrap.style.display = 'flex';
      treeView.style.display   = 'none';
    } else {
      outputWrap.style.display = 'none';
      treeView.style.display   = 'block';
      if (lastValidJSON !== null) renderTree(lastValidJSON);
    }
  });
});


/* ── 6. Input Listener — live validate ── */
jsonInput.addEventListener('input', () => {
  buildLineNumbers(jsonInput.value, inputLineNums);

  const raw = jsonInput.value.trim();
  if (!raw) {
    resetState();
    return;
  }

  const result = validateJSON(raw);
  if (result.valid) {
    lastValidJSON = result.parsed;
    jsonInput.classList.remove('has-error');
    updateStatus('valid', `Valid JSON`, metaString(result.parsed, raw));
  } else {
    lastValidJSON = null;
    jsonInput.classList.add('has-error');
    updateStatus('error', result.error, '');
    // Clear output when input is invalid
    jsonOutput.innerHTML = '';
    buildLineNumbers('', outputLineNums);
    treeView.innerHTML = '';
  }
});

// Sync scroll between textarea and its line numbers
jsonInput.addEventListener('scroll', () => {
  inputLineNums.scrollTop = jsonInput.scrollTop;
});

jsonOutput.addEventListener('scroll', () => {
  outputLineNums.scrollTop = jsonOutput.scrollTop;
});


/* ── 7. Format (Beautify) ── */
btnFormat.addEventListener('click', formatJSON);

function formatJSON() {
  const raw = jsonInput.value.trim();
  if (!raw) { showToast('Nothing to format'); return; }

  const result = validateJSON(raw);
  if (!result.valid) {
    showToast('Fix JSON errors first');
    updateStatus('error', result.error, '');
    jsonInput.classList.add('has-error');
    return;
  }

  lastValidJSON = result.parsed;
  const indent  = currentIndent;
  const pretty  = JSON.stringify(result.parsed, null, indent);

  // Update input with formatted version
  jsonInput.value = pretty;
  jsonInput.classList.remove('has-error');
  buildLineNumbers(pretty, inputLineNums);

  // Syntax-highlight the output
  jsonOutput.innerHTML = syntaxHighlight(pretty);
  buildLineNumbers(pretty, outputLineNums);

  updateStatus('valid', 'Formatted successfully', metaString(result.parsed, pretty));

  if (currentView === 'tree') renderTree(result.parsed);

  showToast('JSON formatted ✓');
}


/* ── 8. Minify ── */
btnMinify.addEventListener('click', () => {
  const raw = jsonInput.value.trim();
  if (!raw) { showToast('Nothing to minify'); return; }

  const result = validateJSON(raw);
  if (!result.valid) {
    showToast('Fix JSON errors first');
    updateStatus('error', result.error, '');
    return;
  }

  const minified = JSON.stringify(result.parsed);
  jsonInput.value = minified;
  jsonInput.classList.remove('has-error');
  buildLineNumbers(minified, inputLineNums);

  jsonOutput.innerHTML = syntaxHighlight(minified);
  buildLineNumbers(minified, outputLineNums);

  lastValidJSON = result.parsed;
  updateStatus('valid', 'Minified successfully', `${minified.length} chars`);
  showToast('JSON minified ✓');
});


/* ── 9. Clear ── */
btnClear.addEventListener('click', () => {
  jsonInput.value    = '';
  jsonOutput.innerHTML = '';
  treeView.innerHTML = '';
  lastValidJSON      = null;
  jsonInput.classList.remove('has-error');
  buildLineNumbers('', inputLineNums);
  buildLineNumbers('', outputLineNums);
  resetState();
  showToast('Cleared');
});


/* ── 10. Copy Output ── */
btnCopy.addEventListener('click', async () => {
  const text = jsonOutput.textContent;
  if (!text.trim()) { showToast('Nothing to copy — format first'); return; }

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch {
    showToast('Copy failed — please copy manually');
  }
});


/* ── 11. Download ── */
btnDownload.addEventListener('click', () => {
  const text = jsonOutput.textContent;
  if (!text.trim()) { showToast('Nothing to download — format first'); return; }

  const blob = new Blob([text], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'jsonify-output.json';
  a.click();
  showToast('Downloaded!');
});


/* ── 12. validateJSON ── */
function validateJSON(str) {
  try {
    const parsed = JSON.parse(str);
    return { valid: true, parsed };
  } catch (e) {
    // Extract a clean error message
    let msg = e.message;
    // Try to extract position info
    const posMatch = msg.match(/position (\d+)/i);
    if (posMatch) {
      const pos    = parseInt(posMatch[1]);
      const before = str.substring(Math.max(0, pos - 20), pos);
      const after  = str.substring(pos, pos + 20);
      msg = `${e.message.split(' at ')[0]} near: …${before}↑${after}…`;
    }
    return { valid: false, error: msg };
  }
}


/* ── 13. formatJSON ── (string → pretty string, called internally) ── */
// NOTE: the public formatJSON() function is defined in section 7.
// This is a pure helper that returns the formatted string.
function prettyPrint(obj, indent) {
  return JSON.stringify(obj, null, indent);
}


/* ── 14. syntaxHighlight ── */
function syntaxHighlight(json) {
  // Escape HTML special chars first
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      let cls = 'syn-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'syn-key' : 'syn-str';
      } else if (/true|false/.test(match)) {
        cls = 'syn-bool';
      } else if (/null/.test(match)) {
        cls = 'syn-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}


/* ── 15. buildLineNumbers ── */
function buildLineNumbers(text, container) {
  const lines = text ? text.split('\n').length : 0;
  container.innerHTML = Array.from(
    { length: lines },
    (_, i) => `<span>${i + 1}</span>`
  ).join('');
}


/* ── 16. updateStatus ── */
function updateStatus(state, message, meta) {
  statusBar.className  = `status-bar ${state}`;
  statusText.textContent = message;
  statusMeta.textContent = meta || '';
}

function resetState() {
  statusBar.className    = 'status-bar';
  statusText.textContent = 'Paste JSON to get started';
  statusMeta.textContent = '';
}

// Produces a summary string: "Object · 4 keys · 312 chars"
function metaString(parsed, raw) {
  const type  = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed;
  const count = parsed && typeof parsed === 'object' ? `${Object.keys(parsed).length} keys · ` : '';
  return `${type} · ${count}${raw.length} chars`;
}


/* ── 17. Tree View Builder ── */
function renderTree(data) {
  treeView.innerHTML = '';
  const root = buildTreeNode(data, null);
  treeView.appendChild(root);
}


/* ── 18. buildTreeNode ── */
function buildTreeNode(value, key) {
  const node = document.createElement('div');
  node.className = 'tree-node';

  if (value !== null && typeof value === 'object') {
    const isArray  = Array.isArray(value);
    const keys     = Object.keys(value);
    const brackets = isArray ? ['[', ']'] : ['{', '}'];
    const count    = keys.length;

    // Toggler line
    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';

    const keySpan = key !== null
      ? `<span class="tree-key">"${key}"</span><span class="syn-brace">: </span>`
      : '';

    toggle.innerHTML = `${keySpan}<span class="syn-brace">${brackets[0]}</span><span class="tree-count">${count} ${isArray ? 'items' : 'keys'}</span>`;

    // Children container
    const children = document.createElement('div');
    children.className = 'tree-children';

    keys.forEach(k => {
      children.appendChild(buildTreeNode(value[k], isArray ? null : k));
    });

    // Closing bracket line
    const closing = document.createElement('span');
    closing.className = 'syn-brace';
    closing.textContent = brackets[1];

    // Toggle collapse
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('collapsed');
      children.classList.toggle('hidden');
    });

    node.appendChild(toggle);
    node.appendChild(children);
    node.appendChild(closing);

  } else {
    // Primitive value
    let valClass = 'tree-str';
    let display  = JSON.stringify(value);

    if (value === null)           { valClass = 'tree-null';  display = 'null'; }
    else if (typeof value === 'number')  { valClass = 'tree-num';  }
    else if (typeof value === 'boolean') { valClass = 'tree-bool'; }

    const keyPart = key !== null
      ? `<span class="tree-key">"${key}"</span><span class="syn-brace">: </span>`
      : '';

    node.innerHTML = `${keyPart}<span class="${valClass}">${display}</span>`;
  }

  return node;
}


/* ── 19. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}
