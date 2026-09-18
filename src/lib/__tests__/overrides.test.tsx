import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, act, cleanup } from "@testing-library/react";
import { OverridesProvider, useOverrides, OVERRIDES_KEY } from "../overrides";

let api: ReturnType<typeof useOverrides>;
function Probe() { api = useOverrides(); return null; }
const mount = () => render(<OverridesProvider><Probe /></OverridesProvider>);

beforeEach(() => { cleanup(); localStorage.clear(); });

describe("OverridesProvider", () => {
  it("returns the fallback when no override exists", () => {
    mount();
    expect(api.get("nav.ops-command.label", "Command Center")).toBe("Command Center");
  });

  it("commits an override and records activity", () => {
    mount();
    act(() => { api.commit([{ kind: "setText", target: "nav.ops-command.label", value: "Today" }], "Rename home"); });
    expect(api.get("nav.ops-command.label", "Command Center")).toBe("Today");
    expect(api.entries[0].description).toBe("Rename home");
    expect(api.entries[0].changes[0].from).toBeNull();
    expect(api.entries[0].changes[0].label).toContain("Sidebar label");
    expect(localStorage.getItem(OVERRIDES_KEY)).toContain("Today");
  });

  it("reverts to the previous value", () => {
    mount();
    let id = "";
    act(() => { id = api.commit([{ kind: "setText", target: "nav.ops-command.label", value: "Today" }], "Rename"); });
    act(() => { api.revert(id); });
    expect(api.get("nav.ops-command.label", "Command Center")).toBe("Command Center");
    expect(api.entries).toHaveLength(0);
  });

  it("reverts a second change back to the first, not to nothing", () => {
    mount();
    act(() => { api.commit([{ kind: "setText", target: "nav.ops-command.label", value: "One" }], "First"); });
    let second = "";
    act(() => { second = api.commit([{ kind: "setText", target: "nav.ops-command.label", value: "Two" }], "Second"); });
    act(() => { api.revert(second); });
    expect(api.get("nav.ops-command.label", "Command Center")).toBe("One");
  });

  it("persists across a remount", () => {
    mount();
    act(() => { api.commit([{ kind: "setText", target: "nav.ops-command.label", value: "Today" }], "Rename"); });
    cleanup();
    mount();
    expect(api.get("nav.ops-command.label", "Command Center")).toBe("Today");
  });
});
