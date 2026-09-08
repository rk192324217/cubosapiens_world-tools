(function () {
  'use strict';

  const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TILE_SIZE: 40,
    GAME_DURATION: 60,
    BASE_SPEED: 5.5,
    DIAGONAL_FACTOR: Math.SQRT1_2,
    MAX_COINS: 6,
    COMBO_WINDOW: 2.5,
    MAGNET_DURATION: 5.0,
    MAGNET_RADIUS: 180,
    MAGNET_PULL_SPEED: 7.0,

    STORAGE_KEYS: {
      BEST_SCORE: 'coinCollectorBestScore',
      TOTAL_COINS: 'coinCollectorTotalCoins',
      GAMES_PLAYED: 'coinCollectorGamesPlayed',
      THEME: 'coinCollectorTheme',
      MUTED: 'coinCollectorMuted'
    }
  };

  const Storage = {
    get(key, defaultValue) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
      }
    }
  };

  class AudioSystem {
    constructor() {
      this.ctx = null;
      this.isMuted = Storage.get(CONFIG.STORAGE_KEYS.MUTED, false);
    }

    init() {
      if (!this.ctx && typeof AudioContext !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      Storage.set(CONFIG.STORAGE_KEYS.MUTED, this.isMuted);
      return this.isMuted;
    }

    playTone(freq, type, duration, gainStart = 0.15, gainEnd = 0.001) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
      }
    }

    playCoinSound(combo = 1) {
      const baseFreq = 587.33 + (combo - 1) * 110;
      this.playTone(baseFreq, 'sine', 0.07, 0.2);
      setTimeout(() => this.playTone(baseFreq * 1.25, 'sine', 0.1, 0.2), 35);
    }

    playGemSound() {
      this.playTone(880, 'triangle', 0.08, 0.22);
      setTimeout(() => this.playTone(1174.66, 'triangle', 0.08, 0.22), 45);
      setTimeout(() => this.playTone(1760, 'sine', 0.14, 0.22), 90);
    }

    playMagnetSound() {
      this.playTone(280, 'sawtooth', 0.08, 0.15);
      setTimeout(() => this.playTone(560, 'sine', 0.18, 0.2), 50);
    }

    playTickSound() {
      this.playTone(480, 'sine', 0.04, 0.12);
    }

    playStartSound() {
      this.playTone(392, 'square', 0.08, 0.15);
      setTimeout(() => this.playTone(523.25, 'square', 0.08, 0.15), 90);
      setTimeout(() => this.playTone(659.25, 'square', 0.2, 0.2), 180);
    }

    playGameOverSound() {
      this.playTone(392, 'sawtooth', 0.12, 0.2);
      setTimeout(() => this.playTone(330, 'sawtooth', 0.12, 0.2), 120);
      setTimeout(() => this.playTone(261.63, 'sawtooth', 0.25, 0.22), 240);
    }

    playHighScoreSound() {
      const notes = [523.25, 659.25, 784.88, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.16, 0.22), idx * 80);
      });
    }
  }

  const audio = new AudioSystem();

  class Particle {
    constructor(x, y, color, size, speedX, speedY, life, isSquare = true) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = size;
      this.speedX = speedX;
      this.speedY = speedY;
      this.life = life;
      this.maxLife = life;
      this.alpha = 1;
      this.isSquare = isSquare;
    }

    update(dt) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= dt;
      this.alpha = Math.max(0, this.life / this.maxLife);
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;

      if (this.isSquare) {
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class FloatingText {
    constructor(x, y, text, color, scale = 1) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.scale = scale;
      this.life = 0.75;
      this.maxLife = 0.75;
      this.vy = -1.6;
    }

    update(dt) {
      this.y += this.vy;
      this.life -= dt;
    }

    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.font = `700 ${Math.round(15 * this.scale)}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 18;
      this.speed = CONFIG.BASE_SPEED;
      this.facingAngle = 0;
      this.idleTimer = 0;
      this.leanAngle = 0;
      this.trail = [];
      this.magnetTimer = 0;
    }

    update(dx, dy, bounds, dt) {
      this.idleTimer += dt * 5;

      if (dx !== 0 || dy !== 0) {
        let moveX = dx;
        let moveY = dy;
        if (dx !== 0 && dy !== 0) {
          moveX *= CONFIG.DIAGONAL_FACTOR;
          moveY *= CONFIG.DIAGONAL_FACTOR;
        }

        this.x += moveX * this.speed;
        this.y += moveY * this.speed;

        this.facingAngle = Math.atan2(moveY, moveX);
        this.leanAngle = moveX * 0.15;

        if (Math.random() < 0.4) {
          this.trail.push(new Particle(
            this.x + (Math.random() - 0.5) * 12,
            this.y + 12,
            '#00f0ff',
            Math.random() * 3 + 2,
            -moveX * 0.5,
            -moveY * 0.5,
            0.25,
            true
          ));
        }
      } else {
        this.leanAngle *= 0.8;
      }

      this.trail.forEach(t => t.update(dt));
      this.trail = this.trail.filter(t => t.life > 0);

      this.x = Math.max(this.radius + 12, Math.min(bounds.width - this.radius - 12, this.x));
      this.y = Math.max(this.radius + 12, Math.min(bounds.height - this.radius - 12, this.y));

      if (this.magnetTimer > 0) {
        this.magnetTimer -= dt;
      }
    }

    draw(ctx) {
      this.trail.forEach(t => t.draw(ctx));

      if (this.magnetTimer > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.MAGNET_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 255, 136, 0.04)';
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 16, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const hoverY = Math.sin(this.idleTimer) * 2;

      ctx.save();
      ctx.translate(this.x, this.y + hoverY);
      ctx.rotate(this.leanAngle);

      ctx.fillStyle = '#00f0ff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-16, -16, 32, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#090714';
      ctx.beginPath();
      ctx.roundRect(-10, -8, 20, 16, 3);
      ctx.fill();

      const eyeDx = Math.cos(this.facingAngle) * 4;
      const eyeDy = Math.sin(this.facingAngle) * 3;
      ctx.fillStyle = this.magnetTimer > 0 ? '#00ff88' : '#ffd700';
      ctx.beginPath();
      ctx.arc(eyeDx, eyeDy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const pointerAngle = this.facingAngle;
      ctx.arc(Math.cos(pointerAngle) * 16, Math.sin(pointerAngle) * 16, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  class Coin {
    constructor(x, y, type = 'gold') {
      this.x = x;
      this.y = y;
      this.type = type;
      this.bobPhase = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * Math.PI * 2;
      this.shakeX = 0;
      this.shakeY = 0;

      if (type === 'gold') {
        this.radius = 13;
        this.value = 10;
        this.color = '#ffd700';
      } else if (type === 'gem') {
        this.radius = 12;
        this.value = 25;
        this.color = '#00f0ff';
      } else if (type === 'magnet') {
        this.radius = 15;
        this.value = 15;
        this.color = '#00ff88';
      }
    }

    update(player, dt) {
      this.bobPhase += dt * 4;
      this.rotation += dt * 2.5;

      if (player.magnetTimer > 0) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.MAGNET_RADIUS) {
          this.shakeX = (Math.random() - 0.5) * 2;
          this.shakeY = (Math.random() - 0.5) * 2;

          const pull = (1 - dist / CONFIG.MAGNET_RADIUS) * CONFIG.MAGNET_PULL_SPEED;
          this.x += (dx / dist) * pull;
          this.y += (dy / dist) * pull;
        } else {
          this.shakeX = 0;
          this.shakeY = 0;
        }
      } else {
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }

    draw(ctx) {
      const offsetY = Math.sin(this.bobPhase) * 3;
      const currentX = this.x + this.shakeX;
      const currentY = this.y + offsetY + this.shakeY;

      ctx.save();
      ctx.translate(currentX, currentY);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-this.radius * 0.7, this.radius + 2, this.radius * 1.4, 3);

      if (this.type === 'gold') {
        const flipScale = Math.abs(Math.cos(this.rotation));
        ctx.scale(Math.max(0.2, flipScale), 1);

        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#b38f00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = '700 11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);

      } else if (this.type === 'gem') {
        ctx.rotate(Math.sin(this.rotation * 0.5) * 0.2);

        ctx.fillStyle = '#00f0ff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -this.radius - 2);
        ctx.lineTo(this.radius + 1, 0);
        ctx.lineTo(0, this.radius + 2);
        ctx.lineTo(-this.radius - 1, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius / 2, 0);
        ctx.lineTo(0, this.radius / 2);
        ctx.closePath();
        ctx.fill();

      } else if (this.type === 'magnet') {
        ctx.fillStyle = '#00ff88';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = '700 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', 0, 1);
      }

      ctx.restore();
    }
  }

  class CoinCollectorGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.hudBar = document.getElementById('hudBar');
      this.hudScore = document.getElementById('hudScore');
      this.hudBest = document.getElementById('hudBest');
      this.hudTimer = document.getElementById('hudTimer');
      this.hudCombo = document.getElementById('hudCombo');
      this.timerCard = document.getElementById('timerCard');
      this.comboCard = document.getElementById('comboCard');
      this.activePowerupHUD = document.getElementById('activePowerupHUD');
      this.powerupTimer = document.getElementById('powerupTimer');
      this.countdownOverlay = document.getElementById('countdownOverlay');
      this.countdownText = document.getElementById('countdownText');

      this.startScreen = document.getElementById('startScreen');
      this.pauseScreen = document.getElementById('pauseScreen');
      this.gameOverScreen = document.getElementById('gameOverScreen');

      this.previewHero = document.getElementById('previewHero');
      this.previewCoin = document.getElementById('previewCoin');
      this.previewPopup = document.getElementById('previewPopup');
      this.previewTimer = 0;

      this.startBestScore = document.getElementById('startBestScore');
      this.finalScore = document.getElementById('finalScore');
      this.finalBest = document.getElementById('finalBest');
      this.finalCoins = document.getElementById('finalCoins');
      this.finalCombo = document.getElementById('finalCombo');
      this.newHighBadge = document.getElementById('newHighBadge');

      this.btnStart = document.getElementById('btnStart');
      this.btnResume = document.getElementById('btnResume');
      this.btnRestartPause = document.getElementById('btnRestartPause');
      this.btnPlayAgain = document.getElementById('btnPlayAgain');
      this.btnPause = document.getElementById('btnPause');
      this.btnTheme = document.getElementById('btnTheme');
      this.btnSound = document.getElementById('btnSound');
      this.soundIcon = document.getElementById('soundIcon');
      this.themeIcon = document.getElementById('themeIcon');

      this.state = 'START';
      this.isStarting = false;
      this.score = 0;
      this.bestScore = Storage.get(CONFIG.STORAGE_KEYS.BEST_SCORE, 0);
      this.coinsCollectedCount = 0;
      this.timeRemaining = CONFIG.GAME_DURATION;
      this.combo = 1;
      this.maxCombo = 1;
      this.comboTimer = 0;
      this.countdownVal = 3;
      this.countdownTimerAcc = 0;

      this.tileMap = [];
      this.ambientFlickers = [];
      this.titleStars = [];

      this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
      this.coins = [];
      this.particles = [];
      this.floatingTexts = [];

      this.keys = {};

      this.lastTimestamp = 0;
      this.animFrameId = null;

      this.init();
    }

    init() {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      this.setupControls();
      this.setupUI();
      this.generateCyberVaultTilemap();
      this.generateTitleStars();

      this.updateHUD();
      this.startBestScore.textContent = this.bestScore;

      this.lastTimestamp = performance.now();
      this.animFrameId = requestAnimationFrame((ts) => this.loop(ts));
    }

    resizeCanvas() {
      this.canvas.width = CONFIG.CANVAS_WIDTH;
      this.canvas.height = CONFIG.CANVAS_HEIGHT;
    }

    generateTitleStars() {
      this.titleStars = [];
      for (let i = 0; i < 35; i++) {
        this.titleStars.push({
          x: Math.random() * CONFIG.CANVAS_WIDTH,
          y: Math.random() * CONFIG.CANVAS_HEIGHT,
          size: Math.random() < 0.7 ? 2 : 3,
          alphaPhase: Math.random() * Math.PI * 2,
          speed: Math.random() * 1.5 + 0.5,
          color: Math.random() < 0.25 ? '#ffd700' : (Math.random() < 0.3 ? '#00f0ff' : '#ffffff')
        });
      }
    }

    generateCyberVaultTilemap() {
      const cols = CONFIG.CANVAS_WIDTH / CONFIG.TILE_SIZE;
      const rows = CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE;
      this.tileMap = [];
      this.ambientFlickers = [];

      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          let tileType = 0;
          const rand = Math.random();

          if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
            tileType = 4;
          } else {
            if (rand < 0.10) tileType = 1;
            else if (rand < 0.15) tileType = 2;
            else if (rand < 0.18) tileType = 3;
            else if (rand < 0.20) tileType = 5;
          }
          row.push(tileType);
        }
        this.tileMap.push(row);
      }

      for (let i = 0; i < 8; i++) {
        this.ambientFlickers.push({
          x: (Math.floor(Math.random() * 18) + 1) * CONFIG.TILE_SIZE + 20,
          y: (Math.floor(Math.random() * 13) + 1) * CONFIG.TILE_SIZE + 20,
          timer: Math.random() * 5
        });
      }
    }

    setupControls() {
      window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.key] = true;

        if ((e.key === 'p' || e.key === 'P') && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
          this.togglePause();
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.key] = false;
      });

      const dpadMap = {
        dpadUp: ['w', 'arrowup'],
        dpadLeft: ['a', 'arrowleft'],
        dpadDown: ['s', 'arrowdown'],
        dpadRight: ['d', 'arrowright']
      };

      Object.entries(dpadMap).forEach(([btnId, keyNames]) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        const press = (e) => {
          e.preventDefault();
          btn.classList.add('active');
          keyNames.forEach(k => this.keys[k] = true);
        };

        const release = (e) => {
          e.preventDefault();
          btn.classList.remove('active');
          keyNames.forEach(k => this.keys[k] = false);
        };

        btn.addEventListener('touchstart', press);
        btn.addEventListener('touchend', release);
        btn.addEventListener('touchcancel', release);

        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
      });
    }

    setupUI() {
      this.btnStart.addEventListener('click', () => {
        audio.init();
        audio.playStartSound();
        this.initiateCountdown();
      });

      this.btnResume.addEventListener('click', () => {
        audio.init();
        this.togglePause();
      });

      this.btnRestartPause.addEventListener('click', () => {
        audio.init();
        this.togglePause();
        this.initiateCountdown();
      });

      this.btnPlayAgain.addEventListener('click', () => {
        audio.init();
        audio.playStartSound();
        this.initiateCountdown();
      });

      this.btnPause.addEventListener('click', () => {
        audio.init();
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
          this.togglePause();
        }
      });

      this.updateSoundIcon();
      this.btnSound.addEventListener('click', () => {
        audio.toggleMute();
        this.updateSoundIcon();
      });

      const savedTheme = Storage.get(CONFIG.STORAGE_KEYS.THEME, 'dark');
      document.body.className = `theme-${savedTheme}`;
      this.updateThemeIcon(savedTheme);

      this.btnTheme.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.className = `theme-${newTheme}`;
        Storage.set(CONFIG.STORAGE_KEYS.THEME, newTheme);
        this.updateThemeIcon(newTheme);
      });
    }

    updateSoundIcon() {
      this.soundIcon.className = audio.isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }

    updateThemeIcon(theme) {
      this.themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }

    initiateCountdown() {
      if (this.isStarting) return;
      this.isStarting = true;

      if (this.btnStart) this.btnStart.classList.add('pressed');
      if (this.startScreen) this.startScreen.classList.add('transition-out');

      setTimeout(() => {
        this.score = 0;
        this.coinsCollectedCount = 0;
        this.timeRemaining = CONFIG.GAME_DURATION;
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;
        this.countdownVal = 3;
        this.countdownTimerAcc = 0;

        this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.coins = [];
        this.particles = [];
        this.floatingTexts = [];

        for (let i = 0; i < CONFIG.MAX_COINS; i++) {
          this.spawnCoin();
        }

        this.state = 'COUNTDOWN';

        if (this.startScreen) {
          this.startScreen.classList.remove('active', 'transition-out');
        }
        if (this.btnStart) {
          this.btnStart.classList.remove('pressed');
        }
        this.pauseScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
        this.timerCard.classList.remove('urgent');

        if (this.hudBar) {
          this.hudBar.classList.remove('hidden');
        }

        this.countdownText.textContent = '3';
        this.countdownOverlay.classList.remove('hidden');
        audio.playTickSound();
        this.updateHUD();

        this.isStarting = false;
      }, 350);
    }

    startGameplay() {
      this.state = 'PLAYING';
      this.countdownOverlay.classList.add('hidden');
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.pauseScreen.classList.add('active');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.pauseScreen.classList.remove('active');
      }
    }

    spawnCoin() {
      const margin = 50;
      let valid = false;
      let x = 0;
      let y = 0;
      let attempts = 0;

      while (!valid && attempts < 50) {
        attempts++;
        x = margin + Math.random() * (CONFIG.CANVAS_WIDTH - margin * 2);
        y = margin + Math.random() * (CONFIG.CANVAS_HEIGHT - margin * 2);

        const distPlayer = Math.hypot(x - this.player.x, y - this.player.y);
        if (distPlayer > 90) {
          valid = true;
        }
      }

      const rand = Math.random();
      let type = 'gold';
      if (rand < 0.12) type = 'gem';
      else if (rand < 0.20) type = 'magnet';

      this.coins.push(new Coin(x, y, type));
    }

    triggerParticles(x, y, color, count = 8) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        this.particles.push(
          new Particle(
            x, y, color,
            Math.random() * 3.5 + 2,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            Math.random() * 0.35 + 0.25,
            Math.random() > 0.3
          )
        );
      }
    }

    updatePreviewAnimation(dt) {
      if (!this.previewHero || !this.previewCoin || !this.previewPopup) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) return;

      this.previewTimer += dt;
      const cycle = this.previewTimer % 3.5;

      if (cycle > 0.8 && cycle < 1.6) {
        const progress = (cycle - 0.8) / 0.8;
        const moveX = Math.sin(progress * Math.PI) * -16;
        this.previewHero.style.transform = `translateX(${moveX}px)`;
      } else if (cycle >= 1.6 && cycle < 2.4) {
        this.previewHero.style.transform = 'translateX(-16px)';
        this.previewCoin.style.opacity = '0';
        this.previewCoin.style.transform = 'scale(0.5)';
        this.previewPopup.classList.remove('hidden');
        this.previewPopup.classList.add('pop');
      } else {
        this.previewHero.style.transform = 'translateX(0)';
        this.previewCoin.style.opacity = '1';
        this.previewCoin.style.transform = 'scale(1)';
        this.previewPopup.classList.remove('pop');
        this.previewPopup.classList.add('hidden');
      }
    }

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      if (this.state === 'START') {
        this.updatePreviewAnimation(dt);
      } else if (this.state === 'COUNTDOWN') {
        this.updateCountdown(dt);
      } else if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();

      this.animFrameId = requestAnimationFrame((ts) => this.loop(ts));
    }

    updateCountdown(dt) {
      this.countdownTimerAcc += dt;
      if (this.countdownTimerAcc >= 0.85) {
        this.countdownTimerAcc = 0;
        this.countdownVal--;

        if (this.countdownVal > 0) {
          this.countdownText.textContent = this.countdownVal;
          audio.playTickSound();
        } else if (this.countdownVal === 0) {
          this.countdownText.textContent = 'GO!';
          audio.playStartSound();
        } else {
          this.startGameplay();
        }
      }
    }

    update(dt) {
      let dx = 0;
      let dy = 0;

      if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
      if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
      if (this.keys['d'] || this.keys['arrowright']) dx += 1;

      this.player.update(dx, dy, { width: CONFIG.CANVAS_WIDTH, height: CONFIG.CANVAS_HEIGHT }, dt);

      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.combo = 1;
          this.updateHUD();
        }
      }

      if (this.player.magnetTimer > 0) {
        this.activePowerupHUD.classList.remove('hidden');
        this.powerupTimer.textContent = `${this.player.magnetTimer.toFixed(1)}s`;
      } else {
        this.activePowerupHUD.classList.add('hidden');
      }

      for (let i = this.coins.length - 1; i >= 0; i--) {
        const coin = this.coins[i];
        coin.update(this.player, dt);

        const dist = Math.hypot(this.player.x - coin.x, this.player.y - coin.y);
        if (dist < this.player.radius + coin.radius) {
          this.collectCoin(coin, i);
        }
      }

      while (this.coins.length < CONFIG.MAX_COINS) {
        this.spawnCoin();
      }

      this.particles.forEach(p => p.update(dt));
      this.particles = this.particles.filter(p => p.life > 0);

      this.floatingTexts.forEach(ft => ft.update(dt));
      this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

      this.ambientFlickers.forEach(f => f.timer += dt);

      const prevTime = Math.ceil(this.timeRemaining);
      this.timeRemaining -= dt;
      const currTime = Math.ceil(this.timeRemaining);

      if (currTime !== prevTime && currTime <= 10 && currTime > 0) {
        audio.playTickSound();
      }

      if (this.timeRemaining <= 10) {
        this.timerCard.classList.add('urgent');
      }

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.endGame();
      }

      this.updateHUD();
    }

    collectCoin(coin, index) {
      this.coins.splice(index, 1);

      this.comboTimer = CONFIG.COMBO_WINDOW;
      this.combo = Math.min(this.combo + 1, 5);
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      const gained = coin.value * this.combo;
      this.score += gained;
      this.coinsCollectedCount++;

      if (coin.type === 'gold') {
        audio.playCoinSound(this.combo);
        this.triggerParticles(coin.x, coin.y, '#ffd700', 10);
        this.floatingTexts.push(new FloatingText(coin.x, coin.y, `+${gained}`, '#ffd700'));
      } else if (coin.type === 'gem') {
        audio.playGemSound();
        this.triggerParticles(coin.x, coin.y, '#00f0ff', 16);
        this.floatingTexts.push(new FloatingText(coin.x, coin.y, `GEM +${gained}!`, '#00f0ff', 1.2));
      } else if (coin.type === 'magnet') {
        audio.playMagnetSound();
        this.player.magnetTimer = CONFIG.MAGNET_DURATION;
        this.triggerParticles(coin.x, coin.y, '#00ff88', 14);
        this.floatingTexts.push(new FloatingText(coin.x, coin.y, `MAGNET!`, '#00ff88', 1.2));
      }

      if (this.combo >= 3) {
        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, `COMBO x${this.combo}!`, '#ff007f', 1.3));
      }

      const scoreCard = document.querySelector('.score-card');
      scoreCard.classList.add('bump');
      setTimeout(() => scoreCard.classList.remove('bump'), 150);

      this.spawnCoin();
    }

    updateHUD() {
      this.hudScore.textContent = this.score;
      this.hudBest.textContent = Math.max(this.score, this.bestScore);
      this.hudTimer.textContent = `${Math.ceil(this.timeRemaining)}s`;
      this.hudCombo.textContent = `x${this.combo}`;

      this.comboCard.className = `hud-card combo-card level-${Math.min(this.combo, 4)}`;
    }

    endGame() {
      this.state = 'GAMEOVER';

      const isNewHigh = this.score > this.bestScore;
      if (isNewHigh) {
        this.bestScore = this.score;
        Storage.set(CONFIG.STORAGE_KEYS.BEST_SCORE, this.bestScore);
        audio.playHighScoreSound();
        this.newHighBadge.classList.remove('hidden');

        for (let i = 0; i < 50; i++) {
          this.triggerParticles(
            Math.random() * CONFIG.CANVAS_WIDTH,
            Math.random() * CONFIG.CANVAS_HEIGHT,
            ['#ffd700', '#00f0ff', '#ff007f', '#00ff88'][Math.floor(Math.random() * 4)],
            2
          );
        }
      } else {
        audio.playGameOverSound();
        this.newHighBadge.classList.add('hidden');
      }

      const totalCoins = Storage.get(CONFIG.STORAGE_KEYS.TOTAL_COINS, 0) + this.coinsCollectedCount;
      const gamesPlayed = Storage.get(CONFIG.STORAGE_KEYS.GAMES_PLAYED, 0) + 1;
      Storage.set(CONFIG.STORAGE_KEYS.TOTAL_COINS, totalCoins);
      Storage.set(CONFIG.STORAGE_KEYS.GAMES_PLAYED, gamesPlayed);

      this.finalScore.textContent = this.score;
      this.finalBest.textContent = this.bestScore;
      this.finalCoins.textContent = this.coinsCollectedCount;
      this.finalCombo.textContent = `x${this.maxCombo}`;

      this.gameOverScreen.classList.add('active');
    }

    render() {
      this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      const isDark = document.body.classList.contains('theme-dark');

      if (this.state === 'START') {
        this.drawTitleScreenAtmosphere(isDark);
        return;
      }

      this.drawCyberVaultEnvironment(isDark);

      this.coins.forEach(c => c.draw(this.ctx));

      if (this.state !== 'GAMEOVER') {
        this.player.draw(this.ctx);
      }

      this.particles.forEach(p => p.draw(this.ctx));
      this.floatingTexts.forEach(ft => ft.draw(this.ctx));

      this.drawCyberBorderFrame(isDark);
    }

    drawTitleScreenAtmosphere(isDark) {
      const w = CONFIG.CANVAS_WIDTH;
      const h = CONFIG.CANVAS_HEIGHT;

      this.ctx.fillStyle = isDark ? '#0c0a1d' : '#e4ecf8';
      this.ctx.fillRect(0, 0, w, h);

      this.ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.035)' : 'rgba(59, 130, 246, 0.05)';
      this.ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= w; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, h);
        this.ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(w, y);
        this.ctx.stroke();
      }

      this.titleStars.forEach(star => {
        star.alphaPhase += 0.02 * star.speed;
        const alpha = 0.2 + Math.sin(star.alphaPhase) * 0.25;
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0.05, alpha);
        this.ctx.fillStyle = star.color;
        this.ctx.fillRect(star.x, star.y, star.size, star.size);
        this.ctx.restore();
      });

      const radGrad = this.ctx.createRadialGradient(
        w / 2, h / 2, 180,
        w / 2, h / 2, 450
      );
      radGrad.addColorStop(0, 'transparent');
      radGrad.addColorStop(1, isDark ? 'rgba(4, 2, 12, 0.75)' : 'rgba(160, 185, 220, 0.45)');

      this.ctx.fillStyle = radGrad;
      this.ctx.fillRect(0, 0, w, h);
    }

    drawCyberVaultEnvironment(isDark) {
      const tileSize = CONFIG.TILE_SIZE;

      this.ctx.fillStyle = isDark ? '#0c0a1d' : '#e6effc';
      this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      for (let r = 0; r < this.tileMap.length; r++) {
        for (let c = 0; c < this.tileMap[r].length; c++) {
          const type = this.tileMap[r][c];
          const x = c * tileSize;
          const y = r * tileSize;

          if (type === 1) {
            this.ctx.fillStyle = isDark ? '#090717' : '#dbe8fa';
            this.ctx.fillRect(x, y, tileSize, tileSize);
          } else if (type === 2) {
            this.ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(59, 130, 246, 0.15)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 10, y + 20);
            this.ctx.lineTo(x + 30, y + 20);
            this.ctx.stroke();
          } else if (type === 3) {
            this.ctx.strokeStyle = isDark ? 'rgba(147, 112, 219, 0.15)' : 'rgba(100, 116, 139, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 5, y + 8);
            this.ctx.lineTo(x + 18, y + 22);
            this.ctx.lineTo(x + 32, y + 16);
            this.ctx.stroke();
          } else if (type === 5) {
            this.ctx.fillStyle = isDark ? 'rgba(0, 255, 136, 0.15)' : 'rgba(245, 158, 11, 0.2)';
            this.ctx.fillRect(x + 16, y + 16, 8, 8);
          }

          this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.03)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }

      this.ambientFlickers.forEach(f => {
        if (Math.sin(f.timer * 4) > 0.8) {
          this.ctx.fillStyle = isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(245, 158, 11, 0.4)';
          this.ctx.fillRect(f.x, f.y, 4, 4);
        }
      });

      const radGrad = this.ctx.createRadialGradient(
        CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 200,
        CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 480
      );
      radGrad.addColorStop(0, 'transparent');
      radGrad.addColorStop(1, isDark ? 'rgba(5, 3, 15, 0.5)' : 'rgba(180, 200, 230, 0.35)');

      this.ctx.fillStyle = radGrad;
      this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    drawCyberBorderFrame(isDark) {
      const w = CONFIG.CANVAS_WIDTH;
      const h = CONFIG.CANVAS_HEIGHT;
      const t = 8;

      this.ctx.save();

      this.ctx.fillStyle = isDark ? '#1a1438' : '#a8c4eb';
      this.ctx.fillRect(0, 0, w, t);
      this.ctx.fillRect(0, h - t, w, t);
      this.ctx.fillRect(0, 0, t, h);
      this.ctx.fillRect(w - t, 0, t, h);

      this.ctx.strokeStyle = isDark ? '#ffd700' : '#d97706';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(t, t, w - t * 2, h - t * 2);

      const cs = 20;
      this.ctx.fillStyle = isDark ? '#ffd700' : '#d97706';
      this.ctx.fillRect(0, 0, cs, cs);
      this.ctx.fillRect(w - cs, 0, cs, cs);
      this.ctx.fillRect(0, h - cs, cs, cs);
      this.ctx.fillRect(w - cs, h - cs, cs, cs);

      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(4, 4, cs - 8, cs - 8);
      this.ctx.fillRect(w - cs + 4, 4, cs - 8, cs - 8);
      this.ctx.fillRect(4, h - cs + 4, cs - 8, cs - 8);
      this.ctx.fillRect(w - cs + 4, h - cs + 4, cs - 8, cs - 8);

      this.ctx.fillStyle = '#00f0ff';
      this.ctx.fillRect(w / 2 - 10, 2, 20, 4);
      this.ctx.fillRect(w / 2 - 10, h - 6, 20, 4);
      this.ctx.fillRect(2, h / 2 - 10, 4, 20);
      this.ctx.fillRect(w - 6, h / 2 - 10, 4, 20);

      this.ctx.restore();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    new CoinCollectorGame();
  });

})();
