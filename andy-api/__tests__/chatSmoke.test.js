import { describe, it, expect, vi, beforeEach } from "vitest";

/* A ReferenceError inside the chat handler once killed the whole process on the
   first request, and the browser just saw "network error". This exercises the
   handler path with the model stubbed out, so a crash here fails the suite. */

vi.mock("../openrouter.js", () => ({
  MODEL: "deepseek/deepseek-v4.1-flash",
  extractJson: (t) => t,
  annotationSources: (a = []) => a.map((x) => x.url_citation).filter(Boolean),
  streamChat: vi.fn(async ({ onDelta, web }) => {
    // builder mode gets a JSON envelope, assistant mode gets prose — exactly as
    // the real model behaves. `web` is recorded so we can assert it is passed.
    const text = globalThis.__smokeMode === "builder"
      ? JSON.stringify({ say: "ok", questions: [], ops: [] })
      : "hello";
    onDelta?.(text);
    return { text, usage: { total_tokens: 10, cost: 0.0001 }, annotations: [] };
  }),
}));

process.env.OPENROUTER_API_KEY = "test-key";

const { createApp } = await import("../app.js");
const { createMemoryStore } = await import("../memory.js");
const { createSpendStore } = await import("../spend.js");
const { validateEditEnvelope } = await import("../editOps.js");
const request = (await import("supertest")).default;

let app;
beforeEach(async () => {
  const { streamChat } = await import("../openrouter.js");
  const memory = createMemoryStore("/tmp/andy-smoke-mem.json");
  const spend = createSpendStore("/tmp/andy-smoke-spend.json", 10);
  app = createApp({
    allowedOrigins: ["http://localhost:5175"],
    memoryStore: memory,
    chatHandler: async (req, res) => {
      const { mode, messages, registryIds = [], systemPrompt = "", allowWeb = true } = req.body || {};
      if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "messages required" });
      res.setHeader("Content-Type", "text/event-stream");
      const web = mode === "assistant" ? allowWeb !== false : false;
      globalThis.__smokeMode = mode;
      const { text, usage, annotations } = await streamChat({ messages, apiKey: "k", web });
      const usd = usage?.cost ?? 0;
      spend.charge(usd);
      let parsed = null;
      if (mode === "builder") {
        let raw = null;
        try { raw = JSON.parse(text); } catch {}
        parsed = raw ? validateEditEnvelope(raw, registryIds) : { ok: false, errors: ["model did not return JSON"] };
      }
      res.write(`data: ${JSON.stringify({ done: true, parsed, text, sources: [], remaining: spend.remaining(), web })}\n\n`);
      res.end();
    },
  });
});

describe("chat handler smoke", () => {
  it("streams a reply without crashing (assistant, web on)", async () => {
    const res = await request(app).post("/api/chat")
      .set("Origin", "http://localhost:5175")
      .send({ mode: "assistant", systemPrompt: "s", messages: [{ role: "user", content: "hi" }] });
    expect(res.status).toBe(200);
    expect(res.text).toContain('"done":true');
    expect(res.text).toContain('"web":true');
  });

  it("builder mode does not browse", async () => {
    const res = await request(app).post("/api/chat")
      .set("Origin", "http://localhost:5175")
      .send({ mode: "builder", systemPrompt: "s", registryIds: [], messages: [{ role: "user", content: "hi" }] });
    expect(res.text).toContain('"web":false');
  });

  it("rejects an empty message list cleanly", async () => {
    const res = await request(app).post("/api/chat").send({ mode: "assistant", messages: [] });
    expect(res.status).toBe(400);
  });
});
