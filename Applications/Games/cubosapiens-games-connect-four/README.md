# Connect Four Design Overview

The Connect Four game features a modern, premium aesthetic that blends nostalgic retro arcade elements with contemporary UI trends like glassmorphism and ambient lighting. 

## Key Design Principles

1. **Glassmorphism UI**
   - The primary UI elements (such as the title block, player scoreboards, and the game board itself) use a glass-like effect. This is achieved using semi-transparent backgrounds (`rgba`), background blur (`backdrop-filter: blur()`), and subtle translucent borders.
   - This creates a layered, "floating" appearance that feels lightweight and modern.

2. **Ambient Glows**
   - We use large, highly blurred `radial-gradient` backgrounds to cast soft, atmospheric glows behind the content.
   - The colors of the glows match the key interactive elements (e.g., Red for Player 1, Yellow/Gold for Player 2), enhancing the game's dynamic feel.

3. **Neon Accents and Typography**
   - Tokens and text employ `text-shadow` and `box-shadow` to produce a glowing neon effect.
   - The typography pairs the elegant **Cinzel** font for bold headers with the clean **Outfit** sans-serif font for standard text, giving the interface a sharp, polished look.

4. **Animations and Micro-interactions**
   - Smooth hover states on buttons provide immediate feedback.
   - Game tokens use a custom cubic-bezier `dropIn` animation to simulate gravity when they fall into the board.
   - Winning tokens are highlighted with a continuous pulsing animation (`pulseWin`) to draw the player's attention to the victory condition.

5. **Dynamic Theming (Dark & Light Mode)**
   - The game supports both **Dark Mode** (default) and **Light Mode**.
   - A theme toggle in the header dynamically swaps the CSS custom properties (`:root` variables) attached to the document. 
   - Light mode retains the premium feel by substituting deep blacks with soft grays and whites, while adjusting the neon glows and token colors to maintain high contrast and accessibility. 
