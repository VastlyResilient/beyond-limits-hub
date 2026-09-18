import type { EditKind } from "./editRegistry";

export interface Change { kind: EditKind; target: string; value: string | number | boolean; }
export type Overrides = Record<string, string | number | boolean>;

/** Pure: returns a NEW overrides map. Unknown targets are ignored, never thrown. */
export function applyOps(current: Overrides, ops: Change[]): Overrides {
  const next = { ...current };
  for (const op of ops) {
    if (op.value === undefined || op.value === null) continue;
    next[op.target] = op.value;
  }
  return next;
}

/** Pure: what changed, for the activity log. */
export function diffOps(before: Overrides, ops: Change[]) {
  return ops.map((op) => ({
    target: op.target,
    from: before[op.target] ?? null,
    to: op.value,
    kind: op.kind,
  }));
}
