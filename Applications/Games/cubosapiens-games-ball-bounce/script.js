/**
 * Bounce Blitz - Game Logic
 * A high-speed retro ball bounce arcade game.
 */

const CONFIG = {
  ball: {
    radius: 8,
    initialSpeed: 4,
    speedIncrement: 0.2,
    maxSpeed: 10,
    minVerticalSpeed: 2.5, // Hard minimum to prevent horizontal loops
    maxBounceAngle: 65 * (Math.PI / 180), // Max reflection angle
    perturbation: 0.15, 
  },
  paddle: {
    width: 80,
    height: 12,
    speed: 12,
  },
  game: {
    lives: 3,
    scoreThreshold: 10, 
  },
  storage: {
    highscoreKey: 'cubosapiens-ball-bounce-highscore',
    themeKey: 'cubosapiens-ball-bounce-theme',
  }
};

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.width = 400;
    this.height = 500;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.score = 0;
    this.highscore = parseInt(localStorage.getItem(CONFIG.storage.highscoreKey)) || 0;
    this.lives = CONFIG.game.lives;
    this.paused = false;
    this.running = false;
    this.gameOver = false;
    this.lastTimestamp = 0;

    this.ball = {
      x: this.width / 2,
      y: this.height / 2,
      dx: 0,
      dy: 0,
      radius: CONFIG.ball.radius,
      speed: CONFIG.ball.initialSpeed
    };

    this.paddle = {
      x: (this.width - CONFIG.paddle.width) / 2,
      y: this.height - 30,
      width: CONFIG.paddle.width,
      height: CONFIG.paddle.height,
      dx: 0
    };

    this.ui = {
      score: document.getElementById('score-display'),
      best: document.getElementById('best-display'),
      lives: document.getElementById('lives-val'),
      announcer: document.getElementById('aria-announcer'),
      overlay: document.getElementById('overlay'),
      gameOverOverlay: document.getElementById('game-over-overlay'),
      finalScore: document.getElementById('final-score'),
      hiMsg: document.getElementById('hi-msg'),
      themeBtn: document.getElementById('theme-toggle')
    };

    this.setupEventListeners();
    this.initTheme();
    this.updateScoreboard();
  }

  initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.storage.themeKey) || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  updateThemeIcon(theme) {
    if (!this.ui.themeBtn) return;
    this.ui.themeBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(CONFIG.storage.themeKey, next);
    this.updateThemeIcon(next);
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.paddle.dx = -CONFIG.paddle.speed;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.paddle.dx = CONFIG.paddle.speed;
      if (e.key === 'Escape') this.togglePause();
      if (this.gameOver && (e.key === 'Enter' || e.key === ' ')) this.restart();
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) this.paddle.dx = 0;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, mouseX - this.paddle.width / 2));
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const touch = e.touches[0];
      const mouseX = (touch.clientX - rect.left) * scaleX;
      this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, mouseX - this.paddle.width / 2));
    }, { passive: false });

    document.getElementById('btn-splash-start').addEventListener('click', () => this.start());
    document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    if (this.ui.themeBtn) this.ui.themeBtn.addEventListener('click', () => this.toggleTheme());
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());

    document.getElementById('btn-left').addEventListener('mousedown', () => this.paddle.dx = -CONFIG.paddle.speed);
    document.getElementById('btn-right').addEventListener('mousedown', () => this.paddle.dx = CONFIG.paddle.speed);
    document.getElementById('btn-left').addEventListener('mouseup', () => this.paddle.dx = 0);
    document.getElementById('btn-right').addEventListener('mouseup', () => this.paddle.dx = 0);
    document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); this.paddle.dx = -CONFIG.paddle.speed; });
    document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); this.paddle.dx = CONFIG.paddle.speed; });
    document.getElementById('btn-left').addEventListener('touchend', () => this.paddle.dx = 0);
    document.getElementById('btn-right').addEventListener('touchend', () => this.paddle.dx = 0);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.running) this.togglePause();
    });

    this.cursor = document.getElementById('custom-cursor');
    if (this.cursor) {
      window.addEventListener('mousemove', (e) => {
        this.cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    }
  }

  updateScoreboard() {
    if (this.ui.score) this.ui.score.textContent = this.score.toString().padStart(3, '0');
    if (this.ui.best) this.ui.best.textContent = this.highscore.toString().padStart(3, '0');
  }

  announce(text) {
    if (this.ui.announcer) this.ui.announcer.textContent = text;
  }

  togglePause() {
    if (!this.running || this.gameOver) return;
    this.paused = !this.paused;
    this.ui.overlay.classList.toggle('hidden', !this.paused);
    this.announce(this.paused ? "Game Paused" : "Game Resumed");
  }

  start() {
    document.getElementById('screen-splash').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    this.running = true;
    this.resetBall();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resetBall() {
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.speed = CONFIG.ball.initialSpeed;
    
    // Forced vertical launch to avoid immediate flat-line
    const launchAngle = (Math.random() * 0.5 - 0.25); // -14 to +14 degrees
    this.ball.dx = this.ball.speed * Math.sin(launchAngle);
    this.ball.dy = -this.ball.speed * Math.cos(launchAngle);
  }

  restart() {
    this.score = 0;
    this.lives = CONFIG.game.lives;
    this.gameOver = false;
    this.running = true;
    this.updateScoreboard();
    this.ui.gameOverOverlay.classList.add('hidden');
    this.resetBall();
    this.announce("Game Restarted");
  }

  update(dt) {
    if (!this.running || this.paused || this.gameOver) return;

    // Cap dt to prevent tunneling during lag spikes
    const clampedDt = Math.min(dt, 33); 
    const timeScale = clampedDt / 16.67;

    this.paddle.x += this.paddle.dx * timeScale;
    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));

    this.ball.x += this.ball.dx * timeScale;
    this.ball.y += this.ball.dy * timeScale;

    // --- WALL COLLISIONS ---
    
    // Left Wall
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.dx = Math.abs(this.ball.dx);
      // Break horizontal symmetry
      this.ball.dy += (Math.random() - 0.5) * CONFIG.ball.perturbation;
      // Enforce min vertical speed
      if (Math.abs(this.ball.dy) < CONFIG.ball.minVerticalSpeed) {
        this.ball.dy = this.ball.dy >= 0 ? CONFIG.ball.minVerticalSpeed : -CONFIG.ball.minVerticalSpeed;
      }
    } 
    // Right Wall
    else if (this.ball.x + this.ball.radius > this.width) {
      this.ball.x = this.width - this.ball.radius;
      this.ball.dx = -Math.abs(this.ball.dx);
      // Break horizontal symmetry
      this.ball.dy += (Math.random() - 0.5) * CONFIG.ball.perturbation;
      // Enforce min vertical speed
      if (Math.abs(this.ball.dy) < CONFIG.ball.minVerticalSpeed) {
        this.ball.dy = this.ball.dy >= 0 ? CONFIG.ball.minVerticalSpeed : -CONFIG.ball.minVerticalSpeed;
      }
    }

    // Top Wall - FIXED STICKING
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      // Ensure the bounce is strong enough to leave the collision zone
      this.ball.dy = Math.max(CONFIG.ball.minVerticalSpeed, Math.abs(this.ball.dy));
    }

    // --- PADDLE COLLISION (Arcade Steering) ---
    if (
      this.ball.y + this.ball.radius > this.paddle.y &&
      this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.width
    ) {
      this.ball.y = this.paddle.y - this.ball.radius;
      
      const paddleCenterX = this.paddle.x + this.paddle.width / 2;
      const relativeHitPos = (this.ball.x - paddleCenterX) / (this.paddle.width / 2);
      const bounceAngle = relativeHitPos * CONFIG.ball.maxBounceAngle;
      
      // Rebuild normalized velocity
      this.ball.dx = this.ball.speed * Math.sin(bounceAngle);
      this.ball.dy = -this.ball.speed * Math.cos(bounceAngle);
      
      // Final safety clamp for dy
      if (Math.abs(this.ball.dy) < CONFIG.ball.minVerticalSpeed) {
        this.ball.dy = -CONFIG.ball.minVerticalSpeed;
      }

      this.score++;
      this.updateScoreboard();
      this.announce(`Score ${this.score}`);

      if (this.score % CONFIG.game.scoreThreshold === 0) {
        this.ball.speed = Math.min(CONFIG.ball.maxSpeed, this.ball.speed + CONFIG.ball.speedIncrement);
      }
    }

    if (this.ball.y + this.ball.radius > this.height) {
      this.lives--;
      this.announce(`Life lost. ${this.lives} remaining`);
      if (this.lives <= 0) {
        this.triggerGameOver();
      } else {
        this.resetBall();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.running = false;
    if (this.score > this.highscore) {
      this.highscore = this.score;
      localStorage.setItem(CONFIG.storage.highscoreKey, this.highscore);
      this.ui.hiMsg.classList.remove('hidden');
    } else {
      this.ui.hiMsg.classList.add('hidden');
    }
    this.ui.finalScore.textContent = this.score;
    this.ui.gameOverOverlay.classList.remove('hidden');
    this.updateScoreboard();
    this.announce(`Game Over. Final Score ${this.score}`);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--s1').trim();
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 6);
    this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paddle').trim();
    this.ctx.fill();
    this.ctx.closePath();

    if (this.ui.lives) this.ui.lives.textContent = this.lives;
  }

  gameLoop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.draw();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.onload = () => {
  new Game();
};
