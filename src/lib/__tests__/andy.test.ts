import { describe, it, expect } from "vitest";
import { mockParsed, mockReply, firstUrl, statesAValue } from "../andy";

const base = { systemPrompt: "", registryIds: ["nav.ops-command.label"] } as any;

describe("andy mock mode", () => {
  it("asks a question when Andy has not said what to change it to", () => {
    const p = mockParsed({ ...base, mode: "builder", messages: [{ role: "user", content: "rename my home screen" }] });
    expect(p!.ops).toHaveLength(0);
    expect(p!.questions!.length).toBeGreaterThan(0);
  });

  it("produces an op once a new name is given", () => {
    const p = mockParsed({ ...base, mode: "builder", messages: [{ role: "user", content: "rename my home screen to Today" }] });
    expect(p!.ops![0]).toEqual({ kind: "setText", target: "nav.ops-command.label", value: "Today" });
  });

  it("reads a quoted name", () => {
    const p = mockParsed({ ...base, mode: "builder", messages: [{ role: "user", content: 'call it "Front Desk"' }] });
    expect(p!.ops![0].value).toBe("Front Desk");
  });

  it("assistant mode never proposes ops", () => {
    const p = mockParsed({ ...base, mode: "assistant", messages: [{ role: "user", content: "how many learners?" }] });
    expect(p!.ops).toHaveLength(0);
  });

  it("streams text chunks", () => {
    expect(mockReply({ ...base, mode: "assistant", messages: [] }).join("")).toContain("113");
  });

  it("finds the first url", () => {
    expect(firstUrl("see https://a.test/x for more")).toBe("https://a.test/x");
    expect(firstUrl("no link here")).toBeNull();
  });
});

describe("statesAValue", () => {
  it("does not treat an apostrophe in ordinary prose as a quoted value", () => {
    expect(statesAValue("That wasn't what I wanted.")).toBe(false);
  });
  it("recognises an explicit target", () => {
    expect(statesAValue("rename it to Today")).toBe(true);
    expect(statesAValue('call it "Front Desk"')).toBe(true);
  });
  it("a feedback message produces a question, not a change", () => {
    const p = mockParsed({ ...base, mode: "builder", messages: [{ role: "user", content: "That wasn't what I wanted — put it back." }] });
    expect(p!.ops).toHaveLength(0);
    expect(p!.questions!.length).toBeGreaterThan(0);
  });
});
