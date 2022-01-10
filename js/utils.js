// Small helpers that don't depend on the page or the notes

// A unique id like "3b241101-e2bb-4255-8caf-4136c566a962"
export function createId() {
  return crypto.randomUUID();
}

// Wait until calls stop for `delayMs`, then run `fn` once with the
// latest arguments. Typing 20 letters quickly = 1 call, not 20.
// debounced.flush() runs a waiting call right now (e.g. before the page closes).
export function debounce(fn, delayMs) {
  let timeoutId = null;
  let lastArgs = [];

  function run() {
    timeoutId = null;
    fn(...lastArgs);
  }

  function debounced(...args) {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(run, delayMs);
  }

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      run();
    }
  };

  return debounced;
}
