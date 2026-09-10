(() => {
    'use strict';

    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');

    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const livesEl = document.getElementById('lives');
    const levelEl = document.getElementById('level');
    const bricksLeftEl = document.getElementById('bricksLeft');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const themeBtn = document.getElementById('themeBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const launchBtn = document.getElementById('launchBtn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');

    const overlay = document.getElementById('overlay');
    const resultTitle = document.getElementById('resultTitle');
    const resultSub = document.getElementById('resultSub');
    const finalScoreEl = document.getElementById('finalScore');
    const playAgainBtn = document.getElementById('playAgainBtn');

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 360;
    const BRICK_ROWS = 5;
    const BRICK_COLS = 10;
    const BRICK_PADDING = 6;
    const BRICK_OFFSET_TOP = 28;
    const BRICK_OFFSET_LEFT = 18;
    const BRICK_WIDTH = Math.floor((CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLS - 1))) / BRICK_COLS);
    const BRICK_HEIGHT = 16;

    const DIFFICULTIES = {
        easy: { speed: 4.5, paddleWidth: 104, lives: 3 },
        medium: { speed: 6.0, paddleWidth: 88, lives: 3 },
        hard: { speed: 7.5, paddleWidth: 72, lives: 2 }
    };

    let difficulty = 'easy';
    let score = 0;
    let highScore = loadHighScore();
    let lives = 3;
    let level = 1;
    let gameState = 'START';
    let animationFrameId = null;

    const paddle = {
        x: (CANVAS_WIDTH - 104) / 2,
        y: CANVAS_HEIGHT - 28,
        width: 104,
        height: 14,
        speed: 8.5,
        dx: 0
    };

    const ball = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 42,
        radius: 7,
        dx: 0,
        dy: 0,
        speed: 5,
        attached: true,
        fireball: false,
        fireTimer: 0
    };

    let bricks = [];
    let powerups = [];
    let particles = [];
    const keyState = { left: false, right: false };

    const audioCtx = typeof window.AudioContext !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

    function playSound(type) {
        if (!audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'bounce') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'brick') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'powerup') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'lost') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.25);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'win') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(600, now + 0.1);
                osc.frequency.setValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch (e) {
            // Web Audio fallback
        }
    }

    function loadHighScore() {
        try {
            const saved = localStorage.getItem('cubosapiens_brick_breaker_highscore');
            return saved ? parseInt(saved, 10) || 0 : 0;
        } catch (e) {
            return 0;
        }
    }

    function saveHighScore(val) {
        try {
            localStorage.setItem('cubosapiens_brick_breaker_highscore', val.toString());
        } catch (e) {}
    }

    function createBricks(currentLevel) {
        bricks = [];
        const colors = ['#ff2d78', '#ff6a00', '#ffe600', '#39ff14', '#00f5ff', '#a855f7'];

        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                let maxHp = 1;
                let color = colors[r % colors.length];

                if (currentLevel === 2) {
                    if (r === 0 || (r === 1 && (c === 0 || c === BRICK_COLS - 1))) {
                        maxHp = 2;
                        color = '#ffffff';
                    }
                } else if (currentLevel >= 3) {
                    if (r % 2 === 0) {
                        maxHp = 2;
                        color = '#ffffff';
                    }
                }

                const x = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
                const y = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
                bricks.push({
                    x: x,
                    y: y,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    hp: maxHp,
                    maxHp: maxHp,
                    baseColor: color,
                    scoreValue: (BRICK_ROWS - r) * 10 * maxHp
                });
            }
        }
        updateUI();
    }

    function spawnPowerup(x, y) {
        if (Math.random() > 0.25) return;
        const types = ['wide', 'life', 'slow', 'fire'];
        const type = types[Math.floor(Math.random() * types.length)];
        const colorMap = {
            wide: '#00f5ff',
            life: '#ff2d78',
            slow: '#ffe600',
            fire: '#ff6a00'
        };
        powerups.push({
            x: x + BRICK_WIDTH / 2,
            y: y + BRICK_HEIGHT / 2,
            dy: 2.2,
            radius: 8,
            type: type,
            color: colorMap[type]
        });
    }

    function applyPowerup(type) {
        playSound('powerup');
        if (type === 'wide') {
            paddle.width = Math.min(130, DIFFICULTIES[difficulty].paddleWidth * 1.4);
            setTimeout(() => {
                paddle.width = DIFFICULTIES[difficulty].paddleWidth;
            }, 8000);
        } else if (type === 'life') {
            lives++;
            updateUI();
        } else if (type === 'slow') {
            ball.speed = Math.max(3.5, DIFFICULTIES[difficulty].speed * 0.75);
            setTimeout(() => {
                ball.speed = DIFFICULTIES[difficulty].speed + (level - 1) * 0.5;
            }, 7000);
        } else if (type === 'fire') {
            ball.fireball = true;
            clearTimeout(ball.fireTimer);
            ball.fireTimer = setTimeout(() => {
                ball.fireball = false;
            }, 6000);
        }
    }

    function spawnParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1.5,
                color: color,
                alpha: 1,
                life: 0.04
            });
        }
    }

    function resetBallOnPaddle() {
        ball.attached = true;
        ball.speed = DIFFICULTIES[difficulty].speed + (level - 1) * 0.5;
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 2;
        ball.dx = 0;
        ball.dy = 0;
        ball.fireball = false;
    }

    function launchBall() {
        if (!ball.attached || gameState !== 'PLAYING') return;
        ball.attached = false;
        const angle = (Math.random() * 0.4 - 0.2);
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed;
        playSound('bounce');
    }

    function initGame() {
        const conf = DIFFICULTIES[difficulty];
        score = 0;
        level = 1;
        lives = conf.lives;
        paddle.width = conf.paddleWidth;
        paddle.x = (CANVAS_WIDTH - paddle.width) / 2;
        powerups = [];
        particles = [];
        createBricks(level);
        resetBallOnPaddle();
        updateUI();
        hideOverlay();
    }

    function nextLevel() {
        level++;
        playSound('win');
        ball.speed = DIFFICULTIES[difficulty].speed + (level - 1) * 0.5;
        createBricks(level);
        resetBallOnPaddle();
        powerups = [];
        updateUI();
    }

    function updateUI() {
        scoreEl.textContent = score;
        highScoreEl.textContent = highScore;
        livesEl.textContent = '♥'.repeat(Math.max(0, lives));
        levelEl.textContent = level;
        const remaining = bricks.filter(b => b.hp > 0).length;
        bricksLeftEl.textContent = remaining;
    }

    function showOverlay(title) {
        resultTitle.textContent = title;
        finalScoreEl.textContent = score;
        resultSub.style.display = 'block';
        overlay.classList.add('show');
    }

    function hideOverlay() {
        overlay.classList.remove('show');
    }

    function update() {
        if (gameState !== 'PLAYING') return;

        if (keyState.left) {
            paddle.x = Math.max(0, paddle.x - paddle.speed);
        }
        if (keyState.right) {
            paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + paddle.speed);
        }

        if (ball.attached) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius - 2;
            return;
        }

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.dx = -ball.dx;
            playSound('bounce');
        } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - ball.radius;
            ball.dx = -ball.dx;
            playSound('bounce');
        }

        if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.dy = -ball.dy;
            playSound('bounce');
        }

        if (ball.y - ball.radius > CANVAS_HEIGHT) {
            lives--;
            playSound('lost');
            updateUI();
            if (lives <= 0) {
                gameState = 'GAME_OVER';
                if (score > highScore) {
                    highScore = score;
                    saveHighScore(highScore);
                    updateUI();
                }
                showOverlay('GAME OVER');
                return;
            } else {
                resetBallOnPaddle();
                return;
            }
        }

        if (
            ball.dy > 0 &&
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width
        ) {
            playSound('bounce');
            ball.y = paddle.y - ball.radius;
            const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            const maxAngle = Math.PI / 2.6;
            const angle = hitPoint * maxAngle;
            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = currentSpeed * Math.sin(angle);
            ball.dy = -currentSpeed * Math.cos(angle);
        }

        let activeBricks = 0;
        for (let i = 0; i < bricks.length; i++) {
            const b = bricks[i];
            if (b.hp <= 0) continue;

            activeBricks++;

            if (
                ball.x + ball.radius > b.x &&
                ball.x - ball.radius < b.x + b.width &&
                ball.y + ball.radius > b.y &&
                ball.y - ball.radius < b.y + b.height
            ) {
                playSound('brick');
                if (!ball.fireball) {
                    const prevX = ball.x - ball.dx;

                    if (prevX + ball.radius <= b.x || prevX - ball.radius >= b.x + b.width) {
                        ball.dx = -ball.dx;
                    } else {
                        ball.dy = -ball.dy;
                    }
                }

                b.hp--;
                spawnParticles(ball.x, ball.y, b.baseColor, 10);

                if (b.hp <= 0) {
                    score += b.scoreValue;
                    if (score > highScore) {
                        highScore = score;
                        saveHighScore(highScore);
                    }
                    spawnPowerup(b.x, b.y);
                }
                updateUI();
                break;
            }
        }

        if (activeBricks === 0) {
            if (level >= 3) {
                gameState = 'VICTORY';
                playSound('win');
                showOverlay('VICTORY!');
            } else {
                nextLevel();
            }
            return;
        }

        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            p.y += p.dy;

            if (
                p.y + p.radius >= paddle.y &&
                p.y - p.radius <= paddle.y + paddle.height &&
                p.x >= paddle.x &&
                p.x <= paddle.x + paddle.width
            ) {
                applyPowerup(p.type);
                powerups.splice(i, 1);
            } else if (p.y > CANVAS_HEIGHT) {
                powerups.splice(i, 1);
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= pt.life;
            if (pt.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border') || '#2a2a50';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.25;
        for (let x = 0; x < CANVAS_WIDTH; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        for (let i = 0; i < bricks.length; i++) {
            const b = bricks[i];
            if (b.hp <= 0) continue;

            ctx.fillStyle = b.hp === 2 ? '#ffffff' : b.baseColor;
            ctx.fillRect(b.x, b.y, b.width, b.height);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(b.x, b.y, b.width, 3);
            ctx.fillRect(b.x, b.y, 3, b.height);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(b.x, b.y + b.height - 3, b.width, 3);
            ctx.fillRect(b.x + b.width - 3, b.y, 3, b.height);
        }

        for (let i = 0; i < powerups.length; i++) {
            const p = powerups[i];
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        }

        for (let i = 0; i < particles.length; i++) {
            const pt = particles[i];
            ctx.save();
            ctx.globalAlpha = pt.alpha;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const cyanColor = getComputedStyle(document.body).getPropertyValue('--cyan') || '#00f5ff';
        const yellowColor = getComputedStyle(document.body).getPropertyValue('--yellow') || '#ffe600';

        ctx.fillStyle = cyanColor;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.fillStyle = yellowColor;
        ctx.fillRect(paddle.x + 4, paddle.y + 2, paddle.width - 8, 3);

        ctx.fillStyle = ball.fireball ? '#ff6a00' : '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        if (ball.fireball) {
            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (gameState === 'START' || ball.attached) {
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillStyle = yellowColor;
            ctx.textAlign = 'center';
            if (gameState === 'START') {
                ctx.fillText('READY?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillStyle = cyanColor;
                ctx.fillText('PRESS SPACE OR TAP TO LAUNCH', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
            } else if (ball.attached && gameState === 'PLAYING') {
                ctx.font = '11px "Press Start 2P", monospace';
                ctx.fillText('PRESS SPACE TO LAUNCH', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
            }
        } else if (gameState === 'PAUSED') {
            ctx.font = '22px "Press Start 2P", monospace';
            ctx.fillStyle = yellowColor;
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
    }

    function loop() {
        update();
        render();
        animationFrameId = requestAnimationFrame(loop);
    }

    function setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keyState.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keyState.right = true;
            } else if (e.key === ' ') {
                e.preventDefault();
                if (gameState === 'START') {
                    startGame();
                } else if (ball.attached && gameState === 'PLAYING') {
                    launchBall();
                } else if (gameState === 'PLAYING' || gameState === 'PAUSED') {
                    togglePause();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keyState.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keyState.right = false;
            }
        });

        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keyState.left = true; });
        leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keyState.left = false; });
        leftBtn.addEventListener('mousedown', () => { keyState.left = true; });
        leftBtn.addEventListener('mouseup', () => { keyState.left = false; });

        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keyState.right = true; });
        rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keyState.right = false; });
        rightBtn.addEventListener('mousedown', () => { keyState.right = true; });
        rightBtn.addEventListener('mouseup', () => { keyState.right = false; });

        launchBtn.addEventListener('click', () => {
            if (gameState === 'START') {
                startGame();
            } else if (ball.attached) {
                launchBall();
            }
        });

        function handlePointerMove(clientX) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = CANVAS_WIDTH / rect.width;
            const canvasX = (clientX - rect.left) * scaleX;
            paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, canvasX - paddle.width / 2));
        }

        canvas.addEventListener('pointermove', (e) => {
            if (gameState === 'PLAYING') {
                handlePointerMove(e.clientX);
            }
        });

        canvas.addEventListener('click', () => {
            if (gameState === 'START') {
                startGame();
            } else if (ball.attached && gameState === 'PLAYING') {
                launchBall();
            }
        });

        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', togglePause);
        restartBtn.addEventListener('click', initGame);
        playAgainBtn.addEventListener('click', () => {
            initGame();
            startGame();
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                difficulty = btn.dataset.difficulty;
                initGame();
            });
        });

        themeBtn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('cubosapiens_theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('cubosapiens_theme', 'light');
            }
        });

        try {
            const savedTheme = localStorage.getItem('cubosapiens_theme');
            if (savedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        } catch (e) {}
    }

    function startGame() {
        if (gameState === 'PLAYING') return;
        if (gameState === 'GAME_OVER' || gameState === 'VICTORY') {
            initGame();
        }
        gameState = 'PLAYING';
        hideOverlay();
        if (ball.attached) {
            launchBall();
        }
    }

    function togglePause() {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> RESUME';
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
        }
    }

    function setupCanvasDimensions() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }

    setupCanvasDimensions();
    setupControls();
    initGame();
    loop();

})();
