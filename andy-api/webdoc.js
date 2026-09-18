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


/* ---------------------------------------------------------------------------
   Should this question go to the web?

   The Assistant is Andy's guide to HIS program. Searching the web for "how many
   of my families need a code" once produced a Seesaw login-codes help page,
   which is worse than no source at all. Questions about his own program are
   answered from FACTS and must not be diluted with unrelated search results.
--------------------------------------------------------------------------- */
const PROGRAM_TERMS = [
  "my famil", "our famil", "the famil", "family", "families", "roster", "learner", "student",
  "code", "codes", "participant", "agreement", "form", "forms", "paperwork", "signature",
  "payment", "payments", "invoice", "billing", "subsid", "sliding", "discount", "outstanding",
  "program", "programs", "session", "sessions", "attendance", "tutor", "tutors", "volunteer",
  "directory", "hub", "screen", "sidebar", "dashboard", "command center", "beyond limits",
  "andy", "parentsquare", "remind", "starfish", "horizons", "scse", "bffs",
  "builder", "assistant", "rename", "reword", "edit", "appearance", "settings", "activity",
  "accent colour", "accent color", "change",
];

/* Phrases that mean "not about us" — checked first, so "sliding scale fees at
   OTHER nonprofits" browses even though "sliding" is a program term. */
const EXTERNAL_MARKERS = [
  "other ", "elsewhere", "in general", "generally", "industry", "best practice",
  "news", "latest", "current", "today", "this week", "weather", "compare", "versus",
];

export function shouldBrowse(message) {
  const m = String(message || "").toLowerCase().trim();
  if (!m) return false;
  // an explicit link always wins — Andy is pointing at something
  if (/https?:\/\//.test(m)) return true;
  // "how do others do this" is a web question even when it mentions our words
  if (EXTERNAL_MARKERS.some((t) => m.includes(t))) return true;
  // otherwise: browse only when the question is NOT about his own program
  return !PROGRAM_TERMS.some((t) => m.includes(t));
}
