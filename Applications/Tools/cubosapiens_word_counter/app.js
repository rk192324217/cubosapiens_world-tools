/* ============================================================
   TextScope – app.js
   Sections:
   1.  Element references
   2.  State
   3.  Theme toggle
   4.  Input listener → analyzeText
   5.  analyzeText()
   6.  updateStats()
   7.  getFrequency()
   8.  renderTopWords()
   9.  highlightText()
   10. Export JSON
   11. Toast helper
   ============================================================ */


/* ── 1. Element References ── */
const input       = document.getElementById('textInput');

const wordsEl     = document.getElementById('words');
const charsEl     = document.getElementById('chars');
const noSpacesEl  = document.getElementById('noSpaces');
const numbersEl   = document.getElementById('numbers');
const symbolsEl   = document.getElementById('symbols');
const spacesEl    = document.getElementById('spaces');
const linesEl     = document.getElementById('lines');
const uniqueEl    = document.getElementById('unique');
const readingEl   = document.getElementById('reading');

const highlightBox = document.getElementById('highlightBox');
const topWordsEl   = document.getElementById('topWords');
const exportBtn    = document.getElementById('exportBtn');
const toastEl      = document.getElementById('toast');


/* ── 2. State ── */
let latestAnalysis = {};


/* ── 3. Theme Toggle ── */
document.getElementById('themeToggle').addEventListener('click', () => {
  const html    = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});


/* ── 4. Input Listener ── */
input.addEventListener('input', analyzeText);


/* ── 5. analyzeText ── */
function analyzeText() {
  const text = input.value;

  const words      = text.trim().split(/\s+/).filter(Boolean);
  const chars      = text.length;
  const noSpaces   = text.replace(/\s/g, '').length;
  const spaces     = (text.match(/\s/g)      || []).length;
  const numbers    = (text.match(/\d/g)      || []).length;
  const symbols    = (text.match(/[^\w\s]/g) || []).length;
  const lines      = text.split(/\n/).filter(Boolean).length;
  const uniqueWords= [...new Set(words.map(w => w.toLowerCase()))];
  const readingTime= Math.ceil(words.length / 200);

  updateStats({ words: words.length, chars, noSpaces, numbers, symbols, spaces, lines, unique: uniqueWords.length, readingTime });

  const freq = getFrequency(words);
  renderTopWords(freq);
  highlightText(text);

  latestAnalysis = {
    words:       words.length,
    characters:  chars,
    uniqueWords,
    frequency:   freq,
    readingTime
  };
}


/* ── 6. updateStats ── */
function updateStats(data) {
  wordsEl.textContent    = data.words;
  charsEl.textContent    = data.chars;
  noSpacesEl.textContent = data.noSpaces;
  numbersEl.textContent  = data.numbers;
  symbolsEl.textContent  = data.symbols;
  spacesEl.textContent   = data.spaces;
  linesEl.textContent    = data.lines;
  uniqueEl.textContent   = data.unique;
  readingEl.textContent  = data.readingTime + ' min';
}


/* ── 7. getFrequency ── */
function getFrequency(words) {
  const map = {};
  words.forEach(w => {
    const key = w.toLowerCase();
    map[key]  = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}


/* ── 8. renderTopWords ── */
function renderTopWords(freq) {
  topWordsEl.innerHTML = '';
  freq.forEach(([word, count]) => {
    const li       = document.createElement('li');
    li.innerHTML   = `<span>${word}</span><b>${count}</b>`;
    topWordsEl.appendChild(li);
  });
}


/* ── 9. highlightText ── */
function highlightText(text) {
  const tokens = text.split(/(\s+)/);
  highlightBox.innerHTML = tokens.map(token => {
    if      (/^\d+$/.test(token))       return `<span class="number">${token}</span>`;
    else if (/^[^\w\s]+$/.test(token))  return `<span class="symbol">${token}</span>`;
    else if (/^\s+$/.test(token))       return `<span class="space">${token}</span>`;
    else                                return `<span class="word">${token}</span>`;
  }).join('');
}


/* ── 10. Export JSON ── */
exportBtn.addEventListener('click', () => {
  if (!Object.keys(latestAnalysis).length) {
    showToast('Nothing to export — type some text first');
    return;
  }

  const blob = new Blob(
    [JSON.stringify(latestAnalysis, null, 2)],
    { type: 'application/json' }
  );
  const a      = document.createElement('a');
  a.href       = URL.createObjectURL(blob);
  a.download   = 'textscope-analysis.json';
  a.click();
  showToast('Exported successfully!');
});


/* ── 11. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}