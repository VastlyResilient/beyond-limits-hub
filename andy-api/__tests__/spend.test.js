import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import { createSpendStore } from "../spend.js";

const F = "/tmp/andy-spend-test.json";
beforeEach(() => { try { fs.unlinkSync(F); } catch {} });

describe("spend", () => {
  it("refuses once the cap is exceeded", () => {
    const s = createSpendStore(F, 10);
    expect(s.charge(6)).toBe(true);
    expect(s.charge(3)).toBe(true);
    expect(s.charge(2)).toBe(false);
    expect(s.remaining()).toBeCloseTo(1);
  });
  it("persists across instances", () => {
    createSpendStore(F, 10).charge(4);
    expect(createSpendStore(F, 10).total).toBe(4);
  });
  it("ignores non-positive charges", () => {
    const s = createSpendStore(F, 10);
    expect(s.charge(0)).toBe(true);
    expect(s.total).toBe(0);
  });
});
