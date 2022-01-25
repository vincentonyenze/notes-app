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
  searchQuery: "",
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

// Pinned notes first, then the most recently edited.
// A negative result puts `a` before `b`, a positive one puts it after.
function compareNotes(a, b) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1;
  }
  return b.updatedAt - a.updatedAt;
}

// The order is worked out from the data every time it's needed, not
// stored. sort() changes the array it's called on, so copy it first.
export function getSortedNotes() {
  return [...state.notes].sort(compareNotes);
}

// Case-insensitive: "MILK" finds "Buy milk"
function matchesSearch(note, query) {
  const text = `${note.title}\n${note.body}`.toLowerCase();
  return text.includes(query.toLowerCase());
}

// The notes the list should show: sorted, then narrowed by the search
export function getVisibleNotes() {
  const query = state.searchQuery.trim();
  const sorted = getSortedNotes();
  if (query === "") return sorted;
  return sorted.filter((note) => matchesSearch(note, query));
}

export function setSearchQuery(query) {
  state.searchQuery = query;
  notify();
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

// Pinning doesn't change updatedAt: it isn't an edit to the note
export function togglePin(id) {
  state.notes = state.notes.map((note) =>
    note.id === id ? { ...note, pinned: !note.pinned } : note
  );
  persist();
  notify();
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

  // Another tab may have brought it back already. Don't add it twice.
  if (state.notes.some((existing) => existing.id === note.id)) return;

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

// Another tab saved, and these are its notes. Use them, with one exception:
// if the note open here has newer edits that haven't been saved yet, keep
// ours. Otherwise the other tab would wipe out what you just typed.
export function syncNotes(incoming) {
  const local = getSelectedNote();

  state.notes = incoming.map((note) =>
    local && note.id === local.id && local.updatedAt > note.updatedAt
      ? local
      : note
  );

  // The open note was deleted in the other tab, so close the editor
  if (!state.notes.some((note) => note.id === state.selectedId)) {
    state.selectedId = null;
  }

  // No persist() here: the other tab has already saved these notes. If we
  // kept newer edits, the save that's already waiting will write them.
  notify();
}

// Pass null to close the editor
export function selectNote(id) {
  // Finish saving the note we're leaving before opening another
  persistSoon.flush();
  state.selectedId = id;
  state.saveStatus = "idle";
  notify();
}
