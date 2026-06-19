/* ============================================================
   CONNECT DOTS — CuboSapiens
   Game Logic (Dots and Boxes)
   ============================================================ */

(function () {
    'use strict';

    // ── State ──────────────────────────────────────────────────
    let gridSize = 5;
    let gameMode = 'ai';
    let aiDifficulty = 'medium';
    let currentPlayer = 1;
    let scores = { 1: 0, 2: 0 };
    let totalBoxes = 0;
    let filledBoxes = 0;
    let hLines = [];   // hLines[row][col] — horizontal line between dots
    let vLines = [];   // vLines[row][col] — vertical line between dots
    let boxes  = [];   // boxes[row][col]  — which player filled it
    let history = [];  // for undo
    let gameOver = false;
    let soundOn = true;
    let aiThinking = false;

    // ── DOM Refs ───────────────────────────────────────────────
    const board        = document.getElementById('game-board');
    const p1ScoreEl    = document.getElementById('p1-score');
    const p2ScoreEl    = document.getElementById('p2-score');
    const p1NameEl     = document.getElementById('p1-name');
    const p2NameEl     = document.getElementById('p2-name');
    const turnEl       = document.getElementById('turn-indicator');
    const boxesLeftEl  = document.getElementById('boxes-left');
    const scoreP1El    = document.getElementById('score-p1');
    const scoreP2El    = document.getElementById('score-p2');
    const newGameBtn   = document.getElementById('new-game-btn');
    const undoBtn      = document.getElementById('undo-btn');
    const gridSizeEl   = document.getElementById('grid-size');
    const gameModeEl   = document.getElementById('game-mode');
    const aiDiffEl     = document.getElementById('ai-difficulty');
    const themeToggle  = document.getElementById('theme-toggle');
    const themeIcon    = document.getElementById('theme-icon');
    const soundToggle  = document.getElementById('sound-toggle');
    const soundIcon    = document.getElementById('sound-icon');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle   = document.getElementById('modal-title');
    const modalSubtitle= document.getElementById('modal-subtitle');
    const modalEmoji   = document.getElementById('modal-emoji');
    const modalP1Name  = document.getElementById('modal-p1-name');
    const modalP2Name  = document.getElementById('modal-p2-name');
    const modalP1Score = document.getElementById('modal-p1-score');
    const modalP2Score = document.getElementById('modal-p2-score');
    const modalStats   = document.getElementById('modal-stats');
    const playAgainBtn = document.getElementById('play-again-btn');
    const closeModalBtn= document.getElementById('close-modal-btn');

    // ── Load Preferences ───────────────────────────────────────
    function loadPrefs() {
        try {
            const prefs = JSON.parse(localStorage.getItem('cubosapiens-dots') || '{}');
            if (prefs.theme) document.documentElement.setAttribute('data-theme', prefs.theme);
            if (prefs.sound !== undefined) soundOn = prefs.sound;
            if (prefs.gridSize) { gridSize = prefs.gridSize; gridSizeEl.value = prefs.gridSize; }
            if (prefs.gameMode) { gameMode = prefs.gameMode; gameModeEl.value = prefs.gameMode; }
            if (prefs.aiDiff)   { aiDifficulty = prefs.aiDiff; aiDiffEl.value = prefs.aiDiff; }
        } catch(e) {}
        updateThemeIcon();
        updateSoundIcon();
    }

    function savePrefs() {
        try {
            localStorage.setItem('cubosapiens-dots', JSON.stringify({
                theme: document.documentElement.getAttribute('data-theme'),
                sound: soundOn,
                gridSize: parseInt(gridSizeEl.value),
                gameMode: gameModeEl.value,
                aiDiff: aiDiffEl.value,
            }));
        } catch(e) {}
    }

    // ── Sound Effects (Web Audio API, no external files) ───────
    let audioCtx;
    function getAudioCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }
    function playTone(freq, duration, type = 'sine') {
        if (!soundOn) return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch(e) {}
    }
    const sfx = {
        click:  () => playTone(440, 0.08, 'square'),
        score:  () => { playTone(523, 0.1); setTimeout(() => playTone(659, 0.1), 100); setTimeout(() => playTone(784, 0.2), 200); },
        win:    () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.15), i*120)); },
        draw:   () => playTone(330, 0.4, 'triangle'),
    };

    // ── Game Initialisation ────────────────────────────────────
    function initGame() {
        gridSize     = parseInt(gridSizeEl.value);
        gameMode     = gameModeEl.value;
        aiDifficulty = aiDiffEl.value;
        currentPlayer = 1;
        scores        = { 1: 0, 2: 0 };
        totalBoxes    = (gridSize - 1) * (gridSize - 1);
        filledBoxes   = 0;
        gameOver      = false;
        aiThinking    = false;
        history       = [];

        // Init line & box arrays
        hLines = Array.from({ length: gridSize },     () => Array(gridSize - 1).fill(0));
        vLines = Array.from({ length: gridSize - 1 }, () => Array(gridSize).fill(0));
        boxes  = Array.from({ length: gridSize - 1 }, () => Array(gridSize - 1).fill(0));

        p2NameEl.textContent = gameMode === 'ai' ? 'AI' : 'Player 2';
        p2ScoreEl.textContent  = '0';
        p1ScoreEl.textContent  = '0';
        undoBtn.disabled = true;

        buildBoard();
        updateUI();
        savePrefs();
        modalOverlay.hidden = true;
    }

    // ── Board Rendering ────────────────────────────────────────
    function buildBoard() {
        board.innerHTML = '';
        const CELL = Math.min(Math.floor((Math.min(window.innerWidth, 580) - 60) / (gridSize - 1)), 72);
        const DOT  = 14;
        const LINE_THICK = 8;
        const boardW = (gridSize - 1) * CELL;
        const boardH = (gridSize - 1) * CELL;

        board.style.width  = boardW + DOT + 'px';
        board.style.height = boardH + DOT + 'px';
        board.style.position = 'relative';

        // Draw boxes
        for (let r = 0; r < gridSize - 1; r++) {
            for (let c = 0; c < gridSize - 1; c++) {
                const box = document.createElement('div');
                box.className = 'box';
                box.id = `box-${r}-${c}`;
                box.style.cssText = `
                    left: ${c * CELL + DOT / 2}px;
                    top:  ${r * CELL + DOT / 2}px;
                    width:  ${CELL}px;
                    height: ${CELL}px;
                `;
                board.appendChild(box);
            }
        }

        // Draw horizontal lines
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize - 1; c++) {
                const line = document.createElement('div');
                line.className = 'line horizontal';
                line.id = `h-${r}-${c}`;
                line.setAttribute('role', 'button');
                line.setAttribute('tabindex', '0');
                line.setAttribute('aria-label', `Horizontal line row ${r} col ${c}`);
                line.style.cssText = `
                    left:   ${c * CELL + DOT}px;
                    top:    ${r * CELL + DOT / 2 - LINE_THICK / 2}px;
                    width:  ${CELL - DOT}px;
                    height: ${LINE_THICK}px;
                `;
                line.addEventListener('click',   () => handleLineClick('h', r, c));
                line.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleLineClick('h', r, c); });
                board.appendChild(line);
            }
        }

        // Draw vertical lines
        for (let r = 0; r < gridSize - 1; r++) {
            for (let c = 0; c < gridSize; c++) {
                const line = document.createElement('div');
                line.className = 'line vertical';
                line.id = `v-${r}-${c}`;
                line.setAttribute('role', 'button');
                line.setAttribute('tabindex', '0');
                line.setAttribute('aria-label', `Vertical line row ${r} col ${c}`);
                line.style.cssText = `
                    left:   ${c * CELL + DOT / 2 - LINE_THICK / 2}px;
                    top:    ${r * CELL + DOT}px;
                    width:  ${LINE_THICK}px;
                    height: ${CELL - DOT}px;
                `;
                line.addEventListener('click',   () => handleLineClick('v', r, c));
                line.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleLineClick('v', r, c); });
                board.appendChild(line);
            }
        }

        // Draw dots (on top)
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.style.cssText = `left: ${c * CELL + DOT / 2}px; top: ${r * CELL + DOT / 2}px;`;
                board.appendChild(dot);
            }
        }
    }

    // ── Line Click Handler ─────────────────────────────────────
    function handleLineClick(type, r, c) {
        if (gameOver || aiThinking) return;
        if (gameMode === 'ai' && currentPlayer === 2) return;
        const taken = type === 'h' ? hLines[r][c] : vLines[r][c];
        if (taken) return;

        sfx.click();
        makeMove(type, r, c);

        // AI turn
        if (!gameOver && gameMode === 'ai' && currentPlayer === 2) {
            aiThinking = true;
            turnEl.classList.add('ai-thinking');
            const delay = 400 + Math.random() * 300;
            setTimeout(() => {
                aiThinking = false;
                turnEl.classList.remove('ai-thinking');
                const move = getAIMove();
                if (move) { sfx.click(); makeMove(move.type, move.r, move.c); }
            }, delay);
        }
    }

    // ── Core Move ──────────────────────────────────────────────
    function makeMove(type, r, c) {
        // Save history
        history.push({ type, r, c, player: currentPlayer, scores: { ...scores }, filledBoxes });
        undoBtn.disabled = false;

        // Place line
        if (type === 'h') hLines[r][c] = currentPlayer;
        else              vLines[r][c] = currentPlayer;

        const lineEl = document.getElementById(`${type}-${r}-${c}`);
        if (lineEl) {
            lineEl.classList.add('taken', `p${currentPlayer}`, 'highlight');
            lineEl.style.removeProperty('cursor');
        }

        // Check boxes
        const boxesMade = checkBoxes(r, c, type);
        if (boxesMade > 0) {
            scores[currentPlayer] += boxesMade;
            filledBoxes += boxesMade;
            sfx.score();
            updateScores();
        }

        // End or next turn
        if (filledBoxes >= totalBoxes) {
            endGame();
        } else if (boxesMade === 0) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateUI();
        } else {
            updateUI(); // Same player keeps turn
        }
    }

    // ── Box Completion Check ───────────────────────────────────
    function checkBoxes(r, c, type) {
        let count = 0;
        const pairs = type === 'h'
            ? [ [r - 1, c], [r, c] ]
            : [ [r, c - 1], [r, c] ];

        for (const [br, bc] of pairs) {
            if (br < 0 || bc < 0 || br >= gridSize - 1 || bc >= gridSize - 1) continue;
            if (boxes[br][bc]) continue;
            // Check all 4 sides
            const top    = hLines[br][bc];
            const bottom = hLines[br + 1][bc];
            const left   = vLines[br][bc];
            const right  = vLines[br][bc + 1];
            if (top && bottom && left && right) {
                boxes[br][bc] = currentPlayer;
                count++;
                const boxEl = document.getElementById(`box-${br}-${bc}`);
                if (boxEl) {
                    boxEl.classList.add(`filled-p${currentPlayer}`);
                    boxEl.textContent = currentPlayer === 1 ? '●' : '●';
                    boxEl.style.color = currentPlayer === 1 ? 'var(--p1)' : 'var(--p2)';
                }
            }
        }
        return count;
    }

    // ── UI Updates ─────────────────────────────────────────────
    function updateUI() {
        const name = currentPlayer === 1 ? 'Player 1' : (gameMode === 'ai' ? 'AI' : 'Player 2');
        turnEl.textContent = currentPlayer === 1 ? `Your Turn` : (gameMode === 'ai' ? `AI Thinking` : `Player 2's Turn`);
        turnEl.className = `turn-indicator ${currentPlayer === 2 ? 'p2-turn' : ''}`;
        scoreP1El.classList.toggle('active-player', currentPlayer === 1);
        scoreP2El.classList.toggle('active-player', currentPlayer === 2);
        boxesLeftEl.textContent = `${totalBoxes - filledBoxes} box${totalBoxes - filledBoxes !== 1 ? 'es' : ''} left`;
    }

    function updateScores() {
        p1ScoreEl.textContent = scores[1];
        p2ScoreEl.textContent = scores[2];
    }

    // ── Game End ───────────────────────────────────────────────
    function endGame() {
        gameOver = true;
        undoBtn.disabled = true;
        const p2Name = gameMode === 'ai' ? 'AI' : 'Player 2';
        let emoji, title, subtitle;

        if (scores[1] > scores[2]) {
            emoji = '🏆'; title = 'You Win!'; subtitle = 'Congratulations, Player 1!';
            sfx.win();
        } else if (scores[2] > scores[1]) {
            emoji = scores[1] < scores[2] && gameMode === 'ai' ? '🤖' : '🎉';
            title = gameMode === 'ai' ? 'AI Wins!' : `${p2Name} Wins!`;
            subtitle = gameMode === 'ai' ? 'Better luck next time!' : `Well played, ${p2Name}!`;
            sfx.win();
        } else {
            emoji = '🤝'; title = "It's a Draw!"; subtitle = 'What a close match!';
            sfx.draw();
        }

        modalEmoji.textContent   = emoji;
        modalTitle.textContent   = title;
        modalSubtitle.textContent = subtitle;
        modalP1Name.textContent  = 'Player 1';
        modalP2Name.textContent  = p2Name;
        modalP1Score.textContent = scores[1];
        modalP2Score.textContent = scores[2];
        modalP1Score.style.color = 'var(--p1)';
        modalP2Score.style.color = 'var(--p2)';
        modalStats.textContent   = `Total boxes: ${totalBoxes} • Grid: ${gridSize}×${gridSize}`;

        setTimeout(() => { modalOverlay.hidden = false; }, 600);
    }

    // ── Undo ───────────────────────────────────────────────────
    function undo() {
        if (history.length === 0) return;
        const last = history.pop();

        // Restore line
        if (last.type === 'h') hLines[last.r][last.c] = 0;
        else                   vLines[last.r][last.c] = 0;

        const lineEl = document.getElementById(`${last.type}-${last.r}-${last.c}`);
        if (lineEl) lineEl.className = `line ${last.type === 'h' ? 'horizontal' : 'vertical'}`;

        // Restore boxes
        for (let r = 0; r < gridSize - 1; r++) {
            for (let c = 0; c < gridSize - 1; c++) {
                const top    = hLines[r][c];
                const bottom = hLines[r + 1][c];
                const left   = vLines[r][c];
                const right  = vLines[r][c + 1];
                const wasFilled = boxes[r][c];
                if (wasFilled && !(top && bottom && left && right)) {
                    boxes[r][c] = 0;
                    const boxEl = document.getElementById(`box-${r}-${c}`);
                    if (boxEl) { boxEl.className = 'box'; boxEl.textContent = ''; }
                }
            }
        }

        scores      = { ...last.scores };
        filledBoxes = last.filledBoxes;
        currentPlayer = last.player;
        gameOver    = false;

        updateScores();
        updateUI();
        if (history.length === 0) undoBtn.disabled = true;
    }

    // ── AI Logic ───────────────────────────────────────────────
    function getAIMove() {
        const empty = getAllEmptyLines();
        if (empty.length === 0) return null;

        if (aiDifficulty === 'easy') {
            return empty[Math.floor(Math.random() * empty.length)];
        }

        // Medium & Hard: find lines that complete a box
        const winning = empty.filter(m => wouldCompleteBox(m));
        if (winning.length > 0) return winning[0];

        if (aiDifficulty === 'hard') {
            // Avoid giving opponent a box (chain strategy)
            const safe = empty.filter(m => !givesOpponentBox(m));
            if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];
        }

        return empty[Math.floor(Math.random() * empty.length)];
    }

    function getAllEmptyLines() {
        const lines = [];
        for (let r = 0; r < gridSize; r++)
            for (let c = 0; c < gridSize - 1; c++)
                if (!hLines[r][c]) lines.push({ type: 'h', r, c });
        for (let r = 0; r < gridSize - 1; r++)
            for (let c = 0; c < gridSize; c++)
                if (!vLines[r][c]) lines.push({ type: 'v', r, c });
        return lines;
    }

    function wouldCompleteBox({ type, r, c }) {
        const pairs = type === 'h' ? [[r-1,c],[r,c]] : [[r,c-1],[r,c]];
        for (const [br, bc] of pairs) {
            if (br < 0 || bc < 0 || br >= gridSize-1 || bc >= gridSize-1) continue;
            if (boxes[br][bc]) continue;
            const sides = countSides(br, bc);
            if (sides === 3) return true;
        }
        return false;
    }

    function givesOpponentBox({ type, r, c }) {
        // Simulate placing this line and check if opponent benefits
        if (type === 'h') hLines[r][c] = 2;
        else              vLines[r][c] = 2;
        const pairs = type === 'h' ? [[r-1,c],[r,c]] : [[r,c-1],[r,c]];
        let gives = false;
        for (const [br, bc] of pairs) {
            if (br < 0 || bc < 0 || br >= gridSize-1 || bc >= gridSize-1) continue;
            if (boxes[br][bc]) continue;
            if (countSides(br, bc) === 3) gives = true;
        }
        if (type === 'h') hLines[r][c] = 0;
        else              vLines[r][c] = 0;
        return gives;
    }

    function countSides(br, bc) {
        return [hLines[br][bc], hLines[br+1][bc], vLines[br][bc], vLines[br][bc+1]]
            .filter(Boolean).length;
    }

    // ── Theme & Sound ──────────────────────────────────────────
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
        updateThemeIcon(); savePrefs();
    }

    function updateThemeIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeIcon.textContent = isDark ? '☀️' : '🌙';
    }

    function toggleSound() {
        soundOn = !soundOn;
        updateSoundIcon(); savePrefs();
    }

    function updateSoundIcon() {
        soundIcon.textContent = soundOn ? '🔊' : '🔇';
    }

    // ── Event Listeners ────────────────────────────────────────
    newGameBtn.addEventListener('click', initGame);
    undoBtn.addEventListener('click', () => {
        if (gameMode === 'ai' && !aiThinking) {
            // Undo 2 moves (player + AI)
            undo(); if (history.length > 0 && history[history.length-1].player === 2) undo();
        } else {
            undo();
        }
    });
    themeToggle.addEventListener('click', toggleTheme);
    soundToggle.addEventListener('click', toggleSound);
    playAgainBtn.addEventListener('click', () => { modalOverlay.hidden = true; initGame(); });
    closeModalBtn.addEventListener('click', () => { modalOverlay.hidden = true; });
    gridSizeEl.addEventListener('change', initGame);
    gameModeEl.addEventListener('change', initGame);

    // Rebuild board on resize for responsiveness
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildBoard, 150);
    });

    // ── Boot ───────────────────────────────────────────────────
    loadPrefs();
    initGame();

})();
