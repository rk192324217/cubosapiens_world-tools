/* ============================================================
   PassGen – app.js
   Sections:
   1.  Character sets
   2.  Element references
   3.  State
   4.  Theme toggle
   5.  Slider listeners (length + bulk)
   6.  Character toggle pills
   7.  Generate button
   8.  generatePasswords()
   9.  generateOne()
   10. renderPasswords()
   11. copyPassword()
   12. getStrength()
   13. updateStrength()
   14. Toast helper
   ============================================================ */


/* ── 1. Character Sets ── */
const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?'
};


/* ── 2. Element References ── */
const themeToggle  = document.getElementById('themeToggle');
const lengthSlider = document.getElementById('lengthSlider');
const lengthVal    = document.getElementById('lengthVal');
const bulkSlider   = document.getElementById('bulkSlider');
const bulkVal      = document.getElementById('bulkVal');
const chkUpper     = document.getElementById('chkUpper');
const chkLower     = document.getElementById('chkLower');
const chkNumbers   = document.getElementById('chkNumbers');
const chkSymbols   = document.getElementById('chkSymbols');
const pillUpper    = document.getElementById('pillUpper');
const pillLower    = document.getElementById('pillLower');
const pillNumbers  = document.getElementById('pillNumbers');
const pillSymbols  = document.getElementById('pillSymbols');
const btnGenerate  = document.getElementById('btnGenerate');
const passwordList = document.getElementById('passwordList');
const strengthWrap = document.getElementById('strengthWrap');
const strengthLabel= document.getElementById('strengthLabel');
const strengthFill = document.getElementById('strengthFill');
const toastEl      = document.getElementById('toast');


/* ── 3. State ── */
let lastPasswords = [];


/* ── 4. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 5. Slider Listeners ── */
lengthSlider.addEventListener('input', () => {
  lengthVal.textContent = lengthSlider.value;
});

bulkSlider.addEventListener('input', () => {
  bulkVal.textContent = bulkSlider.value;
});


/* ── 6. Character Toggle Pills ── */
const pillMap = [
  { pill: pillUpper,   chk: chkUpper   },
  { pill: pillLower,   chk: chkLower   },
  { pill: pillNumbers, chk: chkNumbers },
  { pill: pillSymbols, chk: chkSymbols },
];

pillMap.forEach(({ pill, chk }) => {
  pill.addEventListener('click', () => {
    // Prevent deselecting ALL — at least one must stay active
    const activeCount = pillMap.filter(p => p.chk.checked).length;
    if (chk.checked && activeCount === 1) {
      showToast('At least one character type must be selected');
      return;
    }

    chk.checked = !chk.checked;
    pill.classList.toggle('active', chk.checked);
  });
});


/* ── 7. Generate Button ── */
btnGenerate.addEventListener('click', generatePasswords);

// Auto-generate on page load
generatePasswords();


/* ── 8. generatePasswords ── */
function generatePasswords() {
  const length = parseInt(lengthSlider.value);
  const count  = parseInt(bulkSlider.value);

  // Build charset from active toggles
  let charset = '';
  if (chkUpper.checked)   charset += CHARS.upper;
  if (chkLower.checked)   charset += CHARS.lower;
  if (chkNumbers.checked) charset += CHARS.numbers;
  if (chkSymbols.checked) charset += CHARS.symbols;

  if (!charset) {
    showToast('Please select at least one character type');
    return;
  }

  lastPasswords = Array.from({ length: count }, () => generateOne(length, charset));
  renderPasswords(lastPasswords);
  updateStrength(lastPasswords[0], charset);
}


/* ── 9. generateOne ── */
function generateOne(length, charset) {
  // Use crypto.getRandomValues for cryptographic randomness
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, n => charset[n % charset.length]).join('');
}


/* ── 10. renderPasswords ── */
function renderPasswords(passwords) {
  passwordList.innerHTML = '';

  passwords.forEach((pw, i) => {
    const item = document.createElement('div');
    item.className = 'pw-item';
    item.style.animationDelay = `${i * 0.05}s`;

    const text = document.createElement('span');
    text.className = 'pw-text';
    text.textContent = pw;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'pw-copy-btn';
    copyBtn.title = 'Copy';
    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    copyBtn.addEventListener('click', () => copyPassword(pw, copyBtn));

    item.appendChild(text);
    item.appendChild(copyBtn);
    passwordList.appendChild(item);
  });
}


/* ── 11. copyPassword ── */
async function copyPassword(pw, btn) {
  try {
    await navigator.clipboard.writeText(pw);
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    btn.style.background = 'var(--red)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'transparent';
    showToast('Password copied!');
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 1800);
  } catch {
    showToast('Copy failed — please copy manually');
  }
}


/* ── 12. getStrength ── */
function getStrength(password, charset) {
  // Score based on length + character set diversity
  let score = 0;

  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 24) score++;

  if (chkUpper.checked)   score++;
  if (chkLower.checked)   score++;
  if (chkNumbers.checked) score++;
  if (chkSymbols.checked) score += 2;

  if (score <= 4)  return { label: 'Weak',   cls: 'weak',   pct: 25 };
  if (score <= 6)  return { label: 'Fair',   cls: 'fair',   pct: 60 };
  return               { label: 'Strong', cls: 'strong', pct: 100 };
}


/* ── 13. updateStrength ── */
function updateStrength(password, charset) {
  const { label, cls, pct } = getStrength(password, charset);

  strengthWrap.style.display = 'flex';
  strengthLabel.textContent  = label;
  strengthLabel.style.color  =
    cls === 'weak'   ? 'var(--strength-weak)'   :
    cls === 'fair'   ? 'var(--strength-fair)'   :
                       'var(--strength-strong)';

  // Remove old class, add new
  strengthFill.className = `strength-fill ${cls}`;
  strengthFill.style.width = pct + '%';
}


/* ── 14. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}
