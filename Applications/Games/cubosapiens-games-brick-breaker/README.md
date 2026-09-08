# Brick Breaker

A retro-arcade **Brick Breaker** game built for the **CuboSapiens** platform using vanilla HTML5 Canvas, CSS custom properties, and JavaScript.

## Overview

Brick Breaker is a classic arcade game where players control a paddle at the bottom of the screen to bounce a ball into a wall of bricks. The objective is to destroy all bricks while preventing the ball from falling below the paddle.

## Features

- **Multi-hit & Reinforced Bricks**: Color-coded brick grid with multi-hit reinforced bricks.
- **Power-up System**: Catch falling items to widen paddle, gain extra lives, slow down ball speed, or trigger fireball mode.
- **Level Progression**: 3 distinct level patterns with increasing challenge and ball speed.
- **Difficulty Modes**: Easy, Medium, and Hard difficulty presets altering paddle size and ball speed.
- **Theme Support**: Seamless Dark Mode and Light Mode toggling with persistent preferences.
- **Responsive Layout**: Adapts gracefully across desktop, tablet, and mobile displays.
- **Audio Feedback**: Built-in retro sound effects synthesized using the Web Audio API without external audio files.

## Controls

### Desktop
- **Left / Right Arrow** or **A / D**: Move paddle left/right.
- **Space**: Launch ball / Pause game.
- **Mouse / Pointer Drag**: Drag paddle directly on the game board.

### Mobile
- **Touch Drag**: Touch and drag anywhere on the canvas board.
- **On-Screen Buttons**: Dedicated **LEFT**, **LAUNCH**, and **RIGHT** touch controls.

## How to Play

1. Choose a difficulty level (**EASY**, **MEDIUM**, **HARD**).
2. Press **START** or hit **Space** to begin and launch the ball.
3. Angle the ball by striking different sections of the paddle.
4. Collect power-ups dropped from destroyed bricks to boost your score and survivability.
5. Clear all bricks on the screen to progress to the next level.

## Technical Implementation

- **Game Engine**: HTML5 Canvas rendering driven by `requestAnimationFrame`.
- **Physics**: Angle-based deflection calculation based on impact offset relative to the paddle center.
- **Audio**: Web Audio API oscillator nodes generating procedural chimes, bounces, and explosions.
- **Zero External Dependencies**: Pure vanilla HTML, CSS, and JS execution.

## File Structure

```text
Applications/Games/cubosapiens-games-brick-breaker/
├── index.html   # Main HTML page structure and accessibility markup
├── script.js    # Canvas game loop, physics engine, powerups, and control handlers
├── style.css    # Responsive layout, arcade CSS variables, and light/dark theme styling
└── README.md    # Documentation
```

## Accessibility

- **Semantic HTML**: Structural `<main>`, `<header>`, `<aside>`, `<nav>`, and `<footer>` elements.
- **Keyboard Operable**: Visible focus states (`:focus-visible`) and non-conflicting keyboard shortcuts.
- **Screen Reader Hints**: Descriptive `aria-label` tags on controls and canvas.

## Persistence

- **High Score**: Persists highest player score in `localStorage` under `cubosapiens_brick_breaker_highscore`.
- **Theme Preference**: Persists selected light/dark theme choice in `localStorage` under `cubosapiens_theme`.

## Development / Usage

Open `index.html` directly in any modern browser or serve via any static web server.
