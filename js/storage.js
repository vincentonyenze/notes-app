// Saving and loading notes in localStorage.
// This is the only module that knows notes live in localStorage, so
// moving them to a server later means changing just this file.
//
// A note looks like:
// {
//   id: "3b241101-...",   // from createId()
//   title: "Shopping",
//   body: "Milk, eggs",
//   pinned: false,
//   createdAt: 1760700000000, // timestamps in ms (Date.now())
//   updatedAt: 1760700000000,
// }

export const STORAGE_KEY = "notes-app:notes";

function isValidNote(note) {
  return (
    Boolean(note) &&
    typeof note.id === "string" &&
    note.id !== "" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    typeof note.pinned === "boolean" &&
    Number.isFinite(note.createdAt) &&
    Number.isFinite(note.updatedAt)
  );
}

export function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];

    // Keep the good notes even if one is damaged, instead of losing them all
    const notes = saved.filter(isValidNote);
    if (notes.length < saved.length) {
      console.warn(`Skipped ${saved.length - notes.length} damaged note(s).`);
    }
    return notes;
  } catch (error) {
    console.error("Could not load notes:", error);
    return [];
  }
}

// Call `callback(notes)` whenever ANOTHER tab saves the notes.
// The "storage" event never fires in the tab that did the saving, only in
// the others, so a tab can't end up reacting to its own saves.
export function watchNotes(callback) {
  window.addEventListener("storage", (event) => {
    // event.key is null when all of localStorage was cleared
    if (event.storageArea !== localStorage) return;
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    callback(loadNotes());
  });
}

// Returns true if the notes were saved, false if the browser refused
// (for example when storage is full), so the UI can tell the user.
export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error("Could not save notes:", error);
    return false;
  }
}
