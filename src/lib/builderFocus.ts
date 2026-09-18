/* A tiny observable so the dock can tell the page what to highlight.
   Deliberately not React state: the page must not re-render the world
   every time the Builder moves its attention. */

type Listener = (targetId: string | null, previewValue?: string) => void;

let current: { targetId: string | null; previewValue?: string } = { targetId: null };
const listeners = new Set<Listener>();

export const builderFocus = {
  get() { return current; },
  set(targetId: string | null, previewValue?: string) {
    current = { targetId, previewValue };
    listeners.forEach((l) => l(targetId, previewValue));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
};
