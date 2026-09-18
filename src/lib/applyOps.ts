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

/**
 * Pure: what changed, for the activity log.
 *
 * `resolveFrom` supplies the value that was actually on screen. Without it the
 * log would say "nothing -> Today" for a target that plainly read "Command
 * Center" a moment earlier, because an override map only holds CHANGED values.
 */
export function diffOps(
  before: Overrides,
  ops: Change[],
  resolveFrom?: (target: string) => string | number | boolean | null
) {
  return ops.map((op) => {
    const had = Object.prototype.hasOwnProperty.call(before, op.target);
    const from = had ? before[op.target] : (resolveFrom ? resolveFrom(op.target) : null);
    return { target: op.target, from: from ?? null, to: op.value, kind: op.kind };
  });
}
