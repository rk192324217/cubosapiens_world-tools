# Cube Hopper — Retro Arcade Edition 🕹️

An isometric 3D platformer game with a retro 8-bit arcade aesthetic, procedural platform generation, floating canvas score popups, hop combo multipliers, and an Arcade Hub tabbed modal. Developed for the **CuboSapiens** ecosystem.

## ✨ Features

- **2.5D Isometric Render Engine**: Smooth 60 FPS HTML5 Canvas rendering loop.
- **Retro Arcade Theme**: Authentic 8-bit pixel typography (`Press Start 2P`), CRT scanlines overlay, and LED digital score displays.
- **Dynamic Combo Engine**: Fast consecutive hops build up score multipliers (`x1`, `x2`, `x3`, `x4 MASTER!`).
- **Canvas Floating Text**: Animated score popups (`+10`, `+50 GEM!`, `SPRING BOOST!`, `BADGE UNLOCKED!`) rendered on top of isometric coordinates.
- **Unified Arcade Hub Modal**:
  - 🏆 **Hall of Fame Scores**: High scores table with 3-letter player initials entry (`AAA`).
  - 📊 **Lifetime Stats**: Total games played, hops, gems, highest combo, and average score.
  - 🎨 **Cube Skins**: Selectable 8-bit avatar skins (*Cyber Cyan*, *Neon Pink*, *Emerald Spark*, *Gold Master*).
  - 🎖️ **Arcade Badges**: Unlockable trophies (*First Hop*, *Gem Collector*, *Century Hopper*, *Combo King*, *Spring Booster*, *Retro Master*).
  - ⚙️ **Cabinet Setup**: CRT Scanline effect toggle, procedural chiptune sound switch, and data reset.
- **Procedural Audio Synth**: 8-bit retro sound FX generated dynamically using the Web Audio API.
- **LocalStorage Persistence**: Saves high scores, statistics, unlocked badges, skins, and CRT settings.
- **Cross-Platform Controls**: Responsive desktop keyboard and touch D-Pad / Jump controls for mobile devices.

---

## 🎮 Controls

### Desktop Keyboard

| Key | Action |
|---|---|
| `Space` / `W` / `Up` | Hop Forward |
| `A` / `Left` | Hop Left |
| `D` / `Right` | Hop Right |
| `P` | Pause / Resume Game |

### Mobile Touch Controls

- **D-Pad Left / Right**: Hop diagonally left or right
- **HOP Button**: Hop forward

---

## 🧱 Platform Types

- **Normal**: Solid cubic platform
- **Moving**: Oscillating platform
- **Crumbling**: Falls away shortly after landing
- **Spring**: Boosts hop distance and height

---

## 🛠️ Tech Stack

- **HTML5 Canvas**: 2.5D Isometric rendering loop & floating text system
- **Vanilla CSS**: CSS custom properties, retro CRT scanline overlays, pixel typography
- **Vanilla JavaScript (ES6+)**: OOP Architecture, Web Audio API procedural synthesizer, LocalStorage API

---

## 📂 Folder Structure

```txt
Applications/Games/cube-hopper/
├── index.html     # Game layout, HUD chips & Arcade Hub modal tabs
├── style.css      # Retro arcade styles, CRT scanlines & modal themes
├── script.js     # Engine loop, combo system, leaderboard & audio synth
└── README.md      # Game documentation
```

---

## 🚀 Running Locally

1. Open `Applications/Games/cube-hopper/index.html` directly in any modern web browser.
2. Or serve via Live Server / any local web server.
