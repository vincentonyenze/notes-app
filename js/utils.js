// Small helpers that don't depend on the page or the notes

// A unique id like "3b241101-e2bb-4255-8caf-4136c566a962"
export function createId() {
  return crypto.randomUUID();
}
