import { describe, it, expect } from "vitest";
import { extractJson, MODEL } from "../openrouter.js";

describe("openrouter helpers", () => {
  it("uses the requested model", () => {
    expect(MODEL).toBe("deepseek/deepseek-v4.1-flash");
  });
  it("extracts a bare JSON object", () => {
    expect(extractJson('{"say":"hi"}')).toBe('{"say":"hi"}');
  });
  it("extracts from a fenced block with prose around it", () => {
    const t = 'Sure!\n```json\n{"say":"hi","ops":[]}\n```\nHope that helps.';
    expect(JSON.parse(extractJson(t)).say).toBe("hi");
  });
  it("returns empty string when there is no object", () => {
    expect(extractJson("no json here")).toBe("");
  });
});
