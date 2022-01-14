// Everything that draws on the page. These functions read data and
// update the DOM; they never change the notes themselves.
import { elements } from "./dom.js";
import { escapeRegExp } from "./utils.js";

const UNTITLED = "Untitled note";
const NO_TEXT = "No additional text";
const NO_NOTES = "No notes yet. Create your first one!";

const SAVE_STATUS_TEXT = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "⚠️ Couldn't save. Storage may be full.",
};

// The first line of the body that has something in it. While searching,
// prefer the first line containing the match, so you can see why it's listed.
function getPreview(body, query) {
  const lines = body.split("\n").filter((line) => line.trim() !== "");
  const lowerQuery = query.toLowerCase();
  const matchingLine =
    query && lines.find((line) => line.toLowerCase().includes(lowerQuery));
  return (matchingLine || lines[0])?.trim() ?? NO_TEXT;
}

// Turn "Buy milk" + "mil" into: "Buy ", <mark>mil</mark>, "k"
//
// This builds real DOM nodes instead of an HTML string. With innerHTML,
// a note containing <img src=x onerror=alert(1)> would run as code.
// Text nodes are always shown as plain text, whatever they contain.
function highlight(text, query) {
  if (!query) return [text];

  // The ( ) keep the matches in the result of split(), and "i" ignores
  // case. Matches always land at the odd positions: 1, 3, 5...
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "i"));

  return parts.map((part, index) => {
    if (index % 2 === 0) return part; // plain text (a string becomes a text node)
    const mark = document.createElement("mark");
    mark.textContent = part;
    return mark;
  });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function createNoteCard(note, selectedId, query) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "note-card";
  button.classList.toggle("note-card--pinned", note.pinned);
  button.dataset.id = note.id;
  if (note.id === selectedId) {
    button.setAttribute("aria-current", "true");
  }

  const title = document.createElement("span");
  title.className = "note-card__title";
  title.append(...highlight(note.title.trim() || UNTITLED, query));

  const preview = document.createElement("span");
  preview.className = "note-card__preview";
  preview.append(...highlight(getPreview(note.body, query), query));

  const date = document.createElement("span");
  date.className = "note-card__date";
  date.textContent = formatDate(note.updatedAt);

  button.append(title, preview, date);

  const item = document.createElement("li");
  item.append(button);
  return item;
}

// notes: the notes to show (already sorted and filtered)
// total: how many notes exist, so we can say "2 of 5 notes"
export function renderList({ notes, total, selectedId, query }) {
  const count = notes.length;
  const noun = `note${total === 1 ? "" : "s"}`;
  elements.notesCount.textContent = query
    ? `${count} of ${total} ${noun}`
    : `${total} ${noun}`;

  elements.notesList.replaceChildren(
    ...notes.map((note) => createNoteCard(note, selectedId, query))
  );

  // Two different empty states: no notes at all, or nothing matches
  elements.listEmpty.hidden = count > 0;
  elements.listEmpty.textContent =
    total > 0 ? `No notes match “${query}”.` : NO_NOTES;
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

  // aria-pressed tells screen readers (and our CSS) it's an on/off button
  elements.pinBtn.setAttribute("aria-pressed", String(note.pinned));
  elements.pinBtn.textContent = note.pinned ? "📌 Pinned" : "📌 Pin";
}

export function renderSaveStatus(status) {
  elements.saveStatus.textContent = SAVE_STATUS_TEXT[status];
}

export function showToast(message) {
  elements.toastMessage.textContent = message;
  elements.toast.hidden = false;
}

export function hideToast() {
  elements.toast.hidden = true;
}
