// The notes "store": holds the app's data and every way to change it.
// It knows nothing about HTML. When something changes it tells its
// subscribers, and they decide how to show it.
import { createId } from "./utils.js";
import { saveNotes } from "./storage.js";

const state = {
  notes: [],
  selectedId: null, // the note open in the editor, or null
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
  saveNotes(state.notes);
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

// Pass null to close the editor
export function selectNote(id) {
  state.selectedId = id;
  notify();
}
