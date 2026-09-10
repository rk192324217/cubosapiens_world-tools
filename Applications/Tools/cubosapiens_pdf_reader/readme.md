# Cubo PDF

**Free, privacy-first PDF & EPUB reader — runs 100% in the browser.**  
No server uploads. No accounts. Files and progress stored locally via IndexedDB + localStorage.

---

## Project Structure

```
cubo-pdf/
├── index.html          ← Main HTML, metadata, SEO
├── css/
│   └── style.css       ← Comic B&W theme, animations, responsive
├── js/
│   ├── db.js           ← IndexedDB + localStorage helpers
│   ├── reader.js       ← PDF.js & EPUB rendering engine
│   └── app.js          ← UI controller, events, library
└── assets/
    └── logo.png        ← Place your Cubosapiens logo here
```

---

## Deployment

1. Drop `logo.png` into `assets/`
2. Upload the entire folder to your host
3. Point `https://pdf-reader.cubosapiens.world` at the folder root
4. The canonical `https://cubosapiens.world/tools/pdf-reader` is set in `<head>`

No build step, no bundler — pure HTML/CSS/JS.

---

## Features

- **PDF rendering** — PDF.js (Mozilla), page-by-page canvas rendering
- **EPUB rendering** — JSZip, OPF spine parsing, NCX/NAV table of contents
- **Progress saving** — page/chapter auto-saved 700ms after each turn, survives page refresh
- **Continue reading** — last 3 opened books surfaced on library screen
- **Cover thumbnails** — rendered from PDF page 1 or extracted from EPUB zip
- **Delete confirm modal** — with animation
- **Toast notifications**
- **Keyboard navigation** — Arrow keys, Page Up/Down, Escape
- **Touch swipe** — swipe left/right to paginate on mobile
- **Drag & drop** upload
- **Mobile responsive** — 480px, 768px breakpoints, sidebar goes fullscreen on mobile
- **Accessible** — ARIA labels, roles, keyboard focus management

---

## Browser Support

Chrome 90+, Firefox 90+, Safari 15+, Edge 90+  
Requires: IndexedDB, FileReader API, Canvas API