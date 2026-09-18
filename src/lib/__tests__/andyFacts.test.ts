import { describe, it, expect } from "vitest";
import { buildFacts, REAL_PROGRAM } from "../andyFacts";

describe("buildFacts", () => {
  it("states the real program numbers", () => {
    const f = buildFacts();
    expect(f).toContain(String(REAL_PROGRAM.families));
    expect(f).toContain(String(REAL_PROGRAM.familiesWithoutACode));
  });

  it("never presents the demo roster as Andy's real families", () => {
    const f = buildFacts();
    expect(f).toContain("NOT real families");
    expect(f).toMatch(/sample learners/);
  });

  it("reflects an override in the sidebar description", () => {
    expect(buildFacts({ "nav.ops-command.label": "Today" })).toContain("Today");
  });

  it("lists every registry target so the Builder knows its limits", () => {
    const f = buildFacts();
    expect(f).toContain("nav.ops-command.label");
    expect(f).toContain("command.hero.headline");
  });

  it("names the unidentified group", () => {
    expect(buildFacts()).toContain("BFFS");
  });
});
