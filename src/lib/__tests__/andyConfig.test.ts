import { describe, it, expect } from "vitest";
import { resolveAndApiBase, isAndyConfigured } from "../andyConfig";

describe("andyConfig", () => {
  it("falls back to the production default when unset", () => {
    expect(resolveAndApiBase(undefined)).toBe("https://andy-api.up.railway.app");
  });
  it("uses an explicit override", () => {
    expect(resolveAndApiBase("http://localhost:8080")).toBe("http://localhost:8080");
  });
  it("strips trailing slashes", () => {
    expect(resolveAndApiBase("http://localhost:8080///")).toBe("http://localhost:8080");
  });
  it("reports unconfigured when the value is blank", () => {
    expect(isAndyConfigured("")).toBe(false);
    expect(isAndyConfigured("https://x.test")).toBe(true);
  });
});
