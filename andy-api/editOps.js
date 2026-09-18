export const EDIT_OPS = ["setText", "setNumber", "setColor", "setVisible"];

/**
 * Validate a model-proposed edit against the registry the client sent.
 * Returns { ok: true, ops, say, questions } or { ok: false, errors }.
 * Rejects anything not in the registry. Never accepts code.
 */
export function validateEditEnvelope(raw, registryIds) {
  const errors = [];
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["envelope is not an object"] };

  const say = typeof raw.say === "string" ? raw.say.slice(0, 2000) : "";
  const questions = Array.isArray(raw.questions)
    ? raw.questions.filter((q) => typeof q === "string" && q.trim()).slice(0, 3)
    : [];
  const ops = Array.isArray(raw.ops) ? raw.ops : [];

  if (ops.length === 0 && questions.length === 0) errors.push("nothing to do: no ops and no questions");
  if (ops.length > 8) errors.push("too many ops in one change (max 8)");

  const clean = [];
  for (const op of ops) {
    if (!op || typeof op !== "object") { errors.push("op is not an object"); continue; }
    if (!EDIT_OPS.includes(op.kind)) { errors.push(`unknown op kind: ${op.kind}`); continue; }
    if (typeof op.target !== "string" || !registryIds.includes(op.target)) {
      errors.push(`target not in registry: ${op.target}`); continue;
    }
    if (op.kind === "setText" && typeof op.value !== "string") { errors.push("setText needs a string value"); continue; }
    if (op.kind === "setNumber" && typeof op.value !== "number") { errors.push("setNumber needs a number"); continue; }
    if (op.kind === "setColor" && !/^#[0-9a-fA-F]{6}$/.test(op.value)) { errors.push("setColor needs #rrggbb"); continue; }
    if (op.kind === "setVisible" && typeof op.value !== "boolean") { errors.push("setVisible needs a boolean"); continue; }
    clean.push({ kind: op.kind, target: op.target, value: op.value });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, ops: clean, say, questions };
}
