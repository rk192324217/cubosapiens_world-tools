/**
 * Pattern Match Game - CuboSapiens
 * Clean Standalone Browser Arcade Implementation
 */

(function () {
    'use strict';

    const MAX_LIVES = 3;
    const MAX_HINTS = 3;
    const KEY_BEST = 'cubosapiens_pattern_match_highscore';
    const KEY_THEME = 'cubosapiens_pattern_match_theme';
    const KEY_SOUND = 'cubosapiens_pattern_match_sound';

    const STATES = {
        IDLE: 'IDLE',
        PREVIEW: 'PREVIEW',
        INPUT: 'INPUT',
        ROUND_WIN: 'ROUND_WIN',
        GAME_OVER: 'GAME_OVER',
    };

    let gameState = STATES.IDLE;
    let currentRound = 1;
    let score = 0;
    let bestScore = 0;
    let streak = 0;
    let maxStreak = 0;
    let lives = MAX_LIVES;
    let hintsRemaining = MAX_HINTS;
    
    let patternSequence = [];
    let playerInputIndex = 0;
    let gridDimension = 3;
    let focusedCellIndex = 0;
    let activeTimeouts = [];
    let soundEnabled = true;

    // Web Audio Synthesizer
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }
    }

    function playTone(freq, duration = 0.15, type = 'sine') {
        if (!soundEnabled) return;
        try {
            initAudio();
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context ignored if blocked by browser policy
        }
    }

    function playSoundEffect(name) {
        if (!soundEnabled) return;
        switch (name) {
            case 'flash':
                playTone(440 + (patternSequence.length * 20), 0.18, 'sine');
                break;
            case 'correct':
                playTone(587.33, 0.12, 'triangle');
                break;
            case 'roundWin':
                playTone(523.25, 0.1, 'sine');
                setTimeout(() => playTone(659.25, 0.1, 'sine'), 100);
                setTimeout(() => playTone(783.99, 0.18, 'sine'), 200);
                break;
            case 'wrong':
                playTone(180, 0.22, 'sawtooth');
                break;
            case 'gameOver':
                playTone(220, 0.2, 'sawtooth');
                setTimeout(() => playTone(164.81, 0.3, 'sawtooth'), 200);
                break;
        }
    }

    // DOM References
    const elements = {
        grid: document.getElementById('grid'),
        boardOverlay: document.getElementById('boardOverlay'),
        statusBanner: document.getElementById('statusBanner'),
        statusText: document.getElementById('statusText'),
        
        roundVal: document.getElementById('roundVal'),
        scoreVal: document.getElementById('scoreVal'),
        bestScoreVal: document.getElementById('bestScoreVal'),
        streakVal: document.getElementById('streakVal'),
        livesContainer: document.getElementById('livesContainer'),
        
        startBtn: document.getElementById('startBtn'),
        overlayStartBtn: document.getElementById('overlayStartBtn'),
        restartBtn: document.getElementById('restartBtn'),
        hintBtn: document.getElementById('hintBtn'),
        hintCount: document.getElementById('hintCount'),
        soundToggle: document.getElementById('soundToggle'),
        soundIcon: document.getElementById('soundIcon'),
        soundText: document.getElementById('soundText'),
        themeToggle: document.getElementById('themeToggle'),
        
        gameOverModal: document.getElementById('gameOverModal'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        finalScore: document.getElementById('finalScore'),
        finalRounds: document.getElementById('finalRounds'),
        finalStreak: document.getElementById('finalStreak'),
        modalBestScore: document.getElementById('modalBestScore'),
        modalTitle: document.getElementById('modalTitle'),
        modalSub: document.getElementById('modalSub'),
        srLive: document.getElementById('srLive'),
    };

    function init() {
        loadSettings();
        setupEventListeners();
        renderGrid();
        updateHUD();
    }

    function loadSettings() {
        const savedBest = localStorage.getItem(KEY_BEST);
        if (savedBest) {
            bestScore = parseInt(savedBest, 10) || 0;
        }
        
        const savedTheme = localStorage.getItem(KEY_THEME);
        if (savedTheme === 'light' || savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        const savedSound = localStorage.getItem(KEY_SOUND);
        if (savedSound === 'false') {
            soundEnabled = false;
            updateSoundUI();
        }
    }

    function updateThemeIcon(theme) {
        const icon = elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    function updateSoundUI() {
        if (elements.soundIcon) {
            elements.soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
        if (elements.soundText) {
            elements.soundText.textContent = soundEnabled ? 'SOUND ON' : 'MUTED';
        }
    }

    function announceSR(msg) {
        if (elements.srLive) {
            elements.srLive.textContent = msg;
        }
    }

    function getGridDimensionForRound(round) {
        if (round <= 3) return 3;
        if (round <= 7) return 4;
        if (round <= 12) return 5;
        return 6;
    }

    function getPatternLengthForRound(round) {
        return Math.min(12, 2 + Math.floor(round * 0.75));
    }

    function getPreviewIntervalForRound(round) {
        if (round <= 3) return 550;
        if (round <= 7) return 480;
        if (round <= 12) return 400;
        return 330;
    }

    function renderGrid() {
        elements.grid.innerHTML = '';
        elements.grid.className = `pattern-grid grid-${gridDimension}x${gridDimension}`;
        const totalCells = gridDimension * gridDimension;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            cell.setAttribute('aria-label', `Grid cell ${i + 1}`);
            cell.setAttribute('tabindex', gameState === STATES.INPUT ? '0' : '-1');

            cell.addEventListener('click', () => handleCellClick(i));
            elements.grid.appendChild(cell);
        }
        focusedCellIndex = 0;
    }

    function clearAllTimers() {
        activeTimeouts.forEach(t => clearTimeout(t));
        activeTimeouts = [];
    }

    function addTimeout(fn, delay) {
        const id = setTimeout(() => {
            fn();
            activeTimeouts = activeTimeouts.filter(tId => tId !== id);
        }, delay);
        activeTimeouts.push(id);
        return id;
    }

    function startGame() {
        clearAllTimers();
        gameState = STATES.IDLE;
        currentRound = 1;
        score = 0;
        streak = 0;
        maxStreak = 0;
        lives = MAX_LIVES;
        hintsRemaining = MAX_HINTS;
        gridDimension = getGridDimensionForRound(1);
        
        renderGrid();
        updateHUD();
        elements.boardOverlay.classList.add('hidden');
        elements.startBtn.classList.remove('hidden');
        elements.gameOverModal.classList.remove('active');
        elements.gameOverModal.setAttribute('aria-hidden', 'true');

        startRound();
    }

    function startRound() {
        clearAllTimers();
        const requiredDimension = getGridDimensionForRound(currentRound);
        
        if (requiredDimension !== gridDimension) {
            gridDimension = requiredDimension;
            renderGrid();
        }

        playerInputIndex = 0;
        generatePattern();
        updateHUD();
        setGridDisabled(true);

        setStatus(`Watch Pattern (${patternSequence.length} cells)`, 'watch');
        announceSR(`Round ${currentRound}. Watch pattern.`);

        addTimeout(() => {
            playPatternPreview();
        }, 400);
    }

    function generatePattern() {
        const totalCells = gridDimension * gridDimension;
        const length = getPatternLengthForRound(currentRound);
        patternSequence = [];

        for (let i = 0; i < length; i++) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * totalCells);
            } while (i > 0 && nextIndex === patternSequence[i - 1] && totalCells > 1);
            
            patternSequence.push(nextIndex);
        }
    }

    function playPatternPreview() {
        gameState = STATES.PREVIEW;
        setGridDisabled(true);
        const speed = getPreviewIntervalForRound(currentRound);
        const cellDuration = Math.floor(speed * 0.7);

        patternSequence.forEach((cellIdx, seqIdx) => {
            addTimeout(() => {
                highlightCell(cellIdx, 'flash', cellDuration);
                playSoundEffect('flash');
            }, seqIdx * speed);
        });

        const totalTime = patternSequence.length * speed + 150;
        addTimeout(() => {
            enterInputPhase();
        }, totalTime);
    }

    function highlightCell(cellIdx, className, duration) {
        const cell = elements.grid.children[cellIdx];
        if (!cell) return;

        cell.classList.add(className);
        addTimeout(() => {
            cell.classList.remove(className);
        }, duration);
    }

    function enterInputPhase() {
        gameState = STATES.INPUT;
        setGridDisabled(false);
        updateInputStatus();
        announceSR('Your turn. Select the cells in order.');
        elements.hintBtn.disabled = hintsRemaining <= 0;
        
        updateCellFocusability();
    }

    function updateInputStatus() {
        setStatus(`Your Turn (${playerInputIndex}/${patternSequence.length})`, 'play');
    }

    function setGridDisabled(disabled) {
        const cells = elements.grid.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            if (disabled) {
                cell.classList.add('disabled');
                cell.setAttribute('tabindex', '-1');
            } else {
                cell.classList.remove('disabled');
                cell.setAttribute('tabindex', '0');
            }
        });
    }

    function updateCellFocusability() {
        const cells = elements.grid.querySelectorAll('.grid-cell');
        cells.forEach((cell, idx) => {
            cell.setAttribute('tabindex', idx === focusedCellIndex ? '0' : '-1');
        });
    }

    function handleCellClick(clickedIdx) {
        if (gameState !== STATES.INPUT) return;

        const expectedIdx = patternSequence[playerInputIndex];

        if (clickedIdx === expectedIdx) {
            highlightCell(clickedIdx, 'correct', 220);
            playSoundEffect('correct');
            playerInputIndex++;

            if (playerInputIndex >= patternSequence.length) {
                handleRoundSuccess();
            } else {
                updateInputStatus();
            }
        } else {
            handleWrongTap(clickedIdx);
        }
    }

    function handleRoundSuccess() {
        gameState = STATES.ROUND_WIN;
        setGridDisabled(true);
        elements.hintBtn.disabled = true;

        streak++;
        if (streak > maxStreak) maxStreak = streak;

        const roundPoints = (100 * currentRound) + (25 * streak);
        score += roundPoints;

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(KEY_BEST, bestScore.toString());
        }

        playSoundEffect('roundWin');
        setStatus(`Round Cleared! +${roundPoints} pts`, 'success');
        announceSR(`Round cleared. Score ${score}.`);
        updateHUD();

        currentRound++;
        addTimeout(() => {
            startRound();
        }, 1000);
    }

    function handleWrongTap(clickedIdx) {
        highlightCell(clickedIdx, 'wrong', 350);
        playSoundEffect('wrong');
        streak = 0;
        lives--;
        updateHUD();

        if (lives <= 0) {
            handleGameOver();
        } else {
            gameState = STATES.PREVIEW;
            setGridDisabled(true);
            elements.hintBtn.disabled = true;
            setStatus(`Mistake! (${lives} heart${lives > 1 ? 's' : ''} left)`, 'error');
            announceSR(`Incorrect cell. ${lives} lives remaining.`);

            playerInputIndex = 0;
            addTimeout(() => {
                setStatus(`Watch Pattern (${patternSequence.length} cells)`, 'watch');
                playPatternPreview();
            }, 900);
        }
    }

    function handleGameOver() {
        gameState = STATES.GAME_OVER;
        clearAllTimers();
        setGridDisabled(true);
        elements.hintBtn.disabled = true;
        
        playSoundEffect('gameOver');
        setStatus('Game Over', 'error');

        elements.finalScore.textContent = score.toLocaleString();
        elements.finalRounds.textContent = (currentRound - 1).toString();
        elements.finalStreak.textContent = `${maxStreak}x`;
        elements.modalBestScore.textContent = bestScore.toLocaleString();

        const isNewBest = score > 0 && score >= bestScore;
        elements.modalTitle.textContent = isNewBest ? 'NEW BEST SCORE!' : 'GAME OVER';
        elements.modalSub.textContent = `Completed ${currentRound - 1} round${(currentRound - 1) === 1 ? '' : 's'}`;
        
        elements.gameOverModal.classList.add('active');
        elements.gameOverModal.setAttribute('aria-hidden', 'false');
    }

    function handleHintRequest() {
        if (gameState !== STATES.INPUT || hintsRemaining <= 0) return;

        hintsRemaining--;
        updateHUD();
        elements.hintBtn.disabled = true;

        gameState = STATES.PREVIEW;
        setGridDisabled(true);
        setStatus(`Replaying pattern...`, 'watch');
        playerInputIndex = 0;

        playPatternPreview();
    }

    function updateHUD() {
        elements.roundVal.textContent = currentRound;
        elements.scoreVal.textContent = score.toLocaleString();
        elements.bestScoreVal.textContent = bestScore.toLocaleString();
        elements.streakVal.textContent = `${streak}x`;
        elements.hintCount.textContent = hintsRemaining;

        elements.livesContainer.innerHTML = '';
        for (let i = 0; i < MAX_LIVES; i++) {
            const heart = document.createElement('i');
            heart.className = `fa-solid fa-heart ${i < lives ? 'active' : ''}`;
            elements.livesContainer.appendChild(heart);
        }
    }

    function setStatus(text, stateClass = 'idle') {
        elements.statusText.textContent = text;
        elements.statusBanner.className = `status-banner state-${stateClass}`;
    }

    function setupEventListeners() {
        elements.startBtn.addEventListener('click', () => {
            initAudio();
            startGame();
        });

        elements.overlayStartBtn.addEventListener('click', () => {
            initAudio();
            startGame();
        });

        elements.restartBtn.addEventListener('click', () => {
            if (gameState === STATES.IDLE || confirm('Restart game? Current progress will be lost.')) {
                startGame();
            }
        });

        elements.playAgainBtn.addEventListener('click', () => {
            startGame();
        });

        elements.hintBtn.addEventListener('click', handleHintRequest);

        elements.soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem(KEY_SOUND, soundEnabled.toString());
            updateSoundUI();
        });

        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(KEY_THEME, newTheme);
            updateThemeIcon(newTheme);
        });

        document.addEventListener('keydown', handleKeyboardNav);
    }

    function handleKeyboardNav(e) {
        if (gameState !== STATES.INPUT) return;

        const totalCells = gridDimension * gridDimension;
        const cells = Array.from(elements.grid.children);

        if (e.key >= '1' && e.key <= '9') {
            const numIdx = parseInt(e.key, 10) - 1;
            if (numIdx < totalCells) {
                e.preventDefault();
                handleCellClick(numIdx);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                focusedCellIndex = (focusedCellIndex + 1) % totalCells;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                focusedCellIndex = (focusedCellIndex - 1 + totalCells) % totalCells;
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (focusedCellIndex + gridDimension < totalCells) {
                    focusedCellIndex += gridDimension;
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (focusedCellIndex - gridDimension >= 0) {
                    focusedCellIndex -= gridDimension;
                }
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleCellClick(focusedCellIndex);
                return;
            default:
                return;
        }

        updateCellFocusability();
        if (cells[focusedCellIndex]) {
            cells[focusedCellIndex].focus();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
