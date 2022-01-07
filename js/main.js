// Entry point: the only script loaded by index.html.
// It connects the pieces: storage -> notes store -> UI, and user events -> store.
import { elements } from "./dom.js";
import { loadNotes } from "./storage.js";
import { subscribe, initNotes, createNote, selectNote, getSelectedNote } from "./notes.js";
import { renderList, renderEditor } from "./ui.js";

// ===== Rendering =====
function render(state) {
  renderList(state.notes, state.selectedId);
  renderEditor(getSelectedNote());
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

// ===== Init =====
elements.newNoteBtn.addEventListener("click", handleNewNote);
elements.notesList.addEventListener("click", handleListClick);
elements.backBtn.addEventListener("click", handleBack);

// Subscribe first, so loading the notes triggers the first render
subscribe(render);
initNotes(loadNotes());
