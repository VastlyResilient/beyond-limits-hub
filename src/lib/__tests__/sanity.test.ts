import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs TypeScript tests", () => {
    const n: number = 2;
    expect(n + 1).toBe(3);
  });
});
