# Cubo HTML Formatter

A production-quality, browser-based HTML Formatter utility built for the [CuboSapiens](https://cubosapiens.world) ecosystem.

Format, beautify, minify and preview HTML instantly — no signup, no paywalls, completely free.

---

## Overview

Cubo HTML Formatter is a standalone developer tool that provides a clean, modern interface for formatting HTML code. It features real-time preview, syntax highlighting, search, keyboard shortcuts, and persistent preferences — all running entirely client-side with zero dependencies.

---

## Features

### Core

- **Format / Beautify HTML** — Proper indentation with configurable indent size
- **Minify HTML** — Strip whitespace, comments, and unnecessary characters
- **Live Preview** — Rendered HTML preview in a sandboxed iframe
- **Syntax Highlighting** — Color-coded tags, attributes, strings, comments
- **Copy Output** — One-click clipboard copy with toast feedback
- **Download Output** — Save formatted HTML as `formatted.html`
- **Upload HTML** — Load `.html` / `.htm` files via file picker
- **Drag & Drop** — Drop files directly onto the editor
- **Search** — Find and navigate matches within output

### UI / UX

- **Dark Mode & Light Mode** — Toggle with persistent preference
- **Fullscreen Editor** — Expand the editor to fill the viewport
- **Statistics Panel** — Lines, characters, tags, file size, format time
- **Toast Notifications** — Animated feedback (no browser alerts)
- **Keyboard Shortcuts** — Full keyboard accessibility
- **Responsive Design** — Desktop, tablet, and mobile support
- **Accessibility** — ARIA labels, focus indicators, semantic HTML
- **Reduced Motion** — Respects `prefers-reduced-motion`

### Preferences (Persisted via localStorage)

- Theme (light / dark)
- Last HTML input
- Indentation (2 spaces / 4 spaces / tabs)
- Wrap lines toggle
- Auto copy toggle

---



## Installation

No installation required. This is a standalone browser application.

### Running Locally

1. Open the project folder
2. Right-click `index.html`
3. Click **Open with Live Server** (VS Code extension)

Or simply open `index.html` in any modern browser.

---

## Usage

1. **Paste** your HTML into the input panel (or drag & drop a file)
2. Click **Format** to beautify, or **Minify** to compress
3. View the **Live Preview** below the editor
4. **Copy** or **Download** the output
5. Adjust settings: indent size, wrap lines, auto copy

---

## Folder Structure

```
cubosapiens_html_formatter/
├── index.html       Main application structure
├── style.css        Styling, themes, responsive layout
├── script.js        Logic, formatting engine, interactivity
├── README.md        This file
└── assets/          Images, icons, fonts
```

---

## Keyboard Shortcuts

| Shortcut                 | Action          |
|--------------------------|-----------------|
| `Ctrl + Shift + F`      | Format HTML     |
| `Ctrl + L`              | Clear all       |
| `Ctrl + O`              | Upload file     |
| `Esc`                   | Exit fullscreen |

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

- HTML5
- CSS3
- JavaScript (Vanilla ES6+)
- Font Awesome (icons via CDN)
- DM Sans / DM Mono (fonts via Google Fonts CDN)

No frameworks. No build tools. Zero dependencies.

---

## Route

`/tools/html-formatter`

---

## Future Improvements

- HTML validation with error highlighting
- Diff view (before / after)
- Multiple file support
- Custom formatting rules
- Export to PDF
- PWA / offline support

---

## License

MIT

---

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) and [CONTRIBUTING_TOOLS.md](../../CONTRIBUTING_TOOLS.md) for guidelines.

---

<p align="center">
  Built for the CuboSapiens Open Source Community
</p>
