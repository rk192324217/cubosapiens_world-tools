// ─────────────────────────────────────────────────────────────
// TRADING EMPIRE — Core Game Logic
// ─────────────────────────────────────────────────────────────

// ── GAME STATE ──
let state = {
  cash: 10000,
  debt: 5000,
  bank: 0,
  day: 1,
  maxDays: 30,
  planet: "Terra Prime",
  cargo: {
    food: 0,
    energy: 0,
    implants: 0,
    chips: 0,
    spice: 0
  },
  upgrades: {
    cargo: 1,      // level 1 = 30 slots, lv 2 = 40, lv 3 = 50, etc.
    shields: 0,    // lv 1 = 25% damage red, lv 2 = 50%, lv 3 = 75%
    warp: 0        // lv 1 = -20% hazard, lv 2 = -40%, lv 3 = -60%
  },
  hull: 100,
  marketPrices: {},
  priceTrends: {} // 'up', 'down', or 'stable'
};

// ── LIFETIME STATISTICS ──
let stats = {
  highScore: 10000,
  totalGames: 0
};

// ── AUDIO SYSTEM (Web Audio API) ──
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSynthSound(freq, type, duration, slideTo = 0) {
  if (!soundEnabled) return;
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    if (slideTo > 0) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
    }

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context failed to play sound:", e);
  }
}

// ── CONFIG DATA ──
const planets = [
  { name: "Terra Prime", specialty: "Central Hub", iconClass: "fa-solid fa-globe", desc: "Stable trading conditions, neutral market." },
  { name: "Aurelia-9", specialty: "Mining Outpost", iconClass: "fa-solid fa-mountain-sun", desc: "High fuel demands, cheap metals & raw materials." },
  { name: "Neo-Cyberia", specialty: "Biotech Hub", iconClass: "fa-solid fa-network-wired", desc: "Cheap cyber-implants, high demands for foodstuffs." },
  { name: "Vulkan-X", specialty: "Industrial Grid", iconClass: "fa-solid fa-fire-flame-curved", desc: "Cheap power cell supplies, expensive biotechnology." },
  { name: "Oasis Station", specialty: "Luxury Outpost", iconClass: "fa-solid fa-satellite", desc: "Huge luxury demands, produces premium spice." }
];

const commodities = {
  food: { name: "Bio-Food", type: "Basic", basePrice: 15, volatility: 0.15, iconClass: "fa-solid fa-wheat-awn" },
  energy: { name: "Energy Cells", type: "Energy", basePrice: 45, volatility: 0.25, iconClass: "fa-solid fa-bolt" },
  implants: { name: "Cyber-Implants", type: "Biotech", basePrice: 180, volatility: 0.40, iconClass: "fa-solid fa-microchip" },
  chips: { name: "AI Processors", type: "Tech", basePrice: 450, volatility: 0.55, iconClass: "fa-solid fa-brain" },
  spice: { name: "Exotic Spice", type: "Luxury", basePrice: 1200, volatility: 0.80, iconClass: "fa-solid fa-pepper-hot" }
};

// Specialty price multipliers [Planet][Commodity]
const specialtyModifiers = {
  "Terra Prime": { food: 1.0, energy: 1.0, implants: 1.0, chips: 1.0, spice: 1.0 },
  "Aurelia-9": { food: 1.3, energy: 1.1, implants: 1.2, chips: 1.3, spice: 0.8 },
  "Neo-Cyberia": { food: 1.5, energy: 1.0, implants: 0.7, chips: 0.8, spice: 1.3 },
  "Vulkan-X": { food: 1.6, energy: 0.6, implants: 1.1, chips: 1.2, spice: 1.1 },
  "Oasis Station": { food: 1.1, energy: 1.4, implants: 1.3, chips: 1.4, spice: 0.6 }
};

// ── DOM ELEMENTS ──
const elements = {
  dayCounter: document.querySelector("#day-counter .value"),
  locationCounter: document.querySelector("#location-counter .value"),
  cashVal: document.querySelector("#stat-cash .stat-val"),
  debtVal: document.querySelector("#stat-debt .stat-val"),
  bankVal: document.querySelector("#stat-bank .stat-val"),
  cargoVal: document.querySelector("#stat-cargo .stat-val"),
  hullVal: document.querySelector("#stat-hull .stat-val"),
  hullBar: document.querySelector("#stat-hull .progress-bar-fill"),
  marketBody: document.getElementById("market-body"),
  planetsContainer: document.getElementById("planets-container"),
  logsList: document.getElementById("logs-list"),
  
  // Modals
  helpModal: document.getElementById("help-modal"),
  eventModal: document.getElementById("event-modal"),
  endModal: document.getElementById("end-modal"),
  
  // Event modal content
  eventTitle: document.getElementById("event-title"),
  eventDescription: document.getElementById("event-description"),
  eventButtons: document.getElementById("event-buttons"),
  eventGraphic: document.getElementById("event-icon-graphic"),
  eventImg: document.getElementById("event-img"),

  // End Game content
  rankName: document.getElementById("rank-name"),
  endValCash: document.getElementById("end-val-cash"),
  endValBank: document.getElementById("end-val-bank"),
  endValDebt: document.getElementById("end-val-debt"),
  endValNetworth: document.getElementById("end-val-networth"),
  highScoreVal: document.getElementById("high-score-val"),
  totalGamesVal: document.getElementById("total-games-val"),
  
  // General buttons
  btnHelp: document.getElementById("btn-help"),
  btnSound: document.getElementById("btn-sound"),
  btnTheme: document.getElementById("btn-theme"),
  btnPayDebt1000: document.getElementById("btn-pay-debt-1000"),
  btnPayDebtAll: document.getElementById("btn-pay-debt-all"),
  btnDeposit1000: document.getElementById("btn-deposit-1000"),
  btnDepositAll: document.getElementById("btn-deposit-all"),
  btnWithdraw1000: document.getElementById("btn-withdraw-1000"),
  btnWithdrawAll: document.getElementById("btn-withdraw-all"),
  btnUpgCargo: document.getElementById("btn-upg-cargo"),
  btnUpgShields: document.getElementById("btn-upg-shields"),
  btnUpgWarp: document.getElementById("btn-upg-warp"),
  btnRepairHull: document.getElementById("btn-upg-repair"),
  btnClearLogs: document.getElementById("btn-clear-logs"),
  btnCloseHelp: document.getElementById("btn-close-help"),
  btnStartPlaying: document.getElementById("btn-start-playing"),
  btnRestartGame: document.getElementById("btn-restart-game"),
  
  soundToast: document.getElementById("sound-toast")
};

// ── GAME INITS ──
document.addEventListener("DOMContentLoaded", () => {
  loadGame();
  setupEventListeners();
  updateUI();
  
  // Show instructions on very first load
  if (state.day === 1 && state.cash === 10000 && state.debt === 5000 && state.bank === 0 && getCargoCount() === 0) {
    openModal(elements.helpModal);
  }
});

// Setup button controls and click hooks
function setupEventListeners() {
  // Help modal
  elements.btnHelp.addEventListener("click", () => {
    playSynthSound(400, 'sine', 0.08);
    openModal(elements.helpModal);
  });
  elements.btnCloseHelp.addEventListener("click", () => {
    playSynthSound(300, 'sine', 0.08);
    closeModal(elements.helpModal);
  });
  elements.btnStartPlaying.addEventListener("click", () => {
    playSynthSound(523.25, 'triangle', 0.15); // C5
    closeModal(elements.helpModal);
  });

  // Sound toggle
  elements.btnSound.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    elements.btnSound.innerHTML = soundEnabled ? `<i class="fa-solid fa-volume-high"></i>` : `<i class="fa-solid fa-volume-xmark"></i>`;
    showToast(soundEnabled ? "Audio Feed Re-established" : "Audio Feed Muted");
    if (soundEnabled) playSynthSound(500, 'sine', 0.1);
  });

  // Theme switch (Dark / Light)
  elements.btnTheme.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    playSynthSound(isDark ? 450 : 350, 'sine', 0.1);
    if (isDark) {
      document.body.classList.replace("dark-theme", "light-theme");
      elements.btnTheme.innerHTML = `<i class="fa-solid fa-moon"></i>`;
      localStorage.setItem("te_theme", "light");
    } else {
      document.body.classList.replace("light-theme", "dark-theme");
      elements.btnTheme.innerHTML = `<i class="fa-solid fa-sun"></i>`;
      localStorage.setItem("te_theme", "dark");
    }
  });

  // Load theme preference
  const savedTheme = localStorage.getItem("te_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.replace("dark-theme", "light-theme");
    elements.btnTheme.innerHTML = `<i class="fa-solid fa-moon"></i>`;
  }

  // Clear log list
  elements.btnClearLogs.addEventListener("click", () => {
    playSynthSound(300, 'sine', 0.1);
    state.history = [];
    elements.logsList.innerHTML = "";
    saveGame();
  });

  // Tab controls in Bank/Shipyard card
  document.querySelectorAll(".tab-link").forEach(tabBtn => {
    tabBtn.addEventListener("click", (e) => {
      playSynthSound(350, 'sine', 0.08);
      document.querySelectorAll(".tab-link").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      tabBtn.classList.add("active");
      const targetId = tabBtn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Bank Actions
  elements.btnPayDebt1000.addEventListener("click", () => payDebt(1000));
  elements.btnPayDebtAll.addEventListener("click", () => payDebt(state.debt));
  elements.btnDeposit1000.addEventListener("click", () => depositBank(1000));
  elements.btnDepositAll.addEventListener("click", () => depositBank(state.cash));
  elements.btnWithdraw1000.addEventListener("click", () => withdrawBank(1000));
  elements.btnWithdrawAll.addEventListener("click", () => withdrawBank(state.bank));

  // Shipyard Actions
  elements.btnUpgCargo.addEventListener("click", () => buyUpgrade("cargo"));
  elements.btnUpgShields.addEventListener("click", () => buyUpgrade("shields"));
  elements.btnUpgWarp.addEventListener("click", () => buyUpgrade("warp"));
  elements.btnRepairHull.addEventListener("click", () => repairHull());

  // Restart Actions
  elements.btnRestartGame.addEventListener("click", () => {
    playSynthSound(600, 'sine', 0.25, 900);
    closeModal(elements.endModal);
    resetGameState();
  });
}

// ── UTILITIES ──
function getCargoCount() {
  return Object.values(state.cargo).reduce((a, b) => a + b, 0);
}

function getMaxCargo() {
  return state.upgrades.cargo * 10 + 20; // Lv1 = 30, Lv2 = 40, Lv3 = 50
}

function getNetWorth() {
  return state.cash + state.bank - state.debt;
}

function showToast(msg) {
  elements.soundToast.innerText = msg;
  elements.soundToast.classList.add("show");
  setTimeout(() => {
    elements.soundToast.classList.remove("show");
  }, 2200);
}

function addLog(text, type = "info") {
  const time = `[Day ${state.day}]`;
  const logMsg = `${time} ${text}`;
  
  // Limit logs to last 35 entries
  state.history.unshift({ text: logMsg, type });
  if (state.history.length > 35) state.history.pop();
  
  renderLogs();
}

function renderLogs() {
  elements.logsList.innerHTML = state.history
    .map(entry => `<div class="log-entry ${entry.type}">${entry.text}</div>`)
    .join("");
}

// ── STATE PERSISTENCE (LocalStorage) ──
function saveGame() {
  try {
    localStorage.setItem("te_save_state", JSON.stringify(state));
    localStorage.setItem("te_stats", JSON.stringify(stats));
  } catch (e) {
    console.error("Localstorage writing error", e);
  }
}

function loadGame() {
  try {
    const savedState = localStorage.getItem("te_save_state");
    const savedStats = localStorage.getItem("te_stats");

    if (savedState) {
      state = JSON.parse(savedState);
    } else {
      generateMarketPrices(true);
    }

    if (savedStats) {
      stats = JSON.parse(savedStats);
    }
  } catch (e) {
    console.warn("Loading save file failed, creating default state", e);
    generateMarketPrices(true);
  }
}

function resetGameState() {
  state = {
    cash: 10000,
    debt: 5000,
    bank: 0,
    day: 1,
    maxDays: 30,
    planet: "Terra Prime",
    cargo: { food: 0, energy: 0, implants: 0, chips: 0, spice: 0 },
    upgrades: { cargo: 1, shields: 0, warp: 0 },
    hull: 100,
    marketPrices: {},
    priceTrends: {},
    history: []
  };
  generateMarketPrices(true);
  addLog("New warp voyage simulation initialized. Destination: Terra Prime.", "info");
  updateUI();
  saveGame();
}

// ── MARKET ALGORITHMS ──
function generateMarketPrices(firstLoad = false) {
  const currentModifiers = specialtyModifiers[state.planet];
  
  Object.keys(commodities).forEach(key => {
    const comm = commodities[key];
    const modifier = currentModifiers[key];
    
    // Base Price * Planet Modifier * Volatility Range
    const randomRange = 1 + (Math.random() - 0.5) * comm.volatility * 2.1;
    let finalPrice = Math.round(comm.basePrice * modifier * randomRange);
    
    // Safety clamp (prices must remain positive)
    if (finalPrice < 2) finalPrice = 2;

    // Track price changes
    if (!firstLoad && state.marketPrices[key]) {
      const oldPrice = state.marketPrices[key];
      if (finalPrice > oldPrice * 1.05) state.priceTrends[key] = "up";
      else if (finalPrice < oldPrice * 0.95) state.priceTrends[key] = "down";
      else state.priceTrends[key] = "stable";
    } else {
      state.priceTrends[key] = "stable";
    }

    state.marketPrices[key] = finalPrice;
  });
}

// ── UPGRADE CALCULATIONS ──
function getUpgradeCost(type) {
  const currentLevel = state.upgrades[type];
  if (type === "cargo") {
    // Lv1 is default (30 Slots). Upgrading to Lv2 costs 2000, Lv3 costs 4500, Lv4 costs 9000
    return Math.round(2000 * Math.pow(2.25, currentLevel - 1));
  }
  if (type === "shields") {
    // Max level 3
    if (currentLevel >= 3) return Infinity;
    return currentLevel === 0 ? 3500 : currentLevel === 1 ? 7500 : 14000;
  }
  if (type === "warp") {
    // Max level 3
    if (currentLevel >= 3) return Infinity;
    return currentLevel === 0 ? 4000 : currentLevel === 1 ? 8000 : 15000;
  }
  return Infinity;
}

// ── GAME ACTION LOGICS ──

// Trade Transactions
function buyCommodity(key) {
  const price = state.marketPrices[key];
  if (!price) return;

  if (state.cash < price) {
    playSynthSound(150, 'sawtooth', 0.15);
    addLog(`Insufficient cash credits to buy ${commodities[key].name}.`, "loss");
    return;
  }

  if (getCargoCount() >= getMaxCargo()) {
    playSynthSound(150, 'sawtooth', 0.15);
    addLog("Your ship's cargo hold is at maximum capacity.", "loss");
    return;
  }

  // Deduct cash, increase cargo
  state.cash -= price;
  state.cargo[key]++;
  
  playSynthSound(440, 'triangle', 0.08, 660); // Quick positive beep
  addLog(`Purchased 1 unit of ${commodities[key].name} for ${price} Credits.`, "earn");
  
  updateUI();
  saveGame();
}

function sellCommodity(key) {
  const price = state.marketPrices[key];
  if (!price) return;

  if (!state.cargo[key] || state.cargo[key] <= 0) {
    playSynthSound(150, 'sawtooth', 0.15);
    addLog(`You do not have any units of ${commodities[key].name} to sell.`, "loss");
    return;
  }

  // Award cash, reduce cargo
  state.cash += price;
  state.cargo[key]--;

  playSynthSound(660, 'triangle', 0.08, 880); // Descending-ascending beep
  addLog(`Sold 1 unit of ${commodities[key].name} for ${price} Credits.`, "earn");

  updateUI();
  saveGame();
}

// Banking Actions
function payDebt(amount) {
  if (state.debt <= 0) {
    showToast("Debt completely settled");
    return;
  }
  
  let toPay = Math.min(amount, state.debt, state.cash);
  if (toPay <= 0) {
    playSynthSound(150, 'sine', 0.1);
    addLog("No cash available to clear syndicate debt.", "loss");
    return;
  }

  state.cash -= toPay;
  state.debt -= toPay;

  playSynthSound(587.33, 'sine', 0.12, 783.99); // ascending D5 -> G5
  addLog(`Repaid ${toPay.toLocaleString()} Credits of Syndicate debt.`, "earn");

  updateUI();
  saveGame();
}

function depositBank(amount) {
  let toDeposit = Math.min(amount, state.cash);
  if (toDeposit <= 0) {
    playSynthSound(150, 'sine', 0.1);
    addLog("No cash available to deposit.", "loss");
    return;
  }

  state.cash -= toDeposit;
  state.bank += toDeposit;

  playSynthSound(500, 'sine', 0.15);
  addLog(`Deposited ${toDeposit.toLocaleString()} Credits into Galactic Bank.`, "info");

  updateUI();
  saveGame();
}

function withdrawBank(amount) {
  let toWithdraw = Math.min(amount, state.bank);
  if (toWithdraw <= 0) {
    playSynthSound(150, 'sine', 0.1);
    addLog("No savings available to withdraw.", "loss");
    return;
  }

  state.cash += toWithdraw;
  state.bank -= toWithdraw;

  playSynthSound(600, 'sine', 0.15);
  addLog(`Withdrew ${toWithdraw.toLocaleString()} Credits from Galactic Bank.`, "info");

  updateUI();
  saveGame();
}

// Upgrades
function buyUpgrade(type) {
  const cost = getUpgradeCost(type);
  if (state.cash < cost) {
    playSynthSound(150, 'sawtooth', 0.18);
    addLog(`Insufficient credits to buy shipyard upgrade (${cost.toLocaleString()} required).`, "loss");
    return;
  }

  state.cash -= cost;
  state.upgrades[type]++;

  playSynthSound(500, 'triangle', 0.2, 800);
  addLog(`Purchased Upgrade: ${type.toUpperCase()} reached level ${state.upgrades[type]}.`, "info");

  updateUI();
  saveGame();
}

function repairHull() {
  if (state.hull >= 100) {
    showToast("Hull is already at 100%");
    return;
  }

  const damagePercent = 100 - state.hull;
  const cost = Math.max(50, damagePercent * 10); // 10 Credits per 1% damage, min 50

  if (state.cash < cost) {
    playSynthSound(150, 'sawtooth', 0.18);
    addLog("Insufficient cash credits for shipyard repairs.", "loss");
    return;
  }

  state.cash -= cost;
  state.hull = 100;

  playSynthSound(300, 'sine', 0.25, 600);
  addLog(`Nanobots deployed. Hull repaired back to 100% for ${cost} Credits.`, "earn");

  updateUI();
  saveGame();
}

// Warp Travel
function warpToPlanet(planetName) {
  if (state.planet === planetName) return;

  playSynthSound(800, 'sawtooth', 0.45, 100); // Decending warp sweep

  // 1. Move days
  state.day++;
  
  // 2. Accumulate interest
  if (state.debt > 0) {
    const interest = Math.round(state.debt * 0.10);
    state.debt += interest;
    addLog(`Syndicate debt accumulated 10% daily interest (+${interest.toLocaleString()} Credits).`, "loss");
  }
  if (state.bank > 0) {
    const interest = Math.round(state.bank * 0.03);
    state.bank += interest;
    addLog(`Galactic Bank accounts credited with 3% daily interest (+${interest.toLocaleString()} Credits).`, "earn");
  }

  // 3. Relocate and recalculate market
  state.planet = planetName;
  generateMarketPrices();

  addLog(`Successfully hyperwarped to ${planetName} system.`, "travel");

  // 4. Trigger travel hazard events (25% base rate)
  const baseHazard = 0.25;
  const finalHazard = baseHazard * (1 - state.upgrades.warp * 0.20);
  
  if (Math.random() < finalHazard) {
    setTimeout(() => {
      triggerRandomEvent();
    }, 550);
  } else {
    // If no event, check for game end conditions
    if (state.day > state.maxDays) {
      setTimeout(endCampaign, 600);
    }
  }

  updateUI();
  saveGame();
}

// ── HAZARD EVENTS ENGINE ──
function triggerRandomEvent() {
  const roll = Math.random();
  
  if (roll < 0.60) {
    triggerPirateAttack();
  } else if (roll < 0.80) {
    triggerSolarFlare();
  } else {
    triggerSalvageEvent();
  }
}

// Pirate Attack Event
function triggerPirateAttack() {
  elements.eventTitle.innerText = "🚨 Syndicate Pirates!";
  elements.eventDescription.innerText = "A pirate fleet drops out of hyperspace and locks weapon systems on your ship. They demand a tribute to pass safely!";
  
  // Graphic setting
  elements.eventImg.className = "event-image-box text-red";
  elements.eventGraphic.className = "fa-solid fa-user-ninja";

  elements.eventButtons.innerHTML = "";

  // Bribe Button (costs 30% of cash, min 300)
  const bribeCost = Math.max(300, Math.round(state.cash * 0.3));
  const btnBribe = document.createElement("button");
  btnBribe.className = "event-opt-btn";
  btnBribe.innerHTML = `<span>Pay Off Pirates</span><span class="btn-shortcut">${bribeCost.toLocaleString()} Credits</span>`;
  btnBribe.addEventListener("click", () => {
    state.cash = Math.max(0, state.cash - bribeCost);
    playSynthSound(500, 'sine', 0.15, 250);
    addLog(`Paid a bribe of ${bribeCost.toLocaleString()} credits to space pirates.`, "loss");
    closeModal(elements.eventModal);
    checkGameProgress();
  });
  elements.eventButtons.appendChild(btnBribe);

  // Flee Button (success dependent on warp upgrade)
  const fleeChance = 35 + state.upgrades.warp * 20; // 35%, 55%, 75%, 95%
  const btnFlee = document.createElement("button");
  btnFlee.className = "event-opt-btn";
  btnFlee.innerHTML = `<span>Attempt to Flee</span><span class="btn-shortcut">${fleeChance}% Chance</span>`;
  btnFlee.addEventListener("click", () => {
    if (Math.random() * 100 < fleeChance) {
      playSynthSound(600, 'sine', 0.35, 900);
      addLog("Successfully outmaneuvered the pirate fleet.", "travel");
      showToast("Pirates Evaded");
    } else {
      // Failed to flee: take damage and warp fails (stay on planet, lose time)
      const dmg = Math.round((25 + Math.random() * 20) * (1 - state.upgrades.shields * 0.25)); // mitigated by shield
      state.hull = Math.max(0, state.hull - dmg);
      playSynthSound(100, 'sawtooth', 0.5); // Explosion
      addLog(`Escape failed! Pirates hit hull plating doing ${dmg}% damage.`, "loss");
    }
    closeModal(elements.eventModal);
    checkGameProgress();
  });
  elements.eventButtons.appendChild(btnFlee);

  // Fight Button (success dependent on shield upgrade)
  const fightChance = 30 + state.upgrades.shields * 20; // 30%, 50%, 70%, 90%
  const btnFight = document.createElement("button");
  btnFight.className = "event-opt-btn";
  btnFight.innerHTML = `<span>Fight Back</span><span class="btn-shortcut">${fightChance}% Success</span>`;
  btnFight.addEventListener("click", () => {
    if (Math.random() * 100 < fightChance) {
      const reward = Math.round(1500 + Math.random() * 2000);
      state.cash += reward;
      playSynthSound(800, 'triangle', 0.2, 1200); // Victory sound
      addLog(`Defeated the pirate interceptors! Salvaged ${reward.toLocaleString()} credits from wreckage.`, "earn");
    } else {
      const dmg = Math.round((35 + Math.random() * 25) * (1 - state.upgrades.shields * 0.25));
      state.cash = Math.max(0, Math.round(state.cash * 0.7)); // lose 30% of carried credits
      state.hull = Math.max(0, state.hull - dmg);
      playSynthSound(80, 'sawtooth', 0.6); // Heavy explosion
      addLog(`Defeat! Pirates disabled your weapon grids. Hull damaged by ${dmg}%. Cargo credits plundered.`, "loss");
    }
    closeModal(elements.eventModal);
    checkGameProgress();
  });
  elements.eventButtons.appendChild(btnFight);

  openModal(elements.eventModal);
}

// Solar Flare Event
function triggerSolarFlare() {
  elements.eventTitle.innerText = "☀️ Solar Radiation Flare!";
  
  // Calculate damage mitigated by deflector shields
  const baseDmg = Math.round(15 + Math.random() * 20);
  const finalDmg = Math.round(baseDmg * (1 - state.upgrades.shields * 0.25));

  elements.eventDescription.innerText = `A high-energy coronal solar flare erupts nearby. Radioactive fields strike your hull plating, causing ${finalDmg}% systems damage.`;
  
  // Graphic setting
  elements.eventImg.className = "event-image-box text-orange";
  elements.eventGraphic.className = "fa-solid fa-sun";

  elements.eventButtons.innerHTML = "";
  
  const btnOk = document.createElement("button");
  btnOk.className = "event-opt-btn";
  btnOk.style.justifyContent = "center";
  btnOk.innerHTML = `<span>Absorb Radiation Shielding</span>`;
  btnOk.addEventListener("click", () => {
    state.hull = Math.max(0, state.hull - finalDmg);
    playSynthSound(120, 'sawtooth', 0.4);
    addLog(`Solar flare radiation damaged hull by ${finalDmg}%.`, "loss");
    closeModal(elements.eventModal);
    checkGameProgress();
  });
  elements.eventButtons.appendChild(btnOk);

  openModal(elements.eventModal);
}

// Salvage Loot Event
function triggerSalvageEvent() {
  elements.eventTitle.innerText = "📦 Floating Cargo Pod!";
  
  // Pick random commodity
  const commKeys = Object.keys(commodities);
  const luckyKey = commKeys[Math.floor(Math.random() * commKeys.length)];
  const commName = commodities[luckyKey].name;
  const count = Math.round(2 + Math.random() * 3); // 2-5 units

  elements.eventDescription.innerText = `You drop out of warp near drifting ship debris. Scanners locate an intact cargo container filled with ${count} units of ${commName}!`;
  
  // Graphic setting
  elements.eventImg.className = "event-image-box text-green";
  elements.eventGraphic.className = "fa-solid fa-boxes-packing";

  elements.eventButtons.innerHTML = "";

  const btnClaim = document.createElement("button");
  btnClaim.className = "event-opt-btn";
  btnClaim.innerHTML = `<span>Transfer Cargo to Hold</span>`;
  btnClaim.addEventListener("click", () => {
    const currentCargo = getCargoCount();
    const maxCargo = getMaxCargo();
    
    if (currentCargo >= maxCargo) {
      showToast("Cargo Hold Full");
      addLog("Could not salvage floating pod. Cargo hold is full.", "loss");
    } else {
      const fits = Math.min(count, maxCargo - currentCargo);
      state.cargo[luckyKey] += fits;
      playSynthSound(500, 'sine', 0.2, 700);
      addLog(`Salvaged and stored ${fits} units of ${commName}.`, "earn");
    }
    
    closeModal(elements.eventModal);
    checkGameProgress();
  });
  elements.eventButtons.appendChild(btnClaim);

  openModal(elements.eventModal);
}

function checkGameProgress() {
  updateUI();
  saveGame();

  if (state.hull <= 0) {
    endCampaign(true);
  } else if (state.day > state.maxDays) {
    endCampaign();
  }
}

// ── END GAME ENGINE ──
function endCampaign(destroyed = false) {
  playSynthSound(destroyed ? 80 : 500, 'sine', 0.8, destroyed ? 40 : 800);
  
  // 1. Force pay debt off final net worth calculation
  const netWorth = getNetWorth();

  // 2. Determine commercial rank
  let rank = "Scrap Metal";
  if (!destroyed) {
    if (netWorth < 0) rank = "Syndicate Debtor";
    else if (netWorth < 15000) rank = "Freelance Merchant";
    else if (netWorth < 50000) rank = "Trading Fleet Captain";
    else if (netWorth < 120000) rank = "Regional Trade Baron";
    else if (netWorth < 300000) rank = "Interstellar Tycoon";
    else rank = "Cosmic Cargo Overlord";
  }

  // 3. Update records
  stats.totalGames++;
  if (netWorth > stats.highScore) {
    stats.highScore = netWorth;
  }

  // 4. Fill modal elements
  elements.endValCash.innerText = state.cash.toLocaleString();
  elements.endValBank.innerText = state.bank.toLocaleString();
  elements.endValDebt.innerText = state.debt.toLocaleString();
  elements.endValNetworth.innerText = netWorth.toLocaleString();
  
  elements.highScoreVal.innerText = stats.highScore.toLocaleString();
  elements.totalGamesVal.innerText = stats.totalGames;

  elements.rankName.innerText = rank;
  elements.endTitle.innerText = destroyed ? "🚀 Vessel Destroyed" : "🏆 Warp Route Completed";
  
  if (destroyed) {
    elements.rankName.classList.add("text-red");
    elements.rankName.classList.remove("text-accent");
  } else {
    elements.rankName.classList.add("text-accent");
    elements.rankName.classList.remove("text-red");
  }

  // 5. Open End Modal
  openModal(elements.endModal);

  // Clear state for next run
  localStorage.removeItem("te_save_state");
  saveGame();
}

// ── UI RENDERING ENGINE ──
function updateUI() {
  // Counters
  elements.dayCounter.innerHTML = `Day ${state.day} <span class="muted">/ ${state.maxDays}</span>`;
  elements.locationCounter.innerText = state.planet;

  // Stats
  elements.cashVal.innerText = state.cash.toLocaleString();
  elements.debtVal.innerText = state.debt.toLocaleString();
  elements.bankVal.innerText = state.bank.toLocaleString();
  
  const curCargo = getCargoCount();
  const maxCargo = getMaxCargo();
  elements.cargoVal.innerHTML = `${curCargo} <span class="muted">/ ${maxCargo}</span>`;
  
  elements.hullVal.innerText = `${state.hull}%`;
  elements.hullBar.style.width = `${state.hull}%`;
  
  // Set health coloring
  if (state.hull > 60) {
    elements.hullBar.style.background = "linear-gradient(90deg, var(--blue), var(--cyan))";
    elements.hullVal.className = "stat-val text-blue";
  } else if (state.hull > 30) {
    elements.hullBar.style.background = "linear-gradient(90deg, var(--orange), #fcd34d)";
    elements.hullVal.className = "stat-val text-orange";
  } else {
    elements.hullBar.style.background = "linear-gradient(90deg, var(--red), #fda4af)";
    elements.hullVal.className = "stat-val text-red";
  }

  // Render Commodities Market
  renderMarket();

  // Render Travel Options
  renderTravel();

  // Render Shipyard Upgrades
  renderUpgrades();

  // Render logs list
  renderLogs();
}

function renderMarket() {
  elements.marketBody.innerHTML = Object.keys(commodities)
    .map(key => {
      const comm = commodities[key];
      const price = state.marketPrices[key];
      const trend = state.priceTrends[key];
      const playerCargo = state.cargo[key] || 0;

      // Determine price class trends
      let trendIcon = `<i class="fa-solid fa-arrows-left-right text-muted"></i>`;
      let priceClass = "";
      if (trend === "up") {
        trendIcon = `<i class="fa-solid fa-arrow-trend-up text-green"></i>`;
        priceClass = "text-green";
      } else if (trend === "down") {
        trendIcon = `<i class="fa-solid fa-arrow-trend-down text-red"></i>`;
        priceClass = "text-red";
      }

      // Check buy / sell disabled states
      const disableBuy = state.cash < price || getCargoCount() >= getMaxCargo();
      const disableSell = playerCargo <= 0;

      return `
        <tr>
          <td>
            <div class="commodity-cell">
              <span class="commodity-name"><i class="${comm.iconClass}"></i> ${comm.name}</span>
              <span class="commodity-type">${comm.type}</span>
            </div>
          </td>
          <td class="price-val-cell ${priceClass}">${price}</td>
          <td class="trend-cell">${trendIcon}</td>
          <td class="cargo-cell">${playerCargo}</td>
          <td>
            <div class="trade-actions">
              <button class="trade-btn buy" onclick="buyCommodity('${key}')" ${disableBuy ? 'disabled' : ''}>Buy</button>
              <button class="trade-btn sell" onclick="sellCommodity('${key}')" ${disableSell ? 'disabled' : ''}>Sell</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderTravel() {
  elements.planetsContainer.innerHTML = planets
    .map(p => {
      const isCurrent = state.planet === p.name;
      const planetBtnClass = isCurrent ? "planet-btn current" : "planet-btn";
      
      return `
        <button class="${planetBtnClass}" onclick="warpToPlanet('${p.name}')" ${isCurrent ? 'disabled' : ''}>
          <div class="planet-info">
            <span class="planet-avatar text-accent"><i class="${p.iconClass}"></i></span>
            <div class="planet-meta">
              <span class="planet-name">${p.name}</span>
              <span class="planet-specialty">${p.specialty}</span>
            </div>
          </div>
          <span class="planet-status">
            ${isCurrent ? '<span class="text-cyan">ORBITING</span>' : '<i class="fa-solid fa-chevron-right warp-indicator"></i>'}
          </span>
        </button>
      `;
    })
    .join("");
}

function renderUpgrades() {
  // Cargo Upgrade
  const cargoCost = getUpgradeCost("cargo");
  const cargoLvl = state.upgrades.cargo;
  document.querySelector("#upg-cargo .upg-level").innerText = `Lv ${cargoLvl} (${getMaxCargo()} Slots)`;
  elements.btnUpgCargo.innerHTML = `Upgrade<br><span class="price-tag">${cargoCost.toLocaleString()} Credits</span>`;
  elements.btnUpgCargo.disabled = state.cash < cargoCost;

  // Shields Upgrade
  const shieldLvl = state.upgrades.shields;
  const shieldCost = getUpgradeCost("shields");
  if (shieldLvl >= 3) {
    document.querySelector("#upg-shields .upg-level").innerText = `Lv ${shieldLvl} (Max - 75% Mitigation)`;
    elements.btnUpgShields.innerHTML = `Maxed`;
    elements.btnUpgShields.disabled = true;
  } else {
    const shieldDesc = shieldLvl === 0 ? "No Shields" : shieldLvl === 1 ? "25% Mitigation" : "50% Mitigation";
    document.querySelector("#upg-shields .upg-level").innerText = `Lv ${shieldLvl} (${shieldDesc})`;
    elements.btnUpgShields.innerHTML = `Upgrade<br><span class="price-tag">${shieldCost.toLocaleString()} Credits</span>`;
    elements.btnUpgShields.disabled = state.cash < shieldCost;
  }

  // Warp Upgrade
  const warpLvl = state.upgrades.warp;
  const warpCost = getUpgradeCost("warp");
  if (warpLvl >= 3) {
    document.querySelector("#upg-warp .upg-level").innerText = `Lv ${warpLvl} (Max - 60% Safety)`;
    elements.btnUpgWarp.innerHTML = `Maxed`;
    elements.btnUpgWarp.disabled = true;
  } else {
    const warpDesc = warpLvl === 0 ? "Standard Warp" : warpLvl === 1 ? "-20% Hazard Rate" : "-40% Hazard Rate";
    document.querySelector("#upg-warp .upg-level").innerText = `Lv ${warpLvl} (${warpDesc})`;
    elements.btnUpgWarp.innerHTML = `Upgrade<br><span class="price-tag">${warpCost.toLocaleString()} Credits</span>`;
    elements.btnUpgWarp.disabled = state.cash < warpCost;
  }

  // Repair Upgrade
  const repairCost = Math.max(50, (100 - state.hull) * 10);
  elements.btnRepairHull.innerHTML = `Repair Hull<br><span class="price-tag">${repairCost} Credits</span>`;
  elements.btnRepairHull.disabled = state.hull >= 100 || state.cash < repairCost;
}

// Modal handling
function openModal(modalEl) {
  modalEl.classList.add("show");
}

function closeModal(modalEl) {
  modalEl.classList.remove("show");
}
