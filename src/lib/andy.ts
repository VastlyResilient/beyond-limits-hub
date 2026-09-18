import { ANDY_API_BASE, ANDY_MOCK } from "./andyConfig";
import { REGISTRY_IDS } from "./editRegistry";

export interface ChatMessage { role: "user" | "assistant"; content: string; }

export interface AndyChunk {
  delta?: string;
  done?: boolean;
  parsed?: { ok: boolean; ops?: any[]; say?: string; questions?: string[]; errors?: string[] };
  error?: string;
  remaining?: number;
  model?: string;
}

export interface AndyRequest {
  mode: "builder" | "assistant";
  systemPrompt: string;
  messages: ChatMessage[];
  registryIds?: string[];
}

/* ---------------------------------------------------------------- mock mode
   Deterministic replies so the Playwright suite never calls the model and
   demos never depend on a network round-trip. Enabled with VITE_ANDY_MOCK=1. */

export function mockReply(opts: AndyRequest): string[] {
  if (opts.mode === "assistant") {
    return ["Your roster holds ", "113 learners", " across four programs."];
  }
  return ["Got it — I can change that. ", "Here is the change I would make:"];
}

/** Did Andy actually name a new value? A lone apostrophe in "wasn't" is not a quote. */
export function statesAValue(text: string): boolean {
  return /\bto\s+[A-Za-z0-9]/.test(text)          // "…to Today"
    || /["“][^"”]{1,40}["”]/.test(text)            // "Today" or “Today”
    || /'[^']{1,40}'/.test(text)                   // 'Today' — needs BOTH quotes
    || /\bcall it\b/i.test(text);
}

/** Pull a new label out of what Andy typed, so the mock behaves plausibly. */
function mockTargetValue(text: string): string {
  const dq = text.match(/["“]([^"”]{1,40})["”]/);
  if (dq) return dq[1].trim();
  const sq = text.match(/'([^']{1,40})'/);
  if (sq) return sq[1].trim();
  const to = text.match(/\bto\s+([A-Za-z][A-Za-z0-9 &'-]{0,38})/i);
  if (to) return to[1].trim().replace(/[.!]$/, "");
  return "Today";
}

export function mockParsed(opts: AndyRequest): AndyChunk["parsed"] {
  if (opts.mode === "assistant") {
    return { ok: true, ops: [], say: "Answered from your Hub's own data.", questions: [] };
  }
  const last = [...opts.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const allowed = opts.registryIds ?? REGISTRY_IDS;
  const target = allowed.includes("nav.ops-command.label") ? "nav.ops-command.label" : allowed[0];

  // if Andy has not said what to change it to, ask instead of guessing
  if (!statesAValue(last)) {
    return { ok: true, ops: [], say: "Happy to. What should it say instead?", questions: ["Call it “Today”", "Keep it as it is"] };
  }
  return {
    ok: true,
    say: `Renaming that screen to “${mockTargetValue(last)}”.`,
    questions: [],
    ops: [{ kind: "setText", target, value: mockTargetValue(last) }],
  };
}

/* ------------------------------------------------------------------ live */

export async function* streamAndy(opts: AndyRequest): AsyncGenerator<AndyChunk> {
  if (ANDY_MOCK) {
    for (const chunk of mockReply(opts)) { yield { delta: chunk }; }
    yield { done: true, parsed: mockParsed(opts) };
    return;
  }

  let res: Response;
  try {
    res = await fetch(`${ANDY_API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
  } catch (e) {
    yield { error: "Andy's AI is unreachable right now. Check the connection and try again." };
    return;
  }

  if (!res.ok || !res.body) {
    let detail = "";
    try { detail = (await res.json()).error ?? ""; } catch {}
    yield { error: detail || `Andy's AI is unavailable (${res.status}).` };
    return;
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      try { yield JSON.parse(line.slice(5).trim()) as AndyChunk; } catch {}
    }
  }
}

export async function fetchPage(url: string): Promise<{ title: string; url: string; text: string } | null> {
  if (ANDY_MOCK) return { title: "Mock page", url, text: "Mock fetched content." };
  try {
    const res = await fetch(`${ANDY_API_BASE}/api/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s)]+/i);
  return m ? m[0] : null;
}
