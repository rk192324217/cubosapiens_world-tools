# Pattern Match

A standalone, browser-based pattern memory arcade game for CuboSapiens.

## Overview

In Pattern Match, players observe a sequence of highlighted grid cells and reproduce the sequence in exact order. As rounds progress, grid size expands from 3x3 to 6x6, sequence length increases, and preview speeds accelerate.

## Features

- **Dynamic Grid Scaling**: Expands from 3x3 up to 6x6 based on round progression.
- **Clear Phase Flow**: Visual distinction between the **Watch Pattern** reveal phase and the **Your Turn** player input phase.
- **Synthesized Audio**: Built-in Web Audio API sound synthesis for pattern notes and feedback without external audio files.
- **Lives & Replay System**: 3 hearts per run and 3 pattern replay chances.
- **Stats Persistence**: High score, sound settings, and color theme preferences saved in `localStorage`.
- **Responsive & Accessible**: Mobile touch-optimized layout, screen reader status announcements, and full keyboard navigation.

## Controls

- **Mouse / Touch**: Tap or click grid cells directly.
- **Keyboard**:
  - `Arrow Keys`: Navigate grid cells.
  - `1-9 Keys`: Select grid cells 1 through 9.
  - `Space` / `Enter`: Activate focused cell.

## Development

Built using standard Vanilla HTML5, CSS3, and ES6 JavaScript with zero external frameworks or build tools.

## Route

`/games/pattern-match`
