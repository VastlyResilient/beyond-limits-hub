import React, { useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, SectionTitle, Bar, useToast, Reveal } from "../../components/ui";
import { PROGRAMS, ENRICHMENT, SCHOLARSHIPS, SPONSORS, COMMUNITY_PARTNERS, CONTEXT_STAT, TONE, IMPACT } from "../../lib/data";

const ICONS: Record<string, any> = { book: I.BookOpen, compass: I.Compass, badge: I.BadgeCheck, sun: I.Sun, users: I.Users, spark: I.Sparkles };
const LIVE_STAT: Record<string, string> = {
  peer: "90% on-site", bffs: "ECS cohort", youth: "Paid first jobs", msssp: "Annual bridge", mentor: "1:1 pairs", enrich: "5 workshops",
};

export default function OpsPrograms() {
  const toast = useToast();
  const [reserved, setReserved] = useState<Record<string, number>>({});
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const reserve = (name: string, seats: number, filled: number) => {
    const taken = reserved[name] || 0;
    if (filled + taken >= seats) return;
    setReserved(r => ({ ...r, [name]: taken + 1 }));
    toast(`Seat reserved — ${name}`, "green");
  };

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Programs" title="Six programs, one ladder"
        sub="Every program is subsidized, every family is reachable, and every step up the staircase is staffed. Founded 2014 — grades 4–10." />

      {/* ------------------------------------------------ staircase */}
      <div className="relative mb-14">
        <div className="absolute inset-y-6 left-1/2 w-px bg-gradient-to-b from-transparent via-navy-200 to-transparent hidden lg:block" aria-hidden />
        <div className="space-y-5">
          {PROGRAMS.map((p, i) => {
            const tone = TONE[p.tone] || TONE.navy;
            const Icon = ICONS[p.icon] || I.Layers;
            const left = i % 2 === 0;
            const open = openIdx === i;
            return (
              <Reveal key={p.id} delay={i * 60}>
                <div className={cx("lg:w-[62%]", left ? "lg:mr-auto lg:pr-10" : "lg:ml-auto lg:pl-10", `lg:translate-y-${""}`)}
                  style={{ marginTop: i === 0 ? 0 : undefined }}>
                  <button onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open}
                    className={cx("group w-full text-left card p-5 sm:p-6 transition-all hover:shadow-deep hover:-translate-y-0.5 relative overflow-hidden",
                      open && "ring-2 ring-navy-700/20 shadow-deep")}>
                    <span className="absolute top-0 inset-x-0 h-[4px]" style={{ background: tone.dot }} aria-hidden />
                    <div className="flex items-start gap-4">
                      <span className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", tone.bg, tone.fg)}>
                        <Icon size={21} strokeWidth={1.9} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="display text-[19px] text-ink">{p.name}</span>
                          <Chip tone={p.tone}>{LIVE_STAT[p.id]}</Chip>
                        </div>
                        <p className="mt-1.5 text-[13px] text-ink/62 leading-relaxed">{p.blurb}</p>
                        <div className={cx("grid transition-all duration-500", open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0")}>
                          <div className="overflow-hidden">
                            <p className="text-[13px] text-ink/70 leading-relaxed border-l-[3px] pl-3.5" style={{ borderColor: tone.dot }}>{p.detail}</p>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 mt-1 text-navy-300 group-hover:text-navy-700 transition-colors">
                        {open ? <I.ChevronUp size={17} /> : <I.ChevronDown size={17} />}
                      </span>
                    </div>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------ enrichment + scholarships */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12 items-start">
        <Card>
          <SectionTitle eyebrow="Enrichment" title="Workshops with seats open"
            sub="Free for enrolled families. Reserve directly from this board." />
          <div className="space-y-3">
            {ENRICHMENT.map(w => {
              const extra = reserved[w.name] || 0;
              const filled = w.filled + extra;
              const pct = Math.round((filled / w.seats) * 100);
              const full = filled >= w.seats;
              return (
                <div key={w.name} className="rounded-2xl border border-navy-100 p-4 hover:border-navy-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-bold leading-snug">{w.name}</div>
                      <div className="mt-0.5 text-[11.5px] text-ink/50 flex items-center gap-1.5"><I.CalendarDays size={11.5} /> {w.when}</div>
                    </div>
                    {full ? <Chip tone="navy">Full</Chip> : <Chip tone="green">{w.seats - filled} seats left</Chip>}
                  </div>
                  <Bar value={pct} tone={full ? "var(--navy)" : "#159A63"} h={6} label={`${filled} of ${w.seats} seats`} />
                  {!full && (
                    <Button size="sm" variant="ghost" icon={I.TicketPlus} className="mt-3"
                      onClick={() => reserve(w.name, w.seats, w.filled)}>
                      {extra > 0 ? `Reserve another (${extra} held)` : "Reserve seats"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="stack" style={{ ["--gap" as any]: "20px" }}>
          <Card className="navy-field relative on-dark grain border-0">
            <SectionTitle dark eyebrow="Scholarships" title="Named awards, real winners" />
            <div className="space-y-4">
              {SCHOLARSHIPS.map(s => (
                <div key={s.name} className="rounded-2xl bg-white/7 border border-white/12 p-4.5 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-solar text-ink"><I.Award size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="display text-[16px] text-white">{s.name}</div>
                      <div className="mt-0.5 text-[11.5px] text-white/55">{s.type} · {s.who}</div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {s.awarded.map(a => <Chip key={a} dark><I.Medal size={11} /> {a}</Chip>)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Backing" title="Sponsors & partners" />
            <div className="space-y-3">
              {SPONSORS.map(s => (
                <div key={s.name} className="flex items-center gap-3.5 rounded-2xl border border-navy-100 p-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-navy-50 text-navy-700">
                    {s.logo
                      ? <img src={s.logo} alt={`${s.name} logo`} className="h-8 w-8 object-contain"
                          onError={e => { const el = e.currentTarget; el.style.display = "none"; el.parentElement!.insertAdjacentHTML("beforeend", "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M20 6 9 17l-5-5'/></svg>"); }} />
                      : <I.Handshake size={18} />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold">{s.name}</div>
                    <div className="text-[11.5px] text-ink/50 leading-snug">{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {COMMUNITY_PARTNERS.map(p => <Chip key={p} tone="navy">{p}</Chip>)}
            </div>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------ context callout */}
      <div className="rounded-[22px] border-2 border-dashed border-navy-200 bg-white px-6 py-6 sm:px-8 flex flex-wrap items-center gap-6">
        <div className="display text-[44px] tnum text-signal-red leading-none">{CONTEXT_STAT.n}</div>
        <div className="min-w-[240px] flex-1">
          <p className="text-[14px] text-ink/75 leading-relaxed max-w-2xl">{CONTEXT_STAT.text}</p>
          <div className="mt-2 flex items-center gap-2 text-[11.5px] font-semibold text-ink/45">
            <I.BookMarked size={12} /> Source: {CONTEXT_STAT.src}
            <span className="text-ink/25">·</span>
            <span>Why Beyond Limits exists: subsidized tutoring closes this gap.</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {IMPACT.slice(0, 2).map(m => (
            <Chip key={m.label} tone="solar">{m.n} {m.label}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
