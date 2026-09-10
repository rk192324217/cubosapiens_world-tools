# Cubo Random Text Generator

A production-quality, browser-based Random Text & Placeholder Data Generator built for the [CuboSapiens](https://cubosapiens.world) ecosystem.

Generate Lorem Ipsum, random English words, sentences, paragraphs, secure passwords, and structured mock data schemas (JSON, HTML, Markdown) instantly — entirely client-side.

---

## Overview

Cubo Random Text Generator is a standalone developer utility that provides a clean, modern interface for generating placeholders and dummy text. It features custom character pools for strong password creation, schema options for mock databases, markdown configurations, light/dark themes, instant file downloads, keyboard shortcuts, and live statistics — all running locally with zero dependencies.

---

## Features

### Core Generators

- **Lorem Ipsum** — Standard placeholder text with custom paragraph counts, with or without the traditional start phrase.
- **Random Words** — Generate random lists of dictionary terms.
- **Sentences** — Generate custom length sentences with customizable words-per-sentence limits.
- **Paragraphs** — Generate custom paragraphs with customizable words-per-sentence and sentences-per-paragraph ranges.
- **Secure Passwords** — Strong passwords with configurable pools (uppercase, lowercase, numbers, symbols) and a custom readable toggle (avoids confusing characters like `l`, `1`, `O`, `0`).
- **Mock Data Sets** — Structured data records for User Profiles, Product Catalogs, Blogs, and Tasks, exported in JSON, HTML, or Markdown.

### UI / UX

- **Dark Mode & Light Mode** — Sleek toggle with persistent preference state.
- **Fullscreen Mode** — Expand the generator workspace to occupy the full viewport.
- **Live Statistics Panel** — Dynamic counting of paragraphs, sentences, words, characters, and estimated reading time (assuming 200 WPM).
- **Toast Notifications** — Beautiful unobtrusive notifications for copy/download actions.
- **Keyboard Shortcuts** — Full keyboard access.
- **Responsive Layout** — Full mobile, tablet, and desktop layout compatibility.
- **Accessibility** — Semantic HTML structure, screen reader friendly labels, focus-ring states, and high contrast styling.
- **Reduced Motion** — Adapts to OS-level animations preference (`prefers-reduced-motion`).

---

## Installation

No installation required. This is a standalone browser application.

### Running Locally

1. Open the project folder in your terminal or editor.
2. Right-click `index.html`.
3. Click **Open with Live Server** (VS Code extension).

Or simply double-click and run `index.html` in any modern web browser.

---

## Usage

1. Select your **Generator Type** (Lorem Ipsum, Words, Sentences, Paragraphs, Passwords, Mock Data).
2. Configure options in the left settings panel (Length, ranges, character pools).
3. Select the preferred **Output Format** (Plain text, HTML wrappers, Markdown, or JSON).
4. Click **Generate** (or press `Ctrl + Shift + G`).
5. Review the text and live statistics in the right panel.
6. Click **Copy** to save to your clipboard or **Download** to save as a file.

---

## Folder Structure

```txt
random-text-generator/
├── index.html       Main application layout & structure
├── style.css        Glassmorphic theme, typography, dark/light modes
├── script.js        Text generation engines, stats, state management, shortcuts
├── README.md        Documentation and user manual (This file)
└── assets/          Application logo and icons
```

---

## Keyboard Shortcuts

| Shortcut           | Action                  |
|--------------------|-------------------------|
| `Ctrl + Shift + G` | Generate random text    |
| `Ctrl + Enter`     | Generate random text    |
| `Ctrl + L`         | Clear generated output  |
| `Esc`              | Close fullscreen mode   |

---

## Browser Support

| Browser          | Supported |
|------------------|-----------|
| Chrome 90+       | Yes       |
| Firefox 88+      | Yes       |
| Safari 14+       | Yes       |
| Edge 90+         | Yes       |
| Mobile Chrome    | Yes       |
| Mobile Safari    | Yes       |

---

## Tech Stack

- HTML5 (Semantic and ARIA compliant)
- CSS3 (Vanilla CSS variables, grid/flex layouts, transition effects)
- JavaScript (Vanilla ES6+ module patterns)
- Font Awesome (CDNs for modern iconography)
- DM Sans / DM Mono (Google Fonts CDN)

Zero frameworks, zero node-modules bundle size, and zero tracking scripts.

---

## Route

`/tools/random-text-generator`

---

## License

MIT

---

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) and [CONTRIBUTING_TOOLS.md](../../CONTRIBUTING_TOOLS.md) for community guidelines.

---

<p align="center">
  Built for the CuboSapiens Open Source Community
</p>
