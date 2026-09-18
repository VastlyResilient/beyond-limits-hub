export const MODEL = "deepseek/deepseek-v4.1-flash";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Models sometimes wrap JSON in prose or fences. Pull the first object out. */
export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return "";
  return candidate.slice(start, end + 1);
}

export async function streamChat({ messages, apiKey, signal, onDelta, stream = true, web = false, maxResults = 4 }) {
  const body = {
    model: MODEL,
    messages,
    stream,
    temperature: 0.2,
    max_tokens: 1600,
  };
  // Live web browsing. OpenRouter runs the search itself and returns the pages
  // as annotations, so the model answers from what is on the web right now
  // rather than from anything it memorised.
  if (web) body.plugins = [{ id: "web", max_results: maxResults }];

  const res = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vastlyresilient.github.io/beyond-limits-hub/",
      "X-Title": "Beyond Limits Hub",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}: ${(await res.text()).slice(0, 300)}`);

  if (!stream) {
    const json = await res.json();
    const m = json.choices?.[0]?.message ?? {};
    return { text: m.content ?? "", usage: json.usage ?? null, annotations: m.annotations ?? [] };
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", text = "", usage = null, annotations = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") continue;
      let json;
      try { json = JSON.parse(payload); } catch { continue; }
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) { text += delta; onDelta?.(delta); }
      const ann = json.choices?.[0]?.delta?.annotations;
      if (ann && ann.length) annotations = ann;
      if (json.usage) usage = json.usage;
    }
  }
  return { text, usage, annotations };
}

const JUNK_TITLES = ["", "title", "untitled", "no title", "page"];

/** Turn OpenRouter web annotations into plain source labels. */
export function annotationSources(annotations = []) {
  return annotations
    .map((a) => a?.url_citation)
    .filter(Boolean)
    .map((c) => {
      const raw = String(c.title || "").trim();
      const junk = JUNK_TITLES.includes(raw.toLowerCase()) || raw.length < 4;
      let label = raw;
      if (junk) {
        // fall back to the domain — "irs.gov" beats "TITLE"
        try { label = new URL(c.url).hostname.replace(/^www\./, ""); } catch { label = c.url; }
      }
      return { title: label, url: c.url };
    });
}
