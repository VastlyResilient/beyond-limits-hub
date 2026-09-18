import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyOps, diffOps, type Change, type Overrides } from "./applyOps";
import { describeTarget } from "./editRegistry";

/* ---------------------------------------------------------------------------
   The override layer.

   Nothing on screen is rewritten by the Builder directly. The Builder proposes
   a change, Andy approves it, and it lands here as a value keyed by a registry
   id. Every write is recorded in an append-only history so it can be reverted.

   Persisted to localStorage under `bl.overrides.v1` and replayed before first
   paint by the inline bootstrap in index.html (same pattern as the theme).
--------------------------------------------------------------------------- */

export interface ActivityEntry {
  id: string;
  at: number;
  description: string;
  source: "builder" | "manual";
  changes: { target: string; label: string; from: unknown; to: unknown; kind: string }[];
  before: Overrides;   // snapshot for revert
}

interface State { overrides: Overrides; entries: ActivityEntry[]; }

const EMPTY: State = { overrides: {}, entries: [] };
export const OVERRIDES_KEY = "bl.overrides.v1";

export interface OverridesApi {
  get(id: string, fallback: string): string;
  getRaw(id: string): string | number | boolean | undefined;
  commit(ops: Change[], description: string, source?: "builder" | "manual"): string;
  revert(entryId: string): void;
  entries: ActivityEntry[];
  overrides: Overrides;
  clearAll(): void;
}

const Ctx = createContext<OverridesApi | null>(null);
export const useOverrides = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useOverrides must be used inside OverridesProvider");
  return c;
};

function load(): State {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { overrides: parsed.overrides ?? {}, entries: parsed.entries ?? [] };
  } catch {
    return EMPTY;
  }
}

export function OverridesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setState(load()); setLoaded(true); }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(state)); } catch {}
  }, [state, loaded]);

  const api = useMemo<OverridesApi>(() => ({
    overrides: state.overrides,
    entries: state.entries,

    getRaw: (id) => state.overrides[id],

    get: (id, fallback) => {
      const v = state.overrides[id];
      return v === undefined ? fallback : String(v);
    },

    commit: (ops, description, source = "builder") => {
      const id = `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      setState((s) => {
        const entry: ActivityEntry = {
          id,
          at: Date.now(),
          description: description.slice(0, 200) || "Change applied",
          source,
          changes: diffOps(s.overrides, ops).map((d) => ({ ...d, label: describeTarget(d.target) })),
          before: { ...s.overrides },
        };
        return { overrides: applyOps(s.overrides, ops), entries: [entry, ...s.entries].slice(0, 200) };
      });
      return id;
    },

    revert: (entryId) => {
      setState((s) => {
        const entry = s.entries.find((e) => e.id === entryId);
        if (!entry) return s;
        return { overrides: entry.before, entries: s.entries.filter((e) => e.id !== entryId) };
      });
    },

    clearAll: () => setState({ overrides: {}, entries: [] }),
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
