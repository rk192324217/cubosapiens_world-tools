(() => {
  'use strict';

  const TUBE_CAPACITY = 4;
  const STORAGE_KEY = 'colorSortPuzzle:v2';

  const COLOR_VARS = ['--c0', '--c1', '--c2', '--c3', '--c4', '--c5', '--c6', '--c7'];


  const DIFFICULTIES = {
    easy: {
      label: 'Easy',
      colorsForLevel: lvl => Math.min(3 + Math.floor((lvl - 1) / 3), 6),
      emptyTubesForLevel: lvl => (lvl <= 3 ? 3 : 3 + Math.floor((lvl - 4) / 5))
    },
    medium: {
      label: 'Medium',
      colorsForLevel: lvl => Math.min(4 + Math.floor((lvl - 1) / 2), COLOR_VARS.length),
      emptyTubesForLevel: lvl => (lvl <= 2 ? 2 : 2 + Math.floor((lvl - 3) / 4))
    },
    hard: {
      label: 'Hard',
      colorsForLevel: lvl => Math.min(5 + Math.floor((lvl - 1) / 2), COLOR_VARS.length),
      emptyTubesForLevel: lvl => (lvl <= 3 ? 2 : 2 + Math.floor((lvl - 4) / 6))
    }
  };

  const rack = document.getElementById('tube-rack');
  const movesEl = document.getElementById('moves-value');
  const levelEl = document.getElementById('level-value');
  const bestEl = document.getElementById('best-value');
  const liveRegion = document.getElementById('live-region');
  const hintEl = document.getElementById('game-hint');
  const difficultyBar = document.getElementById('difficulty-bar');
  const difficultyBtns = Array.from(difficultyBar.querySelectorAll('.difficulty-btn'));

  const celebrationOverlay = document.getElementById('celebration-overlay');
  const celebrationMoves = document.getElementById('celebration-moves');
  const skipCelebrationBtn = document.getElementById('skip-celebration');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');

  const CELEBRATION_MS = 60000; 

  const undoBtn = document.getElementById('undo-btn');
  const restartBtn = document.getElementById('restart-btn');
  const newLevelBtn = document.getElementById('new-level-btn');
  const themeToggle = document.getElementById('theme-toggle');

  /** @type {{theme:string|null, difficulty:string, progress:Record<string,{level:number, best:Record<number,number>}>}} */
  let store = loadStore();

  let difficulty = store.difficulty;
  let level = store.progress[difficulty].level || 1;
  let tubes = [];
  let initialTubes = [];
  let history = [];
  let moves = 0;
  let selected = -1;
  let won = false;

  function freshProgress() {
    return { level: 1, best: {} };
  }

  function loadStore() {
    let raw = null;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) { /* storage unavailable — fall back to defaults */ }

    if (!raw) {
      
      let legacy = null;
      try {
        legacy = JSON.parse(localStorage.getItem('colorSortPuzzle:v1') || 'null');
      } catch (e) { /* ignore */ }

      const progress = { easy: freshProgress(), medium: freshProgress(), hard: freshProgress() };
      if (legacy) {
        progress.medium = { level: legacy.level || 1, best: legacy.best || {} };
      }
      return { theme: legacy ? legacy.theme : null, difficulty: 'medium', progress };
    }

    raw.progress = raw.progress || {};
    for (const key of Object.keys(DIFFICULTIES)) {
      if (!raw.progress[key]) raw.progress[key] = freshProgress();
    }
    if (!DIFFICULTIES[raw.difficulty]) raw.difficulty = 'medium';
    return raw;
  }

  function saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* ignore write failures (private mode, quota) */ }
  }

  function announce(msg) {
    liveRegion.textContent = msg;
  }

 

  let audioCtx = null;

  function getAudioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function tone({ freq, start, duration, type = 'sine', peak = 0.18, glideTo = null }) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (glideTo !== null) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.03, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }


  function playPourSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    tone({ freq: 620, start: now, duration: 0.16, type: 'sine', glideTo: 260, peak: 0.16 });
    tone({ freq: 900, start: now + 0.05, duration: 0.1, type: 'sine', glideTo: 500, peak: 0.06 });
  }


  function playDeniedSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    tone({ freq: 160, start: ctx.currentTime, duration: 0.14, type: 'triangle', peak: 0.12 });
  }

 
  function playWinFanfare() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone({ freq, start: now + i * 0.12, duration: 0.32, type: 'triangle', peak: 0.2 });
    });
  }



  function colorsForLevel(lvl) {
    return DIFFICULTIES[difficulty].colorsForLevel(lvl);
  }

  function emptyTubesForLevel(lvl) {
    return DIFFICULTIES[difficulty].emptyTubesForLevel(lvl);
  }

  function generateLevel(lvl) {
    const numColors = colorsForLevel(lvl);
    const numEmpty = emptyTubesForLevel(lvl);

    let attempt;
    do {
      const pool = [];
      for (let c = 0; c < numColors; c++) {
        for (let i = 0; i < TUBE_CAPACITY; i++) pool.push(c);
      }
      shuffle(pool);

      attempt = [];
      for (let t = 0; t < numColors; t++) {
        attempt.push(pool.slice(t * TUBE_CAPACITY, (t + 1) * TUBE_CAPACITY));
      }
      for (let e = 0; e < numEmpty; e++) attempt.push([]);
    } while (isSolved(attempt));

    return attempt;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function isSolved(state) {
    return state.every(t =>
      t.length === 0 || (t.length === TUBE_CAPACITY && t.every(c => c === t[0]))
    );
  }

  

  function startLevel(lvl, { keepProgress = false } = {}) {
    level = lvl;
    tubes = generateLevel(lvl);
    initialTubes = tubes.map(t => [...t]);
    history = [];
    moves = 0;
    selected = -1;
    won = false;

    store.progress[difficulty].level = level;
    saveStore();

    render();
    updateStats();
    hideWin();
    announce(`Level ${level}. New puzzle shuffled.`);
  }

  function restartLevel() {
    tubes = initialTubes.map(t => [...t]);
    history = [];
    moves = 0;
    selected = -1;
    won = false;
    render();
    updateStats();
    hideWin();
    announce('Level restarted.');
  }

  function topRun(tube) {
    if (tube.length === 0) return { color: null, count: 0 };
    const color = tube[tube.length - 1];
    let count = 0;
    for (let i = tube.length - 1; i >= 0 && tube[i] === color; i--) count++;
    return { color, count };
  }

  function canPour(fromIdx, toIdx) {
    if (fromIdx === toIdx) return false;
    const from = tubes[fromIdx];
    const to = tubes[toIdx];
    if (from.length === 0) return false;
    if (to.length >= TUBE_CAPACITY) return false;
    const { color } = topRun(from);
    if (to.length > 0 && to[to.length - 1] !== color) return false;
    return true;
  }

  function pour(fromIdx, toIdx) {
    const from = tubes[fromIdx];
    const to = tubes[toIdx];
    const { color, count } = topRun(from);
    const space = TUBE_CAPACITY - to.length;
    const moveCount = Math.min(count, space);
    const toCountBefore = to.length;

    history.push(tubes.map(t => [...t]));

    for (let i = 0; i < moveCount; i++) {
      from.pop();
      to.push(color);
    }

    moves++;
    playPourSound();
    updateStats();
    render({ toIdx, fromCount: toCountBefore });

    if (isSolved(tubes)) {
      won = true;
      onWin();
    } else {
      announce(`Moved ${moveCount} into tube ${toIdx + 1}.`);
    }
  }

  function onWin() {
    const best = store.progress[difficulty].best;
    const prevBest = best[level];
    if (prevBest === undefined || moves < prevBest) {
      best[level] = moves;
      saveStore();
    }
    updateStats();
    announce(`Solved in ${moves} moves!`);
    startCelebration();
  }

  function hideWin() {
    endCelebration();
  }

  function undo() {
    if (history.length === 0 || won) return;
    tubes = history.pop();
    moves = Math.max(0, moves - 1);
    selected = -1;
    render();
    updateStats();
    announce('Move undone.');
  }

  function updateStats() {
    levelEl.textContent = String(level);
    movesEl.textContent = String(moves);
    const best = store.progress[difficulty].best[level];
    bestEl.textContent = best === undefined ? '—' : String(best);
    undoBtn.disabled = history.length === 0 || won;
  }


  function render(justPoured = null) {
    rack.innerHTML = '';
    tubes.forEach((tube, idx) => {
      const el = document.createElement('div');
      el.className = 'tube' + (idx === selected ? ' selected' : '');
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.dataset.index = String(idx);
      el.setAttribute('aria-label', describeTube(tube, idx));

      
      for (let i = 0; i < TUBE_CAPACITY; i++) {
        const seg = document.createElement('div');
        const colorIdx = tube[i];
        const isEmpty = colorIdx === undefined;
        seg.className = 'segment' + (isEmpty ? ' empty' : '');
        if (!isEmpty) {
          seg.style.background = `var(${COLOR_VARS[colorIdx % COLOR_VARS.length]})`;
          if (justPoured && justPoured.toIdx === idx && i >= justPoured.fromCount) {
            seg.classList.add('fill-in');
          }
        }
        el.appendChild(seg);
      }

      el.addEventListener('click', () => handleSelect(idx));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(idx);
        } else if (e.key === 'Escape') {
          selected = -1;
          render();
        }
      });

      rack.appendChild(el);
    });
  }

  function describeTube(tube, idx) {
    if (tube.length === 0) return `Tube ${idx + 1}, empty`;
    const counts = {};
    tube.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    const desc = Object.entries(counts)
      .map(([c, n]) => `${n} color ${Number(c) + 1}`)
      .join(', ');
    return `Tube ${idx + 1}, ${tube.length} of ${TUBE_CAPACITY} filled: ${desc}`;
  }

  function handleSelect(idx) {
    if (won) return;

    if (selected === -1) {
      if (tubes[idx].length === 0) return;
      selected = idx;
      render();
      return;
    }

    if (selected === idx) {
      selected = -1;
      render();
      return;
    }

    if (canPour(selected, idx)) {
      const from = selected;
      selected = -1;
      pour(from, idx);
    } else {
      const el = rack.children[idx];
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 320);
      }
      playDeniedSound();
      selected = -1;
      render();
      announce('That move is not allowed.');
    }
  }


  const CONFETTI_COLORS = ['#f43f5e', '#f97316', '#facc15', '#4ade80', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6'];
  const reducesMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let confettiParticles = [];
  let confettiRAF = null;
  let confettiSpawner = null;
  let celebrationTimer = null;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);

  function spawnConfettiBurst(count) {
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 2.5 + Math.random() * 3,
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: Math.random() < 0.5 ? 'rect' : 'circle'
      });
    }
  }

  function stepConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (const p of confettiParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.01; // gentle gravity
      p.rotation += p.vr;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    }
    confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 40);
    confettiRAF = requestAnimationFrame(stepConfetti);
  }

  function startConfetti() {
    resizeConfettiCanvas();
    confettiParticles = [];
    if (reducesMotion()) return; 
    spawnConfettiBurst(90);
    confettiSpawner = setInterval(() => spawnConfettiBurst(35), 650);
    confettiRAF = requestAnimationFrame(stepConfetti);
  }

  function stopConfetti() {
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    if (confettiSpawner) clearInterval(confettiSpawner);
    confettiRAF = null;
    confettiSpawner = null;
    confettiParticles = [];
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  function startCelebration() {
    celebrationMoves.textContent = `Cleared level ${level} in ${moves} moves.`;
    celebrationOverlay.hidden = false;
    startConfetti();
    playWinFanfare();
    clearTimeout(celebrationTimer);
    celebrationTimer = setTimeout(goToNextLevel, CELEBRATION_MS);
  }

  function endCelebration() {
    clearTimeout(celebrationTimer);
    celebrationTimer = null;
    stopConfetti();
    celebrationOverlay.hidden = true;
  }

  function goToNextLevel() {
    endCelebration();
    startLevel(level + 1);
  }

  skipCelebrationBtn.addEventListener('click', goToNextLevel);



  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    store.theme = theme;
    saveStore();
  }

  function initTheme() {
    const saved = store.theme;
    if (saved) {
      applyTheme(saved);
      return;
    }
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });


  function applyDifficultyButtons() {
    difficultyBtns.forEach(btn => {
      const isActive = btn.dataset.difficulty === difficulty;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function setDifficulty(next) {
    if (next === difficulty || !DIFFICULTIES[next]) return;
    difficulty = next;
    store.difficulty = difficulty;
    saveStore();
    applyDifficultyButtons();
    startLevel(store.progress[difficulty].level || 1);
  }

  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
  });



  undoBtn.addEventListener('click', undo);
  restartBtn.addEventListener('click', restartLevel);
  newLevelBtn.addEventListener('click', () => startLevel(level));


  initTheme();
  applyDifficultyButtons();
  startLevel(level);
})();