# Neon Arena Shooter

A fast-paced, retro-cyberpunk arcade shooter. This folder contains the entire game, built using vanilla HTML5 Canvas, CSS3, and JavaScript. 

## Project Structure

- **`index.html`**: The main markup file. It defines the screen structure (Splash, Menu, Game, Game Over) and the UI overlays, including the mobile virtual joysticks and the theme toggle.
- **`styles.css`**: Contains all the styling, layout, and theming. It uses CSS variables extensively to manage the dynamic neon aesthetic and glassmorphism UI.
- **`script.js`**: The core game engine and logic.

## Game Engine Architecture (`script.js`)

The game relies on a custom, lightweight game loop utilizing `requestAnimationFrame`.

### Core Systems
1. **Game Loop**: Separated into `update()` (physics/logic) and `draw()` (canvas rendering).
2. **State Management**: A global `state` object tracks the current screen, score, multiplier, difficulty, and frame count.
3. **Collision Detection**: Simple circular collision detection using Euclidean distance for projectiles hitting enemies, and enemies hitting the player.

### Entity Classes
- **`Player`**: Handles movement across distinct "lanes", firing cooldowns, invulnerability frames, and health.
- **`Enemy`**: Two variants exist (`basic` and `fast`). They spawn at the top of the canvas and move downward.
- **`Projectile`**: Simple entities with a velocity vector, spawned by the player.
- **`Particle`**: Handles the visual explosion effects using a friction and decay model.

### Input Handling
- **Desktop**: Keyboard (WASD/Arrows) for movement across lanes, Space/Mouse Click for shooting.
- **Mobile**: Touch events are captured in `.joystick-zone` elements to simulate dual-stick controls. The left joystick controls lane movement via horizontal swiping, and the right joystick triggers continuous firing.

### Theming System
The game supports a dynamic **Dark Mode** (default) and **Light Mode**.
- CSS handles the UI adjustments via the `.light-theme` class applied to `:root`.
- The Canvas rendering engine dynamically reads from a global `THEME` object in `script.js`, which is updated via the `updateThemeColors()` function whenever the theme toggle is clicked. This ensures that game entities (like the player, enemies, and particles) are drawn with the correct colors for the active theme.
