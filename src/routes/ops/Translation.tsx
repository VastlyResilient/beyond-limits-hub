import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { Avatar, Bar, Button, Card, Chip, Reveal, Tabs, Tip, cx, useToast } from "../../components/ui";
import { HBars } from "../../components/charts";
import { InfoButton } from "../../components/InfoButton";
import { LANGUAGES, TRANSLATION_PAIRS } from "../../lib/data";

type Verdict = "approved" | "review";
const GLOSSARY = [
  { term: "Beyond Limits", note: "Never translated — it is the program's name in every language." },
  { term: "Participant Agreement", note: "ES: Acuerdo de Participante · HT: Akò Patisipan · PT: Acordo de Participante" },
  { term: "one-to-one tutoring", note: "ES: tutoría individual · never \"clases particulares\" (fee-paying connotation)" },
  { term: "scholar", note: "Family-facing copy says \"your student\"; \"scholar\" is staff shorthand only." },
  { term: "Long Ridge Road", note: "Address — keep verbatim, do not localise." },
];
const ON_CALL = [
  { lang: "Español", who: "Marisol A.", until: "weekdays 3–8pm", tone: "teal" },
  { lang: "Kreyòl Ayisyen", who: "Jean-Baptiste M.", until: "Tue + Thu", tone: "violet" },
  { lang: "Português", who: "Ana P.", until: "on request", tone: "amber" },
  { lang: "العربية", who: "Interpreter line", until: "next-day call-back", tone: "navy" },
];

export default function OpsTranslation() {
  const toast = useToast();
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [filter, setFilter] = useState<"all" | "verified" | "review" | "approved">("all");
  const [showBack, setShowBack] = useState(true);

  const rows = useMemo(() => TRANSLATION_PAIRS.map((p, i) => ({ ...p, key: i, state: verdicts[i] ?? (p.status === "verified" ? "approved" : "review") as Verdict })), [verdicts]);
  const shown = rows.filter(r => filter === "all" ? true : filter === "approved" ? r.state === "approved" : filter === "review" ? r.state === "review" : r.status === "verified");
  const pending = rows.filter(r => r.state === "review").length;
  const totalFamilies = LANGUAGES.reduce((a, l) => a + l.families, 0);

  const set = (key: number, state: Verdict, lang: string) => {
    setVerdicts(v => ({ ...v, [key]: state }));
    toast(state === "approved" ? `${lang} copy approved and locked` : `${lang} sent to a human reviewer`, state === "approved" ? "green" : "navy");
  };

  return (
    <div className="space-y-6">
      <PageHead eyebrow="Reach" tone="#0E8C8C" title="Translation"
        sub="Every family receives your message in their own language. Nothing goes out unchecked."
        actions={<Button variant="ghost" icon={I.Download} onClick={() => toast("Translation log exported for the November audit")}>Export log</Button>} />

      <Reveal>
        <Card className="overflow-hidden" pad={false}>
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="p-5 border-b lg:border-b-0 lg:border-r border-navy-100">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div>
                  <div className="eyebrow text-navy-500 mb-1.5">Who we reach</div>
                  <div className="display text-[21px]">
                    {totalFamilies} households across {LANGUAGES.length} languages
                  </div>
                </div>
                <Chip tone={pending ? "amber" : "green"}>
                  {pending ? `${pending} awaiting review` : "All copy cleared"}
                </Chip>
              </div>
              <HBars items={LANGUAGES.map(l => ({ label: l.label, value: l.families, tone: l.code === "en" ? "var(--navy)" : l.code === "es" ? "#0E8C8C" : "#6C4BD6", note: `${l.reach} contacts` }))} />
            </div>
            <div className="navy-field relative on-dark grain p-5">
              <div className="relative z-10">
                <div className="eyebrow text-solar mb-3">On call today</div>
                <div className="space-y-3">
                  {ON_CALL.map(o => (
                    <div key={o.lang} className="flex items-center gap-3">
                      <Avatar initials={o.lang.slice(0, 2)} tone={o.tone} size={32} dark />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-white truncate">{o.lang}</div>
                        <div className="text-[11.5px] text-white/55">{o.who} · {o.until}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-white/8 p-3 text-[11.5px] leading-relaxed text-white/70">
                  A translator is a phone call away, not a ticket queue. Urgent closures go out in all five languages within the hour.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={60}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs items={[
            { id: "all", label: "All pairs", badge: rows.length },
            { id: "review", label: "Awaiting review", badge: pending },
            { id: "approved", label: "Approved", badge: rows.length - pending },
          ]} value={filter as any} onChange={(v) => setFilter(v as any)} />
          <span className="inline-flex items-center gap-1.5">
            <button onClick={() => setShowBack(v => !v)} className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-ink/55 hover:text-ink">
              <I.Repeat size={14} /> Back-translation check {showBack ? "on" : "off"}
            </button>
            <InfoButton id="C-03" />
          </span>
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] items-start">
        <div className="space-y-4">
          {shown.map((r, idx) => (
            <Reveal key={r.key} delay={idx * 30}>
              <Card pad={false} className="overflow-hidden">
                <div className="flex items-center gap-3 border-b border-navy-100 bg-navy-50/60 px-4 py-2.5">
                  <I.Languages size={14} className="text-navy-500" />
                  <span className="text-[12.5px] font-bold text-navy-700">{r.lang}</span>
                  <span className="text-[11.5px] text-ink/45">{r.by}</span>
                  <Chip tone={r.state === "approved" ? "green" : "amber"} className="ml-auto">
                    {r.state === "approved" ? "Approved" : "Needs a human"}
                  </Chip>
                </div>
                <div className="grid gap-0 sm:grid-cols-2">
                  <div className="p-4 sm:border-r border-navy-100">
                    <div className="eyebrow text-ink/35 mb-2">English source</div>
                    <p className="text-[13.5px] leading-relaxed text-ink/80 m-0">{r.src}</p>
                  </div>
                  <div className="p-4 bg-navy-50/40">
                    <div className="eyebrow text-ink/35 mb-2">Delivered as</div>
                    <p className="text-[13.5px] leading-relaxed text-ink m-0">{r.tgt}</p>
                    {showBack && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/70 px-2.5 py-2 text-[11.5px] text-ink/55">
                        <I.ShieldCheck size={13} className="mt-[2px] shrink-0 text-signal-green" />
                        Back-translated and compared — meaning and tone hold. No fee language, no idioms.
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-navy-100 px-4 py-3">
                  <Button size="sm" variant={r.state === "approved" ? "quiet" : "primary"} icon={I.Check}
                    onClick={() => set(r.key, "approved", r.lang)}>
                    {r.state === "approved" ? "Approved" : "Approve copy"}
                  </Button>
                  <Button size="sm" variant="ghost" icon={I.UserCheck} onClick={() => set(r.key, "review", r.lang)}>
                    Human review
                  </Button>
                  <Tip text="Send this pair to the family language group chat for a sanity read"><span className="ml-auto text-[11.5px] text-ink/35">Ask a parent</span></Tip>
                </div>
              </Card>
            </Reveal>
          ))}
          {shown.length === 0 && (
            <Card className="text-center text-[13px] text-ink/50">Nothing in this bucket — every pair is approved.</Card>
          )}
        </div>

        <div className="space-y-5">
          <Reveal delay={80}>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <I.BookMarked size={15} className="text-navy-600" />
                <h3 className="text-[14.5px] font-bold">Glossary</h3>
              </div>
              <div className="space-y-3">
                {GLOSSARY.map(g => (
                  <div key={g.term}>
                    <div className="text-[12.5px] font-semibold text-navy-700">{g.term}</div>
                    <div className="text-[11.8px] leading-relaxed text-ink/55">{g.note}</div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={120}>
            <Card>
              <div className="eyebrow text-ink/35 mb-3">Coverage this month</div>
              <div className="space-y-3">
                {[{ l: "Families reached in their language", v: 99 }, { l: "Messages needing a human fix", v: 4 }, { l: "Urgent notices in 5 languages", v: 100 }].map(m => (
                  <div key={m.l}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1.5"><span className="text-ink/60">{m.l}</span><b className="tnum">{m.v}%</b></div>
                    <Bar value={m.v} tone={m.v >= 90 ? "#159A63" : "#DE8C00"} />
                  </div>
                ))}
              </div>
              <button onClick={() => toast("November language report queued for the board packet")}
                className="mt-4 w-full rounded-xl border border-navy-100 py-2.5 text-[12.5px] font-semibold text-navy-700 hover:bg-navy-50">
                Add to the board packet
              </button>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
