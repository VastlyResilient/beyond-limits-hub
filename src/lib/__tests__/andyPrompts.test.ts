import { describe, it, expect } from "vitest";
import { BUILDER_PROMPT, ASSISTANT_PROMPT } from "../andyPrompts";

describe("builder prompt", () => {
  it("documents the JSON contract and both slots", () => {
    expect(BUILDER_PROMPT).toContain("{{REGISTRY}}");
    expect(BUILDER_PROMPT).toContain("{{CURRENT}}");
    expect(BUILDER_PROMPT).toContain('"ops"');
  });
  it("tells the model to ask rather than guess", () => {
    expect(BUILDER_PROMPT).toContain("ask exactly one short question");
    expect(BUILDER_PROMPT).toContain("never write code");
  });
  it("forbids claiming a change is already done", () => {
    expect(BUILDER_PROMPT).toContain("Never say a change is done");
  });
  it("forbids leaking internal ids to Andy", () => {
    expect(BUILDER_PROMPT).toContain("Never mention technical ids");
  });
});

describe("assistant prompt", () => {
  it("separates his program from the wider world", () => {
    expect(ASSISTANT_PROMPT).toContain("HIS PROGRAM");
    expect(ASSISTANT_PROMPT).toContain("EVERYTHING ELSE");
  });
  it("refuses to invent facts about his program", () => {
    expect(ASSISTANT_PROMPT).toContain("NEVER invent a number");
    expect(ASSISTANT_PROMPT).toContain("I don't have that in your system");
  });
  it("tells it to use live web results when present", () => {
    expect(ASSISTANT_PROMPT).toContain("web search results");
    expect(ASSISTANT_PROMPT).toContain("Never make up a citation");
  });
  it("tells it to work out loosely phrased questions", () => {
    expect(ASSISTANT_PROMPT).toContain("even if he phrases it loosely");
  });
});
