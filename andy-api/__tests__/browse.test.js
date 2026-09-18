import { describe, it, expect } from "vitest";
import { shouldBrowse } from "../webdoc.js";

describe("shouldBrowse", () => {
  it("never browses for questions about his own program", () => {
    ["how many of my families still need a code",
     "the money side, whats outstanding",
     "which forms are outstanding",
     "how many learners are on the roster",
     "what can the builder change"].forEach((q) => {
      expect(shouldBrowse(q), q).toBe(false);
    });
  });
  it("browses for genuinely external questions", () => {
    ["what is the latest news about stamford",
     "how do sliding scale fees work at other nonprofits"].forEach((q) => {
      expect(shouldBrowse(q), q).toBe(true);
    });
  });
  it("always browses when Andy pastes a link", () => {
    expect(shouldBrowse("what does https://peaceyouthct.org/beyondlimits say")).toBe(true);
  });
  it("does not browse on an empty message", () => {
    expect(shouldBrowse("")).toBe(false);
  });
});
