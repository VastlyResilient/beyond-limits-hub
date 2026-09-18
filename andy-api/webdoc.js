const PRIVATE = [
  /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, /^0\./, /^localhost$/i, /^\[?::1\]?$/i,
];

export function isAllowedUrl(raw, extraAllowedHosts = []) {
  let u;
  try { u = new URL(raw); } catch { return false; }
  if (!["http:", "https:"].includes(u.protocol)) return false;
  const host = u.hostname;
  if (PRIVATE.some((re) => re.test(host))) return false;
  if (extraAllowedHosts.length && !extraAllowedHosts.includes(host)) return false;
  return true;
}

export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function readWebDoc(url, { maxBytes = 300000, maxChars = 15000 } = {}) {
  if (!isAllowedUrl(url)) throw new Error("url not allowed");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "BeyondLimitsHub/1.0 (+https://peaceyouthct.org)" },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer()).slice(0, maxBytes);
    const html = buf.toString("utf8");
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
    return { url, title, text: htmlToText(html).slice(0, maxChars) };
  } finally {
    clearTimeout(timer);
  }
}
