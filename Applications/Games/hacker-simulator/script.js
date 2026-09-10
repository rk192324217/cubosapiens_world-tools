/* ==========================================================================
   CUBOSAPIENS HACKER SIMULATOR - APPLICATION LOGIC (script.js)
   ========================================================================== */

(function() {
  'use strict';

  // ── GAME STATE CONFIGURATION ───────────────────────────────────────────
  let state = {
    credits: 100,
    xp: 0,
    level: 1,
    soundEnabled: true,
    theme: 'matrix-green',
    upgrades: {
      cpu: 1,      // 1-5 (Decryption assistance: auto-reveals correct digits over time)
      ram: 1,      // 1-5 (Buffer slots: determines max guess attempts)
      vpn: 1,      // 1-5 (Proxy shielding: slows trace speed)
      bypass: 1    // 1-5 (Bypass Kit: decreases firewall bypass cooldown)
    },
    activeMission: null,
    activeTarget: null,
    missionsCompleted: 0
  };

  // Upgrades Configuration
  const UPGRADES_DB = {
    cpu: [
      { name: "Single Core 1.0 GHz", desc: "No auto-decryption helper.", cost: 0, revealTime: Infinity },
      { name: "Dual-Core 2.4 GHz", desc: "Decrypts 1 character every 30s.", cost: 150, revealTime: 30000 },
      { name: "Quad-Core 3.8 GHz", desc: "Decrypts 1 character every 20s.", cost: 400, revealTime: 20000 },
      { name: "Quantum Octa-Core", desc: "Decrypts 1 character every 12s.", cost: 1000, revealTime: 12000 },
      { name: "AI Core Array", desc: "Decrypts 1 character every 7s.", cost: 2500, revealTime: 7000 }
    ],
    ram: [
      { name: "4 MB Buffer", desc: "Allows 6 attempts before system lock.", cost: 0, attempts: 6 },
      { name: "8 MB Buffer", desc: "Allows 7 attempts before system lock.", cost: 120, attempts: 7 },
      { name: "16 MB Buffer", desc: "Allows 8 attempts before system lock.", cost: 300, attempts: 8 },
      { name: "32 MB Buffer", desc: "Allows 9 attempts before system lock.", cost: 800, attempts: 9 },
      { name: "64 MB Quantum Buffer", desc: "Allows 10 attempts before system lock.", cost: 1800, attempts: 10 }
    ],
    vpn: [
      { name: "No Proxy Shield", desc: "Standard firewall trace detection.", cost: 0, speedMult: 1.0 },
      { name: "Secure Proxy Node", desc: "Firewall trace detection speed reduced to 80%.", cost: 180, speedMult: 0.8 },
      { name: "DeepWeb Shadow Node", desc: "Firewall trace detection speed reduced to 60%.", cost: 450, speedMult: 0.6 },
      { name: "Tor Grid Matrix", desc: "Firewall trace detection speed reduced to 45%.", cost: 1100, speedMult: 0.45 },
      { name: "Satellite Link Spoofer", desc: "Firewall trace detection speed reduced to 25%.", cost: 2800, speedMult: 0.25 }
    ],
    bypass: [
      { name: "Basic Command Decoy", desc: "Bypasses 15% firewall trace. Cooldown: 25s.", cost: 0, reducePct: 15, cd: 25 },
      { name: "Port Knocker Injector", desc: "Bypasses 18% firewall trace. Cooldown: 20s.", cost: 150, reducePct: 18, cd: 20 },
      { name: "VPN Spoof Infiltrator", desc: "Bypasses 20% firewall trace. Cooldown: 16s.", cost: 350, reducePct: 20, cd: 16 },
      { name: "Zero-Day Decoy Suite", desc: "Bypasses 22% firewall trace. Cooldown: 12s.", cost: 900, reducePct: 22, cd: 12 },
      { name: "Overclocked Signal Jammer", desc: "Bypasses 25% firewall trace. Cooldown: 8s.", cost: 2200, reducePct: 25, cd: 8 }
    ]
  };

  // Cybersecurity Targets Database
  const TARGETS_DB = [
    { id: "local-school", ip: "192.168.4.12", name: "Local High School DB", level: 1, reward: 80, security: "Minimal", traceSpeed: 1.8, desc: "A simple educational node holding grade books. Ideal for rookies." },
    { id: "sm-retail", ip: "172.16.89.204", name: "Corner Market POS System", level: 1, reward: 120, security: "Easy", traceSpeed: 2.5, desc: "A retail store transaction node. Weak encryption layer." },
    { id: "local-isp", ip: "10.0.45.18", name: "Regional ISP Substation", level: 2, reward: 250, security: "Medium", traceSpeed: 3.5, desc: "Internet Service Provider distribution hub. Moderate security." },
    { id: "sec-corp", ip: "216.58.219.14", name: "AeroTech Corp Server", level: 2, reward: 380, security: "Moderate", traceSpeed: 4.5, desc: "R&D server containing experimental airplane blueprints." },
    { id: "apex-bank", ip: "12.45.109.84", name: "Apex Mutual Transaction Core", level: 3, reward: 750, security: "High", traceSpeed: 5.5, desc: "Secure commercial bank server with encrypted transaction files." },
    { id: "power-grid", ip: "64.128.0.51", name: "Municipal Grid Controller", level: 3, reward: 1100, security: "Advanced", traceSpeed: 6.5, desc: "Supervisory Control (SCADA) node for municipal electricity grid." },
    { id: "gov-intel", ip: "142.250.72.110", name: "Agency Database Terminal", level: 4, reward: 1800, security: "Very High", traceSpeed: 8.0, desc: "Classified federal files server. Rapid threat trace response." },
    { id: "nasa-sat", ip: "198.118.248.8", name: "Space-Net Orbital Link", level: 4, reward: 2600, security: "Classified", traceSpeed: 10.0, desc: "NASA telemetry hub link. Quantum-hardened firewalls." },
    { id: "stock-exch", ip: "207.251.200.2", name: "Global Finance Mainframe", level: 5, reward: 6000, security: "Extreme", traceSpeed: 13.0, desc: "The core stock exchange system. Traces connections almost instantly." }
  ];

  // Cyber Security Missions List
  const MISSIONS_DB = [
    { id: "m1", name: "Grade Adjuster", targetId: "local-school", reqLvl: 1, desc: "Infiltrate the local school node and alter a client's history. Decrypt database records.", reward: 100, xpReward: 50 },
    { id: "m2", name: "Retail Hack", targetId: "sm-retail", reqLvl: 1, desc: "Infiltrate corner store system and extract POS transaction log file. Sell information on deep web.", reward: 140, xpReward: 60 },
    { id: "m3", name: "ISP Breach", targetId: "local-isp", reqLvl: 2, desc: "Access the regional ISP router substation. Insert data-sniffing logger.", reward: 300, xpReward: 120 },
    { id: "m4", name: "AeroTech blueprints", targetId: "sec-corp", reqLvl: 2, desc: "Infiltrate AeroTech research division. Retrieve prototype schematics.", reward: 450, xpReward: 180 },
    { id: "m5", name: "Bank Sweep", targetId: "apex-bank", reqLvl: 3, desc: "Penetrate Apex Mutual financial core database. Transfer ledger details.", reward: 900, xpReward: 300 },
    { id: "m6", name: "Grid Disruptor", targetId: "power-grid", reqLvl: 3, desc: "Crack the grid controller to test substation defenses. Execute simulated brownout.", reward: 1300, xpReward: 400 },
    { id: "m7", name: "Intelligence Leaker", targetId: "gov-intel", reqLvl: 4, desc: "Access classified agency files. Extract classified documents for whistleblowers.", reward: 2200, xpReward: 600 },
    { id: "m8", name: "Satellite Relink", targetId: "nasa-sat", reqLvl: 4, desc: "Infiltrate satellite net link. Retrieve telescope observation stream data.", reward: 3000, xpReward: 800 },
    { id: "m9", name: "Global Heist", targetId: "stock-exch", reqLvl: 5, desc: "The ultimate heist. Access the global financial mainframe. Divert stock transaction records.", reward: 7500, xpReward: 1500 }
  ];

  // ── SOUND SYNTHESIS ENGINE (Web Audio API) ──────────────────────────────
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSynthSound(freq, type, duration, volume = 0.1) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      // Smooth tail decay
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio playback failed:", e);
    }
  }

  function playClick() {
    // Short high-pitched pop for keyboard feedback
    playSynthSound(1000, 'sine', 0.05, 0.05);
  }

  function playCmdSuccess() {
    // Ascending chime
    playSynthSound(587.33, 'sine', 0.1, 0.08); // D5
    setTimeout(() => playSynthSound(880, 'sine', 0.2, 0.08), 70); // A5
  }

  function playCmdError() {
    // Low buzzer sound
    playSynthSound(110, 'sawtooth', 0.25, 0.1);
  }

  function playAlarm() {
    // Siren tone
    playSynthSound(660, 'square', 0.15, 0.05);
    setTimeout(() => playSynthSound(440, 'square', 0.15, 0.05), 150);
  }

  function playHackSuccess() {
    // Victory arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playSynthSound(freq, 'sine', 0.3, 0.08);
      }, idx * 100);
    });
  }

  function playHackFail() {
    // Descending fail buzz
    playSynthSound(220, 'sawtooth', 0.2, 0.1);
    setTimeout(() => playSynthSound(146.83, 'sawtooth', 0.4, 0.1), 150);
  }

  // ── DIGITAL MATRIX RAIN EFFECT ──────────────────────────────────────────
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let columns = [];
  const fontSize = 16;
  let matrixInterval = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colCount = Math.floor(canvas.width / fontSize) + 1;
    columns = Array(colCount).fill(0).map(() => Math.random() * -100);
  }

  function drawMatrixRain() {
    // Dark transparent sheet to clear previous frame slowly
    const isLight = document.body.classList.contains('light-matrix');
    ctx.fillStyle = isLight ? 'rgba(244, 247, 245, 0.08)' : 'rgba(3, 10, 5, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get color based on theme class
    let fillStyle = '#00ff41'; // default green
    if (document.body.classList.contains('amber-warmth')) fillStyle = '#ffb700';
    if (document.body.classList.contains('cyberpunk-neon')) fillStyle = '#00ffff';
    if (document.body.classList.contains('blizzard-blue')) fillStyle = '#55ddff';
    if (document.body.classList.contains('stealth-gray')) fillStyle = '#555555';
    if (document.body.classList.contains('light-matrix')) fillStyle = '#0e6b1d';

    ctx.fillStyle = fillStyle;
    ctx.font = fontSize + 'px monospace';

    columns.forEach((y, index) => {
      // Pick random character (hexadecimal or standard matrix glyph)
      const chars = "0123456789ABCDEF%$#@*&^!";
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = index * fontSize;

      ctx.fillText(text, x, y * fontSize);

      // Reset stream if off screen
      if (y * fontSize > canvas.height && Math.random() > 0.985) {
        columns[index] = 0;
      }
      columns[index]++;
    });
  }

  function initMatrixRain() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(drawMatrixRain, 33);
  }

  // ── CORE GAME STATE SAVE/LOAD ──────────────────────────────────────────
  function saveGame() {
    try {
      localStorage.setItem('cuboSapiensHackerSimulator', JSON.stringify(state));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  }

  function loadGame() {
    try {
      const saved = localStorage.getItem('cuboSapiensHackerSimulator');
      if (saved) {
        const loadedState = JSON.parse(saved);
        // Safely merge properties to avoid missing fields on update
        state = { ...state, ...loadedState };
        // Sync HTML components
        document.body.className = state.theme || 'matrix-green';
        document.getElementById('theme-selector').value = state.theme || 'matrix-green';
        if (!state.soundEnabled) {
          document.getElementById('sound-icon').className = 'fa-solid fa-volume-xmark';
        }
      }
    } catch (e) {
      console.warn("Storage load failed, starting fresh.");
    }
    updateDashboardUI();
  }

  function resetGame() {
    if (confirm("WARNING: Are you sure you want to erase all your hacker credentials, custom upgrades, and mission history? This cannot be undone!")) {
      playSynthSound(100, 'sawtooth', 0.5, 0.15);
      localStorage.removeItem('cuboSapiensHackerSimulator');
      state = {
        credits: 100,
        xp: 0,
        level: 1,
        soundEnabled: true,
        theme: 'matrix-green',
        upgrades: { cpu: 1, ram: 1, vpn: 1, bypass: 1 },
        activeMission: null,
        activeTarget: null,
        missionsCompleted: 0
      };
      saveGame();
      document.body.className = 'matrix-green';
      document.getElementById('theme-selector').value = 'matrix-green';
      document.getElementById('sound-icon').className = 'fa-solid fa-volume-high';
      
      const termOut = document.getElementById('terminal-output');
      termOut.innerHTML = '';
      printToTerminal("SYSTEM CLEARED. Local profile wiped successfully.", 'success-msg');
      printToTerminal("Initializing CuboSapiens Security Shell...", 'system-msg');
      printToTerminal("Decryptor firmware loaded successfully.", 'system-msg');
      printToTerminal("Type <span class='cmd-highlight'>help</span> to display authorized command parameters.", 'system-msg');
      
      updateDashboardUI();
    }
  }

  // ── DASHBOARD UI UPDATES ────────────────────────────────────────────────
  function updateDashboardUI() {
    // Sync credentials
    document.getElementById('profile-credits').innerText = `$${state.credits}`;
    
    // Sync reputation XP & Level
    const xpNeeded = state.level * 100;
    document.getElementById('profile-xp').innerText = `${state.xp} / ${xpNeeded}`;
    const xpPct = Math.min((state.xp / xpNeeded) * 100, 100);
    document.getElementById('xp-bar-fill').style.width = `${xpPct}%`;

    // Sync Rank Name
    const RANKS = ["NOVICE", "SCRIPT KIDDIE", "CYBER PHANTOM", "MAINFRAME BREACHER", "NET SHADOW", "ROOT ELITE"];
    const rankName = RANKS[Math.min(state.level - 1, RANKS.length - 1)];
    document.getElementById('profile-rank').innerText = `${rankName} (Lvl ${state.level})`;

    // Sync Hardware Stack inventory strings
    document.getElementById('inv-cpu').innerText = `${UPGRADES_DB.cpu[state.upgrades.cpu - 1].name}`;
    document.getElementById('inv-ram').innerText = `${UPGRADES_DB.ram[state.upgrades.ram - 1].name} (${UPGRADES_DB.ram[state.upgrades.ram - 1].attempts} guesses)`;
    document.getElementById('inv-vpn').innerText = `${UPGRADES_DB.vpn[state.upgrades.vpn - 1].name} (${Math.round(UPGRADES_DB.vpn[state.upgrades.vpn - 1].speedMult * 100)}% trace speed)`;
    document.getElementById('inv-bypass').innerText = `Lvl ${state.upgrades.bypass} (${UPGRADES_DB.bypass[state.upgrades.bypass - 1].cd}s Cooldown)`;

    // Active Target panel status
    const targetPanel = document.getElementById('active-target-panel');
    const targetContent = document.getElementById('target-content-pane');
    const targetTitle = document.getElementById('target-title');

    if (state.activeTarget) {
      targetPanel.classList.remove('locked');
      targetTitle.innerHTML = `<i class="fa-solid fa-link"></i> UPLINK: ESTABLISHED`;
      targetContent.innerHTML = `
        <div class="target-info-item"><span class="stat-lbl">Host IP:</span><span class="stat-val">${state.activeTarget.ip}</span></div>
        <div class="target-info-item"><span class="stat-lbl">Node:</span><span class="stat-val">${state.activeTarget.name}</span></div>
        <div class="target-info-item"><span class="stat-lbl">Security:</span><span class="stat-val">${state.activeTarget.security}</span></div>
        <div class="target-info-item"><span class="stat-lbl">Pay Value:</span><span class="stat-val credit-glow">$${state.activeTarget.reward}</span></div>
        <div style="margin-top:8px;"><button class="keypad-btn" id="dash-crack-btn" style="width:100%;"><i class="fa-solid fa-unlock-keyhole"></i> EXECUTE CRACK</button></div>
      `;
      document.getElementById('dash-crack-btn').addEventListener('click', () => {
        playClick();
        executeTerminalCommand("crack");
      });
      // Toggle button states
      document.getElementById('keypad-bypass-btn').disabled = true;
      document.getElementById('keypad-abort-btn').disabled = false;
    } else {
      targetPanel.classList.add('locked');
      targetTitle.innerHTML = `<i class="fa-solid fa-server"></i> TARGET: INACTIVE`;
      targetContent.innerHTML = `<div class="empty-target-msg">No active uplink established. Initiate connection via terminal.</div>`;
      
      document.getElementById('keypad-bypass-btn').disabled = true;
      document.getElementById('keypad-abort-btn').disabled = true;
    }

    // Sync Local IP (decorative)
    document.getElementById('local-ip').innerText = `NODE::${state.level * 17 + 8}.${state.credits % 254 + 1}`;
  }

  function addXP(amount) {
    state.xp += amount;
    const needed = state.level * 100;
    if (state.xp >= needed) {
      state.xp -= needed;
      state.level++;
      printToTerminal(`[LEVEL UP!] You have established rank reputation. You are now Level ${state.level}!`, 'success-msg');
      playCmdSuccess();
      setTimeout(() => {
        printToTerminal(`Decryption compiler upgraded. Level ${state.level} hosts can now be accessed via 'scan'.`, 'system-msg');
      }, 500);
    }
    updateDashboardUI();
    saveGame();
  }

  // ── TERMINAL EMULATION SYSTEM ──────────────────────────────────────────
  const terminalContainer = document.getElementById('terminal-container');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalForm = document.getElementById('terminal-input-form');
  const terminalInput = document.getElementById('terminal-input');

  function printToTerminal(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }, 10);
  }

  // CLI command parser
  function processCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) return;

    // Echo input
    printToTerminal(`<span class="terminal-prompt">guest@cubosapiens:~$</span> ${input}`, 'user-input-line');

    const tokens = input.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    switch (cmd) {
      case 'help':
        handleHelpCmd();
        break;
      case 'scan':
        handleScanCmd();
        break;
      case 'connect':
        handleConnectCmd(args);
        break;
      case 'disconnect':
        handleDisconnectCmd();
        break;
      case 'crack':
        handleCrackCmd();
        break;
      case 'missions':
        handleMissionsCmd(args);
        break;
      case 'upgrade':
      case 'upgrades':
        handleUpgradeCmd(args);
        break;
      case 'stats':
      case 'status':
        handleStatsCmd();
        break;
      case 'theme':
        handleThemeCmd(args);
        break;
      case 'clear':
        terminalOutput.innerHTML = '';
        break;
      case 'reset':
        resetGame();
        break;
      default:
        printToTerminal(`Unknown command: '${cmd}'. Type <span class="cmd-highlight">help</span> for options.`, 'error-msg');
        playCmdError();
    }

    terminalInput.value = '';
    saveGame();
  }

  function executeTerminalCommand(fullCommandStr) {
    terminalInput.value = fullCommandStr;
    processCommand(fullCommandStr);
  }

  // ── COMMAND HANDLERS ───────────────────────────────────────────────────
  function handleHelpCmd() {
    playCmdSuccess();
    printToTerminal("— CUBOSAPIENS CONSOLE DIRECTORY HELP —", "success-msg");
    printToTerminal("<span class='cmd-highlight'>help</span>                       Show command manual.");
    printToTerminal("<span class='cmd-highlight'>scan</span>                       Locate live network nodes in range.");
    printToTerminal("<span class='cmd-highlight'>connect &lt;ip-address&gt;</span>      Establish secure network handshake connection.");
    printToTerminal("<span class='cmd-highlight'>disconnect</span>                 Sever connection with current host.");
    printToTerminal("<span class='cmd-highlight'>crack</span>                      Execute decryption breach on connected target.");
    printToTerminal("<span class='cmd-highlight'>missions</span>                   Check the Darknet cyber-security job board.");
    printToTerminal("<span class='cmd-highlight'>missions accept &lt;id&gt;</span>      Accept a pending cybersecurity job contract.");
    printToTerminal("<span class='cmd-highlight'>upgrade</span>                    Open the Black Market hardware/software shop.");
    printToTerminal("<span class='cmd-highlight'>upgrade &lt;type&gt;</span>             Purchase component upgrade (cpu/ram/vpn/bypass).");
    printToTerminal("<span class='cmd-highlight'>stats</span>                      Output diagnostic analysis of host hardware.");
    printToTerminal("<span class='cmd-highlight'>theme &lt;theme-name&gt;</span>         Load cosmetic console palette theme.");
    printToTerminal("<span class='cmd-highlight'>clear</span>                      Clean output screen buffers.");
    printToTerminal("<span class='cmd-highlight'>reset</span>                      Wipe all configuration keys and profile data.");
  }

  function handleScanCmd() {
    playCmdSuccess();
    printToTerminal("Scanning cybersecurity network nodes...", "system-msg");
    
    setTimeout(() => {
      printToTerminal("— SCAN DETECTED: OUTWARD NETWORK STACKS —", "success-msg");
      let found = false;
      TARGETS_DB.forEach(t => {
        if (t.level <= state.level) {
          found = true;
          const statusStr = state.activeTarget && state.activeTarget.id === t.id ? "[CONNECTED]" : "";
          printToTerminal(`Node Name: <span class="cmd-highlight">${t.name}</span>`);
          printToTerminal(`  IP Address: <span class="text-warning">${t.ip}</span> | Threat: ${t.security} | Bounty: $${t.reward} ${statusStr}`);
        }
      });
      if (!found) {
        printToTerminal("No targets found in network scanner sweep. Upgrade reputation level.", "error-msg");
      } else {
        printToTerminal("Run <span class='cmd-highlight'>connect &lt;IP&gt;</span> to handshake a specific host target.", "system-msg");
      }
    }, 400);
  }

  function handleConnectCmd(args) {
    if (args.length === 0) {
      printToTerminal("Error: Handshake address required. Usage: connect &lt;ip-address&gt;", "error-msg");
      playCmdError();
      return;
    }

    const ipOrName = args[0];
    const target = TARGETS_DB.find(t => t.ip === ipOrName || t.id === ipOrName || t.name.toLowerCase().includes(ipOrName.toLowerCase()));

    if (!target) {
      printToTerminal(`Failed connection handshake. Host target not found: '${ipOrName}'`, "error-msg");
      playCmdError();
      return;
    }

    if (target.level > state.level) {
      printToTerminal(`Uplink Error: Firewall threat security too high! Level ${target.level} node requires higher reputation.`, "error-msg");
      playCmdError();
      return;
    }

    // Connect
    state.activeTarget = target;
    printToTerminal(`Connecting to ${target.name} [${target.ip}]...`, "system-msg");
    
    setTimeout(() => {
      playCmdSuccess();
      printToTerminal(`[HANDSHAKE SUCCESS] Secure session node tunnel initialized.`, "success-msg");
      printToTerminal(`Warning: Host system firewall trace is alert. Target security: ${target.security}.`, "warning-msg");
      printToTerminal(`Execute <span class='cmd-highlight'>crack</span> to begin data extraction passcode bypass.`, "system-msg");
      updateDashboardUI();
    }, 600);
  }

  function handleDisconnectCmd() {
    if (!state.activeTarget) {
      printToTerminal("Uplink status: No active connections to sever.", "error-msg");
      playCmdError();
      return;
    }
    
    const hostName = state.activeTarget.name;
    state.activeTarget = null;
    playSynthSound(300, 'sawtooth', 0.25, 0.08);
    printToTerminal(`Severed connection uplink to ${hostName}. Secure session ended.`, "warning-msg");
    updateDashboardUI();
  }

  function handleCrackCmd() {
    if (!state.activeTarget) {
      printToTerminal("Error: Decryption unit requires an active server connection. Connect first.", "error-msg");
      playCmdError();
      return;
    }

    // Open decryption minigame modal
    openHackMinigame();
  }

  function handleMissionsCmd(args) {
    playCmdSuccess();
    if (args.length === 0) {
      printToTerminal("— DARKNET BULLETIN BOARD CONTRACTS —", "success-msg");
      
      MISSIONS_DB.forEach(m => {
        const isCompleted = state.missionsCompleted >= MISSIONS_DB.indexOf(m);
        const status = isCompleted ? "[COMPLETED]" : (state.activeMission && state.activeMission.id === m.id ? "[ACTIVE]" : `[Lvl ${m.reqLvl} Req]`);
        
        let colorClass = 'system-msg';
        if (state.activeMission && state.activeMission.id === m.id) colorClass = 'warning-msg';
        if (isCompleted) colorClass = 'muted-color';

        printToTerminal(`Job ID: <span class="cmd-highlight">${m.id}</span> - <span class="text-warning">${m.name}</span> (${status})`, colorClass);
        printToTerminal(`  Objective: ${m.desc}`);
        printToTerminal(`  Credits: $${m.reward} | XP: +${m.xpReward}`);
      });
      
      printToTerminal("Type <span class='cmd-highlight'>missions accept &lt;Job-ID&gt;</span> to lock down a contract.", "system-msg");
      return;
    }

    if (args[0].toLowerCase() === 'accept') {
      if (args.length < 2) {
        printToTerminal("Usage: missions accept &lt;Job-ID&gt;", "error-msg");
        playCmdError();
        return;
      }
      
      const jobId = args[1].toLowerCase();
      const mission = MISSIONS_DB.find(m => m.id === jobId);

      if (!mission) {
        printToTerminal(`Hacking contract ID not found: '${jobId}'`, "error-msg");
        playCmdError();
        return;
      }

      if (mission.reqLvl > state.level) {
        printToTerminal(`Access denied: Contract req lvl ${mission.reqLvl}. Level reputation insufficient.`, "error-msg");
        playCmdError();
        return;
      }

      // Check if already completed
      const mIndex = MISSIONS_DB.indexOf(mission);
      if (state.missionsCompleted > mIndex) {
        printToTerminal("Contract notice: Job has already been executed successfully.", "warning-msg");
        playCmdError();
        return;
      }

      // Accept mission
      state.activeMission = mission;
      const target = TARGETS_DB.find(t => t.id === mission.targetId);
      state.activeTarget = target;

      printToTerminal(`Hacking contract accepted: [${mission.name}]`, "success-msg");
      printToTerminal(`Direct secure link routing initialized to ${target.name} [${target.ip}].`, "system-msg");
      printToTerminal(`Execute <span class='cmd-highlight'>crack</span> to begin data extraction passcode bypass.`, "system-msg");

      updateDashboardUI();
      saveGame();
    }
  }

  function handleUpgradeCmd(args) {
    if (args.length === 0) {
      playCmdSuccess();
      printToTerminal("— BLACK MARKET DECRYPTOR SHOP CATALOG —", "success-msg");
      printToTerminal("Boost hardware slots to penetrate tougher agency mainframe networks.");
      printToTerminal("------------------------------------------------------------------");

      // Print item shop state
      ['cpu', 'ram', 'vpn', 'bypass'].forEach(type => {
        const curLvl = state.upgrades[type];
        const nextUpgrade = UPGRADES_DB[type][curLvl];
        const nameLabel = type.toUpperCase();

        if (nextUpgrade) {
          printToTerminal(`Upgrade: <span class="cmd-highlight">${nameLabel}</span> (Current: Lvl ${curLvl})`);
          printToTerminal(`  Next: Lvl ${curLvl + 1} - ${nextUpgrade.name}`);
          printToTerminal(`  Feature: ${nextUpgrade.desc}`);
          printToTerminal(`  Upgrade Cost: <span class="text-warning">$${nextUpgrade.cost}</span>`);
        } else {
          printToTerminal(`Upgrade: <span class="cmd-highlight">${nameLabel}</span> (Current: Lvl ${curLvl} - MAXED)`);
          printToTerminal(`  You have the highest tier component installed.`);
        }
      });

      printToTerminal("------------------------------------------------------------------");
      printToTerminal("Type <span class='cmd-highlight'>upgrade &lt;cpu/ram/vpn/bypass&gt;</span> to install components.", "system-msg");
      return;
    }

    const type = args[0].toLowerCase();
    if (!['cpu', 'ram', 'vpn', 'bypass'].includes(type)) {
      printToTerminal(`Unknown upgrade type: '${type}'. Select cpu, ram, vpn, or bypass.`, "error-msg");
      playCmdError();
      return;
    }

    const curLvl = state.upgrades[type];
    const shopList = UPGRADES_DB[type];

    if (curLvl >= shopList.length) {
      printToTerminal(`Component upgrade rejected: '${type}' is already max tier level.`, "warning-msg");
      playCmdError();
      return;
    }

    const item = shopList[curLvl];
    if (state.credits < item.cost) {
      printToTerminal(`Transaction rejected: Insufficient credits. Upgrade requires $${item.cost}.`, "error-msg");
      playCmdError();
      return;
    }

    // Buy upgrade
    state.credits -= item.cost;
    state.upgrades[type]++;
    
    playCmdSuccess();
    printToTerminal(`[UPGRADE SUCCESS] Installed ${item.name}!`, "success-msg");
    printToTerminal(`Features loaded: ${item.desc}`, "system-msg");

    updateDashboardUI();
    saveGame();
  }

  function handleStatsCmd() {
    playCmdSuccess();
    printToTerminal("— HOST CONSOLE SYSTEM DIAGNOSTIC —", "success-msg");
    printToTerminal(`Agent reputation rank level: ${state.level}`);
    printToTerminal(`Hacker Reputation Experience: ${state.xp} XP`);
    printToTerminal(`Crypto Wallet balance: $${state.credits} credits`);
    printToTerminal(`Decryption contracts completed: ${state.missionsCompleted}`);
    printToTerminal(`Active Network Uplink: ${state.activeTarget ? state.activeTarget.name : 'None'}`);
    printToTerminal(`Active Job Contract: ${state.activeMission ? state.activeMission.name : 'None'}`);
    
    printToTerminal("Installed Modules:");
    printToTerminal(`  - Decryptor CPU: Lvl ${state.upgrades.cpu} (${UPGRADES_DB.cpu[state.upgrades.cpu - 1].name})`);
    printToTerminal(`  - Memory Buffer: Lvl ${state.upgrades.ram} (${UPGRADES_DB.ram[state.upgrades.ram - 1].name})`);
    printToTerminal(`  - Proxy Shielding VPN: Lvl ${state.upgrades.vpn} (${UPGRADES_DB.vpn[state.upgrades.vpn - 1].name})`);
    printToTerminal(`  - Alert Decoy Bypass: Lvl ${state.upgrades.bypass} (${UPGRADES_DB.bypass[state.upgrades.bypass - 1].name})`);
  }

  function handleThemeCmd(args) {
    if (args.length === 0) {
      printToTerminal("Themes available: <span class='cmd-highlight'>matrix-green</span>, <span class='cmd-highlight'>amber-warmth</span>, <span class='cmd-highlight'>cyberpunk-neon</span>, <span class='cmd-highlight'>blizzard-blue</span>, <span class='cmd-highlight'>stealth-gray</span>, <span class='cmd-highlight'>light-matrix</span>", "system-msg");
      playCmdError();
      return;
    }

    const t = args[0].toLowerCase();
    const themes = ['matrix-green', 'amber-warmth', 'cyberpunk-neon', 'blizzard-blue', 'stealth-gray', 'light-matrix'];
    
    if (!themes.includes(t)) {
      printToTerminal(`Theme unavailable: '${t}'.`, "error-msg");
      playCmdError();
      return;
    }

    state.theme = t;
    document.body.className = t;
    document.getElementById('theme-selector').value = t;
    
    playCmdSuccess();
    printToTerminal(`Loaded custom style sheets for palette: [${t}]`, "success-msg");
    saveGame();
  }

  // ── DECRYPTION MINI-GAME ENGINE ─────────────────────────────────────────
  const hackModal = document.getElementById('hack-modal');
  const modalAbortBtn = document.getElementById('modal-abort-btn');
  const puzzleGuessForm = document.getElementById('puzzle-guess-form');
  const puzzleInput = document.getElementById('puzzle-input');
  const attemptsLogTbody = document.getElementById('attempts-log-tbody');
  const attemptsLeftVal = document.getElementById('attempts-left-val');
  const traceClockPercent = document.getElementById('trace-clock-percent');
  const traceClockBar = document.getElementById('trace-clock-bar');
  const puzzleBypassBtn = document.getElementById('puzzle-bypass-btn');
  const bypassCdText = document.getElementById('bypass-cd-text');

  let activeHack = {
    secretCode: [],
    attempts: [],
    maxAttempts: 6,
    traceProgress: 0,
    traceSpeed: 1,
    bypassOnCooldown: false,
    bypassCdTimer: 0,
    intervals: {
      trace: null,
      cpuReveal: null,
      bypass: null
    }
  };

  function openHackMinigame() {
    initAudio();
    const target = state.activeTarget;
    if (!target) return;

    // Reset game state
    activeHack.attempts = [];
    activeHack.maxAttempts = UPGRADES_DB.ram[state.upgrades.ram - 1].attempts;
    activeHack.traceProgress = 0;
    
    // VPN modifies trace speed multiplier
    const vpnMult = UPGRADES_DB.vpn[state.upgrades.vpn - 1].speedMult;
    activeHack.traceSpeed = target.traceSpeed * vpnMult;
    activeHack.bypassOnCooldown = false;
    activeHack.bypassCdTimer = 0;

    // Generate passcode
    activeHack.secretCode = generateSecretPasscode(4); // 4-digit hex sequence
    console.log("Cheat code bypass:", activeHack.secretCode.join(''));

    // Reset HTML UI elements
    document.getElementById('hud-target-name').innerText = target.name;
    document.getElementById('hud-target-level').innerText = target.security;
    
    const traceValText = vpnMult < 1.0 ? `${target.traceSpeed}x (Reduced by VPN)` : `${target.traceSpeed}x`;
    document.getElementById('hud-target-trace-speed').innerText = traceValText;
    
    attemptsLogTbody.innerHTML = '';
    puzzleInput.value = '';
    attemptsLeftVal.innerText = `${activeHack.maxAttempts} / ${activeHack.maxAttempts}`;
    traceClockPercent.innerText = '0%';
    traceClockBar.style.width = '0%';
    
    const bypassInfo = UPGRADES_DB.bypass[state.upgrades.bypass - 1];
    puzzleBypassBtn.disabled = false;
    bypassCdText.innerText = `Bypass ${bypassInfo.reducePct}% (Ready)`;

    // Open Modal
    hackModal.classList.add('active');
    hackModal.setAttribute('aria-hidden', 'false');
    puzzleInput.focus();

    // Trigger sound
    playSynthSound(440, 'sine', 0.2, 0.08);

    // Initialize timers
    startHackTimers();
  }

  function closeHackMinigame() {
    hackModal.classList.remove('active');
    hackModal.setAttribute('aria-hidden', 'true');
    stopHackTimers();
    updateDashboardUI();
  }

  function startHackTimers() {
    // 1. Trace clock progress loop (runs every 100ms)
    activeHack.intervals.trace = setInterval(() => {
      // Increase trace progress
      activeHack.traceProgress += activeHack.traceSpeed * 0.1; // speed scaled per decisecond
      
      if (activeHack.traceProgress >= 100) {
        activeHack.traceProgress = 100;
        handleHackFailure("TRACE TIMEOUT: Connection intercepted by host firewalls.");
      }

      // Update UI bar
      traceClockPercent.innerText = `${Math.floor(activeHack.traceProgress)}%`;
      traceClockBar.style.width = `${activeHack.traceProgress}%`;

      // Pulse alarm if trace is high
      if (activeHack.traceProgress > 75 && Math.random() > 0.85) {
        playAlarm();
        // Flash trace UI alert
        document.getElementById('alert-panel').className = 'panel alert-panel alert-danger';
        document.getElementById('trace-alert-fill').style.width = `${activeHack.traceProgress}%`;
        document.getElementById('trace-alert-text').innerText = 'WARNING: TRACING';
        document.getElementById('trace-alert-percent').innerText = `${Math.floor(activeHack.traceProgress)}%`;
      } else if (activeHack.traceProgress > 40) {
        document.getElementById('alert-panel').className = 'panel alert-panel alert-warning';
        document.getElementById('trace-alert-fill').style.width = `${activeHack.traceProgress}%`;
        document.getElementById('trace-alert-text').innerText = 'TRACE ACTIVE';
        document.getElementById('trace-alert-percent').innerText = `${Math.floor(activeHack.traceProgress)}%`;
      } else {
        document.getElementById('alert-panel').className = 'panel alert-panel';
        document.getElementById('trace-alert-fill').style.width = `${activeHack.traceProgress}%`;
        document.getElementById('trace-alert-text').innerText = 'SECURE';
        document.getElementById('trace-alert-percent').innerText = `${Math.floor(activeHack.traceProgress)}%`;
      }
    }, 100);

    // 2. CPU Assist auto-revealer loop
    const cpuConfig = UPGRADES_DB.cpu[state.upgrades.cpu - 1];
    if (cpuConfig.revealTime !== Infinity) {
      activeHack.intervals.cpuReveal = setInterval(() => {
        revealCpuHint();
      }, cpuConfig.revealTime);
    }
  }

  function stopHackTimers() {
    if (activeHack.intervals.trace) clearInterval(activeHack.intervals.trace);
    if (activeHack.intervals.cpuReveal) clearInterval(activeHack.intervals.cpuReveal);
    if (activeHack.intervals.bypass) clearInterval(activeHack.intervals.bypass);
  }

  // Generate unique hexadecimal digits
  function generateSecretPasscode(length) {
    const chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    const result = [];
    while (result.length < length) {
      const idx = Math.floor(Math.random() * chars.length);
      const digit = chars[idx];
      if (!result.includes(digit)) {
        result.push(digit);
      }
    }
    return result;
  }

  // CPU Core Assist: Auto reveals 1 correct digit that hasn't been locked yet
  function revealCpuHint() {
    // Find matching positions
    const revealedIndices = [];
    
    // Check what characters the user might have guessed correctly in previous turns
    // Or we simply print a CPU decrypter help line in the main screen console logs
    const hints = [];
    for (let i = 0; i < 4; i++) {
      hints.push(activeHack.secretCode[i]);
    }
    const randIndex = Math.floor(Math.random() * 4);
    const hintChar = hints[randIndex];
    
    playSynthSound(700, 'sine', 0.1, 0.05);
    printToTerminal(`[CPU COMPILER INJECT] Decrypted hint digit at position ${randIndex + 1}: <span class="cmd-highlight">${hintChar}</span>`, 'system-msg');
  }

  // Handle a guess submit
  function submitHackingGuess(e) {
    e.preventDefault();
    playClick();

    const guessVal = puzzleInput.value.trim().toUpperCase();
    
    // Validate guess format
    if (guessVal.length !== 4) {
      alert("Encryption code requires exactly 4 characters.");
      return;
    }

    const regex = /^[0-9A-F]{4}$/;
    if (!regex.test(guessVal)) {
      alert("Encryption passcode can only contain Hex values (0-9, A-F).");
      return;
    }

    // Process guess
    const guessArr = guessVal.split('');
    activeHack.attempts.push(guessVal);
    
    // Check accuracy
    let correctValueAndPos = 0; // correct digit in correct index
    let correctValueOnly = 0;   // correct digit in wrong index

    guessArr.forEach((char, index) => {
      if (char === activeHack.secretCode[index]) {
        correctValueAndPos++;
      } else if (activeHack.secretCode.includes(char)) {
        correctValueOnly++;
      }
    });

    // Add entry row to attempts table log
    const row = document.createElement('tr');
    if (correctValueAndPos === 4) {
      row.className = 'correct-row';
    }
    
    row.innerHTML = `
      <td>${activeHack.attempts.length}</td>
      <td style="letter-spacing: 2px; font-weight: bold;">${guessVal}</td>
      <td>${correctValueOnly + correctValueAndPos}</td>
      <td>${correctValueAndPos}</td>
    `;
    attemptsLogTbody.appendChild(row);

    // Scroll table log to bottom
    const tableContainer = document.querySelector('.attempts-log-container');
    tableContainer.scrollTop = tableContainer.scrollHeight;

    // Reset input
    puzzleInput.value = '';

    // Check Win
    if (correctValueAndPos === 4) {
      handleHackSuccess();
      return;
    }

    // Check Lose (No buffer attempts left)
    const attemptsLeft = activeHack.maxAttempts - activeHack.attempts.length;
    attemptsLeftVal.innerText = `${attemptsLeft} / ${activeHack.maxAttempts}`;

    if (attemptsLeft <= 0) {
      handleHackFailure("FIREWALL LOCKDOWN: Too many unauthorized code attempts. Memory buffer overflow.");
    }
  }

  function handleHackSuccess() {
    stopHackTimers();
    playHackSuccess();
    
    const target = state.activeTarget;
    const mission = state.activeMission;
    
    printToTerminal(`[DECRYPTION SUCCESS] Bypass key compiled for target: ${target.name}.`, "success-msg");
    printToTerminal(`Extracting secure datastream files... Complete.`, "success-msg");
    
    // Calculate bounty
    let finalReward = target.reward;
    let finalXp = target.level * 40;

    if (mission && mission.targetId === target.id) {
      // Completed current active mission contract!
      finalReward = mission.reward;
      finalXp = mission.xpReward;
      
      printToTerminal(`Hacking contract COMPLETED: [${mission.name}]`, "success-msg");
      
      const mIdx = MISSIONS_DB.indexOf(mission);
      if (mIdx === state.missionsCompleted) {
        state.missionsCompleted++;
      }
      state.activeMission = null;
    }

    state.credits += finalReward;
    printToTerminal(`Transferred crypto credits bounty: <span class="cmd-highlight">+$${finalReward} credits</span>.`, "success-msg");
    
    // Sever target
    state.activeTarget = null;
    
    // Close modal after delay
    setTimeout(() => {
      closeHackMinigame();
      addXP(finalXp);
    }, 2000);
  }

  function handleHackFailure(reason) {
    stopHackTimers();
    playHackFail();

    printToTerminal(`[DECRYPTION FAILED] Connection severed. Reason: ${reason}`, "error-msg");
    
    // Apply credit penalty for trace alarm
    const penalty = Math.min(state.credits, state.level * 20);
    state.credits -= penalty;
    printToTerminal(`Trace lockdown fine assessed. Deducted: <span class="text-danger">-$${penalty} credits</span>.`, "error-msg");

    // Close modal after delay
    setTimeout(() => {
      closeHackMinigame();
    }, 2000);
  }

  // Firewall bypass tool active skill
  function triggerFirewallBypass() {
    if (activeHack.bypassOnCooldown || !hackModal.classList.contains('active')) return;

    const bypassInfo = UPGRADES_DB.bypass[state.upgrades.bypass - 1];
    
    // Decrease trace alert progress bar
    activeHack.traceProgress = Math.max(0, activeHack.traceProgress - bypassInfo.reducePct);
    
    playSynthSound(600, 'sine', 0.15, 0.08);
    printToTerminal(`[BYPASS KIT ENGAGED] Signal decoy deployed. Trace decreased by ${bypassInfo.reducePct}%.`, "warning-msg");

    // Put on cooldown
    activeHack.bypassOnCooldown = true;
    puzzleBypassBtn.disabled = true;
    activeHack.bypassCdTimer = bypassInfo.cd;

    activeHack.intervals.bypass = setInterval(() => {
      activeHack.bypassCdTimer--;
      if (activeHack.bypassCdTimer <= 0) {
        clearInterval(activeHack.intervals.bypass);
        activeHack.bypassOnCooldown = false;
        puzzleBypassBtn.disabled = false;
        bypassCdText.innerText = `Bypass ${bypassInfo.reducePct}% (Ready)`;
      } else {
        bypassCdText.innerText = `Cooldown: ${activeHack.bypassCdTimer}s`;
      }
    }, 1000);
  }

  // ── KEYBOARD INTERACTION & VIRTUAL SHORTCUTS ───────────────────────────
  function setupEventListeners() {
    // Terminal commands submit
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = terminalInput.value;
      processCommand(val);
    });

    // Tap on anywhere in CLI box to focus input cursor
    document.getElementById('terminal-container').addEventListener('click', () => {
      terminalInput.focus();
    });

    // Virtual Keypad commands mapping
    document.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        playClick();
        const cmd = e.currentTarget.getAttribute('data-cmd');
        if (cmd === 'bypass') {
          triggerFirewallBypass();
        } else {
          executeTerminalCommand(cmd);
        }
      });
    });

    // Decryption puzzle guess submit
    puzzleGuessForm.addEventListener('submit', submitHackingGuess);

    // Decryption active bypass click
    puzzleBypassBtn.addEventListener('click', () => {
      initAudio();
      triggerFirewallBypass();
    });

    // Abort connection hack modal buttons
    modalAbortBtn.addEventListener('click', () => {
      handleHackFailure("Decryption breach aborted manually by agent.");
    });

    // Sound toggle
    document.getElementById('btn-sound').addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      const soundIcon = document.getElementById('sound-icon');
      if (state.soundEnabled) {
        soundIcon.className = 'fa-solid fa-volume-high';
        initAudio();
        playSynthSound(440, 'sine', 0.1, 0.05);
      } else {
        soundIcon.className = 'fa-solid fa-volume-xmark';
      }
      saveGame();
    });

    // Theme selector change
    document.getElementById('theme-selector').addEventListener('change', (e) => {
      executeTerminalCommand(`theme ${e.target.value}`);
    });

    // Reset game profile button
    document.getElementById('btn-reset-game').addEventListener('click', resetGame);

    // Global Keydowns (Bypass by spacebar, close hack modal by Esc)
    window.addEventListener('keydown', (e) => {
      if (hackModal.classList.contains('active')) {
        if (e.key === ' ' && document.activeElement !== puzzleInput) {
          e.preventDefault();
          triggerFirewallBypass();
        }
        if (e.key === 'Escape') {
          handleHackFailure("Decryption breach aborted manually by agent.");
        }
      }
    });
  }

  // ── APP INITIALIZATION ─────────────────────────────────────────────────
  function init() {
    initMatrixRain();
    setupEventListeners();
    loadGame();
    
    // Focus terminal CLI input initially
    terminalInput.focus();
  }

  // Initialize on page load
  window.addEventListener('DOMContentLoaded', init);

})();
