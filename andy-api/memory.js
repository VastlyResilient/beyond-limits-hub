import fs from "node:fs";

const MAX_TURNS = 24;
const KEEP_TAIL = 8;

export function createMemoryStore(file) {
  let state = { summary: "", turns: [] };
  try { state = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
  const save = () => fs.writeFileSync(file, JSON.stringify(state, null, 2));

  return {
    get() { return { summary: state.summary, turns: [...state.turns] }; },
    add(role, content) { state.turns.push({ role, content, at: Date.now() }); save(); },
    needsCompaction() {
      return state.turns.length > MAX_TURNS ? state.turns.slice(0, state.turns.length - KEEP_TAIL) : [];
    },
    applyCompaction(newSummary) {
      state.summary = String(newSummary).slice(0, 4000);
      state.turns = state.turns.slice(-KEEP_TAIL);
      save();
    },
    clear() { state = { summary: "", turns: [] }; save(); },
  };
}
