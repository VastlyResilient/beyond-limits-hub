import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/* ============================================================================
   Theme engine — the whole palette is CSS-variable backed, so a switch here
   repaints every route, not just the shell.

   Token sets are taken from two real design systems (styles.refero.design):
     · Paper    ← ElevenLabs  (warm cream ground, stone hairlines, soft radii)
     · Atelier  ← Duolingo    (bright white ground, one green, rounded corners)
   ========================================================================== */

export type TokenKey =
  | "ground" | "surface" | "ink" | "brand" | "accent" | "radius" | "density";

export interface Tokens {
  ground: string; surface: string; ink: string; brand: string; accent: string;
  radius: number; density: number;
}

export interface ThemeDef {
  id: string;
  name: string;
  credit: string;
  blurb: string;
  tokens: Tokens;
}

/* --- helpers: hex -> "r g b" for the rgb(var(--x) / <alpha>) trick --------- */
const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a).split(" ").map(Number), B = rgb(b).split(" ").map(Number);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
};

export const THEMES: ThemeDef[] = [
  {
    id: "paper", name: "Paper", credit: "ElevenLabs design system",
    blurb: "Warm cream ground, stone hairlines, soft 20px radii. Editorial and calm — the one we built the mockup on.",
    tokens: { ground: "#faf7f2", surface: "#ffffff", ink: "#0a1220", brand: "#183868", accent: "#e8b84b", radius: 20, density: 1 },
  },
  {
    id: "atelier", name: "Atelier", credit: "Duolingo design system",
    blurb: "Bright white ground, one confident green, big rounded corners. Friendlier — good for family-facing screens.",
    tokens: { ground: "#ffffff", surface: "#ffffff", ink: "#000437", brand: "#3c8c00", accent: "#58cc02", radius: 26, density: 1.08 },
  },
];

export const DEFAULT_CUSTOM: Tokens = THEMES[0].tokens;

/* --- applying tokens ------------------------------------------------------ */
export function applyTokens(t: Tokens) {
  const s = document.documentElement.style;
  const ink = t.ink, brand = t.brand, accent = t.accent;
  const P: Record<string, string> = {};

  // neutrals step out from the ground and the ink
  P["--c-paper"] = rgb(t.ground);
  P["--c-paper-200"] = rgb(mix(t.ground, ink, 0.035));
  P["--c-paper-300"] = rgb(mix(t.ground, ink, 0.075));
  P["--c-paper-400"] = rgb(mix(t.ground, ink, 0.15));
  P["--c-ink"] = rgb(ink);
  P["--c-ink-800"] = rgb(mix(ink, t.ground, 0.1));
  P["--c-ink-700"] = rgb(mix(ink, t.ground, 0.18));

  // one brand colour drives an eleven-step ramp
  const ramp: [number, number][] = [[950,0.72],[900,0.5],[800,0.24],[700,0],[600,-0.14],[500,-0.3],[400,-0.48],[300,-0.68],[200,-0.82],[100,-0.9],[50,-0.955]];
  ramp.forEach(([k, m]) => {
    P[`--c-navy-${k}`] = rgb(m < 0 ? mix(brand, "#ffffff", -m) : mix(brand, ink, m));
  });

  // accent
  P["--c-solar"] = rgb(accent);
  P["--c-solar-600"] = rgb(mix(accent, ink, 0.12));
  P["--c-solar-700"] = rgb(mix(accent, ink, 0.3));
  P["--c-solar-100"] = rgb(mix(accent, "#ffffff", 0.82));
  P["--c-solar-50"] = rgb(mix(accent, "#ffffff", 0.93));

  // plain aliases for direct CSS / inline styles
  ramp.forEach(([k, m]) => { P[`--navy-${k}`] = m < 0 ? mix(brand, "#ffffff", -m) : mix(brand, ink, m); });
  P["--navy"] = brand;
  P["--navy-deep"] = mix(brand, ink, 0.5);
  P["--solar"] = accent;
  P["--solar-100"] = mix(accent, "#ffffff", 0.82);
  P["--solar-600"] = mix(accent, ink, 0.12);
  P["--solar-700"] = mix(accent, ink, 0.3);
  P["--ink"] = ink;
  P["--paper"] = t.ground;

  // hairlines and shadows derive from ink, so they re-tone with the theme
  P["--line"] = `rgba(${rgb(ink)} / .13)`;
  P["--line-soft"] = `rgba(${rgb(ink)} / .075)`;
  P["--radius-card"] = `${t.radius}px`;
  P["--radius-ctl"] = `${Math.max(8, t.radius - 8)}px`;
  P["--density"] = String(t.density);

  for (const k in P) s.setProperty(k, P[k]);
  document.body.style.background = t.ground;
  document.body.style.fontFamily = "var(--font-sans)";
  // keep the browser chrome in step with the theme
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t.ground);

  // persist the resolved values so the next load paints correctly BEFORE React mounts
  try { localStorage.setItem("bl.theme.v2.props", JSON.stringify({ ...P, ...FONTS[themeIdRef] })); } catch {}
}

// applyTokens needs the font vars too; set by applyFonts on the same tick
let themeIdRef = "paper";
export function setThemeIdRef(id: string) { themeIdRef = id; }

const FONTS: Record<string, { display: string; sans: string }> = {
  paper: { display: "'Bricolage Grotesque',Georgia,serif", sans: "'Plus Jakarta Sans',system-ui,sans-serif" },
  atelier: { display: "'Nunito',system-ui,sans-serif", sans: "'Nunito',system-ui,sans-serif" },
};
export function applyFonts(themeId: string) {
  const f = FONTS[themeId] || FONTS.paper;
  document.documentElement.style.setProperty("--font-display", f.display);
  document.documentElement.style.setProperty("--font-sans", f.sans);
}

/* --- provider ------------------------------------------------------------- */
interface Ctx {
  themeId: string; theme: ThemeDef; tokens: Tokens;
  setTheme: (id: string) => void; setToken: <K extends keyof Tokens>(k: K, v: Tokens[K]) => void;
  reset: () => void; dirty: boolean; cssText: string;
}
const ThemeCtx = createContext<Ctx | null>(null);
export const useTheme = () => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme must be used inside ThemeProvider");
  return c;
};

const KEY = "bl.theme.v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState("paper");
  const [tokens, setTokens] = useState<Tokens>(THEMES[0].tokens);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const p = JSON.parse(raw); if (p.themeId) setThemeId(p.themeId); if (p.tokens) setTokens(p.tokens); }
    } catch { /* first run */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setThemeIdRef(themeId);
    applyFonts(themeId); applyTokens(tokens);
    try { localStorage.setItem(KEY, JSON.stringify({ themeId, tokens })); } catch {}
  }, [tokens, themeId, loaded]);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const value = useMemo<Ctx>(() => ({
    themeId, theme, tokens,
    setTheme: (id) => { const d = THEMES.find(t => t.id === id); if (d) { setThemeId(id); setTokens(d.tokens); } },
    setToken: (k, v) => setTokens(t => ({ ...t, [k]: v })),
    reset: () => { setThemeId(theme.id); setTokens(theme.tokens); },
    dirty: JSON.stringify(tokens) !== JSON.stringify(theme.tokens),
    cssText: [
      ":root{", `  --paper: ${tokens.ground};`, `  --navy: ${tokens.brand};`,
      `  --solar: ${tokens.accent};`, `  --ink: ${tokens.ink};`,
      `  --radius-card: ${tokens.radius}px;`, "}",
    ].join("\n"),
  }), [themeId, theme, tokens]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
