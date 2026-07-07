// ─────────────────────────────────────────────────────────────
// CYBER RUNNER — GAME LOGIC
// ─────────────────────────────────────────────────────────────

// Sound Synthesis using Web Audio API
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
    this.tempo = 140; // BPM
    this.currentStep = 0;
    
    // Synthwave Bassline Notes (in Hz)
    // A1, A1, C2, C2, G1, G1, D2, D2
    this.bassline = [55.00, 55.00, 65.41, 65.41, 49.00, 49.00, 73.42, 73.42];
    this.melody = [220, 261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    const muteBtn = document.getElementById('btnMute');
    if (this.muted) {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      muteBtn.classList.add('font-neon-pink');
      this.stopBgm();
    } else {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      muteBtn.classList.remove('font-neon-pink');
      this.init();
      this.startBgm();
    }
    return this.muted;
  }

  startBgm() {
    if (this.muted || !this.ctx) return;
    this.stopBgm();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const stepTime = 60 / this.tempo / 2; // eighth notes
    let nextTime = this.ctx.currentTime;

    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const time = this.ctx.currentTime;

      if (time >= nextTime - 0.05) {
        this.playBassStep(this.bassline[this.currentStep % this.bassline.length], nextTime);
        
        // Add random melody overlays on some steps
        if (this.currentStep % 4 === 0 && Math.random() > 0.4) {
          this.playMelodyStep(this.melody[Math.floor(Math.random() * this.melody.length)], nextTime);
        }
        
        this.currentStep++;
        nextTime += stepTime;
      }
    }, 25);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playBassStep(freq, time) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + 0.1);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  playMelodyStep(freq, time) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const feedback = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    delay.delayTime.setValueAtTime(0.15, time);
    feedback.gain.setValueAtTime(0.3, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    // Wire up echo/delay
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  playJump() {
    if (this.muted || !this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(750, time + 0.15);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  playSlide() {
    if (this.muted || !this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.linearRampToValueAtTime(120, time + 0.22);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.23);
  }

  playCollect() {
    if (this.muted || !this.ctx) return;
    const time = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, time); // C5
    osc1.frequency.setValueAtTime(783.99, time + 0.08); // G5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, time); // C6
    osc2.frequency.exponentialRampToValueAtTime(1318.51, time + 0.15); // E6

    gain.gain.setValueAtTime(0.10, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.22);
    osc2.stop(time + 0.22);
  }

  playDash() {
    if (this.muted || !this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(1500, time + 0.35);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.36);
  }

  playCrash() {
    if (this.muted || !this.ctx) return;
    const time = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, time);
    filter.frequency.exponentialRampToValueAtTime(10, time + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.5);
  }
}

// ─────────────────────────────────────────────────────────────
// GAME STATE & OBJECTS
// ─────────────────────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sound = new SoundController();

// Config / Theme Settings
const THEMES = {
  neon: {
    player: '#00f3ff',
    obstacle: '#ff007f',
    grid: '#9d00ff',
    accent: '#ffe600',
    bgStart: '#06060c',
    bgEnd: '#0b0b18'
  },
  cyan: {
    player: '#ffe600',
    obstacle: '#00f3ff',
    grid: '#00557f',
    accent: '#ff007f',
    bgStart: '#02090f',
    bgEnd: '#051b29'
  },
  matrix: {
    player: '#39ff14',
    obstacle: '#00aa00',
    grid: '#003300',
    accent: '#39ff14',
    bgStart: '#000000',
    bgEnd: '#000800'
  }
};

const DIFFICULTY = {
  easy: { speed: 6, obstacleInterval: 2500, scoreMult: 0.5 },
  normal: { speed: 8.5, obstacleInterval: 1800, scoreMult: 1.0 },
  hard: { speed: 12, obstacleInterval: 1200, scoreMult: 2.0 }
};

// Game Variables
let gameState = 'START'; // START, PLAYING, PAUSED, GAMEOVER
let currentTheme = THEMES.neon;
let currentDifficulty = DIFFICULTY.normal;

let score = 0;
let distance = 0;
let multiplier = 1.0;
let highScore = parseInt(localStorage.getItem('cyber_runner_highscore') || '0', 10);

let lastTime = 0;
let speedFactor = 1.0;
let distanceCounter = 0;

// Player Physics
const player = {
  x: 100,
  y: 0, // 0 is grounded on road
  width: 50,
  height: 60,
  vy: 0,
  gravity: 1600, // px/s^2
  jumpForce: -620,
  isGrounded: true,
  isSliding: false,
  slideTimer: 0,
  slideDuration: 0.65, // seconds
  isDashing: false,
  dashTimer: 0,
  dashDuration: 0.35,
  dashMeter: 0, // 0 to 100
  dashReady: false,
  
  // Custom trail particles
  particles: []
};

// Road Layout (Bottom of canvas)
const road = {
  y: 280, // road top surface
  height: 170,
  speed: 0
};

// Pools of items
let obstacles = [];
let collectibles = [];
let explosions = [];
let gridLines = [];

// Horizon & Perspective Settings
const vanishingPoint = { x: 400, y: road.y - 110 };

// Spawning intervals
let obstacleSpawnTimer = 0;
let collectibleSpawnTimer = 0;

// Set high score on menu initially
document.getElementById('menuHighScore').innerText = String(highScore).padStart(6, '0');

// ─────────────────────────────────────────────────────────────
// INPUT HANDLERS
// ─────────────────────────────────────────────────────────────

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  if (gameState === 'PLAYING') {
    if (e.code === 'ArrowUp' || e.code === 'Space') {
      triggerJump();
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      triggerSlide();
    }
    if (e.code === 'KeyD' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      triggerDash();
    }
    if (e.code === 'KeyP') {
      togglePause();
    }
  } else if (gameState === 'START' && e.code === 'Space') {
    startGame();
  } else if (gameState === 'GAMEOVER' && e.code === 'Space') {
    startGame();
  }
  
  if (e.code === 'KeyM') {
    sound.toggleMute();
  }

  // Prevent browser scrolling
  if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Trigger jump action
function triggerJump() {
  if (player.isGrounded && !player.isSliding && !player.isDashing) {
    player.vy = player.jumpForce;
    player.isGrounded = false;
    sound.playJump();
    
    // Spawn burst jump sparks
    spawnSparks(player.x + player.width/2, road.y + player.y, 8, currentTheme.player);
  }
}

// Trigger slide action
function triggerSlide() {
  if (player.isGrounded && !player.isDashing && !player.isSliding) {
    player.isSliding = true;
    player.slideTimer = player.slideDuration;
    sound.playSlide();
  }
}

// Trigger dash action
function triggerDash() {
  if (player.dashReady && !player.isDashing) {
    player.isDashing = true;
    player.dashTimer = player.dashDuration;
    player.dashMeter = 0;
    player.dashReady = false;
    sound.playDash();
    
    // Shake screen slightly
    shakeScreen();
    // Spawn massive particle burst
    spawnSparks(player.x + player.width, road.y + player.y - player.height/2, 20, currentTheme.player);
    updateDashUI();
  }
}

// Mobile buttons
document.getElementById('touchJump').addEventListener('click', triggerJump);
document.getElementById('touchSlide').addEventListener('click', triggerSlide);
document.getElementById('touchDash').addEventListener('click', triggerDash);

// Prevent zoom/scrolling on mobile double tap
document.querySelectorAll('.touch-btn').forEach(btn => {
  btn.addEventListener('touchend', (e) => e.preventDefault());
});

// Setup Menu Navigation Clicks
document.getElementById('btnStartGame').addEventListener('click', () => {
  sound.init();
  startGame();
});
document.getElementById('btnPause').addEventListener('click', togglePause);
document.getElementById('btnMute').addEventListener('click', () => sound.toggleMute());
document.getElementById('btnResume').addEventListener('click', togglePause);
document.getElementById('btnRestart').addEventListener('click', startGame);
document.getElementById('btnRestartFromPause').addEventListener('click', () => {
  togglePause();
  startGame();
});
document.getElementById('btnMainMenu').addEventListener('click', showMainMenu);
document.getElementById('btnQuit').addEventListener('click', () => {
  togglePause();
  showMainMenu();
});

// Settings Selection Toggle
document.getElementById('difficultyGroup').addEventListener('click', (e) => {
  if (e.target.dataset.value) {
    document.querySelectorAll('#difficultyGroup button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentDifficulty = DIFFICULTY[e.target.dataset.value];
  }
});

document.getElementById('colorGroup').addEventListener('click', (e) => {
  if (e.target.dataset.color) {
    document.querySelectorAll('#colorGroup button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentTheme = THEMES[e.target.dataset.color];
  }
});

// ─────────────────────────────────────────────────────────────
// GAME ENGINE METHODS
// ─────────────────────────────────────────────────────────────

function startGame() {
  // Clear overlays
  document.getElementById('startMenu').classList.remove('active');
  document.getElementById('pauseMenu').classList.remove('active');
  document.getElementById('gameOverMenu').classList.remove('active');

  // Reset metrics
  score = 0;
  distance = 0;
  multiplier = 1.0;
  distanceCounter = 0;
  speedFactor = 1.0;

  // Reset player
  player.y = 0;
  player.vy = 0;
  player.isGrounded = true;
  player.isSliding = false;
  player.slideTimer = 0;
  player.isDashing = false;
  player.dashTimer = 0;
  player.dashMeter = 0;
  player.dashReady = false;
  player.particles = [];

  // Reset arrays
  obstacles = [];
  collectibles = [];
  explosions = [];
  initGridLines();

  // Reset timers
  obstacleSpawnTimer = currentDifficulty.obstacleInterval * 0.5; // give player a second
  collectibleSpawnTimer = 800;

  // UI Setup
  updateDashUI();
  updateHUD();

  // Start sound loop
  sound.init();
  sound.startBgm();

  gameState = 'PLAYING';
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function showMainMenu() {
  document.getElementById('startMenu').classList.add('active');
  document.getElementById('pauseMenu').classList.remove('active');
  document.getElementById('gameOverMenu').classList.remove('active');
  
  gameState = 'START';
  sound.stopBgm();
  
  // Refresh high score just in case
  highScore = parseInt(localStorage.getItem('cyber_runner_highscore') || '0', 10);
  document.getElementById('menuHighScore').innerText = String(highScore).padStart(6, '0');
  
  // Render clean background menu screen
  lastTime = performance.now();
  drawStartScreenBg();
}

function togglePause() {
  if (gameState === 'PLAYING') {
    gameState = 'PAUSED';
    document.getElementById('pauseMenu').classList.add('active');
    sound.stopBgm();
  } else if (gameState === 'PAUSED') {
    gameState = 'PLAYING';
    document.getElementById('pauseMenu').classList.remove('active');
    lastTime = performance.now();
    sound.startBgm();
    requestAnimationFrame(gameLoop);
  }
}

function gameOver(reason) {
  gameState = 'GAMEOVER';
  document.getElementById('gameOverMenu').classList.add('active');
  document.getElementById('gameOverReason').innerText = reason;
  
  sound.stopBgm();
  sound.playCrash();

  // Handle final high scores
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyber_runner_highscore', highScore);
  }

  document.getElementById('gameOverScore').innerText = String(Math.floor(score)).padStart(6, '0');
  document.getElementById('gameOverDistance').innerText = Math.floor(distance) + 'm';
  document.getElementById('gameOverHighScore').innerText = String(highScore).padStart(6, '0');

  // Trigger massive screen explosion effect
  spawnSparks(player.x + player.width/2, road.y + player.y - player.height/2, 45, currentTheme.obstacle);
}

// Game loop
function gameLoop(time) {
  if (gameState !== 'PLAYING') return;

  const dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt to avoid crazy jumps
  lastTime = time;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

// ─────────────────────────────────────────────────────────────
// GAME UPDATE LOGIC
// ─────────────────────────────────────────────────────────────

function update(dt) {
  // Speed escalates with distance run
  speedFactor = 1.0 + (distance / 400); // speed increases 100% every 400m
  speedFactor = Math.min(speedFactor, 2.2); // cap speed increase

  const currentSpeed = currentDifficulty.speed * speedFactor * 60; // scale up to pixels/sec
  road.speed = currentSpeed;

  // Calculate distance
  distanceCounter += currentSpeed * dt;
  if (distanceCounter >= 10) {
    distance += 1;
    distanceCounter -= 10;
    
    // Gain regular passive score
    score += 5 * currentDifficulty.scoreMult * multiplier;
  }

  // Update Player physics
  updatePlayerPhysics(dt, currentSpeed);

  // Spawn System
  updateSpawns(dt);

  // Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= currentSpeed * dt;

    // Check collision
    if (checkCollision(player, obs)) {
      if (player.isDashing) {
        // Destroy obstacle!
        sound.playCollect();
        spawnSparks(obs.x + obs.width/2, obs.y + obs.height/2, 15, currentTheme.obstacle);
        obstacles.splice(i, 1);
        score += 250 * currentDifficulty.scoreMult;
        continue;
      } else {
        gameOver(`Grid error: collision with security_${obs.type}.`);
        return;
      }
    }

    // Remove offscreen
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      // DODGED! Increase score & multiplier slightly
      score += 50 * currentDifficulty.scoreMult * multiplier;
      multiplier = Math.min(multiplier + 0.1, 5.0);
    }
  }

  // Update Collectibles
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const col = collectibles[i];
    col.x -= currentSpeed * dt;

    // Check pickup
    if (checkCollision(player, col)) {
      sound.playCollect();
      spawnSparks(col.x + col.width/2, col.y + col.height/2, 12, currentTheme.accent);
      collectibles.splice(i, 1);

      // Add energy / fill Dash meter
      player.dashMeter = Math.min(player.dashMeter + 12, 100);
      if (player.dashMeter >= 100) {
        player.dashReady = true;
      }
      updateDashUI();

      // Bonus points
      score += 150 * currentDifficulty.scoreMult * multiplier;
      continue;
    }

    // Remove offscreen
    if (col.x + col.width < 0) {
      collectibles.splice(i, 1);
    }
  }

  // Update Particles (Player trails & Sparks)
  updateParticles(dt);

  // Update road lines offset
  roadOffset = (roadOffset + currentSpeed * dt) % 40;

  // Update HUD values
  updateHUD();
}

let roadOffset = 0;

function updatePlayerPhysics(dt, currentSpeed) {
  // Jump gravity
  if (!player.isGrounded) {
    player.vy += player.gravity * dt;
    player.y += player.vy * dt;

    if (player.y >= 0) {
      player.y = 0;
      player.vy = 0;
      player.isGrounded = true;
      // Landing sparks
      spawnSparks(player.x + player.width/2, road.y, 5, currentTheme.player);
    }
  }

  // Slide timer
  if (player.isSliding) {
    player.slideTimer -= dt;
    if (player.slideTimer <= 0) {
      player.isSliding = false;
    }
  }

  // Dash timer
  if (player.isDashing) {
    player.dashTimer -= dt;
    if (player.dashTimer <= 0) {
      player.isDashing = false;
    }
  }

  // Running particles trail
  if (player.isGrounded && Math.random() < (player.isDashing ? 0.8 : 0.35)) {
    player.particles.push({
      x: player.x + 5,
      y: road.y - (player.isSliding ? 10 : 3),
      vx: -(currentSpeed * 0.2 + Math.random() * 50),
      vy: -Math.random() * 60,
      size: Math.random() * 4 + 2,
      life: 0.45,
      color: player.isDashing ? currentTheme.accent : currentTheme.player
    });
  }
}

function updateSpawns(dt) {
  // Obstacles spawning
  obstacleSpawnTimer -= dt * 1000;
  if (obstacleSpawnTimer <= 0) {
    spawnObstacle();
    // randomize next timer slightly
    obstacleSpawnTimer = currentDifficulty.obstacleInterval * (0.8 + Math.random() * 0.4);
  }

  // Collectibles spawning
  collectibleSpawnTimer -= dt * 1000;
  if (collectibleSpawnTimer <= 0) {
    spawnCollectible();
    collectibleSpawnTimer = 1000 + Math.random() * 1500;
  }
}

function spawnObstacle() {
  const types = ['laser', 'drone', 'firewall'];
  // Random selection based on difficulty
  let type = 'laser';
  const rand = Math.random();
  if (currentDifficulty === DIFFICULTY.easy) {
    type = rand > 0.65 ? 'drone' : 'laser';
  } else {
    if (rand < 0.45) type = 'laser';
    else if (rand < 0.80) type = 'drone';
    else type = 'firewall';
  }

  let obs = {
    x: 820,
    width: 0,
    height: 0,
    y: 0,
    type: type
  };

  if (type === 'laser') {
    obs.width = 24;
    obs.height = 40;
    obs.y = road.y - obs.height; // placed on road surface
  } else if (type === 'drone') {
    obs.width = 30;
    obs.height = 30;
    obs.y = road.y - 75; // high in the air, player must slide under or dash
  } else if (type === 'firewall') {
    obs.width = 35;
    obs.height = 90;
    obs.y = road.y - obs.height; // tall barrier
  }

  obstacles.push(obs);
}

function spawnCollectible() {
  // Ensure we don't spawn right on top of a firewall
  collectibles.push({
    x: 820,
    y: road.y - 30 - Math.random() * 70, // random height
    width: 20,
    height: 20,
    pulseTime: 0
  });
}

function spawnSparks(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 140;
    explosions.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 3 + 2,
      life: 0.5 + Math.random() * 0.4,
      color: color
    });
  }
}

function updateParticles(dt) {
  // Player trails
  for (let i = player.particles.length - 1; i >= 0; i--) {
    const p = player.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      player.particles.splice(i, 1);
    }
  }

  // Sparks explosions
  for (let i = explosions.length - 1; i >= 0; i--) {
    const s = explosions[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 200 * dt; // gravity pulls sparks down
    s.life -= dt;
    if (s.life <= 0) {
      explosions.splice(i, 1);
    }
  }
}

// Box collision checker
function checkCollision(p, obj) {
  const pBox = {
    x: p.x,
    y: road.y + p.y - (p.isSliding ? p.height * 0.5 : p.height),
    width: p.width,
    height: p.isSliding ? p.height * 0.5 : p.height
  };

  return (
    pBox.x < obj.x + obj.width &&
    pBox.x + pBox.width > obj.x &&
    pBox.y < obj.y + obj.height &&
    pBox.y + pBox.height > obj.y
  );
}

// ─────────────────────────────────────────────────────────────
// INTERFACE STATE UPDATES
// ─────────────────────────────────────────────────────────────

function updateHUD() {
  document.getElementById('hudScore').innerText = String(Math.floor(score)).padStart(6, '0');
  document.getElementById('hudDistance').innerText = Math.floor(distance) + 'm';
  document.getElementById('hudMultiplier').innerText = 'x' + multiplier.toFixed(1);
}

function updateDashUI() {
  const fill = document.getElementById('dashFill');
  const readyText = document.getElementById('dashReadyText');
  fill.style.width = player.dashMeter + '%';
  
  if (player.dashReady) {
    readyText.classList.add('active');
    fill.style.boxShadow = '0 0 10px #ffe600';
  } else {
    readyText.classList.remove('active');
    fill.style.boxShadow = '0 0 8px rgba(0, 243, 255, 0.5)';
  }
}

// Simple Screen shake
let shakeTimer = 0;
function shakeScreen() {
  shakeTimer = 0.35;
}

// ─────────────────────────────────────────────────────────────
// GRAPHICS RENDERING
// ─────────────────────────────────────────────────────────────

function draw() {
  // Clear canvas
  ctx.fillStyle = currentTheme.bgStart;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background gradients
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, currentTheme.bgStart);
  gradient.addColorStop(0.62, currentTheme.bgEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply screen shake
  ctx.save();
  if (shakeTimer > 0) {
    const shakeAmount = 6 * Math.random();
    ctx.translate(Math.random() * shakeAmount - shakeAmount/2, Math.random() * shakeAmount - shakeAmount/2);
    shakeTimer -= 0.016; // 60fps estimate
  }

  // Draw background stars
  drawStars();

  // Draw distant neon mountains & city skyline
  drawSkyline();

  // Draw retro wireframe sun
  drawSynthwaveSun();

  // Draw perspective highway grid road
  drawGridRoad();

  // Draw Player
  drawPlayer();

  // Draw obstacles
  drawObstacles();

  // Draw collectibles
  drawCollectibles();

  // Draw explosions/sparks
  drawExplosions();

  ctx.restore();
}

// Draw starting screen background (non-playing)
function drawStartScreenBg() {
  ctx.fillStyle = THEMES.neon.bgStart;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawSkyline();
  drawSynthwaveSun();
  drawGridRoad();
}

function initGridLines() {
  // Grid lines initialization
  gridLines = [];
  for (let y = road.y; y < canvas.height; y += 22) {
    gridLines.push(y);
  }
}

// Stars generator based on coordinates
let starsArray = [];
for (let i = 0; i < 40; i++) {
  starsArray.push({
    x: Math.random() * canvas.width,
    y: Math.random() * (road.y - 120),
    size: Math.random() * 1.5 + 0.5,
    twinkle: Math.random()
  });
}

function drawStars() {
  ctx.fillStyle = '#ffffff';
  starsArray.forEach(star => {
    star.twinkle += 0.01;
    const alpha = 0.35 + Math.sin(star.twinkle) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1.0;
}

function drawSkyline() {
  ctx.strokeStyle = currentTheme.grid;
  ctx.lineWidth = 1;
  
  // Neon mountains line path
  ctx.beginPath();
  ctx.moveTo(0, road.y - 30);
  ctx.lineTo(80, road.y - 80);
  ctx.lineTo(160, road.y - 45);
  ctx.lineTo(240, road.y - 110);
  ctx.lineTo(310, road.y - 65);
  ctx.lineTo(440, road.y - 125);
  ctx.lineTo(550, road.y - 50);
  ctx.lineTo(650, road.y - 95);
  ctx.lineTo(800, road.y - 30);
  ctx.stroke();

  // Draw some city block shadows
  ctx.fillStyle = 'rgba(11, 11, 24, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, road.y);
  ctx.lineTo(150, road.y - 35);
  ctx.lineTo(200, road.y - 35);
  ctx.lineTo(220, road.y - 55);
  ctx.lineTo(260, road.y - 55);
  ctx.lineTo(290, road.y - 25);
  ctx.lineTo(480, road.y - 45);
  ctx.lineTo(520, road.y - 25);
  ctx.lineTo(600, road.y - 65);
  ctx.lineTo(660, road.y - 35);
  ctx.lineTo(800, road.y);
  ctx.lineTo(800, road.y);
  ctx.fill();
}

function drawSynthwaveSun() {
  const sunRadius = 65;
  const sunX = canvas.width / 2;
  const sunY = road.y - 10;
  
  // Radial sunset glow
  const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY);
  sunGrad.addColorStop(0, '#ff007f'); // Neon Pink
  sunGrad.addColorStop(0.65, '#ffaa00'); // Orange
  sunGrad.addColorStop(1, '#ffe600'); // Neon Yellow

  ctx.fillStyle = sunGrad;
  
  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = 12;
  
  // Cutouts on retro sun
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, Math.PI, 0, false);
  ctx.fill();
  
  ctx.shadowBlur = 0; // reset shadow glow
  
  // Dark overlay cuts
  ctx.fillStyle = currentTheme.bgStart;
  for (let i = 0; i < 8; i++) {
    const yCut = sunY - i * 8 - 4;
    const thickness = 2.5 + i * 0.45;
    if (yCut > sunY - sunRadius) {
      ctx.fillRect(sunX - sunRadius - 10, yCut, sunRadius * 2 + 20, thickness);
    }
  }
}

function drawGridRoad() {
  // Fill the road highway base
  ctx.fillStyle = 'rgba(6, 6, 12, 0.75)';
  ctx.fillRect(0, road.y, canvas.width, road.height);

  ctx.strokeStyle = currentTheme.grid;
  ctx.lineWidth = 2.5;

  // 1. Perspective Vertical Grid lines
  const linesCount = 14;
  for (let i = 0; i <= linesCount; i++) {
    const progress = i / linesCount;
    // Stretch from vanishing point outward
    const xBottom = progress * canvas.width * 1.6 - (canvas.width * 0.3);
    
    ctx.beginPath();
    ctx.moveTo(vanishingPoint.x, vanishingPoint.y);
    ctx.lineTo(xBottom, canvas.height);
    ctx.stroke();
  }

  // 2. Horizontal Scrolling Grid lines
  ctx.lineWidth = 1.5;
  const gridLineSpeed = road.speed * 0.12; // slow down for visual feel
  
  // Scroll and draw perspective depth lines
  for (let i = 0; i < gridLines.length; i++) {
    // Scroll downward
    if (gameState === 'PLAYING') {
      gridLines[i] += gridLineSpeed * 0.016; // 60fps frame delta approx
    }
    
    if (gridLines[i] > canvas.height) {
      gridLines[i] = road.y; // Recycle line
    }

    const y = gridLines[i];
    // Calculate color opacity depending on depth (closer lines are brighter)
    const factor = (y - road.y) / road.height;
    ctx.strokeStyle = currentTheme.grid;
    ctx.globalAlpha = Math.max(factor * 0.85, 0.1);
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // Draw road side neon borders
  ctx.strokeStyle = currentTheme.player;
  ctx.lineWidth = 4;
  ctx.shadowColor = currentTheme.player;
  ctx.shadowBlur = 8;
  
  ctx.beginPath();
  // Left border
  ctx.moveTo(0, road.y);
  ctx.lineTo(25, canvas.height);
  // Right border
  ctx.moveTo(canvas.width, road.y);
  ctx.lineTo(canvas.width - 25, canvas.height);
  ctx.stroke();
  
  ctx.shadowBlur = 0; // reset
}

function drawPlayer() {
  // Draw player trails
  player.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 0.45;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;

  ctx.save();
  ctx.translate(player.x, road.y + player.y);

  // Check state to adjust bounding shape
  const drawHeight = player.isSliding ? player.height * 0.5 : player.height;
  const yOffset = -drawHeight;

  // Add glow to player
  ctx.shadowColor = player.isDashing ? currentTheme.accent : currentTheme.player;
  ctx.shadowBlur = player.isDashing ? 15 : 8;

  // Vector graphics player silhouette (Futuristic Runner/Bike)
  ctx.fillStyle = player.isDashing ? currentTheme.accent : currentTheme.player;
  
  ctx.beginPath();
  if (player.isSliding) {
    // Lean forward low profile
    ctx.moveTo(0, 0);
    ctx.lineTo(5, -15);
    ctx.lineTo(20, -22);
    ctx.lineTo(45, -20);
    ctx.lineTo(50, -5);
    ctx.lineTo(40, 0);
  } else {
    // Standard sleek runner silhouette
    ctx.moveTo(10, 0); // back wheel/thrust
    ctx.lineTo(5, -25);
    ctx.lineTo(20, -50); // shoulders
    ctx.lineTo(38, -58); // helmet
    ctx.lineTo(46, -46);
    ctx.lineTo(36, -30); // body/bike center
    ctx.lineTo(48, -12); // nose
    ctx.lineTo(42, 0); // bottom/hover panel
  }
  ctx.closePath();
  ctx.fill();

  // Draw visor highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (player.isSliding) {
    ctx.arc(38, -18, 3, 0, Math.PI * 2);
  } else {
    ctx.arc(36, -50, 4, 0, Math.PI * 2);
  }
  ctx.fill();

  // Draw jets flame / exhaust particles
  ctx.fillStyle = currentTheme.accent;
  ctx.beginPath();
  const flameSize = 10 + Math.random() * 12;
  if (player.isSliding) {
    ctx.moveTo(0, -12);
    ctx.lineTo(-flameSize, -8);
    ctx.lineTo(0, -4);
  } else {
    ctx.moveTo(5, -24);
    ctx.lineTo(-flameSize, -18);
    ctx.lineTo(8, -10);
  }
  ctx.closePath();
  ctx.fill();

  // Draw cyber dash shield barrier around player
  if (player.isDashing) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = currentTheme.accent;
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.arc(player.width/2, yOffset + drawHeight/2, player.height * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
  ctx.shadowBlur = 0; // reset
}

function drawObstacles() {
  obstacles.forEach(obs => {
    ctx.save();
    ctx.shadowColor = currentTheme.obstacle;
    ctx.shadowBlur = 10;
    ctx.fillStyle = currentTheme.obstacle;

    if (obs.type === 'laser') {
      // Draw neon fence post
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      // Bright core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 8, obs.y + 2, 8, obs.height - 4);
    } 
    else if (obs.type === 'drone') {
      // Draw floating security drone
      ctx.beginPath();
      ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, 0, Math.PI * 2);
      ctx.fill();

      // Drone scanner light cone down to road
      const coneGradient = ctx.createLinearGradient(0, obs.y, 0, road.y);
      coneGradient.addColorStop(0, 'rgba(255, 0, 127, 0.45)');
      coneGradient.addColorStop(1, 'rgba(255, 0, 127, 0)');
      ctx.fillStyle = coneGradient;
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width/2 - 2, obs.y + obs.height);
      ctx.lineTo(obs.x - 30, road.y);
      ctx.lineTo(obs.x + obs.width + 30, road.y);
      ctx.closePath();
      ctx.fill();

      // Bright red drone core eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, 4, 0, Math.PI * 2);
      ctx.fill();
    } 
    else if (obs.type === 'firewall') {
      // Draw tall hacker barrier grid
      ctx.globalAlpha = 0.8;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.globalAlpha = 1.0;
      
      // Wireframe border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      // Warning text code glitch lines
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px monospace';
      ctx.fillText('BLOCKED', obs.x + 2, obs.y + 15);
      ctx.fillText('0101101', obs.x + 2, obs.y + 40);
      ctx.fillText('FIREWALL', obs.x + 2, obs.y + 65);
    }

    ctx.restore();
  });
  ctx.shadowBlur = 0;
}

function drawCollectibles() {
  collectibles.forEach(col => {
    col.pulseTime += 0.05;
    const pulseOffset = Math.sin(col.pulseTime) * 4;

    ctx.save();
    ctx.shadowColor = currentTheme.accent;
    ctx.shadowBlur = 8;
    ctx.fillStyle = currentTheme.accent;

    // Draw diamond shape
    ctx.beginPath();
    ctx.moveTo(col.x + col.width/2, col.y + pulseOffset);
    ctx.lineTo(col.x + col.width, col.y + col.height/2 + pulseOffset);
    ctx.lineTo(col.x + col.width/2, col.y + col.height + pulseOffset);
    ctx.lineTo(col.x, col.y + col.height/2 + pulseOffset);
    ctx.closePath();
    ctx.fill();

    // Core white center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(col.x + col.width/2, col.y + col.height/2 + pulseOffset, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
  ctx.shadowBlur = 0;
}

function drawExplosions() {
  explosions.forEach(s => {
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.life;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  ctx.globalAlpha = 1.0;
}

// Run initial background menu grid on page load
initGridLines();
drawStartScreenBg();
