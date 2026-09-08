const SAVE_KEY = "cube_hopper_save_v2";

const SKINS = [
  { id: "cyan", name: "Cyber Cyan", color: "#00f0ff", side: "#00a8b3", top: "#80f8ff" },
  { id: "pink", name: "Neon Pink", color: "#ff2a6d", side: "#b31d4c", top: "#ff80a6" },
  { id: "emerald", name: "Emerald Spark", color: "#05ffa1", side: "#03b371", top: "#80ffcf" },
  { id: "gold", name: "Gold Master", color: "#ffd700", side: "#b39700", top: "#ffea80" }
];

const PLATFORMS = {
  NORMAL: "normal",
  MOVING: "moving",
  CRUMBLING: "crumbling",
  SPRING: "spring"
};

const ACHIEVEMENTS = [
  { id: "first_hop", icon: "🐣", title: "First Hop", desc: "Perform your first hop across platforms." },
  { id: "gem_collector", icon: "💎", title: "Gem Collector", desc: "Collect 10 total arcade gems." },
  { id: "hop_century", icon: "🏃", title: "Century Hopper", desc: "Reach 100 lifetime hops." },
  { id: "combo_king", icon: "⚡", title: "Combo King", desc: "Reach a x3 hop combo multiplier." },
  { id: "spring_jumper", icon: "🚀", title: "Spring Booster", desc: "Land on a spring platform." },
  { id: "high_scorer", icon: "👑", title: "Retro Master", desc: "Score 200+ points in a single run." }
];

const DEFAULT_LEADERBOARD = [
  { name: "HOP", score: 500, gems: 15, date: "2026-07-25" },
  { name: "CUB", score: 350, gems: 10, date: "2026-07-25" },
  { name: "ACE", score: 220, gems: 6, date: "2026-07-25" },
  { name: "NEO", score: 140, gems: 4, date: "2026-07-25" },
  { name: "RET", score: 80, gems: 2, date: "2026-07-25" }
];

const fmtScore = (num) => String(Math.max(0, num || 0)).padStart(5, '0');

class SoundFx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  play(type) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const presets = {
      hop: { type: "square", start: 160, end: 320, dur: 0.08, vol: 0.15 },
      gem: { type: "triangle", start: 587, end: 1174, dur: 0.14, vol: 0.2 },
      spring: { type: "sine", start: 250, end: 850, dur: 0.22, vol: 0.25 },
      crash: { type: "sawtooth", start: 220, end: 40, dur: 0.35, vol: 0.35 },
      badge: { type: "triangle", start: 523, end: 1046, dur: 0.25, vol: 0.3 }
    };

    const p = presets[type];
    if (!p) return;

    osc.type = p.type;
    osc.frequency.setValueAtTime(p.start, now);
    osc.frequency.exponentialRampToValueAtTime(p.end, now + p.dur);
    gain.gain.setValueAtTime(p.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + p.dur);
    osc.start(now);
    osc.stop(now + p.dur);
  }
}

class CubeGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sound = new SoundFx();

    this.platforms = [];
    this.gems = [];
    this.particles = [];
    this.floatingTexts = [];

    this.score = 0;
    this.highScore = 0;
    this.gemsCount = 0;
    this.totalGems = 0;
    this.totalHops = 0;
    this.totalGames = 0;

    this.combo = 1;
    this.maxCombo = 1;
    this.lastHopTime = 0;

    this.activeSkin = "cyan";
    this.theme = "dark";
    this.crtEnabled = true;

    this.leaderboard = [...DEFAULT_LEADERBOARD];
    this.unlockedBadges = [];

    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;

    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.player = {
      gridX: 0, gridY: 0, z: 0,
      startGridX: 0, startGridY: 0,
      targetGridX: 0, targetGridY: 0,
      isHopping: false, hopProgress: 0
    };

    this.bindDom();
    this.loadData();
    this.setupListeners();
    this.setTheme(this.theme);
    this.setCRT(this.crtEnabled);
    this.refreshHUD();

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindDom() {
    const $ = (id) => document.getElementById(id);
    this.dom = {
      score: $("scoreVal"),
      best: $("bestVal"),
      gems: $("gemsVal"),
      combo: $("comboVal"),
      sr: $("srAnnounce"),
      startOverlay: $("startOverlay"),
      gameOverOverlay: $("gameOverOverlay"),
      pauseOverlay: $("pauseOverlay"),
      overReason: $("overReason"),
      finalScore: $("finalScore"),
      finalBest: $("finalBest"),
      finalGems: $("finalGems"),
      finalCombo: $("finalCombo"),
      themeBtn: $("themeToggle"),
      audioBtn: $("audioToggle"),
      menuBtn: $("menuBtn"),
      arcadeModal: $("arcadeModal"),
      closeArcadeModal: $("closeArcadeModal"),
      skinGrid: $("skinGrid"),
      leaderboardRows: $("leaderboardRows"),
      achievementsGrid: $("achievementsGrid"),
      crtToggle: $("crtToggle"),
      settingAudioToggle: $("settingAudioToggle"),
      resetDataBtn: $("resetDataBtn"),
      initialsContainer: $("initialsContainer"),
      playerInitials: $("playerInitials"),
      saveScoreBtn: $("saveScoreBtn"),
      statGames: $("statGames"),
      statBest: $("statBest"),
      statGems: $("statGems"),
      statHops: $("statHops"),
      statMaxCombo: $("statMaxCombo"),
      statAvgScore: $("statAvgScore")
    };
  }

  loadData() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
      this.highScore = data.highScore || 0;
      this.totalGems = data.totalGems || 0;
      this.totalHops = data.totalHops || 0;
      this.totalGames = data.totalGames || 0;
      this.maxCombo = data.maxCombo || 1;
      this.activeSkin = data.activeSkin || "cyan";
      this.theme = data.theme || "dark";
      this.crtEnabled = data.crtEnabled !== undefined ? data.crtEnabled : true;
      this.sound.enabled = data.sound !== undefined ? data.sound : true;
      this.leaderboard = data.leaderboard?.length ? data.leaderboard : [...DEFAULT_LEADERBOARD];
      this.unlockedBadges = data.unlockedBadges || [];
    } catch {
      this.leaderboard = [...DEFAULT_LEADERBOARD];
      this.unlockedBadges = [];
    }
  }

  saveData() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        highScore: this.highScore,
        totalGems: this.totalGems,
        totalHops: this.totalHops,
        totalGames: this.totalGames,
        maxCombo: this.maxCombo,
        activeSkin: this.activeSkin,
        theme: this.theme,
        crtEnabled: this.crtEnabled,
        sound: this.sound.enabled,
        leaderboard: this.leaderboard,
        unlockedBadges: this.unlockedBadges
      }));
    } catch {
      // Storage unavailable
    }
  }

  setupListeners() {
    document.getElementById("startBtn").addEventListener("click", () => this.start());
    document.getElementById("restartBtn").addEventListener("click", () => this.start());
    document.getElementById("resumeBtn").addEventListener("click", () => this.togglePause());

    this.dom.themeBtn.addEventListener("click", () => {
      this.theme = this.theme === "dark" ? "light" : "dark";
      this.setTheme(this.theme);
      this.saveData();
    });

    this.dom.audioBtn.addEventListener("click", () => {
      this.sound.enabled = !this.sound.enabled;
      this.updateAudioIcon();
      if (this.dom.settingAudioToggle) this.dom.settingAudioToggle.checked = this.sound.enabled;
      this.saveData();
    });

    this.dom.menuBtn?.addEventListener("click", () => this.openArcadeHub("leaderboard"));
    this.dom.closeArcadeModal?.addEventListener("click", () => this.hideModal("arcadeModal"));

    document.querySelectorAll(".tab-btn").forEach(tab => {
      tab.addEventListener("click", (e) => this.switchTab(e.currentTarget.dataset.tab));
    });

    this.dom.crtToggle?.addEventListener("change", (e) => {
      this.crtEnabled = e.target.checked;
      this.setCRT(this.crtEnabled);
      this.saveData();
    });

    this.dom.settingAudioToggle?.addEventListener("change", (e) => {
      this.sound.enabled = e.target.checked;
      this.updateAudioIcon();
      this.saveData();
    });

    this.dom.resetDataBtn?.addEventListener("click", () => {
      if (confirm("Reset all arcade high scores, statistics and unlocked badges?")) {
        localStorage.removeItem(SAVE_KEY);
        this.highScore = 0;
        this.totalGems = 0;
        this.totalHops = 0;
        this.totalGames = 0;
        this.maxCombo = 1;
        this.leaderboard = [...DEFAULT_LEADERBOARD];
        this.unlockedBadges = [];
        this.saveData();
        this.refreshHUD();
        this.renderLeaderboard();
        this.renderStats();
        this.renderAchievements();
      }
    });

    this.dom.saveScoreBtn?.addEventListener("click", () => this.savePlayerInitials());

    window.addEventListener("keydown", (e) => this.onKeyPress(e));

    document.getElementById("mJumpBtn").addEventListener("click", () => this.jump(0, 1));
    document.getElementById("mLeftBtn").addEventListener("click", () => this.jump(-1, 0));
    document.getElementById("mRightBtn").addEventListener("click", () => this.jump(1, 0));

    this.dom.skinGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".skin-card");
      if (card?.dataset.skin) {
        this.activeSkin = card.dataset.skin;
        this.saveData();
        this.renderSkins();
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.dom.themeBtn.innerHTML = theme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }

  setCRT(enabled) {
    document.querySelector(".app-wrap")?.classList.toggle("crt-off", !enabled);
  }

  updateAudioIcon() {
    this.dom.audioBtn.innerHTML = this.sound.enabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
  }

  openArcadeHub(defaultTab = "leaderboard") {
    this.switchTab(defaultTab);
    this.showModal("arcadeModal");
  }

  switchTab(tabName) {
    this.sound.play("hop");
    document.querySelectorAll(".tab-btn").forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === `tab-${tabName}`));

    if (tabName === "leaderboard") this.renderLeaderboard();
    if (tabName === "stats") this.renderStats();
    if (tabName === "skins") this.renderSkins();
    if (tabName === "achievements") this.renderAchievements();
  }

  showModal(id) {
    document.getElementById(id)?.classList.remove("hidden");
  }

  hideModal(id) {
    document.getElementById(id)?.classList.add("hidden");
  }

  renderLeaderboard() {
    if (!this.dom.leaderboardRows) return;
    this.dom.leaderboardRows.innerHTML = this.leaderboard.slice(0, 5).map((entry, idx) => `
      <tr class="rank-${idx + 1}">
        <td>#${idx + 1}</td>
        <td><strong>${entry.name}</strong></td>
        <td class="highlight-cyan">${fmtScore(entry.score)}</td>
        <td class="highlight-pink">💎 ${entry.gems}</td>
      </tr>
    `).join("");
  }

  renderSkins() {
    this.dom.skinGrid.innerHTML = SKINS.map(skin => `
      <div class="skin-card ${this.activeSkin === skin.id ? 'active' : ''}" data-skin="${skin.id}">
        <div class="skin-preview" style="background: ${skin.color}"></div>
        <strong>${skin.name}</strong>
      </div>
    `).join("");
  }

  renderStats() {
    this.dom.statGames.innerText = this.totalGames;
    this.dom.statBest.innerText = fmtScore(this.highScore);
    this.dom.statGems.innerText = this.totalGems;
    this.dom.statHops.innerText = this.totalHops;
    this.dom.statMaxCombo.innerText = `x${this.maxCombo}`;
    this.dom.statAvgScore.innerText = this.totalGames > 0 ? Math.round(this.totalHops * 10 / this.totalGames) : 0;
  }

  renderAchievements() {
    if (!this.dom.achievementsGrid) return;
    this.dom.achievementsGrid.innerHTML = ACHIEVEMENTS.map(ach => {
      const unlocked = this.unlockedBadges.includes(ach.id);
      return `
        <div class="badge-card ${unlocked ? 'unlocked' : ''}">
          <div class="badge-icon">${ach.icon}</div>
          <div class="badge-info">
            <span class="badge-title">${ach.title}</span>
            <span class="badge-desc">${ach.desc}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  unlockAchievement(id) {
    if (!this.unlockedBadges.includes(id)) {
      this.unlockedBadges.push(id);
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        this.sound.play("badge");
        this.addFloatingText(`BADGE: ${ach.title.toUpperCase()}!`, this.player.gridX, this.player.gridY, "#ffcc00");
      }
      this.saveData();
    }
  }

  checkAchievements() {
    if (this.totalHops >= 1) this.unlockAchievement("first_hop");
    if (this.totalGems >= 10) this.unlockAchievement("gem_collector");
    if (this.totalHops >= 100) this.unlockAchievement("hop_century");
    if (this.combo >= 3) this.unlockAchievement("combo_master");
    if (this.score >= 200) this.unlockAchievement("high_scorer");
  }

  start() {
    this.sound.init();
    this.score = 0;
    this.gemsCount = 0;
    this.combo = 1;
    this.lastHopTime = Date.now();
    this.isPlaying = true;
    this.isPaused = false;
    this.isGameOver = false;

    this.totalGames++;
    this.saveData();

    this.player.gridX = 0;
    this.player.gridY = 0;
    this.player.z = 0;
    this.player.isHopping = false;
    this.player.hopProgress = 0;

    this.buildMap();
    this.refreshHUD();

    this.dom.startOverlay.classList.add("hidden");
    this.dom.gameOverOverlay.classList.add("hidden");
    this.dom.pauseOverlay.classList.add("hidden");
    this.dom.initialsContainer.classList.add("hidden");
  }

  buildMap() {
    this.platforms = [];
    this.gems = [];
    this.particles = [];
    this.floatingTexts = [];

    for (let y = -2; y <= 3; y++) {
      for (let x = -1; x <= 1; x++) {
        this.platforms.push({ x, y, z: 0, type: PLATFORMS.NORMAL, crumbling: false, crumbleProgress: 0 });
      }
    }

    this.appendTrack(50);
  }

  appendTrack(count) {
    const lastY = this.platforms.length ? Math.max(...this.platforms.map(p => p.y)) : 0;

    for (let i = 1; i <= count; i++) {
      const y = lastY + i;
      const width = Math.random() > 0.4 ? 2 : 1;
      const startX = Math.floor(Math.random() * 2) - 1;

      for (let w = 0; w < width; w++) {
        const x = startX + w;
        let type = PLATFORMS.NORMAL;
        const rand = Math.random();

        if (rand < 0.15) type = PLATFORMS.MOVING;
        else if (rand < 0.3) type = PLATFORMS.CRUMBLING;
        else if (rand < 0.38) type = PLATFORMS.SPRING;

        this.platforms.push({
          x, y, z: 0,
          type,
          offset: Math.random() * Math.PI * 2,
          crumbling: false,
          crumbleProgress: 0
        });

        if (Math.random() < 0.25) {
          this.gems.push({ x, y, z: 0.8, collected: false });
        }
      }
    }
  }

  onKeyPress(e) {
    if (e.key === "p" || e.key === "P") {
      this.togglePause();
      return;
    }

    if (!this.isPlaying || this.isPaused || this.player.isHopping) return;

    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
      this.jump(0, 1);
    } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      this.jump(-1, 0);
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      this.jump(1, 0);
    }
  }

  jump(dx, dy) {
    if (!this.isPlaying || this.isPaused || this.player.isHopping) return;

    const now = Date.now();
    this.combo = (now - this.lastHopTime < 1400) ? Math.min(this.combo + 1, 4) : 1;
    this.lastHopTime = now;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    this.player.isHopping = true;
    this.player.hopProgress = 0;
    this.player.startGridX = this.player.gridX;
    this.player.startGridY = this.player.gridY;
    this.player.targetGridX = this.player.gridX + dx;
    this.player.targetGridY = this.player.gridY + dy;

    this.sound.play("hop");
    this.totalHops++;
    this.checkAchievements();
    this.addDust(this.player.gridX, this.player.gridY, "#ffffff", 4);
  }

  togglePause() {
    if (!this.isPlaying || this.isGameOver) return;
    this.isPaused = !this.isPaused;
    this.dom.pauseOverlay.classList.toggle("hidden", !this.isPaused);
  }

  update() {
    if (!this.isPlaying || this.isPaused) return;

    const time = Date.now() * 0.003;
    this.platforms.forEach(p => {
      p.renderX = p.type === PLATFORMS.MOVING ? p.x + Math.sin(time + p.offset) * 0.8 : p.x;
      if (p.crumbling) {
        p.crumbleProgress += 0.05;
        if (p.crumbleProgress >= 1) p.z -= 0.5;
      }
    });

    if (this.player.isHopping) {
      this.player.hopProgress += 0.12;
      const t = this.player.hopProgress;

      this.player.gridX = this.player.startGridX + (this.player.targetGridX - this.player.startGridX) * t;
      this.player.gridY = this.player.startGridY + (this.player.targetGridY - this.player.startGridY) * t;
      this.player.z = Math.sin(t * Math.PI) * 1.2;

      if (t >= 1) {
        this.player.gridX = this.player.targetGridX;
        this.player.gridY = this.player.targetGridY;
        this.player.z = 0;
        this.player.isHopping = false;
        this.onLand();
      }
    }

    this.camera.targetX = this.player.gridX;
    this.camera.targetY = this.player.gridY;
    this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;

    if (this.player.gridY > this.platforms.length - 20) {
      this.appendTrack(30);
    }

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life -= 0.04;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    this.floatingTexts.forEach(ft => {
      ft.z += 0.03;
      ft.life -= 0.025;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);
  }

  onLand() {
    const current = this.platforms.find(p =>
      Math.abs(p.renderX - this.player.gridX) < 0.6 &&
      Math.round(p.y) === Math.round(this.player.gridY)
    );

    if (!current || current.z < -2) {
      this.fail("YOU FELL INTO THE VOID!");
      return;
    }

    if (current.type === PLATFORMS.CRUMBLING) {
      current.crumbling = true;
    } else if (current.type === PLATFORMS.SPRING) {
      this.sound.play("spring");
      this.unlockAchievement("spring_jumper");
      this.addFloatingText("SPRING BOOST!", this.player.gridX, this.player.gridY, "#00ff66");
      this.jump(0, 2);
    }

    this.gems.forEach(g => {
      if (!g.collected && Math.abs(g.x - this.player.gridX) < 0.6 && Math.round(g.y) === Math.round(this.player.gridY)) {
        g.collected = true;
        this.gemsCount++;
        this.totalGems++;
        const points = 25 * this.combo;
        this.score += points;
        this.sound.play("gem");
        this.addDust(this.player.gridX, this.player.gridY, "#ffd700", 8);
        this.addFloatingText(`+${points} GEM!`, this.player.gridX, this.player.gridY, "#ff007f");
      }
    });

    const hopPts = 10 * this.combo;
    this.score += hopPts;
    this.addFloatingText(`+${hopPts}`, this.player.gridX, this.player.gridY, "#00f0ff");

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    this.refreshHUD();
    this.saveData();
  }

  addFloatingText(text, gridX, gridY, color = "#00f0ff") {
    this.floatingTexts.push({ text, x: gridX, y: gridY, z: 1.2, color, life: 1.0 });
  }

  fail(reason) {
    this.isPlaying = false;
    this.isGameOver = true;
    this.sound.play("crash");

    this.dom.overReason.innerText = reason;
    this.dom.finalScore.innerText = fmtScore(this.score);
    this.dom.finalBest.innerText = fmtScore(this.highScore);
    this.dom.finalGems.innerText = this.gemsCount;
    this.dom.finalCombo.innerText = `x${this.combo}`;

    const isTopScore = this.score > 0 && (this.leaderboard.length < 5 || this.score > this.leaderboard[this.leaderboard.length - 1].score);
    this.dom.initialsContainer.classList.toggle("hidden", !isTopScore);
    this.dom.gameOverOverlay.classList.remove("hidden");
  }

  savePlayerInitials() {
    let name = (this.dom.playerInitials.value || "AAA").toUpperCase().trim();
    if (!name) name = "AAA";

    this.leaderboard.push({
      name,
      score: this.score,
      gems: this.gemsCount,
      date: new Date().toISOString().split("T")[0]
    });

    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 5);
    this.saveData();

    this.dom.initialsContainer.classList.add("hidden");
    this.renderLeaderboard();
    this.openArcadeHub("leaderboard");
  }

  refreshHUD() {
    this.dom.score.innerText = fmtScore(this.score);
    this.dom.best.innerText = fmtScore(this.highScore);
    this.dom.gems.innerText = `💎 ${String(this.gemsCount).padStart(2, '0')}`;
    this.dom.combo.innerText = `x${this.combo}`;
    this.dom.sr.innerText = `Score: ${this.score}, High Score: ${this.highScore}`;
  }

  toIso(x, y, z) {
    const isoX = (x - y) * 36;
    const isoY = (x + y) * 18 - z * 24;
    return {
      x: this.canvas.width / 2 + isoX - (this.camera.x - this.camera.y) * 36,
      y: this.canvas.height / 2 + 100 + isoY - (this.camera.x + this.camera.y) * 18
    };
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const sortedPlatforms = [...this.platforms].sort((a, b) => (a.x + a.y) - (b.x + b.y));

    sortedPlatforms.forEach(p => {
      const pos = this.toIso(p.renderX, p.y, p.z);
      this.drawCube(pos.x, pos.y, 36, 18, 20, this.getColors(p.type));
    });

    this.gems.forEach(g => {
      if (!g.collected) {
        const pos = this.toIso(g.x, g.y, g.z);
        this.ctx.fillStyle = "#ffd700";
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y - 10, 6, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    const skin = SKINS.find(s => s.id === this.activeSkin) || SKINS[0];
    const playerPos = this.toIso(this.player.gridX, this.player.gridY, this.player.z);
    this.drawCube(playerPos.x, playerPos.y, 28, 14, 28, skin);

    this.particles.forEach(p => {
      const pos = this.toIso(p.x, p.y, p.z);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 3 * p.life, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.floatingTexts.forEach(ft => {
      const pos = this.toIso(ft.x, ft.y, ft.z);
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.life);
      this.ctx.fillStyle = ft.color;
      this.ctx.font = '12px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(ft.text, pos.x, pos.y);
      this.ctx.restore();
    });
  }

  getColors(type) {
    switch (type) {
      case PLATFORMS.MOVING: return { color: "#00f0ff", side: "#00a8b3", top: "#80f8ff" };
      case PLATFORMS.CRUMBLING: return { color: "#ff2a6d", side: "#b31d4c", top: "#ff80a6" };
      case PLATFORMS.SPRING: return { color: "#05ffa1", side: "#03b371", top: "#80ffcf" };
      default: return { color: "#3a4763", side: "#242e42", top: "#526388" };
    }
  }

  drawCube(x, y, sizeX, sizeY, height, colors) {
    const ctx = this.ctx;

    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + sizeX, y - height + sizeY);
    ctx.lineTo(x, y - height + sizeY * 2);
    ctx.lineTo(x - sizeX, y - height + sizeY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.side;
    ctx.beginPath();
    ctx.moveTo(x - sizeX, y - height + sizeY);
    ctx.lineTo(x, y - height + sizeY * 2);
    ctx.lineTo(x, y + sizeY * 2);
    ctx.lineTo(x - sizeX, y + sizeY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.color;
    ctx.beginPath();
    ctx.moveTo(x, y - height + sizeY * 2);
    ctx.lineTo(x + sizeX, y - height + sizeY);
    ctx.lineTo(x + sizeX, y + sizeY);
    ctx.lineTo(x, y + sizeY * 2);
    ctx.closePath();
    ctx.fill();
  }

  addDust(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y, z: 0.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: Math.random() * 0.3,
        life: 1,
        color
      });
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(this.loop);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new CubeGame();
});
