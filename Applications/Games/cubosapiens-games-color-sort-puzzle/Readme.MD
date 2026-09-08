# Color Sort Puzzle

A standalone browser puzzle game built for CuboSapiens World Tools.
Pour colored liquid between tubes until every tube holds a single color.

**Live route:** `/games/color-sort-puzzle`
**Folder:** `/Application`


## How to Play

- Click or tap a tube to select it.
- Click or tap another tube to pour the liquid.
- A pour is allowed only when the destination tube is empty or its top color matches the color being poured.
- Complete the puzzle by sorting all colors into their respective tubes.
- Use the keyboard for accessibility:
  - `Tab` — Navigate between tubes
  - `Enter` / `Space` — Select or pour
  - `Esc` — Deselect the current tube


## Features

- Procedurally generated, always-solvable puzzle levels.
- Difficulty increases as you progress through levels.
- Move counter to track your progress.
- Undo moves and restart the current level.
- Shuffle to generate a new puzzle at the current difficulty.
- Best move count and current level saved using `localStorage`.
- Dark and light themes with system preference detection.
- Fully responsive and touch-friendly design.
- No build tools or external runtime dependencies required.
- Accessible keyboard controls and visible focus states.
- `aria-label`s describing tube contents.
- Live-region announcements for moves and completed levels.



## Project Structure

```
color-sort-puzzle/
├── index.html     # Game structure and UI
├── style.css      # Styling, responsive layout, and themes
├── script.js      # Game logic, level generation, and interactions
└── README.md      # Project documentation
```


## Game Logic

The game is implemented using vanilla JavaScript and includes:

- **Level Generation:** Procedurally generates puzzle configurations with increasing difficulty while ensuring generated levels are solvable.
- **Pour Validation:** Checks whether a liquid can be poured based on the destination tube's capacity and top color.
- **Game State:** Tracks the current level, moves, selected tube, and puzzle state.
- **Undo System:** Maintains previous game states to allow players to undo moves.
- **Persistence:** Uses `localStorage` to save the current level and best move counts.
- **Theme System:** Supports dark and light themes and respects the user's system preference.


## Local Development

No build tooling is required. Open `index.html` directly in a browser, or serve the folder using any static file server:

```bash
npx serve color-sort-puzzle
```


## Notes for Reviewers

- Built entirely with vanilla HTML, CSS, and JavaScript.
- No external runtime dependencies.
- Google Fonts are loaded via `<link>` only.
- Game progress is stored locally using `localStorage`.
- No sensitive or personally identifiable information is collected or stored.
- The game is designed to work across desktop and mobile devices with keyboard and touch support.