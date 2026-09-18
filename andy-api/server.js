import "dotenv/config";
import { createApp } from "./app.js";
import { streamChat, extractJson, MODEL } from "./openrouter.js";
import { createSpendStore } from "./spend.js";
import { validateEditEnvelope } from "./editOps.js";
import { readWebDoc, isAllowedUrl } from "./webdoc.js";
import { createMemoryStore } from "./memory.js";

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);

const spend = createSpendStore("./spend.json", Number(process.env.MONTHLY_CAP_USD || 10));
const memory = createMemoryStore("./memory.json");

/** ~$0.50 per million tokens, a deliberately conservative estimate. */
const USD_PER_TOKEN = 0.0000005;

const app = createApp({
  allowedOrigins,
  memoryStore: memory,

  chatHandler: async (req, res) => {
    const { mode, messages, registryIds = [], systemPrompt = "" } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages required" });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: "OPENROUTER_API_KEY is not set" });
    }
    if (spend.remaining() <= 0) {
      return res.status(402).json({ error: "Andy's AI budget is used up. Add credit to keep going." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const finalMessages = [{ role: "system", content: systemPrompt }, ...messages.slice(-24)];
    try {
      const { text, usage } = await streamChat({
        messages: finalMessages,
        apiKey: process.env.OPENROUTER_API_KEY,
        onDelta: (d) => res.write(`data: ${JSON.stringify({ delta: d })}\n\n`),
      });

      const usd = (usage?.total_tokens ?? Math.ceil(text.length / 4)) * USD_PER_TOKEN;
      const spendOk = spend.charge(usd);

      let parsed = null;
      if (mode === "builder") {
        let raw = null;
        try { raw = JSON.parse(extractJson(text)); } catch {}
        parsed = raw
          ? validateEditEnvelope(raw, registryIds)
          : { ok: false, errors: ["model did not return JSON"] };
      }

      // remember the exchange, compacting when the log grows
      memory.add("user", String(messages[messages.length - 1]?.content || "").slice(0, 2000));
      memory.add("assistant", text.slice(0, 2000));
      const stale = memory.needsCompaction();
      if (stale.length) {
        try {
          const s = await streamChat({
            apiKey: process.env.OPENROUTER_API_KEY,
            stream: false,
            messages: [
              { role: "system", content: "Summarise these earlier turns into a short running memory for an assistant. Keep names, decisions and preferences." },
              { role: "user", content: JSON.stringify(stale).slice(0, 12000) },
            ],
          });
          memory.applyCompaction(s.text);
        } catch { /* compaction is best-effort */ }
      }

      res.write(`data: ${JSON.stringify({ done: true, model: MODEL, spendOk, parsed, text, remaining: spend.remaining() })}\n\n`);
      res.end();
    } catch (e) {
      res.write(`data: ${JSON.stringify({ error: String(e.message || e) })}\n\n`);
      res.end();
    }
  },

  fetchHandler: async (req, res) => {
    const { url, allowHosts = [] } = req.body || {};
    try {
      if (!isAllowedUrl(url, allowHosts)) throw new Error("url not allowed");
      res.json(await readWebDoc(url));
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`andy-api listening on :${port}`));
