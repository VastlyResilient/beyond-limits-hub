import React, { useEffect, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, useToast, Reveal } from "../../components/ui";
import { SESSIONS } from "../../lib/data";

/* Deterministic reference: next session is Sat Nov 8, 2026 · 10:00 AM local */
const NEXT_AT = new Date("2026-11-08T10:00:00");

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = Math.max(0, NEXT_AT.getTime() - now);
  const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return { d, h, m, s, done: ms === 0 };
}

const BRING = [
  { icon: I.Laptop, t: "Chromebook (or borrow one at the front desk)" },
  { icon: I.BookOpen, t: "Homework — even the messy half-done kind" },
  { icon: I.CircleHelp, t: "One question you got stuck on this week" },
  { icon: I.Pencil, t: "Pencil + notebook (we have spares if you forget)" },
];

export default function StudentSessions() {
  const toast = useToast();
  const cd = useCountdown();
  const [packed, setPacked] = useState<Record<number, boolean>>({});
  const mine = SESSIONS.filter(s => s.student === "Amara R." && s.status === "completed");
  const unit = (v: number, l: string) => (
    <div className="rounded-2xl bg-white/70 px-4 py-3 text-center min-w-[74px]">
      <div className="display tnum text-[26px] text-ink">{String(v).padStart(2, "0")}</div>
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-ink/55">{l}</div>
    </div>
  );

  return (
    <div>
      <PageHead eyebrow="My Sessions" tone="var(--solar-700)" title="Your next session is locked in"
        sub="Show up as you are. Marcus handles the rest." />

      <Reveal>
        <div className="sun-field relative grain rounded-[22px] p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-7">
            <div className="min-w-0 flex-1">
              <Chip className="mb-3" tone="navy"><I.MapPin size={11} /> Room A · Long Ridge Road</Chip>
              <div className="display text-[26px] sm:text-[30px] text-ink">Algebra I with Marcus D.</div>
              <div className="mt-1 text-[13px] text-ink/65">Saturday, Nov 8 · 10:00 – 11:15 AM · Next up: graphing slope-intercept form</div>
            </div>
            <div className="flex gap-2.5">
              {cd.done
                ? <div className="rounded-2xl bg-ink text-white px-6 py-4 display text-[20px]">It's time — head in!</div>
                : <>{unit(cd.d, "days")}{unit(cd.h, "hrs")}{unit(cd.m, "min")}{unit(cd.s, "sec")}</>}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <div className="space-y-5">
          <Reveal><Card>
            <div className="eyebrow text-navy-500 mb-1">Where you've been</div>
            <h3 className="display text-[19px] text-ink mb-4">Session history</h3>
            <div className="space-y-3">
              {mine.map(s => (
                <div key={s.id} className="rounded-2xl border border-navy-100 p-4.5 p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip tone="green"><I.Check size={11} /> {s.when}</Chip>
                    <span className="text-[13.5px] font-bold text-ink">{s.subject} · {s.time}</span>
                    <span className="text-[11.5px] text-ink/45">{s.minutes} min · {s.room}</span>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 text-[12.5px]">
                    <div className="rounded-xl bg-paper p-3"><span className="font-bold text-ink block mb-0.5">You worked on</span><span className="text-ink/65">{s.focus}</span></div>
                    <div className="rounded-xl bg-solar-50 p-3"><span className="font-bold text-ink block mb-0.5">Coming next</span><span className="text-ink/65">{s.next}</span></div>
                  </div>
                  <div className="mt-2.5 text-[11.5px] text-ink/50 flex items-center gap-1.5"><I.BookOpen size={12} /> Homework: {s.homework}</div>
                </div>
              ))}
            </div>
          </Card></Reveal>
        </div>

        <Reveal delay={100}>
          <Card className="lg:sticky lg:top-[86px]">
            <div className="eyebrow text-navy-500 mb-1">Before you leave home</div>
            <h3 className="display text-[18px] text-ink mb-4">What to bring</h3>
            <div className="space-y-2.5">
              {BRING.map((b, i) => (
                <button key={b.t} onClick={() => { setPacked(p => ({ ...p, [i]: !p[i] })); if (!packed[i]) toast("Packed!", "green"); }}
                  className={cx("w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    packed[i] ? "border-emerald-300 bg-emerald-50" : "border-navy-100 hover:border-navy-300")}
                  aria-pressed={!!packed[i]}>
                  <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    packed[i] ? "bg-signal-green text-white" : "bg-navy-50 text-navy-600")}>
                    {packed[i] ? <I.Check size={14} strokeWidth={3} /> : <b.icon size={14} />}
                  </span>
                  <span className={cx("text-[12.5px] font-semibold leading-snug", packed[i] ? "text-ink/50 line-through" : "text-ink/80")}>{b.t}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] text-ink/50 leading-relaxed">
              Forgot something? Don't stress — the center has spare Chromebooks, and the lounge has water and snacks.
            </p>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
