# ⬛ CuboTimer

A fast, minimal, browser-based **speedcubing timer** built with pure HTML, CSS, and JavaScript. No dependencies. No build step. Just open `index.html`.

---

## Features

- ⏱ **Accurate timer** using `performance.now()` (sub-millisecond precision)
- 🔀 **Scramble generator** for 3×3, 2×2, 4×4, Pyraminx, and Skewb
- 📊 **Live stats**: Best, Ao5, Ao12, Session Mean, Solve Count
- 📋 **Solve history** with +2 / DNF penalty support and per-solve delete
- 💾 **LocalStorage persistence** — solves survive page refreshes
- 📱 **Responsive** — works on mobile (tap-and-hold) and desktop (spacebar)
- 🌑 **Dark mode** by default

---

## How to Use

### Desktop
1. Open `index.html` in any modern browser
2. **Hold SPACE** — timer turns red (ready)
3. **Release SPACE** — timer starts (green)
4. **Press SPACE again** — timer stops and records your solve

### Mobile
1. **Tap and hold** the big timer display
2. **Release** to start the timer
3. **Tap** to stop

---

## Project Structure

```
CuboTimer/
├── index.html      ← App shell & layout
├── style.css       ← All styles (dark theme, responsive)
├── script.js       ← Timer logic, scramble gen, stats
├── README.md       ← This file
└── assets/         ← Icons / fonts (currently via Google Fonts CDN)
```

---

## Supported Puzzles

| Puzzle    | Scramble Length |
|-----------|----------------|
| 3×3       | 20 moves       |
| 2×2       | 9 moves        |
| 4×4       | 40 moves       |
| Pyraminx  | 9 moves        |
| Skewb     | 9 moves        |

---

## Stats Reference

| Stat   | Description                                          |
|--------|------------------------------------------------------|
| Best   | Fastest single solve in current session              |
| Ao5    | Average of last 5 (removes best + worst)             |
| Ao12   | Average of last 12 (removes best + worst)            |
| Mean   | Simple average of all valid solves in session        |
| Count  | Total number of solves in session                    |

---

## Penalties

Each solve in the history supports:
- **+2** — Adds 2 seconds (tap again to remove)
- **DNF** — Did Not Finish (excluded from averages as infinity)

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Full support |
| Firefox | ✅ Full support |
| Safari  | ✅ Full support |
| Edge    | ✅ Full support |

---

## Contributing

This app is part of the **CuboSapian** open source project. PRs must include:
- Screenshots of the working app
- Demo video or GIF
- Reference to the issue being resolved

---

## License

MIT — free to use, fork, and modify.