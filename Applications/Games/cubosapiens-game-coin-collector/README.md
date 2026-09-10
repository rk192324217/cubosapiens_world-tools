# Coin Collector Game

A fast-paced, standalone browser arcade game built for the **CuboSapiens** platform using vanilla HTML5, CSS3, and JavaScript.

![Coin Collector Arcade Preview](https://cubosapiens.world/games/coin-collector/og-image.png)

---

## 🌟 Game Overview

**Coin Collector** is a 60-second arcade coin rush. Control your explorer hero inside a bounded game arena, dash around to collect gold coins, chain fast pickups to build massive **Combo Multipliers**, grab rare **Cyan Gems**, and unleash **Magnet Power-ups** to draw coins in from afar!

---

## 🕹️ Controls

### Desktop Controls

| Key | Action |
| --- | --- |
| <kbd>W</kbd> / <kbd>↑</kbd> | Move Up |
| <kbd>S</kbd> / <kbd>↓</kbd> | Move Down |
| <kbd>A</kbd> / <kbd>←</kbd> | Move Left |
| <kbd>D</kbd> / <kbd>→</kbd> | Move Right |
| <kbd>W+A</kbd> / <kbd>W+D</kbd> / etc. | Smooth Diagonal Dash |
| <kbd>P</kbd> | Pause / Resume Game |

### Mobile Touch Controls

- **Virtual D-Pad**: Touch and hold the directional arrows (<kbd>▲</kbd> <kbd>◄</kbd> <kbd>▼</kbd> <kbd>►</kbd>) on touchscreens to navigate smoothly. Multi-touch and simultaneous diagonal touch inputs are fully supported.

---

## ✨ Key Features

- **Arcade Art Direction**: Cyberpunk dark mode and bright daylight adventure theme variants with glowing particle trails, HUD meters, and layered arena graphics.
- **Normalized Diagonal Movement**: Diagonal speed vector is normalized ($v / \sqrt{2}$) so moving diagonally is smooth and balanced.
- **Collectible Types & Power-ups**:
  - 🪙 **Gold Coin**: +10 base score points.
  - 💎 **Cyan Super Gem**: +25 base score points with sparkle burst.
  - 🧲 **Magnet Frenzy**: +15 score points + 5 seconds of magnetic coin pull field.
- **Combo Multiplier System**: Collect coins quickly to build $x1 \to x5$ score multipliers!
- **60-Second Coin Rush**: Urgent timer feedback with audio/visual warnings in the final 10 seconds.
- **Web Audio API Synthesizer**: Zero-dependency retro chimes, countdown ticks, high score fanfares, and full Mute controls.
- **Persistent Local Storage**: Automatically saves Best Score, Total Coins collected, Games Played, Theme preferences, and Audio settings in `localStorage`.
- **Accessibility & Reduced Motion**: Keyboard accessible buttons, visible focus indicators, and `prefers-reduced-motion` CSS overrides.

---

## 📂 File Architecture

```txt
Applications/Games/cubosapiens-game-coin-collector/
├── index.html   # Main HTML5 structure, HUD bar, canvas, overlays, metadata
├── style.css    # Responsive theme styling, HUD cards, animations, virtual controller
├── script.js    # Vanilla JS engine (RAF loop, physics, sound synth, local storage)
└── README.md    # Documentation and usage instructions
```

---

## 🚀 How to Run Locally

### Option 1: Direct Browser Opening
Simply double-click or drag `index.html` into any modern web browser (Chrome, Firefox, Edge, Safari, Brave).

### Option 2: Live Server / Local Web Server
1. Open the repository in VS Code or your preferred IDE.
2. Launch Live Server or run an HTTP static server:
   ```bash
   npx serve Applications/Games/cubosapiens-game-coin-collector
   ```
3. Navigate to `http://localhost:3000` in your browser.

---

## 🔗 Route Registration

- **Route**: `/games/coin-collector`
- Integrated with the CuboSapiens database seed system (`apps/api/prisma/seed.ts`).
