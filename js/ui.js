// Everything that draws on the page. These functions read data and
// update the DOM; they never change the notes themselves.
import { elements } from "./dom.js";

const UNTITLED = "Untitled note";
const NO_TEXT = "No additional text";

const SAVE_STATUS_TEXT = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "⚠️ Couldn't save. Storage may be full.",
};

// First line of the body that has something in it
function getPreview(body) {
  const firstLine = body.split("\n").find((line) => line.trim() !== "");
  return firstLine?.trim() ?? NO_TEXT;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function createNoteCard(note, selectedId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "note-card";
  button.dataset.id = note.id;
  if (note.id === selectedId) {
    button.setAttribute("aria-current", "true");
  }

  const title = document.createElement("span");
  title.className = "note-card__title";
  title.textContent = note.title.trim() || UNTITLED;

  const preview = document.createElement("span");
  preview.className = "note-card__preview";
  preview.textContent = getPreview(note.body);

  const date = document.createElement("span");
  date.className = "note-card__date";
  date.textContent = formatDate(note.updatedAt);

  button.append(title, preview, date);

  const item = document.createElement("li");
  item.append(button);
  return item;
}

export function renderList(notes, selectedId) {
  const count = notes.length;
  elements.notesCount.textContent = `${count} note${count === 1 ? "" : "s"}`;

  elements.notesList.replaceChildren(
    ...notes.map((note) => createNoteCard(note, selectedId))
  );
  elements.listEmpty.hidden = count > 0;
}

export function renderEditor(note) {
  const hasNote = note !== null;
  elements.editor.hidden = !hasNote;
  elements.editorEmpty.hidden = hasNote;
  // On phones, show the editor instead of the list while a note is open
  elements.app.classList.toggle("is-editing", hasNote);

  if (!hasNote) return;

  // Only touch the inputs if the text is different. Setting .value
  // resets the cursor, which would be very annoying while typing.
  if (elements.titleInput.value !== note.title) {
    elements.titleInput.value = note.title;
  }
  if (elements.bodyInput.value !== note.body) {
    elements.bodyInput.value = note.body;
  }
  elements.editorMeta.textContent = `Edited ${formatDate(note.updatedAt)}`;
}

export function renderSaveStatus(status) {
  elements.saveStatus.textContent = SAVE_STATUS_TEXT[status];
}
