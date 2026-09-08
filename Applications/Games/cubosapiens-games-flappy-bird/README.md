# Flappy Bird Clone

A modern, retro-styled Flappy Bird clone for CuboSapiens with smooth 60 FPS gameplay and comprehensive accessibility features.

## 🎮 Gameplay
Navigate your bird through an endless series of pipes! Tap, click, or press the spacebar to make the bird flap and avoid crashing into the pipes or boundaries. The game gets progressively challenging as you advance through more pipes.

## 🕹️ Controls
- **Keyboard**: Press `Spacebar` to flap the bird's wings
- **Mouse**: Click anywhere on the game canvas to flap
- **Touch**: Tap the screen on mobile devices to flap
- **Pause**: Press `Escape` to pause/resume the game
- **Restart**: Press `Enter` or `Spacebar` on the Game Over screen to play again

## ✨ Features
- **60 FPS Gameplay**: Smooth, responsive controls with requestAnimationFrame game loop
- **Physics Engine**: Realistic gravity and jump mechanics
- **Infinite Scrolling**: Procedurally generated pipes with random gap positions
- **Collision Detection**: Precise collision detection between bird and pipes
- **Particle Effects**: Visual feedback with jump and death particle effects
- **Score Tracking**: Real-time scoring with persistent high score storage
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard support, ARIA labels, and screen reader compatibility
- **Theme Integration**: Follows CuboSapiens neon cyberpunk aesthetic
- **Auto-Pause**: Automatically pauses when browser tab becomes inactive
- **Local Storage**: Persistent best score tracking across sessions

## 🛠️ Technical Stack
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **CSS3**: Custom properties for theming, glassmorphism effects, neon glows
- **Vanilla JavaScript**: Delta-time based game loop, efficient collision detection
- **Font Awesome Icons**: UI iconography
- **Google Fonts**: Press Start 2P (retro gaming font), VT323 (monospace)
- **Local Storage API**: Persistent data storage

## 🎨 Design Elements
- **Color Palette**: CuboSapiens neon colors (orange #ff6a00, cyan #00f5ff, etc.)
- **Visual Effects**: Scanline overlay, neon glows, particle systems
- **Typography**: Retro gaming fonts with pixel-perfect rendering
- **Responsive Layout**: Mobile-first design with touch-friendly controls
- **Accessibility**: High contrast, focus indicators, screen reader support

## 🏗️ Architecture
- **State Management**: Clean game state transitions (start → playing → paused → gameover)
- **Object-Oriented**: Modular game objects (bird, pipes, particles)
- **Event-Driven**: Comprehensive input handling for all device types
- **Performance Optimized**: Efficient rendering loop, minimal DOM manipulation
- **Error Handling**: Graceful degradation and fallback mechanisms

## 📱 Browser Compatibility
- Modern browsers with Canvas and ES6+ support
- Chrome 60+, Firefox 55+, Safari 10+, Edge 79+
- Mobile Safari (iOS 10+), Chrome Mobile (Android 5+)
- Progressive Web App ready