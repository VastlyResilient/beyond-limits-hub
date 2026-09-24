import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, SectionTitle, Drawer, SearchBox, Select, useToast, Reveal } from "../../components/ui";
import { Spark } from "../../components/charts";
import { STUDENTS, TUTORS, FORMS } from "../../lib/data";
import { InfoButton } from "../../components/InfoButton";

type RoleTab = "all" | "student" | "guardian" | "tutor";

interface Tile {
  id: string; name: string; initials: string; tone: string; kind: Exclude<RoleTab, "all">;
  grade?: string; school?: string; extra: string; spark?: number[];
}

const guardianTiles: Tile[] = STUDENTS.map(s => ({
  id: `g-${s.id}`, name: s.guardian, initials: s.guardian.split(" ").map(w => w[0]).join(""),
  tone: "violet", kind: "guardian", school: s.school,
  extra: `Guardian of ${s.name}`, spark: undefined,
}));

const studentTiles: Tile[] = STUDENTS.map(s => ({
  id: s.id, name: s.name, initials: s.initials, tone: s.tone, kind: "student",
  grade: s.grade, school: s.school, extra: `Tutor: ${s.tutor}`,
  spark: [s.attendance - 6, s.attendance - 2, s.attendance - 8, s.attendance - 1, s.attendance - 4, s.attendance].map(v => Math.max(40, v)),
}));

const tutorTiles: Tile[] = TUTORS.map(t => ({
  id: t.id, name: t.name, initials: t.initials, tone: t.tone, kind: "tutor",
  grade: t.grade, school: t.school, extra: t.subjects.join(" · "),
  spark: [t.sessions - 8, t.sessions - 5, t.sessions - 9, t.sessions - 3, t.sessions - 6, t.sessions].map(v => Math.max(1, v)),
}));

export default function OpsDirectory() {
  const toast = useToast();
  const [role, setRole] = useState<RoleTab>("all");
  const [grade, setGrade] = useState("all");
  const [subsidy, setSubsidy] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const all = useMemo(() => [...studentTiles, ...tutorTiles, ...guardianTiles], []);
  const grades = useMemo(() => Array.from(new Set(all.map(t => t.grade).filter((g): g is string => !!g))).sort(), [all]);

  const shown = useMemo(() => all.filter(t => {
    if (role !== "all" && t.kind !== role) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (subsidy !== "all") {
      const st = STUDENTS.find(s => s.id === t.id || s.guardian === t.name);
      if (!st || st.subsidy !== subsidy) return false;
    }
    if (q) {
      const hay = `${t.name} ${t.school || ""} ${t.extra}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [all, role, grade, subsidy, q]);

  const current = useMemo(() => all.find(t => t.id === openId) || null, [all, openId]);
  const currentStudent = current ? STUDENTS.find(s => s.id === current.id || s.guardian === current.name) : undefined;
  const currentTutor = current ? TUTORS.find(t => t.id === current.id) : undefined;
  const subsidyBands = useMemo(() => Array.from(new Set(STUDENTS.map(s => s.subsidy))), []);

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Families" title="Directory"
        sub="Students, guardians and tutors in one directory. Pairings, subsidy bands and contact paths — staff view only." />

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
        {/* filter rail */}
        <aside className="lg:sticky lg:top-20 space-y-4">
          <Card className="space-y-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search people…" />
            <div>
              <div className="eyebrow text-navy-500 mb-2">Role</div>
              <div className="grid grid-cols-2 gap-1.5">
                {([["all", "Everyone", I.Users], ["student", "Students", I.GraduationCap], ["guardian", "Guardians", I.Home], ["tutor", "Tutors", I.BookOpen]] as [RoleTab, string, any][]).map(([id, label, Icon]) => (
                  <button key={id} onClick={() => setRole(id)}
                    className={cx("flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[12px] font-semibold transition-colors",
                      role === id ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-700 hover:bg-navy-100")}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="eyebrow text-navy-500 mb-2">Grade</div>
              <Select value={grade} onChange={setGrade} className="w-full"
                options={[{ value: "all", label: "All grades" }, ...grades.map(g => ({ value: g, label: `Grade ${g}` }))]} />
            </div>
            <div>
              <div className="eyebrow text-navy-500 mb-2">Subsidy band</div>
              <Select value={subsidy} onChange={setSubsidy} className="w-full"
                options={[{ value: "all", label: "All bands" }, ...subsidyBands.map(b => ({ value: b, label: b }))]} />
            </div>
            {(role !== "all" || grade !== "all" || subsidy !== "all" || q) && (
              <Button size="sm" variant="quiet" icon={I.RotateCcw} className="w-full justify-center"
                onClick={() => { setRole("all"); setGrade("all"); setSubsidy("all"); setQ(""); }}>Reset filters</Button>
            )}
          </Card>
          <div className="flex items-start gap-2.5 rounded-2xl border border-navy-100 bg-white px-4 py-3.5">
            <I.Lock size={15} className="text-navy-500 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-ink/55 leading-relaxed">
              <strong className="text-ink/75">Privacy:</strong> contact details are never shared between families. This directory is visible to program staff only.
            </p>
          </div>
        </aside>

        {/* mosaic */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[12.5px] font-semibold text-ink/55">{shown.length} of {all.length} people</div>
          </div>
          {shown.length === 0 ? (
            <Card className="grid place-items-center py-16 text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-500 mb-4"><I.UserX size={24} strokeWidth={1.8} /></span>
                <div className="display text-[18px]">No matches</div>
                <p className="mt-1.5 text-[13px] text-ink/55">Try widening the filters on the left.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {shown.map((t, i) => (
                <Reveal key={t.id} delay={Math.min(i * 35, 300)}>
                  <button onClick={() => setOpenId(t.id)} aria-label={`Open profile of ${t.name}`}
                    className="group w-full text-left card p-4 hover:shadow-deep hover:-translate-y-1 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <Avatar initials={t.initials} tone={t.tone} size={58} />
                      <div className="mt-3 display text-[15px] text-ink leading-tight">{t.name}</div>
                      <div className="mt-1 text-[11px] font-semibold text-ink/50 leading-snug">
                        {t.kind === "student" && `Grade ${t.grade} · ${t.school}`}
                        {t.kind === "tutor" && `${t.grade === "College" ? "College" : `Grade ${t.grade}`} · ${t.school}`}
                        {t.kind === "guardian" && t.extra}
                      </div>
                      <Chip tone={t.kind === "student" ? "navy" : t.kind === "tutor" ? "teal" : "violet"} className="mt-2.5">
                        {t.kind === "student" ? "Student" : t.kind === "tutor" ? "Tutor" : "Guardian"}
                      </Chip>
                      {t.spark && (
                        <div className="mt-3 w-full">
                          <Spark data={t.spark} tone={t.kind === "tutor" ? "#0E8C8C" : "var(--navy)"} h={26} fill />
                          <div className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-ink/35">
                            {t.kind === "tutor" ? "Sessions trend" : "Attendance trend"}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* profile drawer */}
      <Drawer open={!!current} onClose={() => setOpenId(null)} title={current?.name || ""}
        sub={current ? (current.kind === "guardian" ? current.extra : `${current.kind === "tutor" ? "Peer tutor" : `Grade ${current.grade}`} · ${current.school || ""}`) : undefined}>
        {current && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={current.initials} tone={current.tone} size={56} />
              <div className="flex flex-wrap gap-1.5">
                <Chip tone="navy">{current.kind === "student" ? "Student" : current.kind === "tutor" ? "Tutor" : "Guardian"}</Chip>
                {currentStudent && <Chip tone="green">{currentStudent.subsidy}</Chip>}
                {currentTutor && <Chip tone={currentTutor.paid ? "solar" : "teal"}>{currentTutor.paid ? "Paid tutor" : "Volunteer tutor"}</Chip>}
              </div>
            </div>

            {currentStudent && (
              <>
                <Card flat className="p-4">
                  <div className="eyebrow text-navy-500 mb-2.5">Learning</div>
                  <div className="flex flex-wrap gap-1.5">{currentStudent.subjects.map(s => <Chip key={s} tone="teal">{s}</Chip>)}</div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    {[["Attendance", `${currentStudent.attendance}%`], ["Confidence", `${currentStudent.confidence}%`], ["Last session", currentStudent.lastSession]].map(([l, v]) => (
                      <div key={l} className="rounded-xl bg-navy-50 py-2.5">
                        <div className="display text-[16px] tnum">{v}</div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-ink/40">{l}{l === "Rating" && <InfoButton id="F-03" />}{l === "Confidence" && <InfoButton id="F-02" />}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card flat className="p-4">
                  <div className="eyebrow text-navy-500 mb-2.5">Pairing</div>
                  <div className="flex items-center gap-2.5 text-[13px] font-semibold">
                    <I.Link2 size={14} className="text-navy-500" /> Tutor: {currentStudent.tutor} · Guardian: {currentStudent.guardian}
                  </div>
                </Card>
                <Card flat className="p-4">
                  <div className="eyebrow text-navy-500 mb-2.5">Forms status</div>
                  <div className="space-y-2">
                    {FORMS.slice(0, 3).map(f => (
                      <div key={f.id} className="flex items-center justify-between text-[12.5px]">
                        <span className="font-semibold text-ink/75 truncate pr-3">{f.name}</span>
                        <Chip tone={f.status === "signed" ? "green" : f.status === "outstanding" ? "red" : "amber"}>{f.status}</Chip>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
            {currentTutor && (
              <Card flat className="p-4">
                <div className="eyebrow text-navy-500 mb-2.5">Tutoring record</div>
                <div className="flex flex-wrap gap-1.5">{currentTutor.subjects.map(s => <Chip key={s} tone="teal">{s}</Chip>)}</div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  {[["Sessions", String(currentTutor.sessions)], ["Rating", currentTutor.rating.toFixed(1)], ["Joined", currentTutor.joined]].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-navy-50 py-2.5">
                      <div className="display text-[16px] tnum">{v}</div>
                      <div className="mt-0.5 inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-ink/40">{l}{l === "Rating" && <InfoButton id="F-03" />}{l === "Confidence" && <InfoButton id="F-02" />}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex flex-wrap gap-2.5">
              <Button size="sm" icon={I.MessageSquare} onClick={() => toast(`Secure staff message drafted to ${current.name}`, "navy")}>Message</Button>
              <Button size="sm" variant="ghost" icon={I.CalendarPlus} onClick={() => toast(`Scheduling view opened for ${current.name}`, "navy")}>Schedule</Button>
              {current.kind !== "tutor" && <Button size="sm" variant="ghost" icon={I.HandCoins} onClick={() => toast("Sliding-scale review queued — staff only", "navy")}>Subsidy review</Button>}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
