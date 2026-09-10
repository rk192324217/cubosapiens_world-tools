# Diff Checker

A standalone browser-based Diff Checker tool built with HTML, CSS, and JavaScript. It compares two blocks of text line by line and highlights added, removed, and unchanged lines. All processing is performed locally in the browser, ensuring fast performance and privacy.

---

## Features

- Compare two text blocks line by line
- Highlight added, removed, and unchanged lines
- Display comparison statistics
- Copy comparison results to the clipboard
- Swap original and modified text
- Clear inputs and comparison results
- Responsive design for desktop and mobile devices
- Light and Dark mode support
- Keyboard accessibility
- Local theme preference using `localStorage`
- Fully browser-based (no backend required)

---

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/rk192324217/cubosapiens_world-tools.git
   ```

2. Navigate to the project directory:

   ```text
   Application/Tools/diff-checker/
   ```

3. Open `index.html` in any modern web browser.

### Recommended

Use **VS Code Live Server** for development:

1. Open the repository in VS Code.
2. Navigate to `Application/Tools/diff-checker/`.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

---

## Usage Instructions

1. Enter or paste the original text into the **Original Text** editor.
2. Enter or paste the updated text into the **Modified Text** editor.
3. Click **Compare** to generate the differences.
4. Review the highlighted output:
   - **+** indicates an added line.
   - **−** indicates a removed line.
   - Unmarked lines are unchanged.
5. Click **Copy Result** to copy the generated diff.
6. Use **Swap** to exchange the two text inputs.
7. Use **Clear** to reset the editors and comparison output.
8. Toggle **Dark/Light Mode** using the theme button.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl/Cmd + Enter** | Compare text |
| **Ctrl/Cmd + Shift + X** | Swap inputs |
| **Ctrl/Cmd + Shift + C** | Copy comparison result |

---

## Project Structure

```text
Applications/
└── Tools/
    └── diff-checker/
        ├── assets/
        ├── app.js
        ├── index.html
        ├── README.md
        └── style.css
```

---