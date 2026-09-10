"use strict";

const STORAGE_KEYS = {
  notes: "noteTakingTool.notes",
  activeNote: "noteTakingTool.activeNoteId",
  theme: "noteTakingTool.theme"
};

const AUTOSAVE_DELAY = 400;

const elements = {
  html: document.documentElement,
  newNoteHeaderBtn: document.getElementById("newNoteHeaderBtn"),
  newNoteBtn: document.getElementById("newNoteBtn"),
  emptyNewNoteBtn: document.getElementById("emptyNewNoteBtn"),
  themeBtn: document.getElementById("themeBtn"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  notesCount: document.getElementById("notesCount"),
  notesList: document.getElementById("notesList"),
  editorEmptyState: document.getElementById("editorEmptyState"),
  editorWorkspace: document.getElementById("editorWorkspace"),
  noteTitle: document.getElementById("noteTitle"),
  noteContent: document.getElementById("noteContent"),
  copyBtn: document.getElementById("copyBtn"),
  deleteBtn: document.getElementById("deleteBtn"),
  deleteDialog: document.getElementById("deleteDialog"),
  saveIndicator: document.getElementById("saveIndicator"),
  updatedAt: document.getElementById("updatedAt"),
  wordCount: document.getElementById("wordCount"),
  characterCount: document.getElementById("characterCount"),
  toast: document.getElementById("toast")
};

let notes = loadNotes();
let activeNoteId = localStorage.getItem(STORAGE_KEYS.activeNote);
let autosaveTimer = null;
let toastTimer = null;

function loadNotes() {
  try {
    const savedNotes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.notes) || "[]"
    );

    if (!Array.isArray(savedNotes)) {
      return [];
    }

    return savedNotes.filter((note) => {
      return (
        note &&
        typeof note.id === "string" &&
        typeof note.title === "string" &&
        typeof note.content === "string"
      );
    });
  } catch (error) {
    console.error("Failed to load notes:", error);
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    setSaveStatus("saved");
    return true;
  } catch (error) {
    console.error("Failed to save notes:", error);
    setSaveStatus("error");
    showToast("Unable to save notes.");
    return false;
  }
}

function generateNoteId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getActiveNote() {
  return notes.find((note) => note.id === activeNoteId) || null;
}

function createNote() {
  flushPendingSave();

  const now = new Date().toISOString();

  const note = {
    id: generateNoteId(),
    title: "",
    content: "",
    createdAt: now,
    updatedAt: now
  };

  notes.unshift(note);
  activeNoteId = note.id;

  localStorage.setItem(STORAGE_KEYS.activeNote, activeNoteId);
  saveNotes();
  render();

  elements.noteTitle.focus();
  showToast("New note created.");
}

function selectNote(noteId) {
  if (noteId === activeNoteId) {
    return;
  }

  flushPendingSave();

  activeNoteId = noteId;
  localStorage.setItem(STORAGE_KEYS.activeNote, activeNoteId);

  render();
}

function scheduleAutosave() {
  const activeNote = getActiveNote();

  if (!activeNote) {
    return;
  }

  activeNote.title = elements.noteTitle.value;
  activeNote.content = elements.noteContent.value;
  activeNote.updatedAt = new Date().toISOString();

  setSaveStatus("saving");
  updateEditorDetails(activeNote);
  updateTextCounts(activeNote.content);

  window.clearTimeout(autosaveTimer);

  autosaveTimer = window.setTimeout(() => {
    autosaveTimer = null;
    sortNotes();
    saveNotes();
    renderNotesList();
  }, AUTOSAVE_DELAY);
}

function flushPendingSave() {
  if (!autosaveTimer) {
    return;
  }

  window.clearTimeout(autosaveTimer);
  autosaveTimer = null;

  sortNotes();
  saveNotes();
}

function sortNotes() {
  notes.sort((firstNote, secondNote) => {
    return (
      new Date(secondNote.updatedAt).getTime() -
      new Date(firstNote.updatedAt).getTime()
    );
  });
}

function deleteActiveNote() {
  if (!activeNoteId) {
    return;
  }

  notes = notes.filter((note) => note.id !== activeNoteId);

  activeNoteId = notes[0]?.id || null;

  if (activeNoteId) {
    localStorage.setItem(STORAGE_KEYS.activeNote, activeNoteId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.activeNote);
  }

  saveNotes();
  render();
  showToast("Note deleted.");
}

async function copyActiveNote() {
  const activeNote = getActiveNote();

  if (!activeNote) {
    showToast("Select a note before copying.");
    return;
  }

  const title = activeNote.title.trim() || "Untitled note";
  const text = `${title}\n\n${activeNote.content}`.trim();

  try {
    await navigator.clipboard.writeText(text);
    showToast("Note copied.");
  } catch (error) {
    const temporaryTextarea = document.createElement("textarea");

    temporaryTextarea.value = text;
    temporaryTextarea.setAttribute("readonly", "");
    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.opacity = "0";

    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();

    const copied = document.execCommand("copy");

    temporaryTextarea.remove();

    showToast(copied ? "Note copied." : "Unable to copy note.");
  }
}

function render() {
  if (activeNoteId && !getActiveNote()) {
    activeNoteId = notes[0]?.id || null;
  }

  renderNotesList();
  renderEditor();
  updateNotesCount();
}

function renderNotesList() {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter((note) => {
    if (!searchTerm) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  });

  elements.notesList.replaceChildren();

  if (filteredNotes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "notes-empty";

    const icon = document.createElement("i");
    icon.className = searchTerm
      ? "fa-solid fa-magnifying-glass"
      : "fa-regular fa-note-sticky";
    icon.setAttribute("aria-hidden", "true");

    const title = document.createElement("p");
    title.textContent = searchTerm
      ? "No matching notes."
      : "No notes yet.";

    const description = document.createElement("span");
    description.textContent = searchTerm
      ? "Try a different search term."
      : "Create one to get started.";

    emptyState.append(icon, title, description);
    elements.notesList.appendChild(emptyState);

    return;
  }

  const fragment = document.createDocumentFragment();

  filteredNotes.forEach((note) => {
    const noteCard = document.createElement("button");

    noteCard.type = "button";
    noteCard.className =
      note.id === activeNoteId ? "note-card active" : "note-card";
    noteCard.dataset.noteId = note.id;
    noteCard.setAttribute("role", "listitem");
    noteCard.setAttribute(
      "aria-label",
      `Open note: ${note.title.trim() || "Untitled note"}`
    );

    const title = document.createElement("span");
    title.className = "note-card-title";
    title.textContent = note.title.trim() || "Untitled note";

    const preview = document.createElement("span");
    preview.className = "note-card-preview";
    preview.textContent =
      note.content.trim() || "No content yet. Start writing your note.";

    const metadata = document.createElement("span");
    metadata.className = "note-card-meta";

    const updatedTime = document.createElement("span");
    updatedTime.textContent = formatRelativeTime(note.updatedAt);

    const wordTotal = document.createElement("span");
    const words = countWords(note.content);
    wordTotal.textContent = `${words} word${words === 1 ? "" : "s"}`;

    metadata.append(updatedTime, wordTotal);
    noteCard.append(title, preview, metadata);
    fragment.appendChild(noteCard);
  });

  elements.notesList.appendChild(fragment);
}

function renderEditor() {
  const activeNote = getActiveNote();
  const noteSelected = Boolean(activeNote);

  elements.editorEmptyState.hidden = noteSelected;
  elements.editorWorkspace.hidden = !noteSelected;

  if (!activeNote) {
    return;
  }

  elements.noteTitle.value = activeNote.title;
  elements.noteContent.value = activeNote.content;

  updateEditorDetails(activeNote);
  updateTextCounts(activeNote.content);
  setSaveStatus("saved");
}

function updateNotesCount() {
  const noteCount = notes.length;

  elements.notesCount.textContent =
    `${noteCount} note${noteCount === 1 ? "" : "s"}`;
}

function updateEditorDetails(note) {
  elements.updatedAt.textContent =
    `Last edited ${formatRelativeTime(note.updatedAt)}`;
}

function countWords(text) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return 0;
  }

  return normalizedText.split(/\s+/).length;
}

function updateTextCounts(content) {
  const words = countWords(content);
  const characters = content.length;

  elements.wordCount.textContent =
    `${words} word${words === 1 ? "" : "s"}`;

  elements.characterCount.textContent =
    `${characters} character${characters === 1 ? "" : "s"}`;
}

function formatRelativeTime(dateValue) {
  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) {
    return "recently";
  }

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 10) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year:
      new Date(dateValue).getFullYear() === new Date().getFullYear()
        ? undefined
        : "numeric"
  }).format(new Date(dateValue));
}

function setSaveStatus(status) {
  const statusOptions = {
    saved: {
      icon: "fa-solid fa-circle-check",
      text: "Saved"
    },
    saving: {
      icon: "fa-solid fa-circle-notch fa-spin",
      text: "Saving..."
    },
    error: {
      icon: "fa-solid fa-circle-exclamation",
      text: "Save failed"
    }
  };

  const selectedStatus = statusOptions[status] || statusOptions.saved;
  const icon = elements.saveIndicator.querySelector("i");
  const text = elements.saveIndicator.querySelector("span");

  elements.saveIndicator.dataset.state = status;

  if (icon) {
    icon.className = selectedStatus.icon;
  }

  if (text) {
    text.textContent = selectedStatus.text;
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  window.clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2500);
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  const darkModeEnabled = theme === "dark";

  elements.html.dataset.theme = theme;
  elements.themeBtn.setAttribute(
    "aria-pressed",
    String(darkModeEnabled)
  );

  elements.themeBtn.setAttribute(
    "aria-label",
    darkModeEnabled
      ? "Switch to light mode"
      : "Switch to dark mode"
  );

  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function toggleTheme() {
  const currentTheme =
    elements.html.dataset.theme === "dark" ? "dark" : "light";

  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function handleSearch() {
  elements.clearSearchBtn.hidden = !elements.searchInput.value;
  renderNotesList();
}

function clearSearch() {
  elements.searchInput.value = "";
  elements.clearSearchBtn.hidden = true;

  renderNotesList();
  elements.searchInput.focus();
}

function handleKeyboardShortcuts(event) {
  const commandKeyPressed = event.ctrlKey || event.metaKey;

  if (!commandKeyPressed) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === "n") {
    event.preventDefault();
    createNote();
    return;
  }

  if (key === "s") {
    event.preventDefault();

    const activeNote = getActiveNote();

    if (!activeNote) {
      showToast("Create or select a note first.");
      return;
    }

    activeNote.title = elements.noteTitle.value;
    activeNote.content = elements.noteContent.value;
    activeNote.updatedAt = new Date().toISOString();

    flushPendingSave();
    sortNotes();
    saveNotes();
    renderNotesList();

    showToast("Note saved.");
    return;
  }

  if (key === "f") {
    event.preventDefault();
    elements.searchInput.focus();
    elements.searchInput.select();
  }
}

function openDeleteDialog() {
  if (!getActiveNote()) {
    return;
  }

  if (
    elements.deleteDialog &&
    typeof elements.deleteDialog.showModal === "function"
  ) {
    elements.deleteDialog.showModal();
    return;
  }

  const confirmed = window.confirm(
    "Delete this note permanently?"
  );

  if (confirmed) {
    deleteActiveNote();
  }
}

function validateElements() {
  const requiredElements = [
    "newNoteHeaderBtn",
    "newNoteBtn",
    "emptyNewNoteBtn",
    "themeBtn",
    "searchInput",
    "clearSearchBtn",
    "notesCount",
    "notesList",
    "editorEmptyState",
    "editorWorkspace",
    "noteTitle",
    "noteContent",
    "copyBtn",
    "deleteBtn",
    "saveIndicator",
    "updatedAt",
    "wordCount",
    "characterCount",
    "toast"
  ];

  const missingElements = requiredElements.filter(
    (elementName) => !elements[elementName]
  );

  if (missingElements.length > 0) {
    console.error(
      `Note Taking Tool could not initialize. Missing elements: ${missingElements.join(
        ", "
      )}`
    );

    return false;
  }

  return true;
}

function initialize() {
  if (!validateElements()) {
    return;
  }

  applyTheme(getPreferredTheme());
  sortNotes();

  if (!activeNoteId && notes.length > 0) {
    activeNoteId = notes[0].id;
    localStorage.setItem(STORAGE_KEYS.activeNote, activeNoteId);
  }

  elements.newNoteHeaderBtn.addEventListener("click", createNote);
  elements.newNoteBtn.addEventListener("click", createNote);
  elements.emptyNewNoteBtn.addEventListener("click", createNote);
  elements.themeBtn.addEventListener("click", toggleTheme);

  elements.searchInput.addEventListener("input", handleSearch);
  elements.clearSearchBtn.addEventListener("click", clearSearch);

  elements.noteTitle.addEventListener("input", scheduleAutosave);
  elements.noteContent.addEventListener("input", scheduleAutosave);

  elements.copyBtn.addEventListener("click", copyActiveNote);
  elements.deleteBtn.addEventListener("click", openDeleteDialog);

  elements.notesList.addEventListener("click", (event) => {
    const noteCard = event.target.closest("[data-note-id]");

    if (!noteCard) {
      return;
    }

    selectNote(noteCard.dataset.noteId);
  });

  if (elements.deleteDialog) {
    elements.deleteDialog.addEventListener("close", () => {
      if (elements.deleteDialog.returnValue === "confirm") {
        deleteActiveNote();
      }
    });
  }

  document.addEventListener("keydown", handleKeyboardShortcuts);
  window.addEventListener("beforeunload", flushPendingSave);

  render();
}

document.addEventListener("DOMContentLoaded", initialize);