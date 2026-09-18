import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { Editable } from "../../components/Editable";
import { cx, Avatar, Chip, Button, Card, Ring, Stat, Tabs, Tip, Drawer, Bar, useToast, Reveal } from "../../components/ui";
import { AreaLine, Donut, HBars, Spark } from "../../components/charts";
import { STUDENTS, TUTORS, SESSIONS, FORMS, LEDGER, AUDIT, ENGAGEMENT_TREND, REACH_BY_GROUP, WEEKLOAD, IMPACT, PROGRAMS, TONE, ENRICHMENT } from "../../lib/data";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function OpsCommand() {
  const { go, posts, forms, ledger, shifts, dispatched, me, threads } = useApp();
  const toast = useToast();
  const [range, setRange] = useState<"wk" | "mo" | "term">("mo");
  const [openStudent, setOpenStudent] = useState<typeof STUDENTS[number] | null>(null);

  const outstanding = forms.filter(f => f.status === "outstanding" && f.required);
  const overdue = ledger.filter(l => l.status === "overdue");
  const due = ledger.filter(l => l.status === "due");
  const midweek = SESSIONS.filter(s => s.status !== "completed").slice(0, 4);
  const atrisk = STUDENTS.filter(s => s.attendance < 80 || s.confidence < 70);

  const collected = ledger.filter(l => l.status === "paid").reduce((a, b) => a + b.billed, 0);
  const openShifts = shifts.reduce((a, s) => a + (s.needed - s.filled.length), 0);

  const scale = { wk: 0.27, mo: 1, term: 3.4 }[range];
  const readRate = Math.round(ENGAGEMENT_TREND[5].read * (range === "wk" ? 1 : 1));
  const trend = ENGAGEMENT_TREND.map(e => e.read);

  const queue = useMemo(() => [
    { id: "q1", tone: "red", icon: I.UserX, head: `${atrisk.length} learners flagged`, body: "Attendance or confidence is trending down. Tutors see it first — they need a nudge.", action: "Review learners", go: "ops-sessions" as const },
    ...outstanding.map(f => ({ id: f.id, tone: "amber", icon: I.FileSignature, head: f.name, body: `${f.who} · ${f.due} — required to keep the sliding-scale rate.`, action: "Chase signature", go: "ops-forms" as const })),
    ...overdue.map(l => ({ id: l.id, tone: "red", icon: I.Receipt, head: `${l.family} family overdue`, body: `${l.program} · $${l.billed.toFixed(2)} · ${l.date}`, action: "Send a gentle reminder", go: "ops-payments" as const })),
    { id: "q2", tone: "violet", icon: I.Languages, head: "1 translation flagged", body: "Sliding-scale verification notice needs a human review before it sends.", action: "Open review queue", go: "ops-translation" as const },
  ].slice(0, 6), [atrisk.length, outstanding, overdue]);

  return (
    <>
      <PageHead
        eyebrow={`Program Operations · ${me.name}`}
        title={<Editable id="command.greeting" fallback={`${greeting()}, Andy.`} />}
        sub={<Editable id="command.hero.sub" fallback="Everything moving in Beyond Limits right now — reach, sessions, paperwork and the learners who need a person today." />}
        actions={
          <>
            <Button variant="ghost" icon={I.FileBarChart} onClick={() => go("ops-analytics")}>Reach report</Button>
            <Button variant="primary" icon={I.Megaphone} onClick={() => go("ops-composer")}>Send a message</Button>
          </>
        }
      />

      {/* ---------------------------------------------------------- hero band */}
      <Reveal>
        <div className="navy-field on-dark grain relative overflow-hidden rounded-[24px] p-6 sm:p-8">
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Chip dark><span className="h-1.5 w-1.5 rounded-full animate-pulseR" style={{ background: "var(--solar)" }} /> Live</Chip>
                <Chip dark>Week of Nov 10</Chip>
                <Chip dark>212 family accounts</Chip>
              </div>
              <h2 className="display mt-5 max-w-[640px] text-[26px] leading-tight text-white sm:text-[32px]">
                <Editable id="command.hero.headline"
                  fallback="Saturday is full and demand is still ahead of staffing — that is the decision waiting for you today." />
              </h2>
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { k: "Reached last send", v: "209/212", s: "99% · 3 by voice", tone: "var(--solar)" },
                  { k: "Sessions this week", v: "84", s: "×6-week average +5", tone: "var(--navy-300)" },
                  { k: "On-site attendance", v: "94%", s: "Best week this term", tone: "#34E2E4" },
                ].map(t => (
                  <div key={t.k} className="rounded-2xl bg-white/7 border border-white/10 px-4 py-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-[.1em] text-white/50">{t.k}</div>
                    <div className="display mt-1.5 text-[23px] tnum" style={{ color: t.tone }}>{t.v}</div>
                    <div className="mt-1 text-[11.5px] text-white/55">{t.s}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="glass-dark p-5">
                <div className="eyebrow text-white/40">Read rate</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="display text-[46px] leading-none tnum text-white">{readRate}%</span>
                  <span className="mb-1.5 text-[12px] font-semibold" style={{ color: "#34E2E4" }}>▲ 6 pts vs Jun</span>
                </div>
                <div className="mt-3"><AreaLine data={trend} h={70} w={260} tone="var(--solar)" fill="rgba(254,222,39,.28)" dark dots={false} /></div>
              </div>
              <div className="glass-dark p-5">
                <div className="eyebrow text-white/40">Who still needs reaching</div>
                <div className="mt-3 space-y-2.5">
                  {REACH_BY_GROUP.map(g => (
                    <div key={g.group}>
                      <div className="flex justify-between text-[11.5px] font-semibold text-white/70"><span>{g.group}</span><span className="tnum">{g.engaged}/{g.families}</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.pct >= 95 ? "var(--solar)" : "var(--navy-300)" }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------- needs you */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Reveal>
          <Card className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-navy-100 px-5 py-4">
              <div>
                <h3 className="display text-[18px]">Needs a person</h3>
                <p className="mt-0.5 text-[12px] text-ink/50">Things the Hub can surface but cannot decide.</p>
              </div>
              <Chip tone="amber">{queue.length} open</Chip>
            </div>
            <div className="divide-y divide-navy-100">
              {queue.map(q => (
                <div key={q.id} className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-paper/60">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: TONE[q.tone].dot + "16", color: TONE[q.tone].dot }}>
                    <q.icon size={16} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-ink">{q.head}</div>
                    <div className="mt-0.5 text-[12px] leading-snug text-ink/55">{q.body}</div>
                  </div>
                  <button onClick={() => { go(q.go); toast(q.action + " opened", "navy"); }}
                    className="shrink-0 rounded-xl border border-navy-100 px-3 py-2 text-[11.5px] font-bold text-navy-700 transition-colors hover:bg-navy-50">
                    {q.action}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={70}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat n={`${outstanding.length}`} label="Required forms outstanding" note="Blocks the sliding-scale rate" tone={TONE.amber.dot} icon={I.FileSignature} />
            <Stat n={`$${(collected + due.length * 9).toFixed(0)}`} label="Collected this month" note={`$${(due.reduce((a, b) => a + b.billed, 0) + overdue.reduce((a, b) => a + b.billed, 0)).toFixed(2)} still outstanding`} tone={TONE.green.dot} icon={I.Wallet} />
            <Stat n={`${openShifts}`} label="Volunteer slots open" note={`${shifts.length} shifts on the board`} tone={TONE.violet.dot} icon={I.HeartHandshake} />
            <Stat n={`${TUTORS.length}`} label="Peer tutors active" note={`${TUTORS.filter(t => t.paid).length} paid via Youth Employment`} tone={TONE.teal.dot} icon={I.GraduationCap} />
          </div>
        </Reveal>
      </div>

      {/* ---------------------------------------------------- bento of live */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="display text-[18px]">Engagement vs attendance</h3>
                <p className="mt-0.5 text-[12px] text-ink/50">Read rate against on-site attendance — the two lines the program lives on.</p>
              </div>
              <Segmented value={range} onChange={setRange} />
            </div>
            <div className="mt-5">
              <AreaLine
                data={range === "wk" ? trend.slice(4) : range === "mo" ? trend : trend.map(v => Math.min(97, v + 3))}
                h={170} tone="var(--navy)" fill="rgb(var(--c-navy-700) / .16)"
                labels={(range === "wk" ? ENGAGEMENT_TREND.slice(4) : ENGAGEMENT_TREND).map(e => e.m)} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { k: "Posts sent", v: Math.round(96 * scale), tone: "var(--navy)" },
                { k: "Families reading", v: Math.round(197 * scale), tone: "#0E8C8C" },
                { k: "Replies from families", v: Math.round(61 * scale), tone: "#6C4BD6" },
              ].map(s => (
                <div key={s.k} className="rounded-2xl bg-paper/70 border border-navy-100 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-[.1em] text-ink/45">{s.k}</div>
                  <div className="display mt-1 text-[24px] tnum" style={{ color: s.tone }}>{s.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={60}>
          <Card className="h-full">
            <h3 className="display text-[18px]">Week load</h3>
            <p className="mt-0.5 text-[12px] text-ink/50">Rooms A–C · 4:00–6:45 PM weeknights, Saturday 10:00 AM–2:15 PM</p>
            <div className="mt-6 space-y-3.5">
              {WEEKLOAD.map(w => {
                const full = w.used >= w.slots;
                return (
                  <div key={w.day}>
                    <div className="flex items-center justify-between text-[12px] font-bold">
                      <span className="text-ink/70">{w.day}</span>
                      <span className="tnum" style={{ color: full ? TONE.amber.dot : "rgba(10,18,32,.45)" }}>{w.used}/{w.slots}{full && " · full"}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-navy-50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(w.used / w.slots) * 100}%`, background: full ? TONE.amber.dot : "var(--navy)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" className="mt-6 w-full justify-center" icon={I.CalendarPlus} onClick={() => go("ops-calendar")}>Open the calendar</Button>
          </Card>
        </Reveal>
      </div>

      {/* ------------------------------------------- next sessions + learners */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <Reveal>
          <Card className="!p-0 overflow-hidden h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
              <h3 className="display text-[18px]">Coming up</h3>
              <button onClick={() => go("ops-sessions")} className="text-[12px] font-bold text-navy-600 hover:underline">Session ledger →</button>
            </div>
            <div className="divide-y divide-navy-100">
              {midweek.map(s => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-[74px] shrink-0">
                    <div className="text-[12.5px] font-bold text-ink">{s.when}</div>
                    <div className="text-[10.5px] text-ink/45">{s.time.split(" - ")[0]}</div>
                  </div>
                  <Avatar initials={s.student.split(" ").map(w => w[0]).join("")} tone={STUDENTS.find(x => x.name === s.student)?.tone || "navy"} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-ink">{s.student}</div>
                    <div className="truncate text-[11.5px] text-ink/50">{s.subject} · {s.room} · {s.tutor}</div>
                  </div>
                  <Chip tone={s.status === "missed" ? "red" : s.status === "completed" ? "green" : "navy"}>{s.status}</Chip>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={60}>
          <Card className="h-full">
            <h3 className="display text-[18px]">Learners to watch</h3>
            <p className="mt-0.5 text-[12px] text-ink/50">Attendance or confidence below the healthy band.</p>
            <div className="mt-5 space-y-3">
              {atrisk.map(s => (
                <button key={s.id} onClick={() => setOpenStudent(s)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-navy-100 p-3 text-left transition-all hover:border-transparent hover:bg-paper/70 hover:shadow-lift">
                  <Avatar initials={s.initials} tone={s.tone} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-ink">{s.name}</div>
                    <div className="truncate text-[11px] text-ink/50">Grade {s.grade} · {s.school}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-ink/35">Attend</div>
                      <div className="text-[13px] font-bold tnum" style={{ color: s.attendance < 80 ? TONE.red.dot : TONE.amber.dot }}>{s.attendance}%</div>
                    </div>
                    <Ring value={s.confidence} size={40} stroke={4} tone={s.confidence < 70 ? TONE.amber.dot : TONE.green.dot}>
                      <span className="text-[9.5px] font-bold tnum">{s.confidence}</span>
                    </Ring>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      {/* -------------------------------------------- programs + activity log */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between">
              <h3 className="display text-[18px]">Program health</h3>
              <button onClick={() => go("ops-programs")} className="text-[12px] font-bold text-navy-600 hover:underline">All programs →</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PROGRAMS.slice(0, 6).map(p => {
                const s = PROGRAM_STAT[p.id];
                return (
                  <div key={p.id} className="rounded-2xl border border-navy-100 bg-paper/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold leading-snug text-navy-700">{p.name}</span>
                      <Spark data={s.spark} tone={s.tone} w={46} h={20} />
                    </div>
                    <div className="display mt-3 text-[22px] tnum text-ink">{s.big}</div>
                    <div className="mt-0.5 text-[11px] text-ink/45">{s.unit}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr] items-center border-t border-navy-100 pt-6">
              <Donut size={132} thickness={18} slices={[
                { label: "Peer Tutoring", pct: 58, tone: "var(--navy)" },
                { label: "Enrichment", pct: 17, tone: "var(--solar)" },
                { label: "Mentoring", pct: 14, tone: "#0E8C8C" },
                { label: "Summer Scholars", pct: 11, tone: "#6C4BD6" },
              ]} center={<div><div className="display text-[20px] tnum">250+</div><div className="text-[9.5px] font-bold uppercase tracking-wide text-ink/40">learners</div></div>} />
              <div className="space-y-3">
                {[["Peer Tutoring", 58, "var(--navy)"], ["Enrichment", 17, "var(--solar)"], ["Mentoring", 14, "#0E8C8C"], ["Summer Scholars", 11, "#6C4BD6"]].map(([l, p, c]: any) => (
                  <div key={l} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: c }} />
                    <span className="flex-1 text-[12.5px] font-semibold text-ink/70">{l}</span>
                    <span className="text-[12.5px] font-bold tnum text-ink">{p}%</span>
                  </div>
                ))}
                <p className="pt-1 text-[11px] leading-snug text-ink/40">Share of enrolled learners touching each program this term. Enrichment seats reset monthly.</p>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={60}>
          <Card className="h-full !p-0 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="display text-[18px]">Activity</h3>
              <p className="mt-0.5 text-[12px] text-ink/50">Every send, signature and payment is recorded.</p>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[520px]">
              {[...(dispatched.length ? dispatched.map(d => ({ at: d.at, who: me.name, what: `${d.name} dispatched to ${d.reach} recipients`, tone: d.urgent ? "red" : "navy" })) : []), ...AUDIT].map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-navy-100 last:border-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE[a.tone]?.dot || "var(--navy)" }} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold leading-snug text-ink/80">{a.what}</div>
                    <div className="mt-0.5 text-[10.5px] text-ink/40">{a.who} · {a.at}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      {/* -------------------------------------------------------- drawer */}
      <Drawer open={!!openStudent} onClose={() => setOpenStudent(null)}
        title={openStudent?.name || ""} sub={openStudent ? `Grade ${openStudent.grade} · ${openStudent.school}` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenStudent(null)}>Close</Button>
            <Button variant="primary" icon={I.MessageSquare} onClick={() => { toast(`Message started with ${openStudent?.guardian}`, "navy"); setOpenStudent(null); }}>Message {openStudent?.guardian}</Button>
          </>
        }>
        {openStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar initials={openStudent.initials} tone={openStudent.tone} size={56} />
              <div className="flex gap-5">
                <Ring value={openStudent.attendance} size={62} stroke={6} tone={openStudent.attendance < 80 ? TONE.red.dot : "var(--navy)"}>
                  <div className="text-center"><div className="text-[13px] font-bold tnum">{openStudent.attendance}%</div><div className="text-[8px] font-bold uppercase text-ink/40">attend</div></div>
                </Ring>
                <Ring value={openStudent.confidence} size={62} stroke={6} tone={TONE.green.dot}>
                  <div className="text-center"><div className="text-[13px] font-bold tnum">{openStudent.confidence}</div><div className="text-[8px] font-bold uppercase text-ink/40">confid.</div></div>
                </Ring>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Tutor", openStudent.tutor], ["Guardian", openStudent.guardian], ["Fee band", openStudent.subsidy], ["Last session", openStudent.lastSession]].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-paper/70 border border-navy-100 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-[.1em] text-ink/45">{k}</div>
                  <div className="mt-1 text-[13px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="eyebrow text-navy-500 mb-2.5">Subjects</div>
              <div className="flex flex-wrap gap-2">{openStudent.subjects.map(s => <Chip key={s} tone="navy">{s}</Chip>)}</div>
            </div>
            <div>
              <div className="eyebrow text-navy-500 mb-2.5">Suggested next step</div>
              <div className="rounded-2xl border border-navy-100 bg-paper/60 p-4 text-[12.5px] leading-relaxed text-ink/70">
                {openStudent.attendance < 80
                  ? `Two or more missed sessions. Send the attendance follow-up and offer to rebuild the schedule — the sliding-scale rate stays the same.`
                  : `Confidence is behind attendance. Ask ${openStudent.tutor} to set one short, winnable goal this week and log a note.`}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

function Segmented({ value, onChange }: { value: "wk" | "mo" | "term"; onChange: (v: "wk" | "mo" | "term") => void }) {
  return (
    <div className="inline-flex rounded-[13px] bg-navy-50 p-1">
      {([["wk", "This week"], ["mo", "This term"], ["term", "Year"]] as const).map(([id, l]) => (
        <button key={id} onClick={() => onChange(id)}
          className={cx("rounded-[10px] px-3.5 py-1.5 text-[12px] font-bold transition-all", value === id ? "bg-white text-navy-700 shadow-sm" : "text-ink/45 hover:text-ink/75")}>{l}</button>
      ))}
    </div>
  );
}

const PROGRAM_STAT: Record<string, { big: string; unit: string; tone: string; spark: number[] }> = {
  peer:   { big: "146",  unit: "learners in tutoring",      tone: "var(--navy)", spark: [12, 15, 14, 18, 21, 24, 26] },
  bffs:   { big: "7",    unit: "ECS scholars supported",    tone: "#0E8C8C", spark: [4, 5, 5, 6, 6, 7, 7] },
  youth:  { big: "6",    unit: "paid peer tutors",          tone: "var(--solar-600)", spark: [3, 4, 4, 5, 5, 6, 6] },
  msssp:  { big: "38",   unit: "rising 6th graders bridged",tone: "#6C4BD6", spark: [22, 26, 29, 31, 34, 36, 38] },
  mentor: { big: "52",   unit: "mentor pairings",           tone: "#C2418F", spark: [30, 34, 38, 42, 46, 49, 52] },
  enrich: { big: "5",    unit: "workshops this month",      tone: "#DE8C00", spark: [2, 3, 3, 4, 4, 5, 5] },
};
