import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, SectionTitle, useToast, Reveal } from "../../components/ui";
import { useApp } from "../../lib/store";
import { SESSIONS, WEEKLOAD, ENRICHMENT, TONE } from "../../lib/data";

/* November 2026: Nov 1 2026 is a Sunday. Grid uses Mon-first columns. */
const YEAR = 2026, MONTH = 10; // 0-indexed November
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = [
  { id: "w1", label: "Nov 2-8", days: [2, 3, 4, 5, 6, 7, 8] },
  { id: "w2", label: "Nov 9-15", days: [9, 10, 11, 12, 13, 14, 15] },
  { id: "w3", label: "Nov 16-22", days: [16, 17, 18, 19, 20, 21, 22] },
  { id: "w4", label: "Nov 23-29", days: [23, 24, 25, 26, 27, 28, 29] },
];

/* deterministic synthetic daily session load (count + rsvps) */
const dayLoad = (d: number) => {
  if (d < 1 || d > 30) return null;
  const dow = new Date(YEAR, MONTH, d).getDay(); // 0 Sun
  if (dow === 0) return { sessions: 0, rsvps: 0, capacity: 0 };
  const base = [4, 6, 5, 6, 3, 8][dow - 1];
  const jitter = (d * 7) % 3;
  const sessions = base + jitter;
  const rsvps = sessions + ((d * 13) % 5);
  return { sessions, rsvps, capacity: dow === 6 ? 16 : 12 };
};

/* real sessions from the dataset keyed to November days */
const SESSION_DAY: Record<number, typeof SESSIONS> = { 6: [], 7: [], 8: [] };
SESSIONS.forEach(s => {
  const m = s.when.match(/Nov (\d+)/);
  if (m) (SESSION_DAY[+m[1]] ??= []).push(s);
});

export default function OpsCalendar() {
  const { setDispatched } = useApp();
  const toast = useToast();
  const [week, setWeek] = useState("w2");
  const [selected, setSelected] = useState(10);
  const [reminded, setReminded] = useState<Record<number, boolean>>({});

  const cells = useMemo(() => {
    const first = new Date(YEAR, MONTH, 1).getDay(); // 0 Sun
    const lead = (first + 6) % 7; // Mon-first offset
    const out: (number | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= 30; d++) out.push(d);
    while (out.length % 7) out.push(null);
    return out;
  }, []);

  const activeWeek = WEEKS.find(w => w.id === week)!;
  const day = dayLoad(selected);
  const daySessions = SESSION_DAY[selected] ?? [];
  const fillPct = day && day.capacity ? Math.round((day.rsvps / day.capacity) * 100) : 0;

  const sendReminder = () => {
    if (!day) return;
    setReminded(r => ({ ...r, [selected]: true }));
    setDispatched(d => [{ id: `r-${Date.now()}`, name: `RSVP reminder — Nov ${selected}`, at: "just now", reach: day.rsvps, channels: ["App", "SMS"], urgent: false }, ...d]);
    toast(`RSVP reminder sent to ${day.rsvps} families for Nov ${selected}`, "green");
  };

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Run the program" title="Calendar &amp; RSVP"
        sub="Room density for November, week by week. Pick a day to see its agenda, RSVP count and how full the rooms really are." />

      {/* week switcher */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {WEEKS.map(w => (
          <button key={w.id} onClick={() => { setWeek(w.id); setSelected(w.days[0]); }}
            className={cx("rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              week === w.id ? "bg-navy-700 text-white shadow-lift" : "bg-white border border-navy-100 text-ink/55 hover:text-ink")}>
            {w.label}
          </button>
        ))}
        <Chip tone="solar" className="ml-auto">Saturday slots fill first</Chip>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ------------------------------------------------ month grid */}
        <Reveal>
          <Card pad={false} className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-navy-100 bg-navy-50/60">
              {DOW.map(d => <div key={d} className="px-2 py-2.5 text-center text-[10.5px] font-bold uppercase tracking-[.12em] text-navy-700/60">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((d, i) => {
                if (d === null) return <div key={`e${i}`} className="min-h-[92px] border-b border-r border-navy-100/60 bg-paper/40 last:border-r-0" />;
                const load = dayLoad(d);
                const inWeek = activeWeek.days.includes(d);
                const on = selected === d;
                const pct = load && load.capacity ? load.rsvps / load.capacity : 0;
                return (
                  <button key={d} onClick={() => setSelected(d)}
                    className={cx("relative min-h-[92px] border-b border-r border-navy-100/60 p-2 text-left transition-colors last:border-r-0",
                      on ? "bg-navy-700 text-white" : inWeek ? "bg-solar-50/50 hover:bg-solar-50" : "hover:bg-navy-50/50")}>
                    <span className={cx("inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold",
                      on ? "bg-solar text-ink" : "text-ink/70")}>{d}</span>
                    {load && load.sessions > 0 && (
                      <div className="mt-1.5">
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: Math.min(load.sessions, 6) }).map((_, j) => (
                            <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: on ? "var(--solar)" : TONE.navy.dot, opacity: j < load.rsvps - load.sessions ? 1 : 0.45 }} />
                          ))}
                        </div>
                        <div className={cx("mt-1 text-[10px] font-semibold", on ? "text-white/70" : "text-ink/45")}>
                          {load.sessions} sess · {Math.round(pct * 100)}% full
                        </div>
                      </div>
                    )}
                    {reminded[d] && <span className={cx("absolute right-1.5 top-1.5 text-[9px] font-bold", on ? "text-solar" : "text-signal-green")}>✓ sent</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-[11px] font-semibold text-ink/50">
              <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-navy-700" /> booked session</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-navy-700/50" /> RSVP ahead</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-solar-100 border border-solar-200" /> selected week</span>
            </div>
          </Card>
        </Reveal>

        {/* ------------------------------------------------ agenda rail */}
        <Reveal delay={80}>
          <div className="stack" style={{ ["--gap" as any]: "16px" }}>
            <Card className="navy-field on-dark grain relative overflow-hidden !border-0">
              <div className="relative">
                <div className="eyebrow text-solar">Agenda</div>
                <h3 className="display mt-1 text-[22px] text-white">Thursday, Nov {selected}</h3>
                {day && day.capacity > 0 ? (
                  <>
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                        <div className="display text-[20px] text-white tnum">{day.sessions}</div>
                        <div className="text-[10.5px] font-semibold text-white/55">sessions</div>
                      </div>
                      <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                        <div className="display text-[20px] tnum" style={{ color: "var(--solar)" }}>{day.rsvps}</div>
                        <div className="text-[10.5px] font-semibold text-white/55">RSVPs</div>
                      </div>
                      <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                        <div className="display text-[20px] tnum" style={{ color: fillPct >= 90 ? "#FF9B8F" : "#34E2E4" }}>{fillPct}%</div>
                        <div className="text-[10.5px] font-semibold text-white/55">capacity</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? "#D93A2B" : "var(--solar)", transition: "width .9s cubic-bezier(.22,1,.36,1)" }} />
                    </div>
                    <div className="mt-1.5 text-[11.5px] text-white/55">
                      {fillPct >= 90 ? "Rooms nearly full — ask about a second tutor before adding RSVPs." : `${day.capacity - day.rsvps} seats of room capacity still open.`}
                    </div>
                    <Button variant="solar" size="sm" icon={I.Send} className="mt-4 w-full justify-center" disabled={!!reminded[selected]} onClick={sendReminder}>
                      {reminded[selected] ? "Reminder sent" : "Send RSVP reminder"}
                    </Button>
                  </>
                ) : (
                  <p className="mt-4 text-[13px] text-white/60">The center is closed this day — no sessions are bookable.</p>
                )}
              </div>
            </Card>

            {/* booked sessions on real data days */}
            {daySessions.length > 0 && (
              <Card>
                <SectionTitle eyebrow="On the books" title={`Sessions · Nov ${selected}`} />
                <div className="space-y-3">
                  {daySessions.map(s => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-navy-100 px-3.5 py-2.5">
                      <Avatar initials={s.student.split(" ").map(w => w[0]).join("")} tone="teal" size={30} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-bold text-ink">{s.student} · {s.subject}</div>
                        <div className="text-[11px] text-ink/50">{s.time} · {s.room} · {s.tutor}</div>
                      </div>
                      <Chip tone={s.status === "missed" ? "red" : s.status === "completed" ? "green" : "navy"}>{s.status}</Chip>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* room load for the active week */}
            <Card>
              <SectionTitle eyebrow="This week" title="Room load" sub="Booked slots vs. available, per day." />
              <div className="space-y-2.5">
                {WEEKLOAD.map(d => (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="w-9 text-[11.5px] font-bold text-ink/55">{d.day}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-navy-50 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.used / d.slots) * 100}%`, background: d.used === d.slots ? "#D93A2B" : "var(--navy)", transition: "width .9s cubic-bezier(.22,1,.36,1)" }} />
                    </div>
                    <span className="tnum text-[11.5px] font-bold text-ink/60 w-12 text-right">{d.used}/{d.slots}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* upcoming enrichment seats */}
            <Card>
              <SectionTitle eyebrow="Enrichment" title="Upcoming workshops" />
              <div className="space-y-3">
                {ENRICHMENT.slice(0, 3).map(e => (
                  <div key={e.name} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-signal-violet"><I.Sparkles size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-bold text-ink">{e.name}</div>
                      <div className="text-[11px] text-ink/50">{e.when}</div>
                    </div>
                    <Chip tone={e.filled >= e.seats ? "red" : "violet"}>{e.seats - e.filled > 0 ? `${e.seats - e.filled} left` : "Full"}</Chip>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" icon={I.Megaphone} className="mt-4 w-full justify-center"
                onClick={() => { setDispatched(d => [{ id: `e-${Date.now()}`, name: "Open enrichment seats", at: "just now", reach: 41, channels: ["App", "Email"], urgent: false }, ...d]); toast("Open-seats broadcast sent to 41 eligible families", "green"); }}>
                Broadcast open seats
              </Button>
            </Card>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
