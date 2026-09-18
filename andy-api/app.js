import express from "express";
import cors from "cors";

export function createApp({ allowedOrigins = [], chatHandler, fetchHandler, memoryStore } = {}) {
  const app = express();
  app.use(express.json({ limit: "256kb" }));
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false); // no CORS header -> the browser blocks it
      },
      credentials: false,
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.post("/api/chat", async (req, res) => {
    if (!chatHandler) return res.status(503).json({ error: "chat not configured" });
    return chatHandler(req, res);
  });

  app.post("/api/fetch", async (req, res) => {
    if (!fetchHandler) return res.status(503).json({ error: "fetch not configured" });
    return fetchHandler(req, res);
  });

  app.get("/api/memory", (_req, res) => {
    if (!memoryStore) return res.status(503).json({ error: "memory not configured" });
    return res.json(memoryStore.get());
  });

  app.post("/api/memory/clear", (_req, res) => {
    if (!memoryStore) return res.status(503).json({ error: "memory not configured" });
    memoryStore.clear();
    return res.json({ ok: true });
  });

  app.use((_req, res) => res.status(404).json({ error: "not found" }));
  return app;
}
