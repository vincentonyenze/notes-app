// The notes "store": holds the app's data and every way to change it.
// It knows nothing about HTML. When something changes it tells its
// subscribers, and they decide how to show it.
import { createId, debounce } from "./utils.js";
import { saveNotes } from "./storage.js";

// Wait this long after the last keystroke before saving
const SAVE_DELAY_MS = 500;

const state = {
  notes: [],
  selectedId: null, // the note open in the editor, or null
  saveStatus: "idle", // "idle" | "saving" | "saved" | "error"
};

// ===== Subscribers =====
const listeners = [];

// Call `listener(state)` every time the state changes
export function subscribe(listener) {
  listeners.push(listener);
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

// ===== Reading =====
export function getState() {
  return state;
}

export function getSelectedNote() {
  return state.notes.find((note) => note.id === state.selectedId) ?? null;
}

// ===== Changing =====
function persist() {
  const saved = saveNotes(state.notes);
  state.saveStatus = saved ? "saved" : "error";
}

// While typing, save once the user pauses instead of on every key
const persistSoon = debounce(() => {
  persist();
  notify();
}, SAVE_DELAY_MS);

// Save anything still waiting right now (used when the page is closing)
export function flushSave() {
  persistSoon.flush();
}

export function initNotes(notes) {
  state.notes = notes;
  notify();
}

export function createNote() {
  const now = Date.now();
  const note = {
    id: createId(),
    title: "",
    body: "",
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };

  // New array instead of push(), so the old list is never changed
  state.notes = [note, ...state.notes];
  state.selectedId = note.id;
  persist();
  notify();
  return note;
}

// changes: the fields to update, e.g. { title: "Shopping" }
export function updateNote(id, changes) {
  state.notes = state.notes.map((note) =>
    note.id === id ? { ...note, ...changes, updatedAt: Date.now() } : note
  );
  state.saveStatus = "saving";
  notify(); // update the list straight away...
  persistSoon(); // ...but save only once typing pauses
}

// The most recently deleted note and where it was, so it can be undone.
// Kept outside `state` because nothing on screen is drawn from it.
let lastDeleted = null; // { note, index } or null

export function deleteNote(id) {
  const index = state.notes.findIndex((note) => note.id === id);
  if (index === -1) return;

  // Finish any waiting save first, so it can't run after the delete
  persistSoon.flush();
  lastDeleted = { note: state.notes[index], index };

  state.notes = state.notes.filter((note) => note.id !== id);
  if (state.selectedId === id) {
    state.selectedId = null;
  }
  persist();
  notify();
}

// Put the last deleted note back in the same spot and open it
export function undoDelete() {
  if (!lastDeleted) return;

  const { note, index } = lastDeleted;
  lastDeleted = null;

  // slice() copies, so this builds a new array around the restored note
  state.notes = [
    ...state.notes.slice(0, index),
    note,
    ...state.notes.slice(index),
  ];
  state.selectedId = note.id;
  persist();
  notify();
}

// Called when the undo toast goes away: the delete is now final
export function forgetDeleted() {
  lastDeleted = null;
}

// Pass null to close the editor
export function selectNote(id) {
  // Finish saving the note we're leaving before opening another
  persistSoon.flush();
  state.selectedId = id;
  state.saveStatus = "idle";
  notify();
}
