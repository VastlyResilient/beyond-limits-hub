import { describe, it, expect } from "vitest";
import { EDIT_REGISTRY, REGISTRY_IDS, getTarget, describeTarget } from "../editRegistry";

describe("edit registry", () => {
  it("has unique ids", () => {
    expect(new Set(REGISTRY_IDS).size).toBe(EDIT_REGISTRY.length);
  });
  it("uses the four allowed kinds only", () => {
    const allowed = ["setText", "setNumber", "setColor", "setVisible"];
    EDIT_REGISTRY.forEach((t) => expect(allowed).toContain(t.kind));
  });
  it("gives every target a plain-English label and help line", () => {
    EDIT_REGISTRY.forEach((t) => {
      expect(t.label.length).toBeGreaterThan(4);
      expect(t.help.length).toBeGreaterThan(8);
    });
  });
  it("looks targets up", () => {
    expect(getTarget("nav.ops-command.label")?.kind).toBe("setText");
    expect(getTarget("nope")).toBeUndefined();
    expect(describeTarget("nope")).toBe("nope");
  });
});

describe("registry defaults", () => {
  it("every target declares its starting value", () => {
    EDIT_REGISTRY.forEach((t) => expect(t.defaultValue.length).toBeGreaterThan(0));
  });
  it("the Command Center label starts as Command Center", () => {
    expect(getTarget("nav.ops-command.label")!.defaultValue).toBe("Command Center");
  });
});
