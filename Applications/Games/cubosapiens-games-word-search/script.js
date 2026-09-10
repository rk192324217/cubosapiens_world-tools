const WORD_DATABASE = {
    programming: ['JAVASCRIPT', 'PYTHON', 'TYPESCRIPT', 'REACT', 'DATABASE', 'ALGORITHM', 'FUNCTION', 'VARIABLE', 'COMPILER', 'MUTATION', 'CLOSURE', 'PROMISE'],
    webdev: ['HTML', 'CSS', 'FLEXBOX', 'GRID', 'DOM', 'ENDPOINT', 'WEBSITE', 'BROWSER', 'PAYLOAD', 'REQUEST', 'RESPONSE', 'HEADER'],
    cyberpunk: ['CYBER', 'MATRIX', 'NEON', 'HACKER', 'GLITCH', 'NETWORK', 'CHIP', 'CODE', 'ROBOT', 'VORTEX', 'SYNTH', 'SIGNAL'],
    space: ['GALAXY', 'PLANET', 'NEBULA', 'ASTEROID', 'COMET', 'GRAVITY', 'ORBIT', 'PULSAR', 'QUASAR', 'STAR', 'COSMOS', 'ROCKET'],
    animals: ['DOLPHIN', 'PANTHER', 'FALCON', 'CHEETAH', 'LEOPARD', 'JAGUAR', 'PHOENIX', 'DRAGON', 'PENGUIN', 'COBRA', 'TIGER', 'EAGLE']
};

const DIFFICULTY_CONFIG = {
    easy: { size: 8, wordCount: 6, maxLen: 8 },
    medium: { size: 11, wordCount: 9, maxLen: 10 },
    hard: { size: 14, wordCount: 12, maxLen: 12 }
};

const DIRECTIONS = [
    [0, 1],   // Right
    [1, 0],   // Down
    [1, 1],   // Down-Right
    [-1, 1],  // Up-Right
    [0, -1],  // Left
    [-1, 0],  // Up
    [-1, -1], // Up-Left
    [1, -1]   // Down-Left
];

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(freq, type, duration) {
        if (!this.enabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (_) {}
    }

    select() { this.playTone(440, 'sine', 0.08); }
    match() {
        this.playTone(523.25, 'triangle', 0.15);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.2), 100);
    }
    hint() { this.playTone(880, 'sine', 0.25); }
    win() {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 'square', 0.3), idx * 120);
        });
    }
}

class WordSearchGame {
    constructor() {
        this.category = 'programming';
        this.difficulty = 'easy';
        this.customWords = [];
        this.gridSize = 8;
        this.placedWords = [];
        this.foundWords = new Set();
        this.gridData = [];
        
        this.isSelecting = false;
        this.startCell = null;
        this.selectedCells = [];
        
        this.score = 0;
        this.highScore = Number(localStorage.getItem('ws_high_score')) || 0;
        this.hintsRemaining = 3;
        
        this.timer = 0;
        this.timerInterval = null;
        
        this.sound = new SoundEngine();
        
        this.bindDOM();
        this.bindEvents();
        this.initGame();
    }

    bindDOM() {
        this.dom = {
            categorySelect: document.getElementById('categorySelect'),
            diffBtns: document.querySelectorAll('.pill-btn'),
            wordGrid: document.getElementById('wordGrid'),
            wordList: document.getElementById('wordList'),
            scoreVal: document.getElementById('scoreVal'),
            highScoreVal: document.getElementById('highScoreVal'),
            progressVal: document.getElementById('progressVal'),
            timerVal: document.getElementById('timerVal'),
            hintCount: document.getElementById('hintCount'),
            newGameBtn: document.getElementById('newGameBtn'),
            hintBtn: document.getElementById('hintBtn'),
            soundToggleBtn: document.getElementById('soundToggleBtn'),
            victoryModal: document.getElementById('victoryModal'),
            finalTime: document.getElementById('finalTime'),
            finalScore: document.getElementById('finalScore'),
            finalWords: document.getElementById('finalWords'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            customModal: document.getElementById('customModal'),
            closeCustomModal: document.getElementById('closeCustomModal'),
            customWordsInput: document.getElementById('customWordsInput'),
            startCustomBtn: document.getElementById('startCustomBtn'),
            confettiCanvas: document.getElementById('confettiCanvas')
        };

        this.dom.highScoreVal.textContent = this.highScore;
    }

    bindEvents() {
        this.dom.categorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.dom.customModal.classList.add('active');
            } else {
                this.category = e.target.value;
                this.initGame();
            }
        });

        this.dom.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.diff;
                this.initGame();
            });
        });

        this.dom.newGameBtn.addEventListener('click', () => this.initGame());
        this.dom.hintBtn.addEventListener('click', () => this.useHint());
        this.dom.playAgainBtn.addEventListener('click', () => {
            this.dom.victoryModal.classList.remove('active');
            this.initGame();
        });

        this.dom.soundToggleBtn.addEventListener('click', () => {
            this.sound.enabled = !this.sound.enabled;
            const icon = this.dom.soundToggleBtn.querySelector('i');
            icon.className = this.sound.enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        });

        this.dom.closeCustomModal.addEventListener('click', () => {
            this.dom.customModal.classList.remove('active');
            this.dom.categorySelect.value = this.category;
        });

        this.dom.startCustomBtn.addEventListener('click', () => {
            const text = this.dom.customWordsInput.value.trim();
            const parsed = text.split(/[\n,]+/).map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 3);
            if (parsed.length < 3) {
                alert('Please enter at least 3 valid words (minimum 3 letters each).');
                return;
            }
            this.customWords = parsed.slice(0, 15);
            this.category = 'custom';
            this.dom.customModal.classList.remove('active');
            this.initGame();
        });

        window.addEventListener('mouseup', () => this.endSelection());
        window.addEventListener('touchend', () => this.endSelection());
    }

    initGame() {
        clearInterval(this.timerInterval);
        this.timer = 0;
        this.score = 0;
        this.foundWords.clear();
        this.hintsRemaining = 3;
        
        this.dom.timerVal.textContent = '00:00';
        this.dom.scoreVal.textContent = '0';
        this.dom.hintCount.textContent = this.hintsRemaining;
        this.dom.hintBtn.disabled = false;
        
        const config = DIFFICULTY_CONFIG[this.difficulty];
        this.gridSize = config.size;

        this.generateBoard(config);
        this.renderGrid();
        this.renderWordList();
        this.updateProgress();
        this.startTimer();
    }

    generateBoard(config) {
        let pool = [];
        if (this.category === 'custom' && this.customWords.length > 0) {
            pool = [...this.customWords];
        } else {
            pool = [...(WORD_DATABASE[this.category] || WORD_DATABASE.programming)];
        }

        pool.sort(() => Math.random() - 0.5);
        const targetWords = pool.filter(w => w.length <= config.maxLen).slice(0, config.wordCount);

        this.gridData = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(''));
        this.placedWords = [];

        for (const word of targetWords) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                attempts++;
                const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
                const row = Math.floor(Math.random() * this.gridSize);
                const col = Math.floor(Math.random() * this.gridSize);

                if (this.canPlaceWord(word, row, col, dir)) {
                    const cells = [];
                    for (let i = 0; i < word.length; i++) {
                        const r = row + dir[0] * i;
                        const c = col + dir[1] * i;
                        this.gridData[r][c] = word[i];
                        cells.push({ row: r, col: c });
                    }
                    this.placedWords.push({ word, cells });
                    placed = true;
                }
            }
        }

        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (!this.gridData[r][c]) {
                    this.gridData[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }

    canPlaceWord(word, row, col, dir) {
        for (let i = 0; i < word.length; i++) {
            const r = row + dir[0] * i;
            const c = col + dir[1] * i;
            if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) return false;
            if (this.gridData[r][c] !== '' && this.gridData[r][c] !== word[i]) return false;
        }
        return true;
    }

    renderGrid() {
        this.dom.wordGrid.innerHTML = '';
        this.dom.wordGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = this.gridData[r][c];
                cell.dataset.row = r;
                cell.dataset.col = c;

                cell.addEventListener('mousedown', (e) => this.startSelection(r, c, e));
                cell.addEventListener('mouseenter', () => this.updateSelection(r, c));
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.startSelection(r, c, e);
                }, { passive: false });

                cell.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target.classList.contains('grid-cell')) {
                        const tr = Number(target.dataset.row);
                        const tc = Number(target.dataset.col);
                        this.updateSelection(tr, tc);
                    }
                }, { passive: false });

                this.dom.wordGrid.appendChild(cell);
            }
        }
    }

    renderWordList() {
        this.dom.wordList.innerHTML = '';
        this.placedWords.forEach(({ word }) => {
            const li = document.createElement('li');
            li.className = 'word-item';
            li.dataset.word = word;
            li.textContent = word;
            if (this.foundWords.has(word)) {
                li.classList.add('found');
            }
            this.dom.wordList.appendChild(li);
        });
    }

    startSelection(row, col) {
        this.isSelecting = true;
        this.startCell = { row, col };
        this.selectedCells = [{ row, col }];
        this.sound.select();
        this.highlightCells();
    }

    updateSelection(row, col) {
        if (!this.isSelecting || !this.startCell) return;
        const dRow = row - this.startCell.row;
        const dCol = col - this.startCell.col;

        const isLine = dRow === 0 || dCol === 0 || Math.abs(dRow) === Math.abs(dCol);
        if (!isLine) return;

        const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
        const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);

        const count = Math.max(Math.abs(dRow), Math.abs(dCol)) + 1;
        this.selectedCells = [];
        for (let i = 0; i < count; i++) {
            this.selectedCells.push({
                row: this.startCell.row + stepRow * i,
                col: this.startCell.col + stepCol * i
            });
        }
        this.highlightCells();
    }

    endSelection() {
        if (!this.isSelecting) return;
        this.isSelecting = false;

        const selectedStr = this.selectedCells
            .map(c => this.gridData[c.row][c.col])
            .join('');
        const revStr = selectedStr.split('').reverse().join('');

        let matchedWord = null;
        for (const item of this.placedWords) {
            if (!this.foundWords.has(item.word) && (item.word === selectedStr || item.word === revStr)) {
                matchedWord = item;
                break;
            }
        }

        if (matchedWord) {
            this.foundWords.add(matchedWord.word);
            this.sound.match();
            
            matchedWord.cells.forEach(c => {
                const el = this.getCellEl(c.row, c.col);
                if (el) el.classList.add('found');
            });

            this.score += matchedWord.word.length * 10;
            this.dom.scoreVal.textContent = this.score;

            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.dom.highScoreVal.textContent = this.highScore;
                localStorage.setItem('ws_high_score', this.highScore);
            }

            this.renderWordList();
            this.updateProgress();

            if (this.foundWords.size === this.placedWords.length) {
                this.winGame();
            }
        }

        this.selectedCells = [];
        this.highlightCells();
    }

    highlightCells() {
        const allCells = this.dom.wordGrid.querySelectorAll('.grid-cell');
        allCells.forEach(cell => cell.classList.remove('selected'));

        this.selectedCells.forEach(c => {
            const el = this.getCellEl(c.row, c.col);
            if (el) el.classList.add('selected');
        });
    }

    getCellEl(row, col) {
        return this.dom.wordGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    useHint() {
        if (this.hintsRemaining <= 0) return;

        const unfound = this.placedWords.filter(item => !this.foundWords.has(item.word));
        if (unfound.length === 0) return;

        const target = unfound[Math.floor(Math.random() * unfound.length)];
        const startPos = target.cells[0];
        const el = this.getCellEl(startPos.row, startPos.col);

        if (el) {
            el.classList.add('hint');
            setTimeout(() => el.classList.remove('hint'), 3000);
        }

        this.hintsRemaining--;
        this.dom.hintCount.textContent = this.hintsRemaining;
        if (this.hintsRemaining === 0) this.dom.hintBtn.disabled = true;
        this.sound.hint();
    }

    updateProgress() {
        this.dom.progressVal.textContent = `${this.foundWords.size} / ${this.placedWords.length}`;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            const mins = String(Math.floor(this.timer / 60)).padStart(2, '0');
            const secs = String(this.timer % 60).padStart(2, '0');
            this.dom.timerVal.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    winGame() {
        clearInterval(this.timerInterval);
        this.sound.win();
        this.dom.finalTime.textContent = this.dom.timerVal.textContent;
        this.dom.finalScore.textContent = this.score;
        this.dom.finalWords.textContent = `${this.foundWords.size} / ${this.placedWords.length}`;
        this.dom.victoryModal.classList.add('active');
        this.launchConfetti();
    }

    launchConfetti() {
        const canvas = this.dom.confettiCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 4,
            color: ['#00ff88', '#00ccff', '#ffd700', '#a855f7'][Math.floor(Math.random() * 4)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1
        }));

        let animationFrame;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            if (particles.some(p => p.y < canvas.height)) {
                animationFrame = requestAnimationFrame(draw);
            }
        };
        draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WordSearchGame();
});
