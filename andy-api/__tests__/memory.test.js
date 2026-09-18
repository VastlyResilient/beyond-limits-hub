import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import { createMemoryStore } from "../memory.js";

const F = "/tmp/andy-mem-test.json";
beforeEach(() => { try { fs.unlinkSync(F); } catch {} });

describe("memory", () => {
  it("does not compact below the threshold", () => {
    const m = createMemoryStore(F);
    for (let i = 0; i < 20; i++) m.add("user", `m${i}`);
    expect(m.needsCompaction()).toEqual([]);
  });
  it("compacts past the threshold", () => {
    const m = createMemoryStore(F);
    for (let i = 0; i < 26; i++) m.add("user", `m${i}`);
    expect(m.needsCompaction().length).toBe(18);
  });
  it("keeps the tail and stores the summary", () => {
    const m = createMemoryStore(F);
    for (let i = 0; i < 30; i++) m.add("user", `m${i}`);
    m.applyCompaction("Andy renamed the Command Center.");
    expect(m.get().turns).toHaveLength(8);
    expect(m.get().summary).toContain("Command Center");
  });
  it("clears", () => {
    const m = createMemoryStore(F);
    m.add("user", "hi"); m.clear();
    expect(m.get().turns).toHaveLength(0);
  });
});
