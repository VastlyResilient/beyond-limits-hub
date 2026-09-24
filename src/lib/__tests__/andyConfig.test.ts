import { describe, it, expect } from "vitest";
import { resolveAndApiBase, isAndyConfigured } from "../andyConfig";

describe("andyConfig", () => {
  /* The old default (andy-api.up.railway.app) returns 404. A bare `npm run build`
     baked it in and every message showed "network error", so pin the real host. */
  it("defaults to the host that is actually deployed", () => {
    expect(resolveAndApiBase(undefined)).toBe("https://andy-api-production.up.railway.app");
    expect(resolveAndApiBase(undefined)).not.toContain("andy-api.up.railway.app");
  });

  it("falls back to the production default when unset", () => {
    expect(resolveAndApiBase(undefined)).toBe("https://andy-api-production.up.railway.app");
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
