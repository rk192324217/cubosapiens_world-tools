const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = 1; // 1 = P1 (Red), 2 = P2/AI (Yellow)
let scores = { p1: 0, p2: 0 };
let mode = 'solo'; // 'solo' or 'duo'
let isGameOver = false;
let isAnimating = false;

const boardEl = document.getElementById('board');
const statusText = document.getElementById('status-text');
const turnIndicator = document.getElementById('turn-indicator');
const cardP1 = document.getElementById('card-p1');
const cardP2 = document.getElementById('card-p2');
const scoreP1El = document.getElementById('score-p1');
const scoreP2El = document.getElementById('score-p2');

// Local storage tracking removed as score now represents in-game count.

// Mode Buttons
document.querySelectorAll('.setup-btn[data-mode]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.setup-btn[data-mode]').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    const target = e.currentTarget;
    target.classList.add('active');
    target.setAttribute('aria-pressed', 'true');
    mode = target.dataset.mode;
    initGame();
  });
});

// Action Buttons
document.getElementById('btn-reset').addEventListener('click', initGame);
document.getElementById('btn-new').addEventListener('click', () => {
  initGame();
});

// Result Overlay Buttons
document.getElementById('res-play').addEventListener('click', () => {
  document.getElementById('overlay').classList.remove('show');
  initGame();
});
document.getElementById('res-reset').addEventListener('click', () => {
  document.getElementById('overlay').classList.remove('show');
  initGame();
});

// How to Play Toggle
document.getElementById('htp-toggle').addEventListener('click', () => {
  const body = document.getElementById('htp-body');
  const chev = document.getElementById('htp-chev');
  const isExpanded = body.classList.contains('open');
  if (isExpanded) {
    body.classList.remove('open');
    chev.classList.remove('open');
    document.getElementById('htp-toggle').setAttribute('aria-expanded', 'false');
  } else {
    body.classList.add('open');
    chev.classList.add('open');
    document.getElementById('htp-toggle').setAttribute('aria-expanded', 'true');
  }
});

function initGame() {
  board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  currentPlayer = 1;
  isGameOver = false;
  isAnimating = false;
  
  scores = { p1: 0, p2: 0 };
  updateScoreDisplay();
  updateTurnDisplay();
  statusText.textContent = "CLICK A COLUMN TO DROP A TOKEN!";
  statusText.style.color = "inherit";
  
  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = '';
  
  // Create cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.id = `cell-${r}-${c}`;
      boardEl.appendChild(cell);
    }
  }

  // Create interactors (invisible column overlays to catch clicks and hover)
  for (let c = 0; c < COLS; c++) {
    const interactor = document.createElement('div');
    interactor.classList.add('column-interactor', `col-${c}`);
    interactor.dataset.col = c;
    
    interactor.addEventListener('mouseenter', () => {
      if (!isGameOver && !isAnimating && (mode === 'duo' || currentPlayer === 1)) {
        boardEl.classList.add(`col-hover-${c}`);
      }
    });
    interactor.addEventListener('mouseleave', () => {
      boardEl.classList.remove(`col-hover-${c}`);
    });
    interactor.addEventListener('click', () => handleColumnClick(c));
    
    boardEl.appendChild(interactor);
  }
}

function clearHovers() {
  for (let c = 0; c < COLS; c++) {
    boardEl.classList.remove(`col-hover-${c}`);
  }
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function handleColumnClick(col) {
  if (isGameOver || isAnimating) return;
  if (mode === 'solo' && currentPlayer === 2) return; // AI's turn
  
  const row = getAvailableRow(col);
  if (row === -1) return; // Column full

  dropToken(row, col, currentPlayer);
}

function dropToken(row, col, player) {
  isAnimating = true;
  clearHovers();
  
  board[row][col] = player;
  
  const cell = document.getElementById(`cell-${row}-${col}`);
  const token = document.createElement('div');
  token.classList.add('token', player === 1 ? 'p1' : 'p2');
  cell.appendChild(token);
  
  // Animation duration is 0.5s in CSS
  setTimeout(() => {
    isAnimating = false;
    checkGameState(row, col, player);
  }, 500);
}

function checkGameState(row, col, player) {
  // Update scores by counting all 4s on the board
  const p1Lines = findAllFours(1);
  const p2Lines = findAllFours(2);
  
  scores.p1 = p1Lines.length;
  scores.p2 = p2Lines.length;
  updateScoreDisplay();
  
  // Highlight winning tokens
  document.querySelectorAll('.token').forEach(t => t.classList.remove('win-highlight'));
  
  const allLines = [...p1Lines, ...p2Lines];
  allLines.forEach(line => {
    line.forEach(([r, c]) => {
      const cell = document.getElementById(`cell-${r}-${c}`);
      if (cell && cell.firstChild) {
        cell.firstChild.classList.add('win-highlight');
      }
    });
  });

  if (isBoardFull()) {
    handleGameOver();
  } else {
    // Next turn
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateTurnDisplay();
    
    if (mode === 'solo' && currentPlayer === 2) {
      statusText.textContent = "AI IS THINKING...";
      setTimeout(makeAIMove, 600);
    } else {
      statusText.textContent = "CLICK A COLUMN TO DROP A TOKEN!";
    }
  }
}

function findAllFours(player) {
  const lines = [];
  // Horizontal
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<=COLS-4; c++) {
      if(board[r][c]===player && board[r][c+1]===player && board[r][c+2]===player && board[r][c+3]===player) {
        lines.push([[r,c], [r,c+1], [r,c+2], [r,c+3]]);
      }
    }
  }
  // Vertical
  for(let c=0; c<COLS; c++) {
    for(let r=0; r<=ROWS-4; r++) {
      if(board[r][c]===player && board[r+1][c]===player && board[r+2][c]===player && board[r+3][c]===player) {
        lines.push([[r,c], [r+1,c], [r+2,c], [r+3,c]]);
      }
    }
  }
  // Diagonal /
  for(let r=3; r<ROWS; r++) {
    for(let c=0; c<=COLS-4; c++) {
      if(board[r][c]===player && board[r-1][c+1]===player && board[r-2][c+2]===player && board[r-3][c+3]===player) {
        lines.push([[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]]);
      }
    }
  }
  // Diagonal \
  for(let r=0; r<=ROWS-4; r++) {
    for(let c=0; c<=COLS-4; c++) {
      if(board[r][c]===player && board[r+1][c+1]===player && board[r+2][c+2]===player && board[r+3][c+3]===player) {
        lines.push([[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]]);
      }
    }
  }
  return lines;
}

function isBoardFull() {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) return false;
  }
  return true;
}

function handleGameOver() {
  isGameOver = true;
  
  if (scores.p1 > scores.p2) {
    statusText.textContent = "PLAYER 1 WINS!";
    statusText.style.color = "var(--p1c)";
    setTimeout(() => showResultOverlay(1, false), 1500);
  } else if (scores.p2 > scores.p1) {
    const p2Name = mode === 'solo' ? "AI" : "PLAYER 2";
    statusText.textContent = `${p2Name} WINS!`;
    statusText.style.color = "var(--p2c)";
    setTimeout(() => showResultOverlay(2, false), 1500);
  } else {
    statusText.textContent = "IT'S A DRAW!";
    statusText.style.color = "var(--gold)";
    setTimeout(() => showResultOverlay(0, true), 1500);
  }
}

function makeAIMove() {
  if (isGameOver) return;
  
  let bestCol = -1;
  let bestScoreDiff = -Infinity;
  let validCols = [];
  
  for (let c = 0; c < COLS; c++) {
    let r = getAvailableRow(c);
    if (r !== -1) {
      validCols.push(c);
      
      // simulate AI move
      board[r][c] = 2;
      let aiScoreAfter = findAllFours(2).length;
      
      // simulate Player move in that same spot to see if it blocks them
      board[r][c] = 1;
      let p1ScoreIfTheyMoved = findAllFours(1).length;
      
      let currentAiScore = scores.p2;
      let currentP1Score = scores.p1;
      
      let aiGain = aiScoreAfter - currentAiScore;
      let p1GainIfTheyMoved = p1ScoreIfTheyMoved - currentP1Score;
      
      // Evaluate move: our gain + blocking their gain
      let moveValue = aiGain + (p1GainIfTheyMoved * 0.9);
      
      // Add a tiny random jitter to make the AI unpredictable
      moveValue += Math.random() * 0.1;
      
      if (moveValue > bestScoreDiff) {
        bestScoreDiff = moveValue;
        bestCol = c;
      }
      
      board[r][c] = 0; // undo
    }
  }
  
  if (bestCol !== -1) {
    let r = getAvailableRow(bestCol);
    dropToken(r, bestCol, 2);
  }
}

function updateTurnDisplay() {
  if (currentPlayer === 1) {
    cardP1.classList.add('active-p1');
    cardP2.classList.remove('active-p2');
    turnIndicator.textContent = "P1 TURN";
    turnIndicator.style.color = "var(--p1c)";
    turnIndicator.style.textShadow = "0 0 15px var(--p1c-glow)";
  } else {
    cardP2.classList.add('active-p2');
    cardP1.classList.remove('active-p1');
    const name = mode === 'solo' ? "AI TURN" : "P2 TURN";
    turnIndicator.textContent = name;
    turnIndicator.style.color = "var(--p2c)";
    turnIndicator.style.textShadow = "0 0 15px var(--p2c-glow)";
  }
  
  document.getElementById('name-p2').textContent = mode === 'solo' ? "AI" : "PLAYER 2";
}

function updateScoreDisplay() {
  scoreP1El.textContent = scores.p1;
  scoreP2El.textContent = scores.p2;
}

function saveScores() {
  // Removed localStorage saves since score represents in-game count
}

function showResultOverlay(winner, isDraw) {
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('res-title');
  const sub = document.getElementById('res-sub');
  const emoji = document.getElementById('res-emoji');
  
  if (isDraw) {
    title.textContent = "DRAW!";
    sub.textContent = "No more moves left.";
    emoji.textContent = "🤝";
  } else {
    const pName = winner === 1 ? "PLAYER 1" : (mode === 'solo' ? "AI" : "PLAYER 2");
    title.textContent = `${pName} WINS!`;
    sub.textContent = winner === 1 ? "Great strategy!" : "Better luck next time!";
    emoji.textContent = winner === 1 ? "🎉" : "🤖";
  }
  
  overlay.classList.add('show');
}

// Start initial game
initGame();
