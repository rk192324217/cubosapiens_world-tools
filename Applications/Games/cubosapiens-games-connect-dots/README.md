# Connect Dots 🎮

A classic **Dots and Boxes** browser game built for CuboSapiens.

## How to Play

1. Players take turns clicking the lines between dots.
2. When a player completes all 4 sides of a box, they score a point and take another turn.
3. The player with the most boxes when all lines are filled **wins**!

## Features

- 🎮 **vs AI** or **2 Players** mode
- 🤖 **3 AI difficulty levels** — Easy, Medium, Hard
- 📐 **4 grid sizes** — 4×4, 5×5, 6×6, 7×7
- 🌙 **Dark / Light mode** with persistent preference
- 🔊 **Sound effects** (Web Audio API — no external files)
- ↩️ **Undo** button
- 📱 **Fully responsive** — works on mobile, tablet, desktop
- ♿ **Accessible** — keyboard navigation & ARIA labels
- 💾 **localStorage** — saves theme, sound, and game settings

## Tech Stack

- HTML5
- Vanilla CSS3 (CSS Variables for theming)
- Vanilla JavaScript (ES6+, no dependencies)

## How to Run

Simply open `index.html` in any modern browser. No installation needed.

## File Structure

```
connect-dots/
├── index.html    # Game structure & SEO metadata
├── style.css     # Theming, layout, animations
├── script.js     # Game logic, AI, sound, localStorage
└── README.md     # This file
```

## Author

Built for CuboSapiens — GSSoC '26 Contribution
