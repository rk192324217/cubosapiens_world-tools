'use strict';

/* ═══════════════════════════════════════════════════
   GAME CONSTANTS & STATE
═══════════════════════════════════════════════════ */
const SAVE_KEY = 'cubosapiens_arena_v1';
const canvas = document.getElementById('gc');
const ctx = canvas.getContext('2d');

// Fixed logical resolution for consistency, scaled via CSS
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 800;
canvas.width = LOGICAL_WIDTH;
canvas.height = LOGICAL_HEIGHT;

const COLORS = {
  bg: '#0a0c10',
  player: '#00cfff', // Neon Cyan
  enemyBasic: '#ff2d78', // Neon Pink
  enemyFast: '#ff6b00', // Neon Orange
  projectile: '#00ff88', // Neon Green
  particle: '#ffffff',
  trail: 'rgba(0, 207, 255, 0.2)'
};

let state = {
  screen: 'splash', // splash, menu, controls, game, over
  paused: false,
  score: 0,
  bestScore: 0,
  difficulty: 'easy',
  multiplier: 1,
  frames: 0,
  lastTime: 0,
  spawnRate: 100 // Frames between spawns
};

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;

/* ═══════════════════════════════════════════════════
   INPUT HANDLING (Desktop & Mobile)
═══════════════════════════════════════════════════ */
const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false, ' ': false };
const mouse = { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2, down: false };
const joysticks = {
  move: { active: false, dx: 0, dy: 0, id: null },
  aim:  { active: false, dx: 0, dy: 0, id: null }
};

// Keyboard
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (keys.hasOwnProperty(k)) keys[k] = true;
  if (k === 'escape') togglePause();
});
window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (keys.hasOwnProperty(k)) keys[k] = false;
});

// Mouse
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top) * scaleY;
});
canvas.addEventListener('mousedown', e => { mouse.down = true; });
window.addEventListener('mouseup', e => { mouse.down = false; });

// Touch / Joysticks
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function setupJoysticks() {
  const zoneLeft = document.getElementById('joystick-left');
  const zoneRight = document.getElementById('joystick-right');
  const baseLeft = document.getElementById('jb-left');
  const stickLeft = document.getElementById('js-left');
  const baseRight = document.getElementById('jb-right');
  const stickRight = document.getElementById('js-right');

  const maxDist = 40;

  function handleTouchStart(e, isLeft) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const joy = isLeft ? joysticks.move : joysticks.aim;
      if (!joy.active) {
        joy.active = true;
        joy.id = t.identifier;
        
        const base = isLeft ? baseLeft : baseRight;
        const rect = (isLeft ? zoneLeft : zoneRight).getBoundingClientRect();
        
        base.style.left = `${t.clientX - rect.left}px`;
        base.style.top = `${t.clientY - rect.top}px`;
        base.classList.remove('hidden');
        updateStick(t, isLeft);
      }
    }
  }

  function handleTouchMove(e, isLeft) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const joy = isLeft ? joysticks.move : joysticks.aim;
      if (joy.active && joy.id === t.identifier) {
        updateStick(t, isLeft);
      }
    }
  }

  function handleTouchEnd(e, isLeft) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const joy = isLeft ? joysticks.move : joysticks.aim;
      if (joy.active && joy.id === t.identifier) {
        joy.active = false;
        joy.id = null;
        joy.dx = 0;
        joy.dy = 0;
        const base = isLeft ? baseLeft : baseRight;
        const stick = isLeft ? stickLeft : stickRight;
        base.classList.add('hidden');
        stick.style.transform = `translate(-50%, -50%)`;
      }
    }
  }

  function updateStick(t, isLeft) {
    const joy = isLeft ? joysticks.move : joysticks.aim;
    const base = isLeft ? baseLeft : baseRight;
    const stick = isLeft ? stickLeft : stickRight;
    
    // Get base position relative to viewport
    const baseRect = base.getBoundingClientRect();
    const baseX = baseRect.left + baseRect.width / 2;
    const baseY = baseRect.top + baseRect.height / 2;
    
    let dx = t.clientX - baseX;
    let dy = t.clientY - baseY;
    const dist = Math.hypot(dx, dy);
    
    // Normalize logic
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    joy.dx = dx / maxDist; // -1 to 1
    joy.dy = dy / maxDist; // -1 to 1
    
    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  zoneLeft.addEventListener('touchstart', e => handleTouchStart(e, true), {passive: false});
  zoneLeft.addEventListener('touchmove', e => handleTouchMove(e, true), {passive: false});
  zoneLeft.addEventListener('touchend', e => handleTouchEnd(e, true), {passive: false});
  zoneLeft.addEventListener('touchcancel', e => handleTouchEnd(e, true), {passive: false});

  zoneRight.addEventListener('touchstart', e => handleTouchStart(e, false), {passive: false});
  zoneRight.addEventListener('touchmove', e => handleTouchMove(e, false), {passive: false});
  zoneRight.addEventListener('touchend', e => handleTouchEnd(e, false), {passive: false});
  zoneRight.addEventListener('touchcancel', e => handleTouchEnd(e, false), {passive: false});
}

if (isMobile) setupJoysticks();

/* ═══════════════════════════════════════════════════
   CLASSES
═══════════════════════════════════════════════════ */
class Player {
  constructor() {
    this.x = LOGICAL_WIDTH / 2;
    this.radius = 20;
    this.y = LOGICAL_HEIGHT - this.radius - 20;
    this.speed = 8;
    this.hp = 3;
    this.color = COLORS.player;
    this.angle = -Math.PI / 2; // Always facing up
    this.cooldown = 0;
    this.fireRate = 12; // Frames between shots
    this.invulnerable = 0;
  }

  update() {
    // Movement (1D Left/Right Only)
    let dx = 0;
    if (isMobile && joysticks.move.active) {
      dx = joysticks.move.dx * this.speed;
    } else {
      if (keys.a || keys.arrowleft) dx -= this.speed;
      if (keys.d || keys.arrowright) dx += this.speed;
    }

    this.x += dx;

    // Bounds
    this.x = Math.max(this.radius, Math.min(LOGICAL_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(LOGICAL_HEIGHT - this.radius, this.y));

    // Aiming & Firing Logic
    let isFiring = false;
    
    if (isMobile && joysticks.aim.active) {
      isFiring = true; // Auto-fire when aim joystick is touched
    } else if (!isMobile) {
      isFiring = mouse.down || keys[' ']; // Fire with mouse or space
    }

    // Shooting
    if (this.cooldown > 0) this.cooldown--;
    if (isFiring && this.cooldown <= 0) {
      this.shoot();
    }

    if (this.invulnerable > 0) this.invulnerable--;
  }

  shoot() {
    const speed = 15;
    const velocity = {
      x: Math.cos(this.angle) * speed,
      y: Math.sin(this.angle) * speed
    };
    // Spawn projectile at the tip of the player
    const spawnX = this.x + Math.cos(this.angle) * this.radius;
    const spawnY = this.y + Math.sin(this.angle) * this.radius;
    
    projectiles.push(new Projectile(spawnX, spawnY, velocity));
    this.cooldown = this.fireRate;
    
    // Recoil effect (subtle particle)
    createParticles(spawnX, spawnY, 2, COLORS.projectile, 3);
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    if (this.invulnerable > 0 && Math.floor(state.frames / 4) % 2 === 0) {
      ctx.globalAlpha = 0.3;
    }

    // Draw ship (triangle)
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.5, 0);
    ctx.lineTo(-this.radius, this.radius);
    ctx.lineTo(-this.radius * 0.5, 0);
    ctx.lineTo(-this.radius, -this.radius);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  takeDamage() {
    if (this.invulnerable > 0) return;
    this.hp--;
    this.invulnerable = 60; // 1 second of iframes
    state.multiplier = 1;
    updateHUD();
    createParticles(this.x, this.y, 15, this.color, 8);
    
    // Screen shake hack
    canvas.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px)`;
    setTimeout(() => { canvas.style.transform = 'none'; }, 50);

    if (this.hp <= 0) {
      endGame();
    }
  }
}

class Projectile {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.radius = 4;
    this.color = COLORS.projectile;
    this.life = 100;
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.life--;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
  }
}

class Enemy {
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.type = type;
    
    if (type === 'basic') {
      this.radius = 18;
      this.color = COLORS.enemyBasic;
      this.speed = 2.5 + Math.random() * 1;
      this.hp = 2;
    } else if (type === 'fast') {
      this.radius = 12;
      this.color = COLORS.enemyFast;
      this.speed = 4.5 + Math.random() * 1.5;
      this.hp = 1;
    }
  }

  update() {
    // Move strictly downwards
    this.y += this.speed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Rotation animation
    if (this.type === 'basic') {
      ctx.rotate(state.frames * 0.02);
      ctx.beginPath();
      ctx.rect(-this.radius, -this.radius, this.radius*2, this.radius*2);
    } else {
      ctx.rotate(Math.PI / 2); // Point downwards
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(-this.radius, this.radius);
      ctx.lineTo(-this.radius, -this.radius);
    }

    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.stroke();
    
    // Fill slightly based on HP
    ctx.fillStyle = `rgba(${this.type==='basic'?'255,45,120':'255,107,0'}, ${this.hp > 1 ? 0.3 : 0.1})`;
    ctx.fill();

    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color, maxSpeed) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * maxSpeed;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    this.alpha = 1;
    this.decay = 0.02 + Math.random() * 0.03;
    this.radius = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= 0.95; // friction
    this.velocity.y *= 0.95;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.restore();
  }
}

function createParticles(x, y, amount, color, speed) {
  for (let i = 0; i < amount; i++) {
    particles.push(new Particle(x, y, color, speed));
  }
}

/* ═══════════════════════════════════════════════════
   CORE GAME LOGIC
═══════════════════════════════════════════════════ */
function spawnEnemy() {
  let fastProb = 0.1;
  if (state.difficulty === 'mid') fastProb = 0.3;
  if (state.difficulty === 'hard') fastProb = 0.6;
  
  const isFast = Math.random() < fastProb;
  let x = Math.random() * (LOGICAL_WIDTH - 60) + 30; // Keep within horizontal bounds
  let y = -40; // Spawn just above the canvas

  enemies.push(new Enemy(x, y, isFast ? 'fast' : 'basic'));
}

function checkCollisions() {
  // Projectiles vs Enemies
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    let hit = false;
    
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const dist = Math.hypot(p.x - e.x, p.y - e.y);
      
      if (dist < e.radius + p.radius) {
        hit = true;
        e.hp--;
        createParticles(p.x, p.y, 5, p.color, 4);
        
        if (e.hp <= 0) {
          createParticles(e.x, e.y, 15, e.color, 6);
          enemies.splice(j, 1);
          
          // Score logic
          const baseScore = e.type === 'fast' ? 20 : 10;
          state.score += baseScore * state.multiplier;
          
          if (state.score % 500 === 0) {
            state.multiplier = Math.min(state.multiplier + 1, 5);
          }
          if (state.score > state.wave * 1000) {
            state.wave++;
            state.spawnRate = Math.max(30, state.spawnRate - 10);
          }
          updateHUD();
        }
        break; // Projectile can only hit one enemy
      }
    }
    
    if (hit) {
      projectiles.splice(i, 1);
    }
  }

  // Player vs Enemies
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < player.radius + e.radius) {
      player.takeDamage();
    }
  }
}

function update() {
  if (state.paused || state.screen !== 'game') return;

  state.frames++;
  player.update();
  
  // Spawn logic
  if (state.frames % state.spawnRate === 0) {
    spawnEnemy();
  }

  projectiles.forEach((p, i) => {
    p.update();
    if (p.x < 0 || p.x > LOGICAL_WIDTH || p.y < -50 || p.y > LOGICAL_HEIGHT + 50 || p.life <= 0) {
      projectiles.splice(i, 1);
    }
  });

  enemies.forEach((e, i) => {
    e.update();
    // Remove if it passes bottom of screen
    if (e.y > LOGICAL_HEIGHT + 50) {
      enemies.splice(i, 1);
      // Optional: taking damage if an enemy passes the player? 
      // Un-comment the line below if you want passing enemies to hurt:
      // player.takeDamage();
    }
  });
  particles.forEach((p, i) => {
    p.update();
    if (p.alpha <= 0) particles.splice(i, 1);
  });

  checkCollisions();
}

function draw() {
  // Clear with a slight trailing effect
  ctx.fillStyle = 'rgba(10, 12, 16, 0.3)';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  if (state.screen === 'game') {
    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 207, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<LOGICAL_WIDTH; i+=50) {
      ctx.moveTo(i, 0); ctx.lineTo(i, LOGICAL_HEIGHT);
      ctx.moveTo(0, i); ctx.lineTo(LOGICAL_WIDTH, i);
    }
    ctx.stroke();

    particles.forEach(p => p.draw());
    projectiles.forEach(p => p.draw());
    enemies.forEach(e => e.draw());
    player.draw();
  }
}

function gameLoop(timestamp) {
  // Cap at ~60fps
  const dt = timestamp - state.lastTime;
  if (dt >= 16) {
    update();
    draw();
    state.lastTime = timestamp;
  }
  animationId = requestAnimationFrame(gameLoop);
}

/* ═══════════════════════════════════════════════════
   UI & STATE MANAGEMENT
═══════════════════════════════════════════════════ */
function loadPrefs() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      state.bestScore = parsed.bestScore || 0;
    }
  } catch(e) {}
  document.getElementById('bdp').textContent = String(state.bestScore).padStart(6, '0');
  document.getElementById('menu-hi').textContent = state.bestScore;
}

function savePrefs() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ bestScore: state.bestScore }));
  } catch(e) {}
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${id}`).classList.add('active');
  state.screen = id;
}

function updateHUD() {
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    savePrefs();
  }
  document.getElementById('sdp').textContent = String(state.score).padStart(6, '0');
  document.getElementById('bdp').textContent = String(state.bestScore).padStart(6, '0');
  document.getElementById('hp-val').textContent = player.hp;
  document.getElementById('multiplier-label').textContent = `x${state.multiplier}`;
  document.getElementById('menu-hi').textContent = state.bestScore;
}

function startGame() {
  player = new Player();
  projectiles = [];
  enemies = [];
  particles = [];
  state.score = 0;
  state.multiplier = 1;
  state.frames = 0;
  state.paused = false;
  
  // Set difficulty spawn rate
  if (state.difficulty === 'easy') state.spawnRate = 100;
  else if (state.difficulty === 'mid') state.spawnRate = 60;
  else if (state.difficulty === 'hard') state.spawnRate = 30;
  
  document.getElementById('overlay').classList.add('hidden');
  updateHUD();
  showScreen('game');
  
  if (!animationId) {
    state.lastTime = performance.now();
    gameLoop(state.lastTime);
  }
}

function togglePause() {
  if (state.screen !== 'game') return;
  state.paused = !state.paused;
  const ov = document.getElementById('overlay');
  const btn = document.getElementById('pause-btn');
  
  if (state.paused) {
    ov.classList.remove('hidden');
    btn.innerHTML = '<i class="fa-solid fa-play"></i> RESUME';
  } else {
    ov.classList.add('hidden');
    btn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
  }
}

function endGame() {
  state.screen = 'over';
  document.getElementById('over-score').textContent = state.score;
  showScreen('over');
}

/* ═══════════════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════════════ */
document.getElementById('btn-splash-start').addEventListener('click', () => showScreen('menu'));
document.getElementById('btn-play').addEventListener('click', startGame);

// Difficulty Selection
document.querySelectorAll('.setup-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.setup-btn').forEach(b => b.classList.remove('active'));
    const target = e.currentTarget;
    target.classList.add('active');
    state.difficulty = target.dataset.level;
  });
});

// How To Play Accordion
const htpToggle = document.getElementById('htp-toggle');
if (htpToggle) {
  htpToggle.addEventListener('click', () => {
    const body = document.getElementById('htp-body');
    const chev = document.getElementById('htp-chev');
    body.classList.toggle('open');
    chev.classList.toggle('open');
    htpToggle.setAttribute('aria-expanded', body.classList.contains('open'));
  });
}

document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-quit').addEventListener('click', () => showScreen('menu'));
document.getElementById('btn-retry').addEventListener('click', startGame);
document.getElementById('btn-over-menu').addEventListener('click', () => showScreen('menu'));

// Initialize
loadPrefs();
