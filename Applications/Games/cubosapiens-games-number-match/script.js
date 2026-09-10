document.addEventListener("DOMContentLoaded", () => {
    const gridEl = document.getElementById("grid");
    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");
    const pairsEl = document.getElementById("pairsMatched");
    const addBtn = document.getElementById("addBtn");
    const hintBtn = document.getElementById("hintBtn");
    const undoBtn = document.getElementById("undoBtn");
    const resetBtn = document.getElementById("resetBtn");
    const soundToggle = document.getElementById("soundToggle");
    const victoryModal = document.getElementById("victoryModal");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const finalScoreEl = document.getElementById("finalScore");

    let mode = "easy";
    let cols = 6;
    let board = [];
    let selectedIdx = null;
    let score = 0;
    let pairsMatched = 0;
    let highScore = parseInt(localStorage.getItem("cubo_number_match_high") || "0", 10);
    let history = [];
    let soundEnabled = true;
    let nextId = 0;

    let audioCtx = null;
    function playSound(type) {
        if (!soundEnabled) return;
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === "select") {
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === "match") {
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === "invalid") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === "add") {
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === "win") {
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.15);
            osc.frequency.setValueAtTime(783.99, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    }

    highScoreEl.textContent = highScore;

    function getInitialNumbers(currentMode) {
        if (currentMode === "easy") {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        const classic = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
        if (currentMode === "hard") {
            const extra = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1);
            return [...classic, ...extra];
        }
        return classic;
    }

    function initGame() {
        cols = mode === "easy" ? 6 : 9;
        gridEl.className = cols === 6 ? "grid-cols-6" : "grid-cols-9";
        
        const nums = getInitialNumbers(mode);
        nextId = 0;
        board = nums.map(val => ({ id: nextId++, val, matched: false }));
        selectedIdx = null;
        score = 0;
        pairsMatched = 0;
        history = [];

        updateStats();
        renderBoard();
        victoryModal.classList.remove("active");
    }

    function saveHistory() {
        history.push({
            board: JSON.parse(JSON.stringify(board)),
            score,
            pairsMatched
        });
        if (history.length > 20) history.shift();
        undoBtn.disabled = history.length === 0;
    }

    function triggerBump(el) {
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
    }

    function animateNumber(el, start, end) {
        if (start === end) return;
        triggerBump(el);
        let current = start;
        const step = Math.max(1, Math.floor((end - start) / 6));
        const timer = setInterval(() => {
            current += step;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 30);
    }

    function updateStats() {
        const curScore = parseInt(scoreEl.textContent, 10) || 0;
        if (curScore !== score) {
            animateNumber(scoreEl, curScore, score);
        } else {
            scoreEl.textContent = score;
        }

        const curPairs = parseInt(pairsEl.textContent, 10) || 0;
        if (curPairs !== pairsMatched) {
            animateNumber(pairsEl, curPairs, pairsMatched);
        } else {
            pairsEl.textContent = pairsMatched;
        }

        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem("cubo_number_match_high", highScore.toString());
        }
        undoBtn.disabled = history.length === 0;
    }

    function areAdjacent(idx1, idx2) {
        if (idx1 === idx2) return false;
        const i1 = Math.min(idx1, idx2);
        const i2 = Math.max(idx1, idx2);

        const activeIndices = [];
        for (let i = 0; i < board.length; i++) {
            if (!board[i].matched) activeIndices.push(i);
        }

        const pos1 = activeIndices.indexOf(i1);
        const pos2 = activeIndices.indexOf(i2);
        if (pos1 !== -1 && pos2 !== -1 && pos2 - pos1 === 1) {
            return true;
        }

        const r1 = Math.floor(i1 / cols);
        const c1 = i1 % cols;
        const r2 = Math.floor(i2 / cols);
        const c2 = i2 % cols;

        if (c1 === c2) {
            let clear = true;
            for (let idx = i1 + cols; idx < i2; idx += cols) {
                if (!board[idx].matched) { clear = false; break; }
            }
            if (clear) return true;
        }

        if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
            const stepCol = c2 > c1 ? 1 : -1;
            const stepRow = r2 > r1 ? 1 : -1;
            const step = stepRow * cols + stepCol;
            let clear = true;
            for (let idx = i1 + step; idx !== i2; idx += step) {
                if (!board[idx].matched) { clear = false; break; }
            }
            if (clear) return true;
        }

        return false;
    }

    function isValidMatch(idx1, idx2) {
        if (idx1 === null || idx2 === null || idx1 === idx2) return false;
        if (board[idx1].matched || board[idx2].matched) return false;
        const v1 = board[idx1].val;
        const v2 = board[idx2].val;
        if (v1 !== v2 && v1 + v2 !== 10) return false;
        return areAdjacent(idx1, idx2);
    }

    function findValidMatch() {
        for (let i = 0; i < board.length; i++) {
            if (board[i].matched) continue;
            for (let j = i + 1; j < board.length; j++) {
                if (board[j].matched) continue;
                if (isValidMatch(i, j)) return [i, j];
            }
        }
        return null;
    }

    function checkVictory() {
        const remaining = board.filter(c => !c.matched);
        if (remaining.length === 0) {
            playSound("win");
            finalScoreEl.textContent = score;
            victoryModal.classList.add("active");
        }
    }

    function renderBoard() {
        gridEl.innerHTML = "";
        board.forEach((cell, idx) => {
            const cellEl = document.createElement("div");
            cellEl.className = "cell";
            if (cell.matched) {
                cellEl.classList.add("matched");
                cellEl.textContent = "×";
            } else {
                cellEl.textContent = cell.val;
            }
            if (selectedIdx === idx) {
                cellEl.classList.add("selected");
            }
            cellEl.addEventListener("click", () => handleCellClick(idx));
            gridEl.appendChild(cellEl);
        });
    }

    function handleCellClick(idx) {
        if (board[idx].matched) return;

        if (selectedIdx === null) {
            selectedIdx = idx;
            playSound("select");
            renderBoard();
            return;
        }

        if (selectedIdx === idx) {
            selectedIdx = null;
            renderBoard();
            return;
        }

        if (isValidMatch(selectedIdx, idx)) {
            saveHistory();
            const prevIdx = selectedIdx;
            selectedIdx = null;

            const children = gridEl.children;
            if (children[prevIdx]) children[prevIdx].classList.add("match-pop");
            if (children[idx]) children[idx].classList.add("match-pop");

            playSound("match");

            setTimeout(() => {
                board[prevIdx].matched = true;
                board[idx].matched = true;
                score += 10;
                pairsMatched += 1;
                updateStats();
                renderBoard();
                checkVictory();
            }, 220);
        } else {
            playSound("invalid");
            selectedIdx = idx;
            renderBoard();
        }
    }

    addBtn.addEventListener("click", () => {
        const activeVals = board.filter(c => !c.matched).map(c => c.val);
        if (activeVals.length === 0) return;
        saveHistory();
        activeVals.forEach(val => {
            board.push({ id: nextId++, val, matched: false });
        });
        playSound("add");
        renderBoard();
    });

    hintBtn.addEventListener("click", () => {
        const match = findValidMatch();
        if (!match) {
            playSound("invalid");
            return;
        }
        playSound("select");
        const children = gridEl.children;
        children[match[0]].classList.add("hint");
        children[match[1]].classList.add("hint");
        setTimeout(() => {
            if (children[match[0]]) children[match[0]].classList.remove("hint");
            if (children[match[1]]) children[match[1]].classList.remove("hint");
        }, 1200);
    });

    undoBtn.addEventListener("click", () => {
        if (history.length === 0) return;
        const last = history.pop();
        board = last.board;
        score = last.score;
        pairsMatched = last.pairsMatched;
        selectedIdx = null;
        playSound("select");
        updateStats();
        renderBoard();
    });

    resetBtn.addEventListener("click", () => {
        initGame();
        playSound("select");
    });

    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled 
            ? '<i class="fa-solid fa-volume-high"></i>' 
            : '<i class="fa-solid fa-volume-xmark"></i>';
    });

    document.querySelectorAll(".segmented-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const targetBtn = e.target.closest(".segmented-btn");
            if (!targetBtn) return;
            document.querySelectorAll(".segmented-btn").forEach(b => b.classList.remove("active"));
            targetBtn.classList.add("active");
            mode = targetBtn.dataset.mode;
            initGame();
        });
    });

    playAgainBtn.addEventListener("click", () => {
        initGame();
    });

    initGame();
});
