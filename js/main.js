// Entry point: the only script loaded by index.html.
// It imports what it needs from the other modules and starts the app.
import { elements } from "./dom.js";
import { createId } from "./utils.js";
import { loadNotes } from "./storage.js";

const notes = loadNotes();
console.log(`Loaded ${notes.length} note(s) from storage:`, notes);
console.log("Example id:", createId(), "| List element:", elements.notesList);
