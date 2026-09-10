/* ============================================================
   cuboPomo – app.js
   Sections:
   1.  State & config defaults
   2.  Element references
   3.  Theme toggle
   4.  Settings — load / save / modal
   5.  Mode switching
   6.  Timer core — tick / start / pause / reset
   7.  Session flow — onTimerEnd / nextSession
   8.  Ring progress update
   9.  Session dots render
   10. Stats update
   11. Sound alert (Web Audio API — no files needed)
   12. Desktop notifications
   13. Tasks — add / remove / toggle / render
   14. Current task input
   15. Page title sync
   16. Keyboard shortcut (Space = play/pause)
   17. Toast helper
   18. Init
   ============================================================ */


/* ── 1. State & Config Defaults ── */
let config = {
  workMins:        25,
  shortMins:       5,
  longMins:        15,
  pomosUntilLong:  4,
  autoBreak:       true,
  autoFocus:       false,
  soundAlert:      true,
  notifications:   false,
};

let state = {
  mode:          'work',    // 'work' | 'short' | 'long'
  running:       false,
  secondsLeft:   25 * 60,
  totalSeconds:  25 * 60,
  sessionsDone:  0,         // completed focus sessions this cycle
  totalDone:     0,         // all-time completed focus sessions
  totalFocusSec: 0,         // accumulated focus seconds
  streak:        0,
  intervalId:    null,
};

let tasks     = [];   // [{ id, text, done, pomoCount }]
let taskNextId = 0;


/* ── 2. Element References ── */
const themeToggle      = document.getElementById('themeToggle');
const btnSettings      = document.getElementById('btnSettings');
const btnCloseModal    = document.getElementById('btnCloseModal');
const modalBackdrop    = document.getElementById('modalBackdrop');
const btnSaveSettings  = document.getElementById('btnSaveSettings');

const modeTabs         = document.querySelectorAll('.mode-tab');
const timerDisplay     = document.getElementById('timerDisplay');
const timerModeLabel   = document.getElementById('timerModeLabel');
const ringProgress     = document.getElementById('ringProgress');
const sessionDots      = document.getElementById('sessionDots');
const btnPlayPause     = document.getElementById('btnPlayPause');
const playIcon         = document.getElementById('playIcon');
const btnSkip          = document.getElementById('btnSkip');
const btnNext          = document.getElementById('btnNext');

const statCompleted    = document.getElementById('statCompleted');
const statStreak       = document.getElementById('statStreak');
const statFocusTime    = document.getElementById('statFocusTime');

const currentTask      = document.getElementById('currentTask');
const taskInput        = document.getElementById('taskInput');
const btnAddTask       = document.getElementById('btnAddTask');
const taskList         = document.getElementById('taskList');
const taskEmpty        = document.getElementById('taskEmpty');
const btnClearDone     = document.getElementById('btnClearDone');
const toastEl          = document.getElementById('toast');

// Settings inputs
const setFocus         = document.getElementById('setFocus');
const setShort         = document.getElementById('setShort');
const setLong          = document.getElementById('setLong');
const setPomosUntilLong= document.getElementById('setPomosUntilLong');
const setAutoBreak     = document.getElementById('setAutoBreak');
const setAutoFocus     = document.getElementById('setAutoFocus');
const setSoundAlert    = document.getElementById('setSoundAlert');
const setNotifications = document.getElementById('setNotifications');

const RING_CIRCUMFERENCE = 779.1; // 2π × 124


/* ── 3. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 4. Settings — load / save / modal ── */
function loadConfig() {
  const saved = localStorage.getItem('cuboPomo_config');
  if (saved) {
    try { config = { ...config, ...JSON.parse(saved) }; } catch {}
  }
  applyConfigToInputs();
}

function applyConfigToInputs() {
  setFocus.value          = config.workMins;
  setShort.value          = config.shortMins;
  setLong.value           = config.longMins;
  setPomosUntilLong.value = config.pomosUntilLong;
  setAutoBreak.checked    = config.autoBreak;
  setAutoFocus.checked    = config.autoFocus;
  setSoundAlert.checked   = config.soundAlert;
  setNotifications.checked= config.notifications;
}

btnSaveSettings.addEventListener('click', () => {
  config.workMins        = Math.max(1, parseInt(setFocus.value)          || 25);
  config.shortMins       = Math.max(1, parseInt(setShort.value)          || 5);
  config.longMins        = Math.max(1, parseInt(setLong.value)           || 15);
  config.pomosUntilLong  = Math.max(1, parseInt(setPomosUntilLong.value) || 4);
  config.autoBreak       = setAutoBreak.checked;
  config.autoFocus       = setAutoFocus.checked;
  config.soundAlert      = setSoundAlert.checked;
  config.notifications   = setNotifications.checked;

  localStorage.setItem('cuboPomo_config', JSON.stringify(config));

  // Request notification permission if enabled
  if (config.notifications && Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      if (p !== 'granted') showToast('Notifications blocked by browser');
    });
  }

  // Reset timer to apply new durations
  pauseTimer();
  resetToMode(state.mode);
  closeModal();
  showToast('Settings saved ✓');
});

// Modal open / close
btnSettings.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

function openModal() {
  applyConfigToInputs();
  modalBackdrop.classList.add('open');
}

function closeModal() {
  modalBackdrop.classList.remove('open');
}


/* ── 5. Mode Switching ── */
const MODE_LABELS = {
  work:  'Focus Time',
  short: 'Short Break',
  long:  'Long Break',
};

modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    pauseTimer();
    switchMode(tab.dataset.mode, true);
  });
});

function switchMode(mode, manual = false) {
  state.mode = mode;
  document.body.dataset.mode = mode;

  modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

  resetToMode(mode);
  timerModeLabel.textContent = MODE_LABELS[mode];

  renderSessionDots();
  updateRing(1);  // full ring on mode switch
  syncTitle();

  if (!manual) {
    // Auto-start logic
    const shouldAutoStart =
      (mode !== 'work' && config.autoBreak) ||
      (mode === 'work'  && config.autoFocus);
    if (shouldAutoStart) startTimer();
  }
}

function resetToMode(mode) {
  pauseTimer();
  const mins = mode === 'work' ? config.workMins
             : mode === 'short' ? config.shortMins
             : config.longMins;
  state.secondsLeft  = mins * 60;
  state.totalSeconds = mins * 60;
  renderTime();
  updateRing(1);
}


/* ── 6. Timer Core ── */
function startTimer() {
  if (state.running) return;
  state.running = true;
  playIcon.className = 'fa-solid fa-pause';
  btnPlayPause.classList.add('running');
  syncTitle();

  state.intervalId = setInterval(() => {
    state.secondsLeft--;

    // Accumulate focus time
    if (state.mode === 'work') state.totalFocusSec++;

    renderTime();
    updateRing(state.secondsLeft / state.totalSeconds);
    updateStats();
    syncTitle();

    if (state.secondsLeft <= 0) {
      clearInterval(state.intervalId);
      state.running = false;
      onTimerEnd();
    }
  }, 1000);
}

function pauseTimer() {
  if (state.intervalId) clearInterval(state.intervalId);
  state.running = false;
  state.intervalId = null;
  playIcon.className = 'fa-solid fa-play';
  btnPlayPause.classList.remove('running');
  syncTitle();
}

btnPlayPause.addEventListener('click', () => {
  state.running ? pauseTimer() : startTimer();
});

// Skip back — restart current session
btnSkip.addEventListener('click', () => {
  pauseTimer();
  resetToMode(state.mode);
  showToast('Session restarted');
});

// Skip forward — go to next session
btnNext.addEventListener('click', () => {
  pauseTimer();
  nextSession(true); // skip = true means don't count as complete
});


/* ── 7. Session Flow ── */
function onTimerEnd() {
  playAlert();
  sendNotification();

  if (state.mode === 'work') {
    state.sessionsDone++;
    state.totalDone++;
    state.streak++;
    updateStats();
    addPomoToCurrentTask();

    // Decide next: long break or short break
    if (state.sessionsDone >= config.pomosUntilLong) {
      state.sessionsDone = 0;
      showToast('Great work! Time for a long break 🎉');
      switchMode('long');
    } else {
      showToast('Focus session done! Take a short break ☕');
      switchMode('short');
    }
  } else {
    // Break ended → back to work
    showToast('Break over! Let\'s focus 🚀');
    switchMode('work');
  }
}

function nextSession(skip = false) {
  if (!skip && state.mode === 'work') {
    state.sessionsDone++;
    state.totalDone++;
    state.streak++;
    updateStats();
  }

  if (state.mode === 'work') {
    if (state.sessionsDone >= config.pomosUntilLong) {
      state.sessionsDone = 0;
      switchMode('long');
    } else {
      switchMode('short');
    }
  } else {
    switchMode('work');
  }
}


/* ── 8. Ring Progress Update ── */
function updateRing(fraction) {
  // fraction = 1 → full ring (start), 0 → empty (end)
  const offset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction)));
  ringProgress.style.strokeDashoffset = offset;

  // Colour ring based on mode
  const colors = { work: '#e34949', short: '#34c759', long: '#007aff' };
  ringProgress.style.stroke = colors[state.mode] || '#e34949';
}


/* ── 9. Session Dots Render ── */
function renderSessionDots() {
  sessionDots.innerHTML = '';
  for (let i = 0; i < config.pomosUntilLong; i++) {
    const dot = document.createElement('div');
    dot.className = 'session-dot';
    if (i < state.sessionsDone)       dot.classList.add('done');
    else if (i === state.sessionsDone) dot.classList.add('active');
    sessionDots.appendChild(dot);
  }
}


/* ── 10. Stats Update ── */
function updateStats() {
  statCompleted.textContent = state.totalDone;
  statStreak.textContent    = state.streak;

  const mins = Math.floor(state.totalFocusSec / 60);
  const hrs  = Math.floor(mins / 60);
  statFocusTime.textContent = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
}

function renderTime() {
  const m = Math.floor(state.secondsLeft / 60).toString().padStart(2, '0');
  const s = (state.secondsLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
}


/* ── 11. Sound Alert (Web Audio API — zero files) ── */
function playAlert() {
  if (!config.soundAlert) return;

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Play 3 short beeps
    [0, 0.35, 0.7].forEach(delay => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type      = 'sine';
      osc.frequency.value = state.mode === 'work' ? 880 : 660;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (e) {
    console.warn('[cuboPomo] Audio context error:', e);
  }
}


/* ── 12. Desktop Notifications ── */
function sendNotification() {
  if (!config.notifications) return;
  if (Notification.permission !== 'granted') return;

  const messages = {
    work:  { title: 'Focus session done! 🍅', body: 'Time to take a break.' },
    short: { title: 'Break over! 🚀',          body: 'Ready to focus again?' },
    long:  { title: 'Long break over! 💪',      body: 'Let\'s get back to it.' },
  };

  const msg = messages[state.mode] || messages.work;
  new Notification(msg.title, { body: msg.body, icon: 'assets/logo.png' });
}


/* ── 13. Tasks — add / remove / toggle / render ── */
function addTask(text) {
  if (!text.trim()) return;
  tasks.push({ id: taskNextId++, text: text.trim(), done: false, pomoCount: 0 });
  renderTasks();
  taskInput.value = '';
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  renderTasks();
}

function addPomoToCurrentTask() {
  const name = currentTask.value.trim();
  if (!name) return;

  // Find matching task (case-insensitive)
  const task = tasks.find(t => t.text.toLowerCase() === name.toLowerCase());
  if (task) {
    task.pomoCount++;
    renderTasks();
  }
}

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.appendChild(taskEmpty);
    return;
  }

  // Sort: undone first, then done
  const sorted = [...tasks].sort((a, b) => a.done - b.done);

  sorted.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.done ? ' done' : '');

    // Checkbox
    const check = document.createElement('div');
    check.className = 'task-check' + (task.done ? ' checked' : '');
    if (task.done) check.innerHTML = '<i class="fa-solid fa-check"></i>';
    check.addEventListener('click', () => toggleTask(task.id));

    // Text
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    // Pomo count
    const pomoCount = document.createElement('span');
    pomoCount.className = 'task-pomo-count';
    if (task.pomoCount > 0) {
      pomoCount.innerHTML = `<i class="fa-solid fa-circle"></i> ${task.pomoCount}`;
    }

    // Remove btn
    const removeBtn = document.createElement('button');
    removeBtn.className = 'task-remove';
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeBtn.addEventListener('click', () => removeTask(task.id));

    item.appendChild(check);
    item.appendChild(text);
    if (task.pomoCount > 0) item.appendChild(pomoCount);
    item.appendChild(removeBtn);
    taskList.appendChild(item);
  });
}

btnAddTask.addEventListener('click', () => addTask(taskInput.value));

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask(taskInput.value);
});

btnClearDone.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  renderTasks();
  showToast('Done tasks cleared');
});


/* ── 14. Current Task Input ── */
currentTask.addEventListener('keydown', e => {
  if (e.key === 'Enter') currentTask.blur();
});


/* ── 15. Page Title Sync ── */
function syncTitle() {
  const m = Math.floor(state.secondsLeft / 60).toString().padStart(2, '0');
  const s = (state.secondsLeft % 60).toString().padStart(2, '0');
  const icon = state.running ? '▶' : '⏸';
  document.title = `${icon} ${m}:${s}-Pomodoro Timer`;
}


/* ── 16. Keyboard Shortcut ── */
document.addEventListener('keydown', e => {
  // Space = play/pause (unless focused on an input)
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    state.running ? pauseTimer() : startTimer();
  }
});


/* ── 17. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}


/* ── 18. Init ── */
loadConfig();
switchMode('work', true);
renderTasks();
updateStats();
document.body.dataset.mode = 'work';
syncTitle();
