'use strict';

// ─── CARD DATA ────────────────────────────────────────────────
const SUITS = ['♠','♥','♦','♣'];
const SUIT_COLOR = { '♠':'black','♥':'red','♦':'red','♣':'black' };
const SUIT_TO_LETTER = { '♠':'S','♥':'H','♦':'D','♣':'C' };
const RANKS = ['Q','K','J','A'];
const RANK_LABEL = { 'Q':'QUEEN','K':'KING','J':'JACK','A':'ACE' };

// Build deck of 16 cards
function buildDeck() {
  return SUITS.flatMap(suit =>
    RANKS.map(rank => ({
      rank,
      suit,
      color: SUIT_COLOR[suit],
      id: rank + suit
    }))
  );
}

// ─── LEVEL CONFIG ─────────────────────────────────────────────
const LEVELS = {
  easy: { pairs: 4, pts: 100, penalty: 10, timeBonus: 120 },
  mid:  { pairs: 6, pts: 150, penalty: 10, timeBonus: 200 },
  hard: { pairs: 8, pts: 200, penalty: 10, timeBonus: 300 },
};

// ─── GAME STATE ───────────────────────────────────────────────
let mode = 'solo';
let level = 'easy';
let cards = [];
let flipped = [];
let locked = false;
let activePlayer = 1;
let scores = [0, 0];
let matchCounts = [0, 0];
let timerSecs = 0;
let timerHandle = null;
let gameStarted = false;
let gameOver = false;

// ─── HELPERS ─────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ─── TIMER ───────────────────────────────────────────────────
function startTimer() {
  if (timerHandle) return;
  timerHandle = setInterval(() => {
    timerSecs++;
    document.getElementById('timer-display').textContent = fmtTime(timerSecs);
  }, 1000);
}
function stopTimer() { clearInterval(timerHandle); timerHandle = null; }
function resetTimer() {
  stopTimer();
  timerSecs = 0;
  document.getElementById('timer-display').textContent = '0:00';
}

// ─── GAME BUILD ──────────────────────────────────────────────
function buildGame() {
  const cfg = LEVELS[level];
  const deck = buildDeck();
  const chosen = shuffle(deck).slice(0, cfg.pairs);
  const pairs = shuffle([...chosen, ...chosen.map(c => ({ ...c }))]);

  cards = pairs.map((c, i) => ({ ...c, index: i, flipped: false, matched: false }));
  flipped = [];
  locked = false;
  gameStarted = false;
  gameOver = false;

  resetTimer();
  renderBoard();
  updateScoreboard();
  setStatus('PRESS A CARD TO START!', 'info');
}

// ─── RENDERING ───────────────────────────────────────────────
function renderBoard() {
  const el = document.getElementById('board');
  el.innerHTML = '';
  cards.forEach(c => {
    const col = document.createElement('div');
    col.className = 'col-3';
    col.appendChild(makeCardEl(c));
    el.appendChild(col);
  });
}

function makeCardEl(c) {
  const div = document.createElement('div');
  div.className = `card shadow ${c.flipped ? 'border-success' : 'border-secondary'}`;
  div.dataset.index = c.index;
  div.style.cursor = 'pointer';

  const imgEl = document.createElement('img');
  imgEl.src = `assets/cards/${c.rank}${SUIT_TO_LETTER[c.suit]}.png`;
  imgEl.alt = `${RANK_LABEL[c.rank]} of ${c.suit}`;
  imgEl.className = 'card-img-top';

  div.appendChild(imgEl);
  div.addEventListener('click', () => handleFlip(c.index));
  return div;
}

function getCardEl(i) {
  return document.querySelector(`.card[data-index="${i}"]`);
}

// ─── GAME LOGIC ──────────────────────────────────────────────
function handleFlip(i) {
  if (gameOver || locked) return;
  const c = cards[i];
  if (c.flipped || c.matched || flipped.length >= 2) return;

  if (!gameStarted) { gameStarted = true; startTimer(); }

  c.flipped = true;
  getCardEl(i).classList.add('border-success');
  flipped.push(i);

  if (flipped.length === 2) {
    locked = true;
    setTimeout(checkMatch, 700);
  } else {
    setStatus(mode === 'duo' ? `P${activePlayer} › FLIP ONE MORE!` : 'FLIP ONE MORE!', 'primary');
  }
}

function checkMatch() {
  const [a, b] = flipped;
  const ca = cards[a], cb = cards[b];
  const cfg = LEVELS[level];
  const pIdx = activePlayer - 1;

  if (ca.id === cb.id) {
    ca.matched = cb.matched = true;
    scores[pIdx] += cfg.pts;
    matchCounts[pIdx]++;
    flipped = [];
    locked = false;
    updateScoreboard();
    showToast(`✓ MATCH! +${cfg.pts} PTS`);

    if (cards.every(c => c.matched)) return setTimeout(endGame, 300);
  } else {
    scores[pIdx] = Math.max(0, scores[pIdx] - cfg.penalty);
    updateScoreboard();
    showToast(`✗ NO MATCH! -${cfg.penalty} PTS`);

    setTimeout(() => {
      cards[a].flipped = false;
      cards[b].flipped = false;
      flipped = [];
      locked = false;
      if (mode === 'duo') {
        activePlayer = activePlayer === 1 ? 2 : 1;
        updateScoreboard();
      }
    }, 800);
  }
}

function endGame() {
  stopTimer();
  gameOver = true;
  const cfg = LEVELS[level];
  const timePts = Math.max(0, cfg.timeBonus - timerSecs);

  if (mode === 'solo') {
    scores[0] += timePts;
    updateScoreboard();
    showResult('🏆','YOU WIN!',`Time: ${fmtTime(timerSecs)} · Bonus: +${timePts}`,
      [{ label:'FINAL SCORE', val:scores[0], color:'green' }]);
  } else {
    const [s1, s2] = scores;
    const winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
    if (winner > 0) scores[winner - 1] += timePts;
    updateScoreboard();
    const emoji = winner ? '🏆' : '🤝';
    const title = winner ? `PLAYER ${winner} WINS!` : "IT'S A TIE!";
    showResult(emoji, title, 'Game finished!', [
      { label:'P1', val:scores[0], color:'green' },
      { label:'P2', val:scores[1], color:'red' }
    ]);
  }
}

// ─── UI ──────────────────────────────────────────────────────
function updateScoreboard() {
  document.getElementById('score-p1').textContent = scores[0];
  document.getElementById('score-p2').textContent = scores[1];
}

function setStatus(msg, type) {
  const el = document.getElementById('status-text');
  el.textContent = msg;
  el.parentElement.className = `alert alert-${type} text-center`;
}

function showResult(emoji, title, sub, scoreItems) {
  document.getElementById('res-emoji').textContent = emoji;
  document.getElementById('res-title').textContent = title;
  document.getElementById('res-sub').textContent = sub;
  const sc = document.getElementById('res-scores');
  sc.innerHTML = '';
  scoreItems.forEach(s => {
    sc.innerHTML += `<div><strong>${s.label}:</strong> <span style="color:${s.color}">${s.val}</span></div>`;
  });
  new bootstrap.Modal(document.getElementById('overlay')).show();
}

function showToast(msg) {
  const toastEl = document.getElementById('toast');
  toastEl.querySelector('.toast-body').textContent = msg;
  new bootstrap.Toast(toastEl).show();
}

// ───