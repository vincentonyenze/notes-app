// Entry point: the only script loaded by index.html.
// It imports what it needs from the other modules and starts the app.
import { elements } from "./dom.js";
import { createId } from "./utils.js";

console.log("Modules loaded ✅", {
  sidebar: elements.notesList,
  exampleId: createId(),
});
