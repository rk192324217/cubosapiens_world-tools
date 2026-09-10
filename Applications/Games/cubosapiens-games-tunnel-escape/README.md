# Tunnel Escape — Collapsing Tunnel Arcade Game

A fast-paced, atmospheric browser arcade game built as a standalone application inside the **CuboSapiens** workspace.

## Overview

In **Tunnel Escape**, players pilot an emergency craft through a rapidly collapsing underground tunnel network. Dodge crumbling wall sectors, falling structural beams, and hydraulic gates while escaping the pursuing collapse wave.

- **Route:** `/games/tunnel-escape`
- **Location:** `Applications/Games/cubosapiens-games-tunnel-escape/`

---

## Game Features

- **Collapsing Tunnel Fantasy:** Atmospheric 2.5D hexagonal tunnel corridor with falling debris, depth fog, and dynamic warning lighting.
- **Hero Canvas Viewport:** Minimal overlaid HUD (`SCORE`, `BEST`, `DISTANCE`) keeping the focus entirely on gameplay.
- **4-Phase Smooth Learning Curve:**
  - **Phase 1 (Learning 0–10s):** Gentle introductory phase with slow speed, 52% wide gap ratio, and zero rotation.
  - **Phase 2 (Normal 10–30s):** Moderate speed with falling structural beams.
  - **Phase 3 (Challenging 30–60s):** Crumbling wall sectors and closing gates.
  - **Phase 4 (Advanced 60s+):** Rapid high-speed escape survival mode.
- **Guaranteed Avoidable Hazards:** 100% of generated hazards have a verified safe escape route.
- **Forgiving Collision Physics:** Small logical collision hitbox (`7px` vs `16px` visual craft size) ensuring fair near-miss feedback.
- **Clean Number Formatting:** All scores and distance metrics display as clean integers.

---

## Controls

### Desktop
- **Steer Craft:** `W` / `A` / `S` / `D` or Arrow Keys
- **Pause / Resume:** `Space` bar or HUD Pause icon

### Mobile
- **Direct Touch Drag:** Drag anywhere on the canvas viewport to steer the craft smoothly.

---

## Technical Architecture

Built strictly with native browser web standards:
- `index.html`: Viewport-first markup, minimal overlaid HUD, and floating start/game-over screens.
- `style.css`: Dark industrial charcoal palette (`#07080c`), amber danger accents (`#f97316`), and modern `Rajdhani`/`Inter` typography.
- `script.js`: Pure vanilla JS 2.5D rendering engine (`requestAnimationFrame`), delta-time physics, Web Audio synthesizer, and `localStorage` persistence.
