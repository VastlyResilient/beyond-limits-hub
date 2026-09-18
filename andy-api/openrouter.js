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

export async function streamChat({ messages, apiKey, signal, onDelta, stream = true }) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vastlyresilient.github.io/beyond-limits-hub/",
      "X-Title": "Beyond Limits Hub",
    },
    body: JSON.stringify({ model: MODEL, messages, stream, temperature: 0.2, max_tokens: 1200 }),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}: ${(await res.text()).slice(0, 300)}`);

  if (!stream) {
    const json = await res.json();
    return { text: json.choices?.[0]?.message?.content ?? "", usage: json.usage ?? null };
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", text = "", usage = null;
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
      if (json.usage) usage = json.usage;
    }
  }
  return { text, usage };
}
