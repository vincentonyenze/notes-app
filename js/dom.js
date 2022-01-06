// Every element the app needs, looked up once and shared with other modules
export const elements = {
  app: document.querySelector(".app"),

  // Sidebar
  newNoteBtn: document.getElementById("new-note-btn"),
  searchInput: document.getElementById("search-input"),
  notesCount: document.getElementById("notes-count"),
  notesList: document.getElementById("notes-list"),
  listEmpty: document.getElementById("list-empty"),

  // Editor
  editorEmpty: document.getElementById("editor-empty"),
  editor: document.getElementById("editor"),
  backBtn: document.getElementById("back-btn"),
  editorMeta: document.getElementById("editor-meta"),
  saveStatus: document.getElementById("save-status"),
  pinBtn: document.getElementById("pin-btn"),
  deleteBtn: document.getElementById("delete-btn"),
  titleInput: document.getElementById("note-title"),
  bodyInput: document.getElementById("note-body"),

  // Toast
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toast-message"),
  undoBtn: document.getElementById("undo-btn"),
};
