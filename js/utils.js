// Small helpers that don't depend on the page or the notes

// A unique id like "3b241101-e2bb-4255-8caf-4136c566a962"
export function createId() {
  return crypto.randomUUID();
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// Builds phrases like "5 minutes ago". numeric: "auto" turns
// "1 day ago" into "yesterday".
const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// "Jan 3", or "Jan 3, 2020" if it wasn't this year
function formatDate(timestamp, now) {
  const date = new Date(timestamp);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

// "just now", "5 minutes ago", "3 hours ago", "yesterday", "4 days ago",
// then a normal date once it's over a week old.
// `now` is a parameter so the function always gives the same answer for
// the same input, which makes it easy to test.
export function formatRelativeTime(timestamp, now = Date.now()) {
  const seconds = Math.floor((now - timestamp) / 1000);

  // A time in the future means the computer's clock changed. Show the
  // date rather than something odd like "in 3 years".
  if (seconds < 0) return formatDate(timestamp, now);
  if (seconds < 45) return "just now";

  // floor, not round, so 59.6 minutes doesn't become "60 minutes ago".
  // Negative numbers mean the past: format(-5, "minute") is "5 minutes ago".
  if (seconds < HOUR) {
    return relativeTime.format(-Math.max(1, Math.floor(seconds / MINUTE)), "minute");
  }
  if (seconds < DAY) {
    return relativeTime.format(-Math.floor(seconds / HOUR), "hour");
  }
  if (seconds < WEEK) {
    return relativeTime.format(-Math.floor(seconds / DAY), "day");
  }
  return formatDate(timestamp, now);
}

// Put a backslash before characters that mean something special in a
// regular expression, so searching for "c++" or "$5" matches literally.
export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
