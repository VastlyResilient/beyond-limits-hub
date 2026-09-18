import { describe, it, expect } from "vitest";
import { validateEditEnvelope } from "../editOps.js";

const REG = ["nav.ops-command.label", "command.hero.headline"];

describe("validateEditEnvelope", () => {
  it("accepts a valid op", () => {
    const r = validateEditEnvelope(
      { say: "Renaming it.", ops: [{ kind: "setText", target: "nav.ops-command.label", value: "Today" }] }, REG);
    expect(r.ok).toBe(true);
    expect(r.ops).toHaveLength(1);
  });

  it("rejects a target outside the registry", () => {
    const r = validateEditEnvelope({ ops: [{ kind: "setText", target: "src/main.tsx", value: "x" }] }, REG);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("target not in registry");
  });

  it("rejects an unknown op kind (no code execution path)", () => {
    const r = validateEditEnvelope({ ops: [{ kind: "runShell", target: REG[0], value: "rm -rf /" }] }, REG);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("unknown op kind");
  });

  it("rejects a bad colour", () => {
    expect(validateEditEnvelope({ ops: [{ kind: "setColor", target: REG[1], value: "red" }] }, REG).ok).toBe(false);
  });

  it("rejects a string where a number is required", () => {
    expect(validateEditEnvelope({ ops: [{ kind: "setNumber", target: REG[1], value: "12" }] }, REG).ok).toBe(false);
  });

  it("accepts questions with no ops", () => {
    const r = validateEditEnvelope({ say: "Which screen?", questions: ["Where should this go?"] }, REG);
    expect(r.ok).toBe(true);
    expect(r.questions).toHaveLength(1);
  });

  it("rejects an empty envelope", () => {
    expect(validateEditEnvelope({ say: "hello" }, REG).ok).toBe(false);
  });

  it("caps ops per change", () => {
    const ops = Array.from({ length: 9 }, () => ({ kind: "setText", target: REG[0], value: "x" }));
    expect(validateEditEnvelope({ ops }, REG).ok).toBe(false);
  });
});
