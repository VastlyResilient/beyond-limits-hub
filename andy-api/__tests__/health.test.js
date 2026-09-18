import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("health", () => {
  it("returns ok", async () => {
    const res = await request(createApp({ allowedOrigins: ["https://a.test"] })).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("rejects an unknown origin", async () => {
    const res = await request(createApp({ allowedOrigins: ["https://a.test"] }))
      .get("/health")
      .set("Origin", "https://evil.test");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows a known origin", async () => {
    const res = await request(createApp({ allowedOrigins: ["https://a.test"] }))
      .get("/health")
      .set("Origin", "https://a.test");
    expect(res.headers["access-control-allow-origin"]).toBe("https://a.test");
  });
});
