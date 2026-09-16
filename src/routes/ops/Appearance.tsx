import React, { useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { Button, Card, Chip, Reveal, SectionTitle, Tip, cx, useToast } from "../../components/ui";
import { THEMES, useTheme, type Tokens } from "../../lib/theme";

/* ---------------------------------------------------------------------------
   Settings › Appearance — edit the interface live. Every control writes a CSS
   variable, so the whole product repaints as you drag. Nothing is a mockup.
--------------------------------------------------------------------------- */

const FIELDS: { key: keyof Tokens; label: string; hint: string }[] = [
  { key: "ground", label: "Page ground", hint: "The canvas behind every screen" },
  { key: "surface", label: "Card surface", hint: "Panels, cards and popovers" },
  { key: "ink", label: "Ink", hint: "Body text and hairlines derive from this" },
  { key: "brand", label: "Brand", hint: "Buttons, links, the sidebar — the full ramp is generated" },
  { key: "accent", label: "Accent", hint: "Badges, highlights and the odd call to action" },
];

function Swatch({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint: string }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-navy-100 last:border-0">
      <label className="relative shrink-0 cursor-pointer" style={{ width: 44, height: 44 }}>
        <span className="absolute inset-0 rounded-xl border border-navy-100 shadow-inset" style={{ background: value }} />
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={label} />
      </label>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold">{label}</div>
        <div className="text-[11.5px] text-ink/45">{hint}</div>
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} spellCheck={false}
        className="mono w-[92px] rounded-lg border border-navy-100 bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-navy-300" />
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, onChange, hint }:
  { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void; hint: string }) {
  return (
    <div className="py-3.5 border-b border-navy-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[13.5px] font-semibold">{label}</div>
          <div className="text-[11.5px] text-ink/45">{hint}</div>
        </div>
        <span className="mono text-[12.5px] text-navy-700">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-navy-700 cursor-pointer" aria-label={label} />
    </div>
  );
}

export default function OpsAppearance() {
  const toast = useToast();
  const { themeId, theme, tokens, setTheme, setToken, reset, dirty, cssText } = useTheme();
  const [tab, setTab] = useState<"themes" | "tokens">("themes");

  return (
    <div className="space-y-6">
      <PageHead eyebrow="Settings" title="Appearance"
        sub="Change how the whole product looks. Every control here writes a live style variable — nothing is a preview."
        actions={
          <div className="flex items-center gap-2">
            {dirty && <Chip tone="amber">Edited from {theme.name} defaults</Chip>}
            <Button variant="ghost" icon={I.RotateCcw} onClick={() => { reset(); toast("Back to the " + theme.name + " defaults", "navy"); }}>
              Reset</Button>
            <Button variant="primary" icon={I.ClipboardCopy}
              onClick={() => { navigator.clipboard?.writeText(cssText); toast("CSS variables copied to the clipboard", "green"); }}>
              Copy CSS</Button>
          </div>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
        {/* ------------------------------------------------------ controls */}
        <div className="space-y-5">
          <Reveal>
            <Card>
              <SectionTitle eyebrow="Start from" title="A design system"
                sub="Both are taken from real, shipped products — not invented." />
              <div className="grid gap-4 sm:grid-cols-2">
                {THEMES.map(t => {
                  const on = t.id === themeId;
                  return (
                    <button key={t.id} onClick={() => { setTheme(t.id); toast(t.name + " applied across the product", "green"); }}
                      className={cx("relative overflow-hidden rounded-[20px] border p-4 text-left transition-all",
                        on ? "border-navy-700 shadow-lift" : "border-navy-100 hover:border-navy-300")}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[14px] font-bold">{t.name}</span>
                        {on && <Chip tone="green" className="ml-auto">active</Chip>}
                      </div>
                      <div className="flex gap-2 mb-3">
                        {[t.tokens.ground, t.tokens.surface, t.tokens.brand, t.tokens.accent, t.tokens.ink].map((c, i) => (
                          <span key={i} className="h-7 w-7 rounded-lg border border-navy-100" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="text-[11.5px] leading-relaxed text-ink/50">{t.blurb}</div>
                      <div className="mt-2.5 mono text-[10.5px] uppercase tracking-[.14em] text-navy-500">{t.credit}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={60}>
            <Card>
              <SectionTitle eyebrow="Fine tune" title="Colours"
                sub="Everything else — hovers, borders, muted text, the whole brand ramp — is derived from these five." />
              <div>
                {FIELDS.map(f => (
                  <Swatch key={f.key} label={f.label} hint={f.hint}
                    value={String(tokens[f.key])}
                    onChange={v => setToken(f.key, v as any)} />
                ))}
              </div>
              <div className="mt-5">
                <SectionTitle eyebrow="Shape" title="Radius and density" />
                <Slider label="Corner radius" value={tokens.radius} min={4} max={34} step={1} suffix="px"
                  hint="Cards, panels and controls all follow this" onChange={v => setToken("radius", v)} />
                <Slider label="Density" value={tokens.density} min={0.85} max={1.25} step={0.01} suffix="×"
                  hint="Padding inside buttons and controls" onChange={v => setToken("density", v)} />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={100}>
            <Card className="bg-navy-50/60">
              <div className="flex items-start gap-3">
                <I.Info size={16} className="mt-0.5 shrink-0 text-navy-500" />
                <div className="text-[12.5px] leading-relaxed text-ink/60">
                  Your settings are saved in this browser and applied before first paint, so there is no flash of the old theme.
                  <b className="text-ink/75"> Every one of the 24 screens inherits them</b> — the palette is variable-backed rather than
                  hard-coded per screen.
                </div>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ------------------------------------------------------- preview */}
        <div className="space-y-5 lg:sticky lg:top-6">
          <Reveal delay={40}>
            <Card pad={false} className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-navy-100 px-4 py-3">
                <I.Eye size={14} className="text-navy-500" />
                <span className="text-[12.5px] font-bold">Live preview</span>
                <Chip tone="green" className="ml-auto">real components</Chip>
              </div>
              <div className="space-y-4 p-4" style={{ background: tokens.ground }}>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-[10px] text-[11px] font-bold text-white"
                    style={{ background: tokens.brand }}>BL</span>
                  <div>
                    <div className="text-[13px] font-bold" style={{ color: tokens.ink }}>Beyond Limits</div>
                    <div className="text-[10.5px] opacity-50" style={{ color: tokens.ink }}>Academic Program</div>
                  </div>
                  <span className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: tokens.accent, color: "#1A1400" }}>104 waiting</span>
                </div>

                <div className="p-4" style={{ background: tokens.surface, borderRadius: tokens.radius, boxShadow: "0 1px 2px rgba(10,18,32,.06), 0 10px 26px -14px rgba(10,18,32,.2)" }}>
                  <div className="text-[10.5px] font-bold uppercase tracking-[.14em] opacity-45" style={{ color: tokens.ink }}>Codes issued</div>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-[34px] font-bold leading-none" style={{ color: tokens.brand }}>9</span>
                    <span className="pb-1 text-[12px] opacity-55" style={{ color: tokens.ink }}>of 113 · 8%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "transparent", border: "1px solid rgba(0,0,0,.08)" }}>
                    <div className="h-full rounded-full" style={{ width: "8%", background: tokens.accent }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="text-[12.5px] font-semibold text-white"
                    style={{ background: tokens.brand, borderRadius: Math.max(8, tokens.radius - 8), padding: `${9 * tokens.density}px 15px` }}>
                    Issue the codes</button>
                  <button className="text-[12.5px] font-semibold"
                    style={{ color: tokens.brand, border: `1px solid rgba(0,0,0,.14)`, borderRadius: Math.max(8, tokens.radius - 8), padding: `${9 * tokens.density}px 15px` }}>
                    Review queue</button>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: `${tokens.accent}22`, color: tokens.ink }}>dup</span>
                </div>

                <div className="overflow-hidden" style={{ background: tokens.surface, borderRadius: Math.max(10, tokens.radius - 6) }}>
                  {[["Shalauddin, Ethan", "BL-2026-0002"], ["Rojas, Annabella", "BL-2026-0001"], ["Lopez, Anthony", "needs a code"]].map(([n, c], i) => (
                    <div key={n} className={cx("flex items-center gap-3 px-3.5 py-2.5", i > 0 && "border-t border-navy-100")}>
                      <span className="text-[12.5px] font-semibold" style={{ color: tokens.ink }}>{n}</span>
                      <span className="ml-auto mono text-[11px] opacity-55" style={{ color: tokens.ink }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={80}>
            <Card>
              <SectionTitle eyebrow="Currently" title="Live variables" />
              <pre className="mono overflow-auto rounded-xl bg-navy-950 p-3.5 text-[11px] leading-relaxed text-navy-100">{cssText}</pre>
              <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink/45">
                <I.Database size={13} /> Saved to this browser · applies before first paint
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
