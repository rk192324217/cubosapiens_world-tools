const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

let currentDiff = 'easy';
let board = [];
let gameStarted = false;
let gameOver = false;
let minesLeft = 0;
let timer = 0;
let timerInterval = null;
let longPressTimer = null;
let cellsRevealed = 0;

// Replay State
let currentReplay = { mines: [], actions: [], firstR: -1, firstC: -1 };
let isReplaying = false;
let replayTimeouts = [];
let replayStartTime = 0;

const boardEl = document.getElementById('board');
const mineCounterEl = document.getElementById('mine-counter');
const timerEl = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const diffSelect = document.getElementById('difficulty-select');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('game-message');
const modalBtn = document.getElementById('modal-restart-btn');
const replayBtn = document.getElementById('modal-replay-btn');
const replayBanner = document.getElementById('replay-banner');
const systemStatusEl = document.getElementById('system-status');

// Helper to update status bar style and text
function setSystemStatus(statusText, stateClass) {
    systemStatusEl.textContent = statusText;
    systemStatusEl.className = 'status-text ' + stateClass;
}

function initGame(startAsReplay = false) {
    // Clear any ongoing replays
    replayTimeouts.forEach(clearTimeout);
    replayTimeouts = [];
    isReplaying = startAsReplay;

    if (isReplaying) {
        replayBanner.style.display = 'block';
        setSystemStatus('REPLAY', 'state-replaying');
    } else {
        replayBanner.style.display = 'none';
        currentReplay = { mines: [], actions: [], firstR: -1, firstC: -1 };
        setSystemStatus('READY', 'state-secure');
    }

    const { rows, cols, mines } = difficulties[currentDiff];
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Adjust cell dimensions dynamically based on board size
    let cellSize = '34px';
    let fontSize = '18px';
    if (currentDiff === 'medium') {
        cellSize = '24px';
        fontSize = '13px';
    } else if (currentDiff === 'hard') {
        cellSize = '20px';
        fontSize = '11px';
    }
    boardEl.style.setProperty('--cell-size', cellSize);
    boardEl.style.setProperty('--cell-font-size', fontSize);

    board = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
    })));

    gameStarted = false;
    gameOver = false;
    minesLeft = mines;
    timer = 0;
    cellsRevealed = 0;

    document.body.style.setProperty('--tension', 0);

    updateMineCounter();
    updateTimerDisplay();
    clearInterval(timerInterval);
    modal.classList.remove('show');

    renderBoard();

    if (isReplaying) {
        runReplay();
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    const { rows, cols } = difficulties[currentDiff];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            cellEl.dataset.r = r;
            cellEl.dataset.c = c;

            // Events
            cellEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleFlag(r, c, true);
            });

            cellEl.addEventListener('mousedown', (e) => {
                if (isReplaying) return;
                if (e.button === 0 && !gameOver) {
                    setSystemStatus('ACTIVE...', 'state-analyzing');
                }
            });

            cellEl.addEventListener('mouseup', (e) => {
                if (isReplaying) return;
                if (e.button === 0) {
                    handleReveal(r, c, true, e);
                    if (!gameOver) {
                        setSystemStatus(gameStarted ? 'PLAYING' : 'READY', 'state-secure');
                    }
                }
            });

            cellEl.addEventListener('mouseenter', () => {
                if (isReplaying || gameOver) return;
                if (board[r][c].isRevealed && board[r][c].neighborMines > 0) {
                    highlightNeighbors(r, c, true);
                }
            });

            cellEl.addEventListener('mouseleave', () => {
                if (isReplaying || gameOver) return;
                if (!gameOver) {
                    setSystemStatus(gameStarted ? 'PLAYING' : 'READY', 'state-secure');
                }
                highlightNeighbors(r, c, false);
            });

            // Mobile long press for flag
            cellEl.addEventListener('touchstart', (e) => {
                if (gameOver || isReplaying) return;
                setSystemStatus('ACTIVE...', 'state-analyzing');
                longPressTimer = setTimeout(() => {
                    handleFlag(r, c, true);
                    longPressTimer = null;
                }, 500);
            });

            cellEl.addEventListener('touchend', (e) => {
                if (gameOver || isReplaying) return;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    const touch = e.changedTouches[0];
                    handleReveal(r, c, true, touch);
                }
                if (!gameOver) {
                    setSystemStatus(gameStarted ? 'PLAYING' : 'READY', 'state-secure');
                }
            });

            cellEl.addEventListener('touchmove', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });

            boardEl.appendChild(cellEl);
        }
    }
}

function placeMines(firstR, firstC) {
    const { rows, cols, mines } = difficulties[currentDiff];

    if (isReplaying) {
        // Restore exact mines from replay
        currentReplay.mines.forEach(({ r, c }) => {
            board[r][c].isMine = true;
        });
    } else {
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);

            if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;

            if (!board[r][c].isMine) {
                board[r][c].isMine = true;
                currentReplay.mines.push({ r, c });
                minesPlaced++;
            }
        }
        currentReplay.firstR = firstR;
        currentReplay.firstC = firstC;
    }

    // Calculate neighbors
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborMines = countNeighbors(r, c);
            }
        }
    }
}

function countNeighbors(r, c) {
    const { rows, cols } = difficulties[currentDiff];
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                count++;
            }
        }
    }
    return count;
}

function recordAction(type, r, c) {
    if (isReplaying || gameOver) return;
    currentReplay.actions.push({
        time: Date.now() - replayStartTime,
        type, r, c
    });
}

function handleReveal(r, c, record = true, event = null) {
    if (gameOver || board[r][c].isFlagged || board[r][c].isRevealed) return;

    if (!gameStarted) {
        gameStarted = true;
        replayStartTime = Date.now();
        placeMines(r, c);
        startTimer();
    }

    if (record) recordAction('reveal', r, c);

    const cell = board[r][c];

    if (cell.isMine) {
        gameOver = true;
        revealAllMines(r, c);
        setSystemStatus('LOST', 'state-breached');

        // Trigger particle explosion
        let px = window.innerWidth / 2;
        let py = window.innerHeight / 2;
        if (event && event.clientX !== undefined) {
            px = event.clientX;
            py = event.clientY;
        } else {
            const rect = getCellEl(r, c).getBoundingClientRect();
            px = rect.left + rect.width / 2;
            py = rect.top + rect.height / 2;
        }
        createParticles(px, py, 'mine');

        showModal("Game Over", "You hit a mine.", true);
        return;
    }

    floodFill(r, c);
    updateTension();
    checkWin();
}

function floodFill(r, c) {
    const { rows, cols } = difficulties[currentDiff];
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;

    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;
    cellsRevealed++;

    const cellEl = getCellEl(r, c);
    cellEl.classList.add('revealed');

    if (cell.neighborMines > 0) {
        cellEl.textContent = cell.neighborMines;
        cellEl.dataset.num = cell.neighborMines;
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                floodFill(r + dr, c + dc);
            }
        }
    }
}

function handleFlag(r, c, record = true) {
    if (gameOver || !gameStarted || board[r][c].isRevealed) return;

    if (record) recordAction('flag', r, c);

    const cell = board[r][c];
    cell.isFlagged = !cell.isFlagged;

    const cellEl = getCellEl(r, c);
    if (cell.isFlagged) {
        cellEl.textContent = '🚩';
        minesLeft--;
    } else {
        cellEl.textContent = '';
        minesLeft++;
    }

    updateMineCounter();
}

function handleChord(r, c, record = true) {
    if (gameOver || !gameStarted || !board[r][c].isRevealed) return;
    const cell = board[r][c];

    if (cell.neighborMines > 0) {
        if (record) recordAction('chord', r, c);

        let flags = 0;
        const { rows, cols } = difficulties[currentDiff];

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (board[nr][nc].isFlagged) flags++;
                }
            }
        }

        if (flags === cell.neighborMines) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        handleReveal(nr, nc, false); // don't record individual fills
                    }
                }
            }
        }
    }
}

function revealAllMines(hitR, hitC) {
    const { rows, cols } = difficulties[currentDiff];
    clearInterval(timerInterval);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = board[r][c];
            const cellEl = getCellEl(r, c);

            if (cell.isMine && !cell.isFlagged) {
                cellEl.classList.add('revealed', 'mine');
                cellEl.textContent = '💣';
                if (r === hitR && c === hitC) cellEl.classList.add('mine-hit');
            } else if (!cell.isMine && cell.isFlagged) {
                cellEl.classList.add('revealed');
                cellEl.textContent = '❌';
            }
        }
    }
}

function checkWin() {
    const { rows, cols, mines } = difficulties[currentDiff];
    if (cellsRevealed === (rows * cols) - mines) {
        gameOver = true;
        clearInterval(timerInterval);
        setSystemStatus('WON', 'state-cleared');
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isMine && !board[r][c].isFlagged) {
                    board[r][c].isFlagged = true;
                    getCellEl(r, c).textContent = '🚩';
                }
            }
        }
        minesLeft = 0;
        updateMineCounter();

        // Win Particles
        createParticles(window.innerWidth / 2, window.innerHeight / 2, 'win');

        showModal("You Win!", "All mines successfully flagged.", true);
    }
}

function startTimer() {
    if (isReplaying) return;
    timerInterval = setInterval(() => {
        timer++;
        if (timer > 999) timer = 999;
        updateTimerDisplay();
    }, 1000);
}

function updateMineCounter() {
    mineCounterEl.textContent = Math.max(0, minesLeft).toString().padStart(3, '0');
}

function updateTimerDisplay() {
    timerEl.textContent = timer.toString().padStart(3, '0');
}

function updateTension() {
    const { rows, cols, mines } = difficulties[currentDiff];
    const totalSafe = (rows * cols) - mines;
    const progress = cellsRevealed / totalSafe;
    document.body.style.setProperty('--tension', progress);
}

function getCellEl(r, c) {
    const { cols } = difficulties[currentDiff];
    return boardEl.children[r * cols + c];
}

function showModal(title, msg, canReplay) {
    setTimeout(() => {
        modalTitle.textContent = title;
        modalMsg.textContent = msg;

        if (canReplay && currentReplay.actions.length > 0 && !isReplaying) {
            replayBtn.style.display = 'inline-block';
        } else {
            replayBtn.style.display = 'none';
        }

        modal.classList.add('show');
    }, 1000);
}

function highlightNeighbors(r, c, add) {
    const { rows, cols } = difficulties[currentDiff];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                const nCell = board[nr][nc];
                if (!nCell.isRevealed && !nCell.isFlagged) {
                    const el = getCellEl(nr, nc);
                    if (add) el.classList.add('hover-highlight');
                    else el.classList.remove('hover-highlight');
                }
            }
        }
    }
}

function createParticles(x, y, type) {
    const count = type === 'win' ? 100 : 40;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        if (type === 'mine') p.classList.add('particle-mine');
        else if (type === 'win') p.classList.add('particle-win');

        p.style.left = x + 'px';
        p.style.top = y + 'px';

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (type === 'win' ? 150 : 100) + 50;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        document.body.appendChild(p);

        requestAnimationFrame(() => {
            p.style.transition = 'transform 1s cubic-bezier(0, .9, .5, 1), opacity 1s ease-out';
            p.style.transform = `translate(${vx}px, ${vy}px) scale(0)`;
            p.style.opacity = '0';
        });

        setTimeout(() => p.remove(), 1000);
    }
}

function runReplay() {
    replayStartTime = Date.now();
    currentReplay.actions.forEach(action => {
        const t = setTimeout(() => {
            timer = Math.floor(action.time / 1000);
            updateTimerDisplay();

            if (action.type === 'reveal') {
                handleReveal(action.r, action.c, false);
            } else if (action.type === 'flag') {
                handleFlag(action.r, action.c, false);
            } else if (action.type === 'chord') {
                handleChord(action.r, action.c, false);
            }
        }, action.time);
        replayTimeouts.push(t);
    });
}

// Help Modal Elements & Events
const helpModal = document.getElementById('help-modal');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const helpCloseBtn = document.getElementById('help-close-btn');

howToPlayBtn.addEventListener('click', () => {
    helpModal.classList.add('show');
});

helpCloseBtn.addEventListener('click', () => {
    helpModal.classList.remove('show');
});

// Close modals when clicking outside modal content
window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.remove('show');
    }
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Event Listeners
resetBtn.addEventListener('click', () => initGame(false));
modalBtn.addEventListener('click', () => initGame(false));
replayBtn.addEventListener('click', () => initGame(true));

diffSelect.addEventListener('change', (e) => {
    currentDiff = e.target.value;
    initGame(false);
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

boardEl.addEventListener('dblclick', (e) => {
    if (gameOver || isReplaying || !e.target.classList.contains('cell')) return;
    const r = parseInt(e.target.dataset.r);
    const c = parseInt(e.target.dataset.c);
    handleChord(r, c, true);
});

document.addEventListener('contextmenu', e => e.preventDefault());

initGame(false);
