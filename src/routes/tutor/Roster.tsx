import React, { useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, Ring, Drawer, useToast, Reveal, SearchBox } from "../../components/ui";
import { DeltaBars } from "../../components/charts";
import { STUDENTS, SUBJECT_SKILLS } from "../../lib/data";
import { InfoButton } from "../../components/InfoButton";

export default function TutorRoster() {
  const { me, go } = useApp();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [view, setView] = useState<string | null>(null);

  const own = STUDENTS.filter(s => s.tutor === me.name);
  const list = (own.length >= 2 ? own : STUDENTS).filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) || s.subjects.some(x => x.toLowerCase().includes(q.toLowerCase())));
  const sel = STUDENTS.find(s => s.id === view);

  return (
    <div>
      <PageHead eyebrow="Peer Tutor · My Students" tone="#0E8C8C"
        title="Your roster"
        sub={own.length >= 2 ? `${own.length} students, one job: help them believe they can.` : "Everyone you're working with this term."}
        actions={<SearchBox value={q} onChange={setQ} placeholder="Name or subject…" />} />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s, i) => (
          <Reveal key={s.id} delay={i * 45}>
            <Card className="h-full flex flex-col">
              <div className="flex items-center gap-3.5 mb-4">
                <Avatar initials={s.initials} tone={s.tone} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="display text-[17px] text-ink truncate">{s.name}</div>
                  <div className="text-[11.5px] text-ink/50">Grade {s.grade} · {s.school}</div>
                </div>
                <Ring value={s.attendance} size={46} stroke={5} tone="#0E8C8C">
                  <span className="tnum text-[10px] font-bold">{s.attendance}%</span>
                </Ring>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {s.subjects.map(x => <Chip key={x} tone="teal">{x}</Chip>)}
              </div>
              <div className="text-[11.5px] text-ink/50 mb-4 flex items-center gap-1.5">
                <I.CalendarClock size={12} /> Last session {s.lastSession} · Guardian: {s.guardian}
              </div>
              <div className="mt-auto grid grid-cols-3 gap-2">
                <Button size="sm" variant="ghost" icon={I.TrendingUp} onClick={() => setView(s.id)} aria-label={`View ${s.name} progress`}>View</Button>
                <Button size="sm" variant="ghost" icon={I.MessageSquare}
                  onClick={() => { go("tutor-messages"); toast(`Opening thread with ${s.guardian}`, "navy"); }} aria-label={`Message ${s.guardian}`}>Msg</Button>
                <Button size="sm" variant="primary" icon={I.PenLine}
                  onClick={() => { go("tutor-log"); toast(`New note for ${s.name}`, "navy"); }} aria-label={`Log note for ${s.name}`}>Log</Button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <Drawer open={!!sel} onClose={() => setView(null)} title={sel ? sel.name : ""}
        sub={sel ? `Grade ${sel.grade} · ${sel.school} · ${sel.subjects.join(", ")}` : ""}>
        {sel && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper p-4 text-center">
                <div className="display tnum text-[22px] text-ink">{sel.attendance}%</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink/45 mt-1">Attendance</div>
              </div>
              <div className="rounded-xl bg-paper p-4 text-center">
                <div className="display tnum text-[22px] text-ink">{sel.confidence}%</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink/45">Confidence <InfoButton id="F-02" /></div>
              </div>
            </div>
            <div>
              <div className="eyebrow text-navy-500 mb-3"><span className="inline-flex items-center gap-1.5">Skill growth <InfoButton id="T-02" /></span></div>
              <DeltaBars items={SUBJECT_SKILLS.slice(0, 3).map(x => ({ label: x.subject, before: x.before, now: x.now }))} />
            </div>
            <Button variant="primary" className="w-full" icon={I.PenLine}
              onClick={() => { setView(null); go("tutor-log"); }}>Log a note for {sel.name.split(" ")[0]}</Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
