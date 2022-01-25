# Notes App

A notes app for writing, pinning, searching and organising notes, built with plain HTML, CSS and JavaScript. No frameworks or libraries.

This is **Project 7** in my beginner-to-expert web development roadmap, and the first one split into ES modules.

<!-- Add a screenshot: save one as screenshot.png in this folder and uncomment the line below -->
<!-- ![Notes App screenshot](screenshot.png) -->

## Features

- Create, edit and delete notes
- Autosave while you type (saves once you pause, with a "Saving…" / "Saved" status)
- Delete straight away with a 5-second **Undo** instead of an "Are you sure?" popup
- 📌 Pin important notes to the top of the list
- Notes sorted by pinned first, then most recently edited
- Search titles and text, with matches highlighted (press Esc to clear)
- Relative edit times ("just now", "5 minutes ago", "yesterday") that keep themselves up to date
- Changes appear instantly in every open tab of the app
- Notes are kept after refreshing or closing the browser
- Separate empty states for "no notes yet" and "nothing matches"
- Keyboard and screen-reader friendly
- Responsive: side-by-side on desktop, list and editor take turns on phones

## Built with

- HTML5 (`<time>`, `aria-pressed`, `aria-current`, live regions)
- CSS3 (custom properties, Flexbox, Grid, responsive layout)
- Vanilla JavaScript (ES6+) split into **ES modules** (`import` / `export`)
- Browser APIs: `localStorage`, the `storage` event, `crypto.randomUUID()`, `Intl.RelativeTimeFormat`, `visibilitychange` / `pagehide`

## How it works

The code follows one direction: **user action → store → subscribers → screen**.

1. **Events** (typing, clicking) in `main.js` call functions in the notes store, such as `updateNote()` or `togglePin()`.
2. **The store** (`notes.js`) changes the data, saves it through `storage.js`, and tells its subscribers that something changed.
3. **The UI** (`ui.js`) redraws the list and editor from the current data. It never changes the notes itself.
4. **Other tabs** hear about each save through the `storage` event and load the new notes.

Only `storage.js` knows the notes live in `localStorage`, so moving them to a server later means changing one file.

## What I learned

- **ES modules:** splitting code into files with `import` / `export`, and why modules need a local server
- **Separating concerns:** data (store), saving (storage), drawing (UI) and wiring (main) in their own modules
- **The subscribe / notify pattern,** a small version of how state libraries work
- **Immutability:** updating notes with `map()`, `filter()`, spread and `slice()` instead of changing arrays in place, and copying before `sort()`
- **Derived data:** sorting and search results are worked out from the notes each time, not stored
- **Debouncing:** saving once typing pauses, and flushing the waiting save before the page closes
- **Undo instead of confirm:** keeping the deleted note and its position so it can be put back
- **Safe rendering:** building DOM nodes for search highlights instead of using `innerHTML`, so note text can never run as code
- **Regular expressions:** escaping user input so searches for `c++` or `$5` match literally
- **Working with time:** `Intl.RelativeTimeFormat`, `<time datetime>`, and refreshing text without rebuilding the list
- **Syncing between tabs** with the `storage` event, and keeping unsaved edits when two tabs change the same note
- **Defensive storage:** checking each saved note and keeping the good ones if one is damaged

## How to run

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```
2. Open the folder in VS Code and start **Live Server** (right-click `index.html` → *Open with Live Server*).

No installation or build step is needed. A local server **is** needed: browsers block ES modules on pages opened straight from a file (`file://`). Any other static server works too, and so does the deployed GitHub Pages version.

## Project structure

```
notes-app/
├── index.html      # Sidebar (search + list), editor, undo toast
├── style.css       # Layout, note cards, editor, toast, responsive design
├── js/
│   ├── main.js     # Entry point: connects events, store and UI
│   ├── notes.js    # The store: notes data and every way to change it
│   ├── storage.js  # Loading, saving and watching notes in localStorage
│   ├── ui.js       # Rendering the list, editor, times and toast
│   ├── dom.js      # Every element the app uses, looked up once
│   └── utils.js    # ids, relative times, debounce, regex escaping
└── README.md
```

## Known limitations

- Notes are stored in this browser only. They don't sync between devices or browsers, and clearing site data deletes them.
- `localStorage` holds about 5 MB, so very large numbers of notes won't fit. The app shows a warning if a save fails.
- If two tabs edit the same note at the same moment, the most recent edit wins.
- Only the most recent delete can be undone.

## Possible improvements

- Tags or folders
- Markdown formatting and a preview
- Export and import notes as a JSON file
- A dark theme
- Store notes on a server with user accounts (planned for a later project in my roadmap)
