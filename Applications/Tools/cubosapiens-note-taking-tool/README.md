# Note Taking Tool

A lightweight, responsive, and accessible browser-based note taking application built for the CuboSapiens World Tools project.

The tool allows users to create, edit, search, copy, and delete notes directly in the browser. Notes are saved automatically using `localStorage`, so they remain available across browser sessions without requiring a backend or account.

---

## Features

### Note Management
- Create new notes
- Edit note titles and content
- Delete notes with confirmation
- Copy complete notes to the clipboard
- Automatically select the most recently edited note
- Display an empty state when no notes are available

### Search
- Search notes by title
- Search notes by content
- Clear the current search query
- Display a dedicated empty state when no matching notes are found

### Persistent Storage
- Notes are saved automatically using `localStorage`
- The active note is restored after refreshing the page
- Theme preference is stored locally
- No backend or user account is required
- No sensitive user information is collected

### Editor Information
- Automatic save status
- Last edited timestamp
- Word count
- Character count
- Note preview in the sidebar

### Responsive Design
- Desktop-friendly two-column workspace
- Tablet-compatible layout
- Mobile-friendly stacked interface
- Responsive editor controls and note list

### Accessibility
- Semantic HTML structure
- Keyboard-accessible controls
- Visible focus states
- Accessible labels and button descriptions
- ARIA live region for status messages
- Reduced-motion support
- Accessible delete confirmation dialog

---

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + N` / `Cmd + N` | Create a new note |
| `Ctrl + S` / `Cmd + S` | Save the active note |
| `Ctrl + F` / `Cmd + F` | Focus the note search field |

---

## Local Storage
The application uses the following `localStorage` keys:

```text
noteTakingTool.notes
noteTakingTool.activeNoteId
noteTakingTool.theme
```

Stored information includes:
- Note titles
- Note content
- Creation timestamps
- Last updated timestamps
- Selected note ID
- Theme preference

Clearing browser storage will remove saved notes and preferences.

---

## Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript
- `localStorage`
- Font Awesome
- Google Fonts

No frameworks, build tools, or backend services are required.

---
