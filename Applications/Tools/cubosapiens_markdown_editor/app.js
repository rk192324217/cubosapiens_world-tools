/* ============================================================
   cuboMark – app.js
   Sections:
   1.  State
   2.  Element references
   3.  Marked.js configuration
   4.  Default starter content
   5.  Theme toggle
   6.  View mode (split / edit / preview)
   7.  Mobile view switching
   8.  Live preview render
   9.  Line numbers — smart rebuild
   10. Cursor position + status bar
   11. Word count + read time
   12. Formatting toolbar actions
   13. Keyboard shortcuts
   14. Pane resizer (drag divider)
   15. Copy Markdown
   16. Copy HTML
   17. Download .md
   18. Clear editor
   19. Auto-save to localStorage
   20. Toast helper
   ============================================================ */


/* ── 1. State ── */
let currentView  = 'split';
let mobileView   = 'edit';
let isDragging   = false;
let lastLineCount = 0;
let renderTimer  = null;       // debounce handle for preview render
let saveTimer    = null;       // debounce handle for localStorage save


/* ── 2. Element References ── */
const themeToggle   = document.getElementById('themeToggle');
const mdEditor      = document.getElementById('mdEditor');
const mdPreview     = document.getElementById('mdPreview');
const lineNumbers   = document.getElementById('lineNumbers');
const workspace     = document.getElementById('workspace');
const editorPane    = document.getElementById('editorPane');
const previewPane   = document.getElementById('previewPane');
const paneDivider   = document.getElementById('paneDivider');
const docTitle      = document.getElementById('docTitle');
const wordCount     = document.getElementById('wordCount');
const wcWords       = document.getElementById('wcWords');
const wcChars       = document.getElementById('wcChars');
const statusMsg     = document.getElementById('statusMsg');
const readTime      = document.getElementById('readTime');
const lineCount     = document.getElementById('lineCount');
const cursorPos     = document.getElementById('cursorPos');
const btnCopyMd     = document.getElementById('btnCopyMd');
const btnCopyHtml   = document.getElementById('btnCopyHtml');
const btnDownloadMd = document.getElementById('btnDownloadMd');
const btnClear      = document.getElementById('btnClear');
const mobDownload   = document.getElementById('mobDownload');
const toastEl       = document.getElementById('toast');


/* ── 3. Marked.js Configuration ── */
marked.setOptions({
  breaks:   true,    // line breaks become <br>
  gfm:      true,    // GitHub Flavored Markdown (tables, strikethrough, task lists)
  pedantic: false,
});

// Custom renderer for task list checkboxes
const renderer = new marked.Renderer();

renderer.listitem = (text, task, checked) => {
  if (task) {
    return `<li style="list-style:none;margin-left:-1.2em;">
      <input type="checkbox" ${checked ? 'checked' : ''} disabled /> ${text}
    </li>`;
  }
  return `<li>${text}</li>`;
};

marked.use({ renderer });


/* ── 4. Default Starter Content ── */
const STARTER = `# Welcome to cuboMark

A **clean**, *elegant* Markdown editor — write on the left, see the result on the right.

## Features

- Live preview as you type
- Formatting toolbar with all common actions
- Keyboard shortcuts (\`Ctrl+B\`, \`Ctrl+I\`, \`Ctrl+K\`)
- Auto-saves to your browser — nothing is lost on refresh
- Download as \`.md\` or copy as \`HTML\`

## Quick syntax guide

### Text formatting

You can use **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

### Lists

**Unordered:**
- Item one
- Item two
  - Nested item

**Ordered:**
1. First
2. Second
3. Third

**Task list:**
- [x] Completed task
- [ ] Pending task
- [ ] Another one

### Blockquote

> *"The best writing is rewriting."*
> — E. B. White

### Code block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Table

| Feature       | Status    |
|---------------|-----------|
| Live preview  | ✅ Done   |
| Toolbar       | ✅ Done   |
| Auto-save     | ✅ Done   |
| Export        | ✅ Done   |

### Horizontal rule

---

Start writing — your work saves automatically.
`;


/* ── 5. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('cuboMark_theme', html.dataset.theme);
});

// Restore saved theme
const savedTheme = localStorage.getItem('cuboMark_theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;


/* ── 6. View Mode (split / edit / preview) ── */
document.querySelectorAll('.vt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.vt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setView(btn.dataset.view);
  });
});

function setView(view) {
  currentView = view;
  editorPane.style.display  = view === 'preview' ? 'none' : 'flex';
  previewPane.style.display = view === 'edit'    ? 'none' : 'flex';
  paneDivider.style.display = view === 'split'   ? 'block' : 'none';

  // Reset flex proportions on split
  if (view === 'split') {
    editorPane.style.flex  = '';
    previewPane.style.flex = '';
  }
}


/* ── 7. Mobile View Switching ── */
document.querySelectorAll('.mob-btn[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mob-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mobileView = btn.dataset.view;
    workspace.dataset.mview = mobileView;
  });
});

workspace.dataset.mview = 'edit';

mobDownload.addEventListener('click', downloadMd);


/* ── 8. Live Preview Render ── */
function renderPreview() {
  const md = mdEditor.value;

  if (!md.trim()) {
    mdPreview.innerHTML = '<p class="preview-placeholder">Preview will appear here as you type…</p>';
    return;
  }

  // Parse → sanitise → inject
  const rawHtml    = marked.parse(md);
  const cleanHtml  = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['checked', 'disabled'],   // needed for task list checkboxes
  });
  mdPreview.innerHTML = cleanHtml;
}

// Debounce: render 80ms after the user stops typing (feels instant, prevents lag on large docs)
mdEditor.addEventListener('input', () => {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, 80);
  updateLineNumbers();
  updateStats();
  scheduleSave();
});

mdEditor.addEventListener('keyup', updateCursor);
mdEditor.addEventListener('click', updateCursor);
mdEditor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = mdEditor.scrollTop;
});


/* ── 9. Line Numbers — smart rebuild ── */
function updateLineNumbers() {
  const count = mdEditor.value.split('\n').length;
  if (count === lastLineCount) return;  // skip DOM rebuild if count unchanged
  lastLineCount = count;

  lineNumbers.innerHTML = Array.from(
    { length: count },
    (_, i) => `<span>${i + 1}</span>`
  ).join('');

  lineCount.textContent = `${count} line${count !== 1 ? 's' : ''}`;
}


/* ── 10. Cursor Position + Status Bar ── */
function updateCursor() {
  const pos   = mdEditor.selectionStart;
  const text  = mdEditor.value.substring(0, pos);
  const lines = text.split('\n');
  const ln    = lines.length;
  const col   = lines[lines.length - 1].length + 1;
  cursorPos.textContent = `Ln ${ln}, Col ${col}`;
}

function setStatus(msg, duration = 2000) {
  statusMsg.textContent = msg;
  if (duration) setTimeout(() => { statusMsg.textContent = 'Ready'; }, duration);
}


/* ── 11. Word Count + Read Time ── */
function updateStats() {
  const text  = mdEditor.value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const mins  = Math.max(1, Math.ceil(words / 200));

  wcWords.textContent = words.toLocaleString();
  wcChars.textContent = chars.toLocaleString();
  readTime.textContent = `${mins} min read`;
}


/* ── 12. Formatting Toolbar Actions ── */
const ACTIONS = {
  h1:           { prefix: '# ',   line: true  },
  h2:           { prefix: '## ',  line: true  },
  h3:           { prefix: '### ', line: true  },
  bold:         { wrap: '**'                  },
  italic:       { wrap: '_'                   },
  strikethrough:{ wrap: '~~'                  },
  'code-inline':{ wrap: '`'                   },
  ul:           { prefix: '- ',   line: true  },
  ol:           { prefix: '1. ',  line: true  },
  todo:         { prefix: '- [ ] ',line: true },
  quote:        { prefix: '> ',   line: true  },
  hr:           { insert: '\n---\n'            },
  link:         { template: '[{sel}](url)'    },
  image:        { template: '![{sel}](url)'   },
  table:        { insert: '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n' },
  'code-block': { insert: '\n```\n\n```\n', cursor: -4 },
};

document.querySelectorAll('.fmt-btn[data-action]').forEach(btn => {
  btn.addEventListener('click', () => applyAction(btn.dataset.action));
});

function applyAction(action) {
  const def   = ACTIONS[action];
  if (!def) return;

  const start = mdEditor.selectionStart;
  const end   = mdEditor.selectionEnd;
  const val   = mdEditor.value;
  const sel   = val.substring(start, end);

  let newVal, newCursor;

  if (def.insert) {
    // Plain insertion at cursor
    newVal    = val.substring(0, start) + def.insert + val.substring(end);
    newCursor = start + def.insert.length + (def.cursor || 0);

  } else if (def.wrap) {
    // Toggle wrap: if already wrapped, unwrap it
    const w = def.wrap;
    if (sel.startsWith(w) && sel.endsWith(w) && sel.length > w.length * 2) {
      const unwrapped = sel.slice(w.length, -w.length);
      newVal    = val.substring(0, start) + unwrapped + val.substring(end);
      newCursor = start + unwrapped.length;
    } else {
      const wrapped = w + (sel || 'text') + w;
      newVal    = val.substring(0, start) + wrapped + val.substring(end);
      newCursor = sel ? start + wrapped.length : start + w.length;
    }

  } else if (def.prefix && def.line) {
    // Line prefix — apply to every selected line
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEnd   = val.indexOf('\n', end);
    const region    = val.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const lines     = region.split('\n');

    // Toggle: if all lines already have the prefix, remove it; otherwise add
    const allPrefixed = lines.every(l => l.startsWith(def.prefix));
    const toggled = lines.map(l =>
      allPrefixed ? l.slice(def.prefix.length) : def.prefix + l
    ).join('\n');

    newVal    = val.substring(0, lineStart) + toggled +
                (lineEnd === -1 ? '' : val.substring(lineEnd));
    newCursor = start + (allPrefixed ? -def.prefix.length : def.prefix.length);

  } else if (def.template) {
    // Link / image template
    const filled  = def.template.replace('{sel}', sel || 'text');
    newVal    = val.substring(0, start) + filled + val.substring(end);
    newCursor = start + filled.indexOf('url');
  }

  // Apply
  mdEditor.value = newVal;
  mdEditor.selectionStart = mdEditor.selectionEnd = newCursor;
  mdEditor.focus();
  renderPreview();
  updateLineNumbers();
  updateStats();
  scheduleSave();
}


/* ── 13. Keyboard Shortcuts ── */
mdEditor.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey;

  // Formatting shortcuts
  if (mod && e.key === 'b') { e.preventDefault(); applyAction('bold'); }
  if (mod && e.key === 'i') { e.preventDefault(); applyAction('italic'); }
  if (mod && e.key === 'k') { e.preventDefault(); applyAction('link'); }

  // Tab → 2 spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = mdEditor.selectionStart;
    const end   = mdEditor.selectionEnd;
    const val   = mdEditor.value;
    mdEditor.value = val.substring(0, start) + '  ' + val.substring(end);
    mdEditor.selectionStart = mdEditor.selectionEnd = start + 2;
    updateLineNumbers();
  }

  // Enter → auto-continue list items
  if (e.key === 'Enter') {
    const start   = mdEditor.selectionStart;
    const lines   = mdEditor.value.substring(0, start).split('\n');
    const lastLine= lines[lines.length - 1];

    // Match unordered list
    const ulMatch = lastLine.match(/^(\s*)([-*+])\s/);
    // Match ordered list
    const olMatch = lastLine.match(/^(\s*)(\d+)\.\s/);
    // Match task list
    const todoMatch = lastLine.match(/^(\s*)([-*+])\s\[[ x]\]\s/);

    if (todoMatch && lastLine.trim() === todoMatch[0].trim()) {
      // Empty task item — break out
      e.preventDefault();
      const val = mdEditor.value;
      const remove = todoMatch[0].length;
      mdEditor.value = val.substring(0, start - remove) + '\n' + val.substring(start);
      mdEditor.selectionStart = mdEditor.selectionEnd = start - remove + 1;
    } else if (todoMatch) {
      e.preventDefault();
      const ins = '\n' + todoMatch[1] + todoMatch[2] + ' [ ] ';
      insertAt(start, ins);
    } else if (ulMatch && lastLine.trim() === ulMatch[2]) {
      // Empty bullet — break out
      e.preventDefault();
      const val = mdEditor.value;
      mdEditor.value = val.substring(0, start - 2) + '\n' + val.substring(start);
      mdEditor.selectionStart = mdEditor.selectionEnd = start - 1;
    } else if (ulMatch) {
      e.preventDefault();
      insertAt(start, '\n' + ulMatch[1] + ulMatch[2] + ' ');
    } else if (olMatch) {
      e.preventDefault();
      const next = parseInt(olMatch[2]) + 1;
      insertAt(start, '\n' + olMatch[1] + next + '. ');
    }

    updateLineNumbers();
    updateStats();
  }
});

function insertAt(pos, text) {
  const val = mdEditor.value;
  mdEditor.value = val.substring(0, pos) + text + val.substring(pos);
  mdEditor.selectionStart = mdEditor.selectionEnd = pos + text.length;
  renderPreview();
}


/* ── 14. Pane Resizer (drag divider) ── */
paneDivider.addEventListener('mousedown', startResize);
paneDivider.addEventListener('touchstart', e => startResize(e.touches[0]), { passive: true });

function startResize(e) {
  isDragging = true;
  paneDivider.classList.add('dragging');
  document.body.style.cursor    = 'col-resize';
  document.body.style.userSelect= 'none';
}

document.addEventListener('mousemove', onResize);
document.addEventListener('touchmove', e => onResize(e.touches[0]), { passive: true });

function onResize(e) {
  if (!isDragging) return;
  const rect  = workspace.getBoundingClientRect();
  const pct   = ((e.clientX - rect.left) / rect.width) * 100;
  const clamped = Math.max(20, Math.min(80, pct));
  editorPane.style.flex  = `0 0 ${clamped}%`;
  previewPane.style.flex = `0 0 ${100 - clamped}%`;
}

document.addEventListener('mouseup',  stopResize);
document.addEventListener('touchend', stopResize);

function stopResize() {
  if (!isDragging) return;
  isDragging = false;
  paneDivider.classList.remove('dragging');
  document.body.style.cursor     = '';
  document.body.style.userSelect = '';
}


/* ── 15. Copy Markdown ── */
btnCopyMd.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(mdEditor.value);
    showToast('Markdown copied!');
    setStatus('Markdown copied');
  } catch {
    showToast('Copy failed');
  }
});


/* ── 16. Copy HTML ── */
btnCopyHtml.addEventListener('click', async () => {
  try {
    const html = DOMPurify.sanitize(marked.parse(mdEditor.value));
    await navigator.clipboard.writeText(html);
    showToast('HTML copied!');
    setStatus('HTML copied');
  } catch {
    showToast('Copy failed');
  }
});


/* ── 17. Download .md ── */
function downloadMd() {
  const content = mdEditor.value;
  if (!content.trim()) { showToast('Nothing to save'); return; }
  const name = (docTitle.value.trim() || 'document').replace(/[^a-z0-9_\-\s]/gi, '').trim();
  const blob = new Blob([content], { type: 'text/markdown' });
  const a    = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name + '.md';
  a.click();
  showToast('Downloaded!');
  setStatus('File saved');
}

btnDownloadMd.addEventListener('click', downloadMd);


/* ── 18. Clear Editor ── */
btnClear.addEventListener('click', () => {
  if (!mdEditor.value.trim()) return;
  if (!confirm('Clear the editor? This cannot be undone.')) return;
  mdEditor.value = '';
  renderPreview();
  updateLineNumbers();
  updateStats();
  updateCursor();
  localStorage.removeItem('cuboMark_content');
  showToast('Editor cleared');
  setStatus('Cleared');
});


/* ── 19. Auto-save to localStorage ── */
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('cuboMark_content', mdEditor.value);
    localStorage.setItem('cuboMark_title',   docTitle.value);
    setStatus('Saved', 1500);
  }, 1000);  // save 1s after last keystroke
}

docTitle.addEventListener('input', scheduleSave);

// Restore on load
function restoreFromStorage() {
  const saved = localStorage.getItem('cuboMark_content');
  const title = localStorage.getItem('cuboMark_title');

  if (saved) {
    mdEditor.value = saved;
    if (title) docTitle.value = title;
  } else {
    mdEditor.value = STARTER;
  }
}


/* ── 20. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}


/* ── Init ── */
restoreFromStorage();
renderPreview();
updateLineNumbers();
updateStats();
updateCursor();
