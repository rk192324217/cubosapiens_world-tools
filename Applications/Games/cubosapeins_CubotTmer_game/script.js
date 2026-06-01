/* =============================================
   CUBOTIMER — script.js
   Speedcubing timer with scramble + stats
   ============================================= */

// ── State ────────────────────────────────────
let timerState = 'IDLE';   // IDLE | HOLDING | RUNNING | STOPPED
let startTime   = 0;
let elapsed     = 0;
let rafId       = null;
let holdTimeout = null;
let solves      = [];      // [{ id, time, rawTime, penalty, scramble, date }]
let currentScramble = '';
let currentPuzzle   = '3x3';

// ── DOM refs ─────────────────────────────────
const timerEl      = document.getElementById('timerDisplay');
const hintEl       = document.getElementById('timerHint');
const scrambleEl   = document.getElementById('scramble');
const puzzleSelect = document.getElementById('puzzleSelect');

const statBest  = document.getElementById('statBest');
const statAo5   = document.getElementById('statAo5');
const statAo12  = document.getElementById('statAo12');
const statMean  = document.getElementById('statMean');
const statCount = document.getElementById('statCount');

const historyList = document.getElementById('historyList');

// ── Scramble generators ───────────────────────

const OPPOSITE = { U:'D', D:'U', R:'L', L:'R', F:'B', B:'F' };

function gen3x3(n = 20) {
  const faces = ['U','D','R','L','F','B'];
  const mods  = ['', "'", '2'];
  const moves = [];
  let lastFace = '', secondLastFace = '';

  while (moves.length < n) {
    const face = faces[Math.floor(Math.random() * 6)];
    if (face === lastFace) continue;
    if (face === OPPOSITE[lastFace] && face === OPPOSITE[secondLastFace]) continue;
    // avoid same axis back-to-back for opposite faces
    if (OPPOSITE[face] === lastFace && OPPOSITE[face] === secondLastFace) continue;
    const mod = mods[Math.floor(Math.random() * 3)];
    moves.push(face + mod);
    secondLastFace = lastFace;
    lastFace = face;
  }
  return moves;
}

function gen2x2(n = 9) {
  const faces = ['U','R','F'];
  const mods  = ['', "'", '2'];
  const moves = [];
  let last = '';
  while (moves.length < n) {
    const face = faces[Math.floor(Math.random() * 3)];
    if (face === last) continue;
    moves.push(face + mods[Math.floor(Math.random() * 3)]);
    last = face;
  }
  return moves;
}

function gen4x4(n = 40) {
  const outer = ['U','D','R','L','F','B'];
  const wide  = ['Uw','Dw','Rw','Lw','Fw','Bw'];
  const mods  = ['', "'", '2'];
  const pool  = [...outer, ...wide];
  const moves = [];
  let last = '';
  while (moves.length < n) {
    const face = pool[Math.floor(Math.random() * pool.length)];
    const base = face.replace('w','');
    if (base === last) continue;
    moves.push(face + mods[Math.floor(Math.random() * 3)]);
    last = base;
  }
  return moves;
}

function genPyraminx(n = 9) {
  const tips  = ['u','l','r','b'];
  const faces = ['U','L','R','B'];
  const mods  = ['', "'"];
  const moves = [];
  let last = '';
  // tip moves (1–2 random tips)
  const numTips = Math.floor(Math.random() * 2);
  for (let i = 0; i < numTips; i++) {
    const t = tips[Math.floor(Math.random() * 4)];
    moves.push(t + mods[Math.floor(Math.random() * 2)]);
  }
  // face moves
  while (moves.filter(m => faces.includes(m[0])).length < n) {
    const face = faces[Math.floor(Math.random() * 4)];
    if (face === last) continue;
    moves.push(face + mods[Math.floor(Math.random() * 2)]);
    last = face;
  }
  return moves;
}

function genSkewb(n = 9) {
  const faces = ['U', 'R', 'L', 'B', 'F'];
  const mods  = ['', "'"];
  const moves = [];
  let last = '';
  while (moves.length < n) {
    const face = faces[Math.floor(Math.random() * 5)];
    if (face === last) continue;
    moves.push(face + mods[Math.floor(Math.random() * 2)]);
    last = face;
  }
  return moves;
}

function generateScramble(puzzle) {
  let moves;
  switch (puzzle) {
    case '2x2':     moves = gen2x2();     break;
    case '4x4':     moves = gen4x4();     break;
    case 'pyraminx': moves = genPyraminx(); break;
    case 'skewb':   moves = genSkewb();   break;
    default:        moves = gen3x3();     break;
  }
  return moves;
}

function renderScramble(moves) {
  scrambleEl.innerHTML = moves
    .map(m => `<span class="move">${m}</span>`)
    .join(' ');
  currentScramble = moves.join(' ');
}

function newScramble() {
  const moves = generateScramble(currentPuzzle);
  renderScramble(moves);
}

// ── Timer formatting ──────────────────────────

function formatTime(ms, decimals = 3) {
  if (ms === Infinity) return 'DNF';
  const totalSec = ms / 1000;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins > 0) {
    return `${mins}:${secs.toFixed(decimals).padStart(6, '0')}`;
  }
  return secs.toFixed(decimals);
}

function getDisplayTime(solve) {
  if (solve.penalty === 'DNF') return 'DNF';
  if (solve.penalty === '+2')  return formatTime(solve.rawTime + 2000, 2);
  return formatTime(solve.rawTime, 3);
}

function getNumericTime(solve) {
  if (solve.penalty === 'DNF') return Infinity;
  if (solve.penalty === '+2')  return solve.rawTime + 2000;
  return solve.rawTime;
}

// ── Timer state machine ───────────────────────

function setTimerState(newState) {
  timerState = newState;
  timerEl.classList.remove('state-ready', 'state-running', 'state-stopped');
  if (newState === 'HOLDING') timerEl.classList.add('state-ready');
  if (newState === 'RUNNING') timerEl.classList.add('state-running');
  if (newState === 'STOPPED') timerEl.classList.add('state-stopped');
}

function startHold() {
  if (timerState === 'RUNNING') {
    stopTimer();
    return;
  }
  if (timerState !== 'IDLE' && timerState !== 'STOPPED') return;
  setTimerState('HOLDING');
  timerEl.textContent = '0.000';
  holdTimeout = setTimeout(() => {
    // held long enough — go green-ish (still holding)
  }, 300);
}

function releaseHold() {
  if (timerState === 'HOLDING') {
    clearTimeout(holdTimeout);
    // only start if held >= 300ms: check by seeing if color changed
    // We'll just start on release after any hold for simplicity & mobile friendliness
    startTimer();
  }
}

function startTimer() {
  setTimerState('RUNNING');
  startTime = performance.now();
  rafId = requestAnimationFrame(tick);
}

function tick() {
  elapsed = performance.now() - startTime;
  timerEl.textContent = formatTime(elapsed, 2);
  rafId = requestAnimationFrame(tick);
}

function stopTimer() {
  cancelAnimationFrame(rafId);
  elapsed = performance.now() - startTime;
  timerEl.textContent = formatTime(elapsed, 3);
  setTimerState('STOPPED');

  // Pulse animation
  timerEl.classList.remove('pulse');
  void timerEl.offsetWidth; // reflow
  timerEl.classList.add('pulse');

  saveSolve(elapsed);
  setTimeout(() => {
    setTimerState('IDLE');
    newScramble();
  }, 400);
}

// ── Solve persistence ─────────────────────────

function saveSolve(rawTime) {
  const solve = {
    id:       Date.now(),
    rawTime,
    time:     rawTime,
    penalty:  null,
    scramble: currentScramble,
    puzzle:   currentPuzzle,
    date:     new Date().toLocaleTimeString()
  };
  solves.unshift(solve);
  persist();
  renderHistory();
  updateStats();
}

function deleteSolve(id) {
  solves = solves.filter(s => s.id !== id);
  persist();
  renderHistory();
  updateStats();
}

function setPenalty(id, penalty) {
  const solve = solves.find(s => s.id === id);
  if (!solve) return;
  solve.penalty = solve.penalty === penalty ? null : penalty;
  persist();
  renderHistory();
  updateStats();
}

function persist() {
  try {
    localStorage.setItem('cubotimer_solves', JSON.stringify(solves));
  } catch(e) {}
}

function loadSolves() {
  try {
    const raw = localStorage.getItem('cubotimer_solves');
    if (raw) solves = JSON.parse(raw);
  } catch(e) { solves = []; }
}

// ── Stats ─────────────────────────────────────

function calcAo(arr, n) {
  if (arr.length < n) return null;
  const slice  = arr.slice(0, n).map(getNumericTime);
  if (slice.filter(t => t === Infinity).length > 1) return Infinity;
  const sorted = [...slice].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, sorted.length - 1);
  const sum = trimmed.reduce((a, b) => a + b, 0);
  return sum / trimmed.length;
}

function updateStats() {
  const count = solves.length;
  statCount.textContent = count;

  if (count === 0) {
    statBest.textContent = '—';
    statAo5.textContent  = '—';
    statAo12.textContent = '—';
    statMean.textContent = '—';
    return;
  }

  const times = solves.map(getNumericTime).filter(t => t !== Infinity);

  statBest.textContent = times.length
    ? formatTime(Math.min(...times), 3)
    : 'DNF';

  const ao5 = calcAo(solves, 5);
  statAo5.textContent = ao5 === null ? '—'
    : ao5 === Infinity ? 'DNF'
    : formatTime(ao5, 3);

  const ao12 = calcAo(solves, 12);
  statAo12.textContent = ao12 === null ? '—'
    : ao12 === Infinity ? 'DNF'
    : formatTime(ao12, 3);

  if (times.length) {
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    statMean.textContent = formatTime(mean, 3);
  } else {
    statMean.textContent = 'DNF';
  }
}

// ── Render history ────────────────────────────

function renderHistory() {
  if (solves.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No solves yet. Start timing!</div>';
    return;
  }

  const bestTime = Math.min(...solves.map(getNumericTime));

  historyList.innerHTML = solves.map((solve, idx) => {
    const num     = solves.length - idx;
    const display = getDisplayTime(solve);
    const numeric = getNumericTime(solve);
    const isBest  = numeric !== Infinity && numeric === bestTime;
    const p2Active  = solve.penalty === '+2'  ? 'active-plus2' : '';
    const dnfActive = solve.penalty === 'DNF' ? 'active-dnf'   : '';

    return `
      <div class="solve-row ${isBest ? 'is-best' : ''}" data-id="${solve.id}">
        <span class="solve-num">${num}</span>
        <span class="solve-time">${display}</span>
        <span class="solve-scramble" title="${solve.scramble}">${solve.scramble}</span>
        <div class="penalty-btns">
          <button class="btn-penalty ${p2Active}"
            onclick="setPenalty(${solve.id}, '+2')">+2</button>
          <button class="btn-penalty ${dnfActive}"
            onclick="setPenalty(${solve.id}, 'DNF')">DNF</button>
        </div>
        <button class="btn-delete" onclick="deleteSolve(${solve.id})" title="Delete">✕</button>
      </div>`;
  }).join('');
}

// ── Keyboard controls ─────────────────────────

let spaceDown = false;

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    spaceDown = true;
    startHold();
  }
});

document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    spaceDown = false;
    releaseHold();
  }
});

// ── Touch / tap controls ──────────────────────

timerEl.addEventListener('touchstart', e => {
  e.preventDefault();
  startHold();
}, { passive: false });

timerEl.addEventListener('touchend', e => {
  e.preventDefault();
  releaseHold();
}, { passive: false });

// Mouse fallback (for those without keyboards on desktop)
timerEl.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  startHold();
});
timerEl.addEventListener('mouseup', () => releaseHold());

// ── Controls ──────────────────────────────────

document.getElementById('btnNewScramble').addEventListener('click', newScramble);

document.getElementById('btnClearSession').addEventListener('click', () => {
  if (solves.length === 0) return;
  if (confirm('Clear all solves in this session?')) {
    solves = [];
    persist();
    renderHistory();
    updateStats();
  }
});

puzzleSelect.addEventListener('change', () => {
  currentPuzzle = puzzleSelect.value;
  newScramble();
});

// ── Init ──────────────────────────────────────

loadSolves();
newScramble();
renderHistory();
updateStats();