import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, SectionTitle, Stat, Tabs, Drawer, SearchBox, Select, useToast, Reveal, Empty } from "../../components/ui";
import { useApp } from "../../lib/store";
import { SESSIONS, STUDENTS, TUTORS, TUTOR_NOTES, TONE } from "../../lib/data";

type SessionRow = (typeof SESSIONS)[number];
type SortKey = "when" | "student" | "tutor" | "subject" | "status";
const STATUS_TONE: Record<string, string> = { completed: "green", scheduled: "navy", missed: "red", cancelled: "amber" };

export default function OpsSessions() {
  const { setDispatched, go } = useApp();
  const toast = useToast();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "when", dir: 1 });
  const [sel, setSel] = useState<string | null>(null);
  const [followedUp, setFollowedUp] = useState(false);

  const rows = useMemo(() => {
    let r = SESSIONS.map(s => ({ ...s, status: overrides[s.id] ?? s.status }));
    if (statusFilter !== "all") r = r.filter(s => s.status === statusFilter);
    if (roomFilter !== "all") r = r.filter(s => s.room === roomFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(s => [s.student, s.tutor, s.subject, s.room, s.focus].join(" ").toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * sort.dir);
  }, [overrides, statusFilter, roomFilter, query, sort]);

  const current = rows.find(r => r.id === sel) ?? SESSIONS.find(s => s.id === sel) ?? null;
  const currentStatus = current ? overrides[current.id] ?? current.status : null;

  const counts = useMemo(() => {
    const withOv = SESSIONS.map(s => overrides[s.id] ?? s.status);
    return {
      total: SESSIONS.length,
      completed: withOv.filter(s => s === "completed").length,
      scheduled: withOv.filter(s => s === "scheduled").length,
      missed: withOv.filter(s => s === "missed").length,
      minutes: SESSIONS.reduce((a, s) => a + s.minutes, 0),
    };
  }, [overrides]);

  const toggleSort = (k: SortKey) => setSort(s => s.key === k ? { key: k, dir: s.dir === 1 ? -1 : 1 } : { key: k, dir: 1 });

  const mark = (s: SessionRow, status: string) => {
    setOverrides(o => ({ ...o, [s.id]: status }));
    toast(status === "completed" ? `${s.student}'s session marked attended` : `${s.student} marked no-show — follow-up queued`, status === "completed" ? "green" : "red");
  };

  const sendFollowUp = () => {
    setDispatched(d => [{ id: `f-${Date.now()}`, name: "Attendance follow-up — Haddad family", at: "just now", reach: 1, channels: ["App", "SMS"], urgent: false }, ...d]);
    setFollowedUp(true);
    toast("Attendance follow-up sent to Yusuf H. (App + SMS)", "green");
  };

  const Th = ({ k, children, right }: { k: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th className={right ? "text-right" : ""} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      <button onClick={() => toggleSort(k)} className={cx("inline-flex items-center gap-1 uppercase tracking-[.1em] text-[10.5px] font-bold", sort.key === k ? "text-navy-700" : "text-navy-700/55 hover:text-navy-700")}>
        {children}<I.ArrowUpDown size={11} className={sort.key === k ? "opacity-100" : "opacity-35"} />
      </button>
    </th>
  );

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Attendance" title="Attendance"
        sub="Every tutoring session, its outcome, and the note the tutor left. Click any row for the full record; correct attendance inline."
        actions={<Button variant="ghost" icon={I.Download} onClick={() => toast("Session ledger exported as CSV", "navy")}>Export week</Button>} />

      {/* week summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Reveal><Stat n={`${counts.total}`} label="Sessions this week" note="Across Rooms A-C" tone="var(--navy)" icon={I.ClipboardList} /></Reveal>
        <Reveal delay={60}><Stat n={`${counts.completed}`} label="Completed" note={`${counts.minutes} contact minutes logged`} tone="#159A63" icon={I.CheckCircle2} /></Reveal>
        <Reveal delay={120}><Stat n={`${counts.scheduled}`} label="Still scheduled" note="Thu-Sat this week" tone="#0E8C8C" icon={I.CalendarClock} /></Reveal>
        <Reveal delay={180}><Stat n={`${counts.missed}`} label="Missed" note="Each one gets a follow-up" tone="#D93A2B" icon={I.UserX} /></Reveal>
      </div>

      {/* missed-session follow-up queue */}
      {!followedUp && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal-amber text-white"><I.BellRing size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold text-ink">Tariq H. missed 2 sessions — follow-up suggested</div>
            <div className="text-[12.5px] text-ink/60">Attendance follow-up never threatens the family's sliding-scale rate. It asks what time works better.</div>
          </div>
          <Button size="sm" icon={I.Megaphone} onClick={sendFollowUp}>Send follow-up</Button>
        </div>
      )}

      {/* filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs
          items={[{ id: "all", label: "All", badge: SESSIONS.length },
                  { id: "completed", label: "Completed", badge: counts.completed },
                  { id: "scheduled", label: "Scheduled", badge: counts.scheduled },
                  { id: "missed", label: "Missed", badge: counts.missed }]}
          value={statusFilter} onChange={setStatusFilter} />
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <Select value={roomFilter} onChange={setRoomFilter}
            options={[{ value: "all", label: "All rooms" }, { value: "Room A", label: "Room A" }, { value: "Room B", label: "Room B" }, { value: "Room C", label: "Room C" }]} />
          <SearchBox value={query} onChange={setQuery} placeholder="Student, tutor, subject…" className="w-[220px]" />
        </div>
      </div>

      {/* ledger table */}
      <Card pad={false} className="overflow-hidden">
        {rows.length === 0 ? (
          <Empty icon={I.SearchX} title="No sessions match" body="Loosen the filters or clear the search to see the full week."
            action={<Button variant="ghost" size="sm" onClick={() => { setQuery(""); setStatusFilter("all"); setRoomFilter("all"); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table data-trim="sessions" className="tbl md:min-w-[780px]">
              <thead>
                <tr>
                  <Th k="when">Date · Time</Th>
                  <Th k="student">Student</Th>
                  <Th k="tutor">Tutor</Th>
                  <Th k="subject">Subject</Th>
                  <th>Room</th>
                  <th className="text-right">Duration</th>
                  <Th k="status">Status</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const st = STUDENTS.find(s => s.name === r.student);
                  const tu = TUTORS.find(t => t.name === r.tutor);
                  return (
                    <tr key={r.id} onClick={() => setSel(r.id)} className="cursor-pointer transition-colors hover:bg-navy-50/60" tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") setSel(r.id); }}>
                      <td>
                        <div className="font-bold text-[13px]">{r.when}</div>
                        <div className="text-[11.5px] text-ink/45">{r.time}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={st?.initials ?? r.student.slice(0, 2)} tone={st?.tone ?? "navy"} size={30} />
                          <span className="font-bold text-[13px]">{r.student}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar initials={tu?.initials ?? r.tutor.slice(0, 2)} tone={tu?.tone ?? "navy"} size={24} />
                          <span className="text-[12.5px] text-ink/70">{r.tutor}</span>
                        </div>
                      </td>
                      <td><Chip tone="navy">{r.subject}</Chip></td>
                      <td className="text-[12.5px] text-ink/60">{r.room}</td>
                      <td className="text-right tnum text-[12.5px]">{r.minutes > 0 ? `${r.minutes} min` : "—"}</td>
                      <td><Chip tone={STATUS_TONE[r.status] ?? "navy"} solid={r.status === "missed"}>{r.status}</Chip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* session detail drawer */}
      <Drawer open={!!current} onClose={() => setSel(null)}
        title={current ? `${current.student} · ${current.subject}` : ""}
        sub={current ? `${current.when} · ${current.time} · ${current.room}` : undefined}
        footer={current && (
          <>
            <Button variant="ghost" onClick={() => setSel(null)}>Close</Button>
            <Button variant="danger" icon={I.UserX} disabled={currentStatus === "missed"} onClick={() => mark(current, "missed")}>Mark no-show</Button>
            <Button variant="primary" icon={I.Check} disabled={currentStatus === "completed"} onClick={() => mark(current, "completed")}>Mark attended</Button>
          </>
        )}>
        {current && (
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <Chip tone={STATUS_TONE[currentStatus ?? current.status] ?? "navy"} solid={currentStatus === "missed"}>{currentStatus}</Chip>
              <Chip tone="navy">{current.minutes > 0 ? `${current.minutes} minutes` : "Not yet held"}</Chip>
            </div>

            <div className="rounded-2xl bg-navy-50 p-4">
              <div className="eyebrow text-navy-500">Session focus</div>
              <div className="mt-1.5 text-[14px] font-bold text-ink">{current.focus}</div>
              <div className="mt-2 text-[12.5px] text-ink/60">Next up: {current.next}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-navy-100 p-3.5">
                <div className="text-[10.5px] font-bold uppercase tracking-[.1em] text-ink/40">Homework</div>
                <div className="mt-1 text-[13px] font-semibold text-ink">{current.homework}</div>
              </div>
              <div className="rounded-2xl border border-navy-100 p-3.5">
                <div className="text-[10.5px] font-bold uppercase tracking-[.1em] text-ink/40">Tutor</div>
                <div className="mt-1 text-[13px] font-semibold text-ink">{current.tutor}</div>
              </div>
            </div>

            <div>
              <SectionTitle eyebrow="Tutor notes" title="Recent notes" />
              <div className="space-y-3">
                {TUTOR_NOTES.map((n, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE[n.tone]?.dot ?? "var(--navy)" }} />
                    <div>
                      <div className="text-[11px] font-bold text-ink/45">{n.at} · {n.tutor}</div>
                      <div className="mt-0.5 text-[12.5px] leading-snug text-ink/75">{n.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="ghost" icon={I.TrendingUp} className="w-full justify-center"
              onClick={() => { go("ops-sessions"); toast("Opened progress for this cohort", "navy"); }}>
              Open in Progress &amp; Goals
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
