/* ============================================================
   cuboPy – app.js
   Sections:
   1.  State
   2.  Code snippets
   3.  Element references
   4.  Theme toggle
   5.  Pyodide loader
   6.  Run code
   7.  stdout / stderr capture
   8.  stdin (input()) handler
   9.  Output helpers — appendOutput / clearOutput
   10. Line numbers
   11. Editor events (tab key, auto-indent, sync scroll)
   12. Font size
   13. Word wrap toggle
   14. Copy code
   15. Download code
   16. Snippet loader
   17. Package installer
   18. Execution timer
   19. Toast helper
   ============================================================ */


/* ── 1. State ── */
let pyodide      = null;
let isReady      = false;
let isRunning    = false;
let fontSize     = 14;
let wordWrap     = false;
let installedPkgs= [];
let stdinResolve = null;   // Promise resolver for input() calls


/* ── 2. Code Snippets ── */
const SNIPPETS = {
  hello: `# Hello, World!
print("Hello, World!")
print("Welcome to cuboPy 🐍")
`,

  fibonacci: `# Fibonacci sequence
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

nums = fibonacci(15)
print("Fibonacci:", nums)
print(f"Sum: {sum(nums)}")
`,

  list_comp: `# List comprehensions
squares   = [x**2 for x in range(1, 11)]
evens     = [x for x in range(20) if x % 2 == 0]
pairs     = [(x, y) for x in range(3) for y in range(3)]
words     = ["hello", "world", "python"]
uppercase = [w.upper() for w in words]

print("Squares:", squares)
print("Evens:", evens)
print("Pairs:", pairs)
print("Upper:", uppercase)
`,

  classes: `# Classes and OOP
class Animal:
    def __init__(self, name, sound):
        self.name  = name
        self.sound = sound

    def speak(self):
        return f"{self.name} says {self.sound}!"

    def __repr__(self):
        return f"Animal({self.name!r})"


class Dog(Animal):
    def __init__(self, name):
        super().__init__(name, "Woof")
        self.tricks = []

    def learn(self, trick):
        self.tricks.append(trick)
        return f"{self.name} learned {trick}!"


dog = Dog("Rex")
print(dog.speak())
print(dog.learn("sit"))
print(dog.learn("shake"))
print(f"Tricks: {dog.tricks}")
`,

  file_io: `# File I/O (in-memory via Pyodide)
import io

# Write to an in-memory file
buf = io.StringIO()
buf.write("Line 1: Python is awesome\\n")
buf.write("Line 2: cuboPy rocks\\n")
buf.write("Line 3: WebAssembly FTW\\n")

# Read back
buf.seek(0)
lines = buf.readlines()

print(f"Read {len(lines)} lines:")
for i, line in enumerate(lines, 1):
    print(f"  {i}: {line.strip()}")
`,

  numpy: `# NumPy — numerical computing
import numpy as np

a = np.array([1, 2, 3, 4, 5], dtype=float)
b = np.linspace(0, 1, 6)
m = np.array([[1, 2], [3, 4]])

print("Array a:", a)
print("Mean:", a.mean(), "  Std:", round(a.std(), 4))
print("Linspace b:", b)
print("Matrix m:\\n", m)
print("Determinant:", round(np.linalg.det(m), 4))
print("Eigenvalues:", np.linalg.eigvals(m).round(4))
print("Dot product a·a:", np.dot(a, a))
`,

  pandas: `# Pandas — data analysis
import pandas as pd

data = {
    "name":   ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "age":    [25, 30, 35, 28, 22],
    "score":  [88, 72, 95, 81, 67],
    "city":   ["Chennai", "Mumbai", "Delhi", "Bangalore", "Hyderabad"],
}

df = pd.DataFrame(data)

print("DataFrame:")
print(df.to_string(index=False))
print()
print("Stats:")
print(df[["age", "score"]].describe().round(2))
print()
print("Top scorers (score > 80):")
print(df[df["score"] > 80][["name", "score"]].to_string(index=False))
`,

  regex: `# Regular expressions
import re

text = """
Contact us at support@cubosapiens.com or sales@example.org
Phone: +91-9876543210 or (044) 2345-6789
Visit https://cubosapiens.com or http://example.org/page
"""

emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+', text)
phones = re.findall(r'[\\+]?[\\d][\\d\\s\\-().]{8,}[\\d]', text)
urls   = re.findall(r'https?://[^\\s]+', text)

print("Emails found:",  emails)
print("Phones found:",  [p.strip() for p in phones])
print("URLs found:",    urls)

# Substitution
cleaned = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+',
                 '[REDACTED]', text)
print("\\nRedacted text:", cleaned.strip())
`,

  sort: `# Sorting algorithms
import time, random

def bubble_sort(arr):
    a = arr[:]
    n = len(a)
    for i in range(n):
        for j in range(0, n-i-1):
            if a[j] > a[j+1]:
                a[j], a[j+1] = a[j+1], a[j]
    return a

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid   = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]

data = random.sample(range(1, 100), 15)
print("Original:", data)
print("Bubble:  ", bubble_sort(data))
print("Merge:   ", merge_sort(data))
print("Built-in:", sorted(data))
`,

  recursion: `# Recursion examples
import sys

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def power(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        half = power(base, exp // 2)
        return half * half
    return base * power(base, exp - 1)

def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

print("10! =", factorial(10))
print("2^20 =", power(2, 20))
nested = [1, [2, [3, [4, [5]]], 6], 7]
print("Flat:", flatten(nested))
`,
};


/* ── 3. Element References ── */
const themeToggle   = document.getElementById('themeToggle');
const pyDot         = document.getElementById('pyDot');
const pyStatusText  = document.getElementById('pyStatusText');
const btnRun        = document.getElementById('btnRun');
const btnStop       = document.getElementById('btnStop');
const runIcon       = document.getElementById('runIcon');
const runLabel      = document.getElementById('runLabel');
const btnClearOutput= document.getElementById('btnClearOutput');
const codeEditor    = document.getElementById('codeEditor');
const lineNumbers   = document.getElementById('lineNumbers');
const outputPre     = document.getElementById('outputPre');
const outputWrap    = document.getElementById('outputWrap');
const execMeta      = document.getElementById('execMeta');
const stdinWrap     = document.getElementById('stdinWrap');
const stdinPrompt   = document.getElementById('stdinPrompt');
const stdinInput    = document.getElementById('stdinInput');
const snippetSelect = document.getElementById('snippetSelect');
const btnFontDec    = document.getElementById('btnFontDec');
const btnFontInc    = document.getElementById('btnFontInc');
const fontSizeLabel = document.getElementById('fontSizeLabel');
const btnDownload   = document.getElementById('btnDownload');
const btnCopy       = document.getElementById('btnCopy');
const btnWrap       = document.getElementById('btnWrap');
const pkgInput      = document.getElementById('pkgInput');
const btnInstall    = document.getElementById('btnInstall');
const pkgList       = document.getElementById('pkgList');
const fileName      = document.getElementById('fileName');
const toastEl       = document.getElementById('toast');


/* ── 4. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 5. Pyodide Loader ── */
async function loadPyodideEnv() {
  try {
    pyStatusText.textContent = 'Loading Python runtime…';
    pyDot.className = 'py-dot loading';

    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
    });

    // Override stdout / stderr
    pyodide.setStdout({ batched: line => appendOutput(line + '\n', 'stdout') });
    pyodide.setStderr({ batched: line => appendOutput(line + '\n', 'stderr') });

    // Patch input() to show our stdin UI
    await pyodide.runPythonAsync(`
import sys, builtins

def _cubo_input(prompt=''):
    from js import _cuboInputBridge
    result = _cuboInputBridge(str(prompt))
    return result

builtins.input = _cubo_input
`);

    isReady = true;
    pyDot.className    = 'py-dot ready';
    pyStatusText.textContent = 'Python 3.11 ready';
    btnRun.disabled    = false;
    showToast('Python runtime loaded ✓');

  } catch (err) {
    pyDot.className    = 'py-dot error';
    pyStatusText.textContent = 'Load failed';
    appendOutput('Failed to load Pyodide: ' + err.message + '\n', 'stderr');
    console.error(err);
  }
}

// Expose input bridge to Python
window._cuboInputBridge = function(prompt) {
  return new Promise(resolve => {
    stdinPrompt.textContent = prompt || '› ';
    stdinWrap.style.display = 'flex';
    stdinInput.value = '';
    stdinInput.focus();
    stdinResolve = resolve;
  });
};

stdinInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && stdinResolve) {
    const val = stdinInput.value;
    appendOutput((stdinPrompt.textContent || '› ') + val + '\n', 'stdout');
    stdinWrap.style.display = 'none';
    stdinResolve(val);
    stdinResolve = null;
  }
});


/* ── 6. Run Code ── */
btnRun.addEventListener('click', runCode);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!isRunning) runCode();
  }
});

async function runCode() {
  if (!isReady || isRunning) return;

  const code = codeEditor.value.trim();
  if (!code) { showToast('Nothing to run'); return; }

  isRunning = true;
  clearOutput();
  setRunningState(true);

  const startTime = performance.now();

  appendOutput('▶ Running…\n', 'system');

  try {
    await pyodide.runPythonAsync(code);

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
    appendOutput(`\n✓ Finished in ${elapsed}s\n`, 'success');
    execMeta.textContent = `${elapsed}s`;

  } catch (err) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
    // Pyodide wraps errors — extract the Python traceback
    const msg = err.message || String(err);
    appendOutput('\n' + msg + '\n', 'stderr');
    appendOutput(`\n✗ Error after ${elapsed}s\n`, 'system');
    execMeta.textContent = `Error · ${elapsed}s`;
  }

  isRunning = false;
  stdinWrap.style.display = 'none';
  setRunningState(false);
}

function setRunningState(running) {
  if (running) {
    runIcon.className  = 'fa-solid fa-spinner';
    runLabel.textContent = 'Running…';
    btnRun.classList.add('running');
    btnRun.disabled    = true;
    btnStop.style.display = 'flex';
  } else {
    runIcon.className  = 'fa-solid fa-play';
    runLabel.textContent = 'Run';
    btnRun.classList.remove('running');
    btnRun.disabled    = false;
    btnStop.style.display = 'none';
  }
}

btnStop.addEventListener('click', () => {
  // Pyodide doesn't support true interruption yet — we just reset the state
  isRunning = false;
  stdinWrap.style.display = 'none';
  if (stdinResolve) { stdinResolve(''); stdinResolve = null; }
  setRunningState(false);
  appendOutput('\n⚠ Execution stopped by user\n', 'system');
  showToast('Stopped');
});


/* ── 9. Output helpers ── */
function appendOutput(text, type = 'stdout') {
  // Remove placeholder if present
  const placeholder = outputPre.querySelector('.output-placeholder');
  if (placeholder) placeholder.remove();

  const span = document.createElement('span');
  span.className = `out-${type}`;
  span.textContent = text;
  outputPre.appendChild(span);

  // Auto-scroll to bottom
  outputWrap.scrollTop = outputWrap.scrollHeight;
}

function clearOutput() {
  outputPre.innerHTML = '';
  execMeta.textContent = '';
}

btnClearOutput.addEventListener('click', () => {
  clearOutput();
  outputPre.innerHTML = '<span class="output-placeholder">Output will appear here after you run your code.</span>';
});


/* ── 10. Line Numbers ── */
function updateLineNumbers() {
  const lines = codeEditor.value.split('\n').length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
    `<span>${i + 1}</span>`
  ).join('');
}

codeEditor.addEventListener('input', updateLineNumbers);

// Sync scroll
codeEditor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = codeEditor.scrollTop;
});

updateLineNumbers();


/* ── 11. Editor Events ── */

// Tab key → insert 4 spaces
codeEditor.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = codeEditor.selectionStart;
    const end   = codeEditor.selectionEnd;
    const val   = codeEditor.value;
    codeEditor.value = val.substring(0, start) + '    ' + val.substring(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
    updateLineNumbers();
  }

  // Auto-indent on Enter — match current line indent
  if (e.key === 'Enter') {
    e.preventDefault();
    const start   = codeEditor.selectionStart;
    const lines   = codeEditor.value.substring(0, start).split('\n');
    const lastLine= lines[lines.length - 1];
    const indent  = lastLine.match(/^(\s*)/)[1];

    // Extra indent after colon
    const extraIndent = lastLine.trimEnd().endsWith(':') ? '    ' : '';

    const ins = '\n' + indent + extraIndent;
    const val = codeEditor.value;
    codeEditor.value = val.substring(0, start) + ins + val.substring(codeEditor.selectionEnd);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + ins.length;
    updateLineNumbers();
  }
});


/* ── 12. Font Size ── */
function setFontSize(size) {
  fontSize = Math.max(10, Math.min(24, size));
  codeEditor.style.fontSize   = fontSize + 'px';
  outputPre.style.fontSize    = (fontSize - 1) + 'px';
  fontSizeLabel.textContent   = fontSize + 'px';
  updateLineNumbers();
}

btnFontDec.addEventListener('click', () => setFontSize(fontSize - 2));
btnFontInc.addEventListener('click', () => setFontSize(fontSize + 2));


/* ── 13. Word Wrap Toggle ── */
btnWrap.addEventListener('click', () => {
  wordWrap = !wordWrap;
  codeEditor.classList.toggle('wrap', wordWrap);
  btnWrap.style.borderColor = wordWrap ? 'var(--red)' : '';
  btnWrap.style.color       = wordWrap ? 'var(--red)' : '';
});


/* ── 14. Copy Code ── */
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(codeEditor.value);
    showToast('Code copied!');
  } catch {
    showToast('Copy failed');
  }
});


/* ── 15. Download Code ── */
btnDownload.addEventListener('click', () => {
  const code = codeEditor.value;
  if (!code.trim()) { showToast('Nothing to save'); return; }
  const blob = new Blob([code], { type: 'text/x-python' });
  const a    = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName.value || 'main.py';
  a.click();
  showToast('Saved!');
});


/* ── 16. Snippet Loader ── */
snippetSelect.addEventListener('change', () => {
  const key = snippetSelect.value;
  if (!key) return;

  if (codeEditor.value.trim() &&
      !confirm('Replace current code with snippet?')) {
    snippetSelect.value = '';
    return;
  }

  codeEditor.value = SNIPPETS[key] || '';
  fileName.value   = key + '.py';
  snippetSelect.value = '';
  updateLineNumbers();
  clearOutput();
  outputPre.innerHTML = '<span class="output-placeholder">Output will appear here after you run your code.</span>';
  showToast(`Snippet loaded: ${key}`);
});


/* ── 17. Package Installer ── */
btnInstall.addEventListener('click', installPackages);
pkgInput.addEventListener('keydown', e => { if (e.key === 'Enter') installPackages(); });

async function installPackages() {
  if (!isReady) { showToast('Python not ready yet'); return; }

  const raw = pkgInput.value.trim();
  if (!raw) { showToast('Enter package names'); return; }

  const pkgs = raw.split(/[\s,]+/).filter(Boolean);
  pkgInput.value = '';

  btnInstall.disabled = true;
  btnInstall.innerHTML = '<i class="fa-solid fa-spinner" style="animation:spin 0.8s linear infinite"></i> Installing…';

  for (const pkg of pkgs) {
    appendOutput(`Installing ${pkg}…\n`, 'system');
    try {
      await pyodide.loadPackage(pkg);
      if (!installedPkgs.includes(pkg)) {
        installedPkgs.push(pkg);
        addPkgBadge(pkg);
      }
      appendOutput(`✓ ${pkg} installed\n`, 'success');
    } catch (err) {
      appendOutput(`✗ Failed to install ${pkg}: ${err.message}\n`, 'stderr');
    }
  }

  btnInstall.disabled = false;
  btnInstall.innerHTML = '<i class="fa-solid fa-download"></i> Install';
  showToast('Done installing!');
}

function addPkgBadge(name) {
  const badge = document.createElement('span');
  badge.className = 'pkg-badge';
  badge.innerHTML = `${name} <i class="fa-solid fa-xmark"></i>`;
  badge.querySelector('i').addEventListener('click', () => badge.remove());
  pkgList.appendChild(badge);
}


/* ── 18. Execution Timer ── */
// (Handled inline in runCode())


/* ── 19. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}


/* ── Init ── */
// Load hello world snippet by default
codeEditor.value = SNIPPETS.hello;
updateLineNumbers();

// Start loading Pyodide
loadPyodideEnv();

// Keyboard shortcut hint in placeholder output
appendOutput('cuboPy — Python in your browser\n', 'system');
appendOutput('Press Ctrl+Enter (or Cmd+Enter) to run · Snippets in the toolbar\n\n', 'system');
