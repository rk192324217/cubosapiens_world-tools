(function () {
    "use strict";

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const hudOverlay = document.getElementById("hudOverlay");
    const startOverlay = document.getElementById("startOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const pauseOverlay = document.getElementById("pauseOverlay");

    const playBtn = document.getElementById("playBtn");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const resumeBtn = document.getElementById("resumeBtn");
    const pauseToggleBtn = document.getElementById("pauseToggleBtn");
    const soundToggleBtn = document.getElementById("soundToggleBtn");

    const scoreDisplay = document.getElementById("scoreDisplay");
    const bestDisplay = document.getElementById("bestDisplay");
    const distanceDisplay = document.getElementById("distanceDisplay");
    const finalScoreDisplay = document.getElementById("finalScoreDisplay");
    const finalDistanceDisplay = document.getElementById("finalDistanceDisplay");
    const finalBestDisplay = document.getElementById("finalBestDisplay");

    const FOCAL_LENGTH = 280;
    const MAX_Z = 1000;
    const PLAYER_Z = 35;
    const BASE_TUNNEL_RADIUS = 260;

    const player = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        visualRadius: 16,
        hitboxRadius: 7,
        roll: 0,
        maxRadiusLimit: 195
    };

    let gameState = "START";
    let animFrameId = null;
    let lastTime = 0;
    let survivalTimer = 0;

    let score = 0;
    let highScore = Math.floor(Number(localStorage.getItem("tunnelEscapeHighScore")) || 0);
    let bestDistance = Math.floor(Number(localStorage.getItem("tunnelEscapeBestDistance")) || 0);
    let distanceMeters = 0;
    let multiplier = 1;
    let currentSpeed = 3.5;
    let tunnelZOffset = 0;
    let audioEnabled = true;

    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        KeyW: false,
        KeyS: false,
        KeyA: false,
        KeyD: false
    };

    let touchTarget = null;
    let hazards = [];
    let particles = [];
    let floatingTexts = [];
    let spawnTimer = 0;
    let screenShake = 0;
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    function playSound(type) {
        if (!audioEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === "start") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === "dodge") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(480, now);
                osc.frequency.setValueAtTime(720, now + 0.07);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === "nearmiss") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(980, now + 0.18);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
            } else if (type === "crash") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === "click") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            }
        } catch (e) {
            // Audio Context unavailable
        }
    }

    function init() {
        bestDisplay.textContent = Math.floor(highScore);
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        setupEventListeners();
        resetGame();
        drawFrame();
    }

    function resizeCanvas() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const minDim = Math.min(rect.width, rect.height);
        player.maxRadiusLimit = (minDim / 2) * 0.72;
    }

    function setupEventListeners() {
        window.addEventListener("keydown", (e) => {
            if (keys.hasOwnProperty(e.code)) {
                keys[e.code] = true;
                if (gameState === "PLAYING") e.preventDefault();
            }
            if (e.code === "Space") {
                e.preventDefault();
                if (gameState === "START" || gameState === "GAMEOVER") startGame();
                else if (gameState === "PLAYING") pauseGame();
                else if (gameState === "PAUSED") resumeGame();
            }
        });

        window.addEventListener("keyup", (e) => {
            if (keys.hasOwnProperty(e.code)) {
                keys[e.code] = false;
            }
        });

        playBtn.addEventListener("click", () => {
            initAudio();
            startGame();
        });

        playAgainBtn.addEventListener("click", () => {
            playSound("click");
            startGame();
        });

        resumeBtn.addEventListener("click", () => {
            playSound("click");
            resumeGame();
        });

        pauseToggleBtn.addEventListener("click", () => {
            playSound("click");
            if (gameState === "PLAYING") pauseGame();
            else if (gameState === "PAUSED") resumeGame();
        });

        soundToggleBtn.addEventListener("click", () => {
            audioEnabled = !audioEnabled;
            if (audioEnabled) initAudio();
            soundToggleBtn.innerHTML = audioEnabled
                ? '<i class="fa-solid fa-volume-high"></i>'
                : '<i class="fa-solid fa-volume-xmark"></i>';
            playSound("click");
        });

        canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
        canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    }

    function handleTouchStart(e) {
        if (gameState !== "PLAYING") return;
        e.preventDefault();
        initAudio();
        updateTouchTarget(e.touches[0]);
    }

    function handleTouchMove(e) {
        if (gameState !== "PLAYING") return;
        e.preventDefault();
        updateTouchTarget(e.touches[0]);
    }

    function handleTouchEnd() {
        touchTarget = null;
    }

    function updateTouchTarget(touch) {
        const rect = canvas.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        touchTarget = {
            x: touch.clientX - rect.left - cx,
            y: touch.clientY - rect.top - cy
        };
    }

    function getDifficultyParams(survivalSec) {
        if (survivalSec < 10) {
            return { speed: 3.5, spawnInterval: 145, gapRatio: 0.52, rotSpeed: 0.0 };
        } else if (survivalSec < 30) {
            return { speed: 4.8, spawnInterval: 110, gapRatio: 0.42, rotSpeed: 0.25 };
        } else if (survivalSec < 60) {
            return { speed: 6.2, spawnInterval: 85, gapRatio: 0.34, rotSpeed: 0.55 };
        } else {
            return {
                speed: 7.5 + Math.min((survivalSec - 60) * 0.03, 3.0),
                spawnInterval: 65,
                gapRatio: 0.28,
                rotSpeed: 0.85
            };
        }
    }

    function resetGame() {
        score = 0;
        distanceMeters = 0;
        survivalTimer = 0;
        multiplier = 1;
        hazards = [];
        particles = [];
        floatingTexts = [];
        spawnTimer = 0;
        screenShake = 0;
        currentSpeed = 3.5;

        player.x = 0;
        player.y = 0;
        player.vx = 0;
        player.vy = 0;
        player.roll = 0;

        updateHUD();
    }

    function startGame() {
        resetGame();
        gameState = "PLAYING";

        startOverlay.style.display = "none";
        gameOverOverlay.style.display = "none";
        pauseOverlay.style.display = "none";
        hudOverlay.style.display = "flex";

        playSound("start");

        lastTime = performance.now();
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        if (gameState !== "PLAYING") return;
        gameState = "PAUSED";
        pauseOverlay.style.display = "flex";
        pauseToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    function resumeGame() {
        if (gameState !== "PAUSED") return;
        gameState = "PLAYING";
        pauseOverlay.style.display = "none";
        pauseToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function triggerGameOver() {
        gameState = "GAMEOVER";
        playSound("crash");
        screenShake = 16;
        createExplosion(player.x, player.y);

        const cleanScore = Math.floor(score);
        const cleanDistance = Math.floor(distanceMeters);

        if (cleanScore > highScore) {
            highScore = cleanScore;
            localStorage.setItem("tunnelEscapeHighScore", highScore);
        }

        if (cleanDistance > bestDistance) {
            bestDistance = cleanDistance;
            localStorage.setItem("tunnelEscapeBestDistance", bestDistance);
        }

        finalScoreDisplay.textContent = cleanScore;
        finalDistanceDisplay.textContent = `${cleanDistance}m`;
        finalBestDisplay.textContent = Math.floor(highScore);

        setTimeout(() => {
            hudOverlay.style.display = "none";
            gameOverOverlay.style.display = "flex";
        }, 500);
    }

    function gameLoop(now) {
        if (gameState !== "PLAYING") return;

        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        update(dt);
        drawFrame();

        animFrameId = requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        survivalTimer += dt;
        const diffConfig = getDifficultyParams(survivalTimer);
        currentSpeed = diffConfig.speed;

        distanceMeters += currentSpeed * dt * 2.8;
        score += currentSpeed * dt * 12 * multiplier;
        tunnelZOffset = (tunnelZOffset + currentSpeed * dt * 50) % 80;

        const moveAcc = 1600;
        const damping = 0.85;

        if (touchTarget) {
            const dx = touchTarget.x - player.x;
            const dy = touchTarget.y - player.y;
            player.vx += dx * 9 * dt;
            player.vy += dy * 9 * dt;
        } else {
            if (keys.ArrowLeft || keys.KeyA) player.vx -= moveAcc * dt;
            if (keys.ArrowRight || keys.KeyD) player.vx += moveAcc * dt;
            if (keys.ArrowUp || keys.KeyW) player.vy -= moveAcc * dt;
            if (keys.ArrowDown || keys.KeyS) player.vy += moveAcc * dt;
        }

        player.vx *= damping;
        player.vy *= damping;

        player.x += player.vx * dt;
        player.y += player.vy * dt;
        player.roll = player.vx * 0.0012;

        const distFromCenter = Math.hypot(player.x, player.y);
        if (distFromCenter > player.maxRadiusLimit) {
            const angle = Math.atan2(player.y, player.x);
            player.x = Math.cos(angle) * player.maxRadiusLimit;
            player.y = Math.sin(angle) * player.maxRadiusLimit;
            player.vx *= -0.2;
            player.vy *= -0.2;
        }

        if (Math.random() < 0.6) {
            particles.push({
                x: player.x + (Math.random() - 0.5) * 6,
                y: player.y + (Math.random() - 0.5) * 6,
                z: PLAYER_Z - 5,
                vx: -player.vx * 0.08,
                vy: -player.vy * 0.08,
                vz: -currentSpeed * 12,
                life: 0.25,
                maxLife: 0.25,
                color: "#00e5ff"
            });
        }

        spawnTimer -= currentSpeed * dt * 10;
        if (spawnTimer <= 0) {
            spawnHazard(diffConfig);
            spawnTimer = diffConfig.spawnInterval;
        }

        for (let i = hazards.length - 1; i >= 0; i--) {
            const h = hazards[i];
            h.z -= currentSpeed * dt * 70;
            h.rotation += h.rotSpeed * dt;

            if (h.z <= PLAYER_Z + 12 && h.z >= PLAYER_Z - 12 && !h.passed) {
                const result = checkHazardCollision(h);
                if (result.collided) {
                    triggerGameOver();
                    return;
                } else {
                    h.passed = true;
                    if (result.nearMiss) {
                        multiplier = Math.min(multiplier + 1, 4);
                        score += 150 * multiplier;
                        playSound("nearmiss");
                        addFloatingText("NEAR MISS!", player.x, player.y);
                        screenShake = 4;
                    } else {
                        playSound("dodge");
                    }
                }
            }

            if (h.z < 0) hazards.splice(i, 1);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            p.life -= dt;
            if (p.life <= 0 || p.z < 0) particles.splice(i, 1);
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 25 * dt;
            ft.alpha -= dt * 1.8;
            if (ft.alpha <= 0) floatingTexts.splice(i, 1);
        }

        if (screenShake > 0) {
            screenShake *= 0.88;
            if (screenShake < 0.4) screenShake = 0;
        }

        updateHUD();
    }

    function spawnHazard(config) {
        const safeAngle = Math.random() * Math.PI * 2;
        const gapSize = Math.PI * 2 * config.gapRatio;

        const type = (survivalTimer > 12 && Math.random() < 0.35) ? "collapsing_beam" : "crumbling_wall";

        hazards.push({
            z: MAX_Z,
            type: type,
            gapAngle: safeAngle,
            gapSize: gapSize,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * config.rotSpeed,
            passed: false
        });
    }

    function checkHazardCollision(h) {
        const pAngle = (Math.atan2(player.y, player.x) + Math.PI * 2) % (Math.PI * 2);
        const pDist = Math.hypot(player.x, player.y);

        if (h.type === "crumbling_wall") {
            const currentGapAngle = (h.gapAngle + h.rotation + Math.PI * 2) % (Math.PI * 2);
            let angleDiff = Math.abs(pAngle - currentGapAngle);
            if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

            const inGap = angleDiff < h.gapSize / 2;

            let collided = !inGap;
            if (collided) {
                const marginAngle = Math.asin(player.hitboxRadius / Math.max(pDist, 1));
                if (angleDiff < h.gapSize / 2 + marginAngle) {
                    collided = false;
                }
            }

            const nearMiss = inGap && (Math.abs(angleDiff - h.gapSize / 2) < 0.15);
            return { collided, nearMiss };
        } else if (h.type === "collapsing_beam") {
            const laserAngle = (h.rotation + Math.PI * 2) % Math.PI;
            const distToLine = Math.abs(
                player.x * Math.sin(laserAngle) - player.y * Math.cos(laserAngle)
            );
            const safeGapWidth = 38 + player.hitboxRadius;

            const collided = distToLine < safeGapWidth;
            const nearMiss = !collided && distToLine < safeGapWidth + 16;

            return { collided, nearMiss };
        }

        return { collided: false, nearMiss: false };
    }

    function createExplosion(x, y) {
        for (let i = 0; i < 35; i++) {
            const speed = 80 + Math.random() * 200;
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                x: x,
                y: y,
                z: PLAYER_Z,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * 60,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7,
                color: Math.random() < 0.5 ? "#f97316" : "#00e5ff"
            });
        }
    }

    function addFloatingText(text, x, y) {
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            alpha: 1.0
        });
    }

    function updateHUD() {
        scoreDisplay.textContent = Math.floor(score);
        bestDisplay.textContent = Math.floor(highScore);
        distanceDisplay.textContent = `${Math.floor(distanceMeters)}m`;
    }

    function drawFrame() {
        const displayWidth = canvas.width / (window.devicePixelRatio || 1);
        const displayHeight = canvas.height / (window.devicePixelRatio || 1);
        const cx = displayWidth / 2;
        const cy = displayHeight / 2;

        ctx.save();
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        if (screenShake > 0) {
            const rx = (Math.random() - 0.5) * screenShake;
            const ry = (Math.random() - 0.5) * screenShake;
            ctx.translate(rx, ry);
        }

        ctx.translate(cx, cy);

        drawTunnel(ctx, cx, cy);
        drawHazards(ctx);
        drawParticles(ctx);

        if (gameState !== "GAMEOVER") {
            drawPlayerCraft(ctx);
        }

        drawFloatingTexts(ctx);

        ctx.restore();
    }

    function drawTunnel(ctx, cx, cy) {
        const numRings = 10;
        const maxRadius = BASE_TUNNEL_RADIUS;

        ctx.strokeStyle = "rgba(100, 116, 139, 0.12)";
        ctx.lineWidth = 1;
        const numRadial = 6;
        for (let i = 0; i < numRadial; i++) {
            const angle = (i / numRadial) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * maxRadius * 1.4, Math.sin(angle) * maxRadius * 1.4);
            ctx.stroke();
        }

        for (let i = 0; i < numRings; i++) {
            const ringZ = ((i * 100 + tunnelZOffset) % MAX_Z) + 10;
            const scale = FOCAL_LENGTH / (FOCAL_LENGTH + ringZ);
            const radius = maxRadius * scale;
            const alpha = Math.min(1.0, (1 - ringZ / MAX_Z) * 0.9);

            ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.25})`;
            ctx.lineWidth = Math.max(1, 2 * scale);
            
            ctx.beginPath();
            for (let h = 0; h < 6; h++) {
                const angle = (h / 6) * Math.PI * 2;
                const hx = Math.cos(angle) * radius;
                const hy = Math.sin(angle) * radius;
                if (h === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }

    function drawHazards(ctx) {
        const sorted = [...hazards].sort((a, b) => b.z - a.z);

        sorted.forEach((h) => {
            const scale = FOCAL_LENGTH / (FOCAL_LENGTH + h.z);
            const radius = BASE_TUNNEL_RADIUS * scale;
            const alpha = Math.min(1.0, (1 - h.z / MAX_Z) * 1.4);

            ctx.save();

            if (h.type === "crumbling_wall") {
                ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
                ctx.lineWidth = Math.max(3, 10 * scale);

                const currentGapAngle = h.gapAngle + h.rotation;
                const startAngle = currentGapAngle + h.gapSize / 2;
                const endAngle = currentGapAngle - h.gapSize / 2 + Math.PI * 2;

                ctx.beginPath();
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.stroke();

                ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
                const p1x = Math.cos(startAngle) * radius;
                const p1y = Math.sin(startAngle) * radius;
                const p2x = Math.cos(endAngle) * radius;
                const p2y = Math.sin(endAngle) * radius;

                ctx.beginPath();
                ctx.arc(p1x, p1y, 3 * scale, 0, Math.PI * 2);
                ctx.arc(p2x, p2y, 3 * scale, 0, Math.PI * 2);
                ctx.fill();
            } else if (h.type === "collapsing_beam") {
                ctx.rotate(h.rotation);
                ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
                ctx.lineWidth = Math.max(3, 12 * scale);

                const barLen = radius * 1.1;
                const gap = 38 * scale;

                ctx.beginPath();
                ctx.moveTo(-barLen, -gap);
                ctx.lineTo(barLen, -gap);
                ctx.moveTo(-barLen, gap);
                ctx.lineTo(barLen, gap);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    function drawParticles(ctx) {
        particles.forEach((p) => {
            const scale = FOCAL_LENGTH / (FOCAL_LENGTH + p.z);
            const px = p.x * scale;
            const py = p.y * scale;
            const size = Math.max(1, 4 * scale * (p.life / p.maxLife));
            const alpha = (p.life / p.maxLife) * Math.min(1.0, 1 - p.z / MAX_Z);

            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    function drawPlayerCraft(ctx) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.roll);

        ctx.fillStyle = "#0d0e15";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, 10);
        ctx.lineTo(0, 5);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawFloatingTexts(ctx) {
        floatingTexts.forEach((ft) => {
            ctx.save();
            ctx.font = "600 14px 'Rajdhani', sans-serif";
            ctx.fillStyle = "#00e5ff";
            ctx.globalAlpha = ft.alpha;
            ctx.textAlign = "center";
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });
    }

    window.addEventListener("DOMContentLoaded", init);
})();
