// Entry point: the only script loaded by index.html.
// It connects the pieces: storage -> notes store -> UI, and user events -> store.
import { elements } from "./dom.js";
import { loadNotes } from "./storage.js";
import {
  subscribe,
  initNotes,
  createNote,
  selectNote,
  updateNote,
  deleteNote,
  undoDelete,
  forgetDeleted,
  getState,
  getSelectedNote,
  flushSave,
} from "./notes.js";
import {
  renderList,
  renderEditor,
  renderSaveStatus,
  showToast,
  hideToast,
} from "./ui.js";

// How long the "Undo" option stays on screen after deleting
const UNDO_TIME_MS = 5000;
let toastTimeoutId = null;

// ===== Rendering =====
function render(state) {
  renderList(state.notes, state.selectedId);
  renderEditor(getSelectedNote());
  renderSaveStatus(state.saveStatus);
}

// ===== Event handlers =====
function handleNewNote() {
  createNote();
  elements.titleInput.focus();
}

function handleListClick(event) {
  const card = event.target.closest(".note-card");
  if (!card) return;
  selectNote(card.dataset.id);
}

function handleBack() {
  selectNote(null);
}

// Typing in the title or body updates the open note
function handleEditorInput(event) {
  const { selectedId } = getState();
  if (!selectedId) return;

  if (event.target === elements.titleInput) {
    updateNote(selectedId, { title: elements.titleInput.value });
  } else if (event.target === elements.bodyInput) {
    updateNote(selectedId, { body: elements.bodyInput.value });
  }
}

// No "Are you sure?" popup: delete straight away and offer Undo instead
function handleDelete() {
  const { selectedId } = getState();
  if (!selectedId) return;

  deleteNote(selectedId);
  showToast("Note deleted");

  // Deleting again restarts the countdown (only the latest delete can be undone)
  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(closeToast, UNDO_TIME_MS);
}

function handleUndo() {
  undoDelete();
  closeToast();
  elements.titleInput.focus();
}

function closeToast() {
  clearTimeout(toastTimeoutId);
  hideToast();
  forgetDeleted();
}

// ===== Init =====
elements.newNoteBtn.addEventListener("click", handleNewNote);
elements.notesList.addEventListener("click", handleListClick);
elements.backBtn.addEventListener("click", handleBack);
elements.editor.addEventListener("input", handleEditorInput);
elements.deleteBtn.addEventListener("click", handleDelete);
elements.undoBtn.addEventListener("click", handleUndo);

// Don't lose the last few keystrokes if the tab is closed or hidden
// before the debounced save runs
window.addEventListener("pagehide", flushSave);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) flushSave();
});

// Subscribe first, so loading the notes triggers the first render
subscribe(render);
initNotes(loadNotes());
