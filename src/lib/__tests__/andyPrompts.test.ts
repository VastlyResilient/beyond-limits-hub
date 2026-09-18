import { describe, it, expect } from "vitest";
import { BUILDER_PROMPT, ASSISTANT_PROMPT } from "../andyPrompts";

describe("prompts", () => {
  it("builder documents the JSON contract and the registry slot", () => {
    expect(BUILDER_PROMPT).toContain("{{REGISTRY}}");
    expect(BUILDER_PROMPT).toContain("{{CURRENT}}");
    expect(BUILDER_PROMPT).toContain('"ops"');
  });
  it("builder tells the model to ask rather than guess", () => {
    expect(BUILDER_PROMPT).toContain("ask exactly one short question");
    expect(BUILDER_PROMPT).toContain("never write code");
  });
  it("assistant demands grounding and forbids guessing", () => {
    expect(ASSISTANT_PROMPT).toContain("{{FACTS}}");
    expect(ASSISTANT_PROMPT).toContain("Never guess");
    expect(ASSISTANT_PROMPT).toContain("I don't have that in your system");
  });
});
