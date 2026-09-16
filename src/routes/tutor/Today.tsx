import React, { useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, useToast, Reveal } from "../../components/ui";
import { SESSIONS, STUDENTS, TUTORS } from "../../lib/data";

export default function TutorToday() {
  const { me, go } = useApp();
  const toast = useToast();
  const tprof = TUTORS.find(t => t.name === me.name) || TUTORS[0];
  const mine = SESSIONS.filter(s => s.tutor === tprof.name);
  const next = mine[0] || SESSIONS[0];
  const student = STUDENTS.find(s => s.name === next.student) || STUDENTS[0];
  const [logged, setLogged] = useState<Record<string, boolean>>({});
  const [started, setStarted] = useState(false);

  const prep = [
    `Review last focus: ${next.focus}`,
    `Set up board for: ${next.next}`,
    `Homework to check: ${next.homework}`,
    "Grab water & snacks for the room from the lounge",
  ];
  const hoursTotal = Math.round((tprof.sessions * 75) / 60);

  return (
    <div>
      <PageHead eyebrow="Peer Tutor · Today" tone="#0E8C8C"
        title={`Ready when you are, ${me.name.split(" ")[0]}`}
        sub="Your shift at a glance — prep, teach, log, done." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <div className="space-y-6">
          {/* next-up hero */}
          <Reveal>
            <Card className="navy-field relative on-dark grain border-0" pad={false}>
              <div className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <Chip dark><I.Clock size={11} /> Next up · {next.when} · {next.time}</Chip>
                  <Chip dark>{next.room}</Chip>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar initials={student.initials} tone={student.tone} size={56} dark />
                  <div className="min-w-0 flex-1">
                    <div className="display text-[24px] text-white">{next.student}</div>
                    <div className="text-[12.5px] text-white/60">{next.subject} · Grade {student.grade} · {student.school}</div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-white/8 border border-white/10 p-3.5 text-[12.5px] text-white/80">
                  <span className="font-bold text-solar">Focus:</span> {next.next}
                </div>
                <div className="mt-4 flex gap-3 flex-wrap">
                  <Button variant="solar" icon={started ? I.CircleCheck : I.Play}
                    onClick={() => { setStarted(s => !s); toast(started ? "Session paused" : `Session with ${next.student.split(" ")[0]} started — timer running`, "green"); }}>
                    {started ? "Session running" : "Start session"}
                  </Button>
                  <Button variant="dark" icon={I.AlarmClock}
                    onClick={() => toast("Front desk notified — they\\'ll let the family know", "navy")}>
                    I'm running late
                  </Button>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* timeline */}
          <Reveal><Card>
            <div className="eyebrow text-navy-500 mb-1">Today's timeline</div>
            <h3 className="display text-[19px] text-ink mb-4">Your sessions</h3>
            <div className="space-y-4">
              {(mine.length ? mine : [next]).map(s => (
                <div key={s.id} className="rounded-2xl border border-navy-100 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-signal-teal"><I.BookOpen size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-bold text-ink">{s.time} · {s.student} · {s.subject}</div>
                      <div className="text-[11.5px] text-ink/50">{s.room} · {s.status}</div>
                    </div>
                    <Button size="sm" variant={logged[s.id] ? "quiet" : "ghost"}
                      icon={logged[s.id] ? I.CheckCheck : I.PenLine}
                      onClick={() => { setLogged(l => ({ ...l, [s.id]: !l[s.id] })); if (!logged[s.id]) toast("Session marked as logged", "green"); }}>
                      {logged[s.id] ? "Logged" : "Mark logged"}
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {prep.slice(0, 2).map(p => (
                      <PrepItem key={p} text={p} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card></Reveal>
        </div>

        {/* side */}
        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Reveal delay={80}><Card>
            <div className="eyebrow text-navy-500 mb-3">Hours & stipend</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper p-3.5 text-center">
                <div className="display tnum text-[22px] text-ink">{tprof.sessions}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink/45 mt-1">Sessions</div>
              </div>
              <div className="rounded-xl bg-paper p-3.5 text-center">
                <div className="display tnum text-[22px] text-ink">{hoursTotal}h</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink/45 mt-1">This year</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-teal-50 p-3.5">
              <I.BadgeDollarSign size={17} className="text-signal-teal shrink-0" />
              <p className="text-[11.5px] leading-snug text-ink/70">
                You're a <b>paid peer tutor</b> (Youth Employment). Hours log automatically when you start a session — no timesheet needed.
              </p>
            </div>
          </Card></Reveal>
          <Reveal delay={140}><Card>
            <div className="eyebrow text-navy-500 mb-3">Quick links</div>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={I.PenLine} onClick={() => go("tutor-log")}>Log a session note</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={I.Users} onClick={() => go("tutor-roster")}>My students</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={I.MessageSquare} onClick={() => go("tutor-messages")}>Message a guardian</Button>
            </div>
          </Card></Reveal>
        </div>
      </div>
    </div>
  );
}

function PrepItem({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => setDone(d => !d)} aria-pressed={done}
      className={cx("flex items-center gap-2.5 rounded-xl border p-3 text-left text-[12px] font-semibold transition-all",
        done ? "border-emerald-300 bg-emerald-50 text-ink/50 line-through" : "border-navy-100 text-ink/75 hover:border-navy-300")}>
      <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-md", done ? "bg-signal-green text-white" : "bg-navy-50 text-navy-500")}>
        {done ? <I.Check size={12} strokeWidth={3} /> : <I.ListTodo size={12} />}
      </span>
      {text}
    </button>
  );
}
