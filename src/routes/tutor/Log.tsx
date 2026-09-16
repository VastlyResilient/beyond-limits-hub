import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, Select, useToast, Reveal } from "../../components/ui";
import { STUDENTS, TUTOR_NOTES } from "../../lib/data";

const TEMPLATES = [
  { id: "win", name: "A win", focus: "Today {s} worked through {sub} and got a real win — ", next: "Build on it next session with a harder set.", hw: "One short practice set" },
  { id: "steady", name: "Steady session", focus: "Solid, steady work on {sub}. {s} stayed with the problems even when they got slow.", next: "Keep the routine; introduce a timed check.", hw: "Review today's sheet" },
  { id: "rough", name: "Tough day (kind version)", focus: "{s} had a hard start today — low energy. We slowed down, did shorter reps, and ended on a problem they could solve.", next: "Fresh start next session; no catching-up speech.", hw: "None — reset day" },
];

export default function TutorLog() {
  const toast = useToast();
  const [student, setStudent] = useState(STUDENTS[0].name);
  const [subject, setSubject] = useState(STUDENTS[0].subjects[0]);
  const [focus, setFocus] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [hw, setHw] = useState("");
  const [conf, setConf] = useState(3);
  const [notes, setNotes] = useState(TUTOR_NOTES);

  const subjects = useMemo(() => STUDENTS.find(s => s.name === student)?.subjects || [], [student]);
  const applyTemplate = (t: (typeof TEMPLATES)[0]) => {
    setFocus(t.focus.replace("{s}", student.split(" ")[0]).replace("{sub}", subject));
    setNextStep(t.next); setHw(t.hw);
    toast(`"${t.name}" template loaded`, "navy");
  };

  const submit = () => {
    setNotes(n => [{ at: "Today", tone: conf >= 4 ? "green" : conf <= 2 ? "amber" : "navy", tutor: "Marcus D.", note: focus }, ...n]);
    setFocus(""); setNextStep(""); setHw(""); setConf(3);
    toast("Note logged — staff and family can see it", "green");
  };

  return (
    <div>
      <PageHead eyebrow="Peer Tutor · Session Notes" tone="#0E8C8C"
        title="Log it while it's fresh"
        sub="Two minutes now saves the next session. Notes go to staff and, in plain language, to the family." />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <Reveal><Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">Student</span>
              <Select className="w-full" value={student} onChange={v => { setStudent(v); const s = STUDENTS.find(x => x.name === v); if (s) setSubject(s.subjects[0]); }}
                options={STUDENTS.map(s => ({ value: s.name, label: s.name }))} /></label>
            <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">Subject</span>
              <Select className="w-full" value={subject} onChange={setSubject}
                options={subjects.map(s => ({ value: s, label: s }))} /></label>
          </div>

          <div className="mt-5">
            <span className="eyebrow text-navy-500 block mb-2">Start from a template</span>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map(t => <button key={t.id} onClick={() => applyTemplate(t)} className="chip hover:border-teal-300 hover:bg-teal-50 transition-colors"><I.LayoutTemplate size={12} /> {t.name}</button>)}
            </div>
          </div>

          <label className="block mt-5"><span className="eyebrow text-navy-500 block mb-1.5">What you worked on</span>
            <textarea className="field min-h-[96px]" value={focus} onChange={e => setFocus(e.target.value)}
              placeholder="Plain words are best — the family reads this." /></label>
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">Next step</span>
              <input className="field" value={nextStep} onChange={e => setNextStep(e.target.value)} placeholder="Where you'll pick up" /></label>
            <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">Homework</span>
              <input className="field" value={hw} onChange={e => setHw(e.target.value)} placeholder="Keep it small and doable" /></label>
          </div>

          <div className="mt-5">
            <span className="eyebrow text-navy-500 block mb-2">Confidence leaving the session · <span className="tnum">{conf}/5</span></span>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={5} value={conf} onChange={e => setConf(+e.target.value)}
                className="flex-1 accent-[#0E8C8C]" aria-label="Confidence 1 to 5" />
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => <I.Star key={n} size={16} className={n <= conf ? "text-signal-amber fill-amber-300" : "text-ink/20"} />)}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="quiet" onClick={() => { setFocus(""); setNextStep(""); setHw(""); }}>Clear</Button>
            <Button variant="primary" icon={I.Send} disabled={!focus.trim()} onClick={submit}>Submit note</Button>
          </div>
        </Card></Reveal>

        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Reveal delay={70}><Card className="navy-field on-dark grain border-0">
            <div className="eyebrow text-solar mb-3">Live preview</div>
            <div className="rounded-xl bg-white/8 border border-white/10 p-4 text-[12.5px] leading-relaxed text-white/85 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Chip dark>{student}</Chip><Chip dark>{subject}</Chip><Chip dark>Confidence {conf}/5</Chip>
              </div>
              <p>{focus || <span className="text-white/40">Your session summary will appear here as you type…</span>}</p>
              {nextStep && <p><span className="font-bold text-solar">Next:</span> {nextStep}</p>}
              {hw && <p><span className="font-bold text-solar">Homework:</span> {hw}</p>}
            </div>
          </Card></Reveal>

          <Reveal delay={130}><Card>
            <div className="eyebrow text-navy-500 mb-3">Recent notes</div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {notes.slice(0, 6).map((n, i) => (
                <div key={i} className="rounded-xl bg-paper p-3">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink/40">{n.at} · {n.tutor}</div>
                  <p className="mt-1 text-[12px] leading-snug text-ink/70">{n.note}</p>
                </div>
              ))}
            </div>
          </Card></Reveal>
        </div>
      </div>
    </div>
  );
}
