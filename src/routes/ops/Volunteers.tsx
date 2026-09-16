import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, Bar, Modal, useToast, Reveal } from "../../components/ui";
import { useApp } from "../../lib/store";
import { TONE, STUDENTS } from "../../lib/data";

export default function OpsVolunteers() {
  const { shifts, setShifts } = useApp();
  const toast = useToast();
  const [pick, setPick] = useState<string | null>(null); // shift id being filled
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const columns = useMemo(() => {
    const map = new Map<string, typeof shifts>();
    shifts.forEach(s => {
      const day = s.when.split("·")[0].trim();
      map.set(day, [...(map.get(day) || []), s]);
    });
    return [...map.entries()];
  }, [shifts]);

  const totals = useMemo(() => {
    const needed = shifts.reduce((a, s) => a + s.needed, 0);
    const filled = shifts.reduce((a, s) => a + s.filled.length, 0);
    const families = new Set(shifts.flatMap(s => s.filled)).size;
    return { shifts: shifts.length, open: needed - filled, families };
  }, [shifts]);

  const addVolunteer = (shiftId: string, name: string) => {
    setShifts(ss => ss.map(s => s.id === shiftId && !s.filled.includes(name) ? { ...s, filled: [...s.filled, name] } : s));
    setPick(null);
    toast(`${name} added to the shift`, "green");
  };
  const markFull = (shiftId: string) => {
    setShifts(ss => ss.map(s => {
      if (s.id !== shiftId) return s;
      const pool = STUDENTS.map(st => st.guardian).filter(g => !s.filled.includes(g));
      const fill = [...s.filled];
      while (fill.length < s.needed && pool.length) fill.push(pool.shift()!);
      return { ...s, filled: fill };
    }));
    setConfirmed(c => ({ ...c, [shiftId]: true }));
    toast("Shift confirmed full — volunteers notified", "green");
  };
  const removeVolunteer = (shiftId: string, name: string) => {
    setShifts(ss => ss.map(s => s.id === shiftId ? { ...s, filled: s.filled.filter(n => n !== name) } : s));
    toast(`${name} removed from the shift`, "red");
  };

  const pickShift = shifts.find(s => s.id === pick) || null;
  const guardianPool = useMemo(() => {
    if (!pickShift) return [] as string[];
    return STUDENTS.map(s => s.guardian).filter(g => !pickShift.filled.includes(g));
  }, [pickShift]);

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Families" title="Signups"
        sub="Shifts are staffed by parents, guardians and college-corps tutors. Every open slot is a real ask — keep the board green."
        actions={<Button variant="ghost" icon={I.CalendarPlus} onClick={() => toast("New shift drafted", "navy")}>New shift</Button>} />

      {/* top rail */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { n: String(totals.shifts), label: "Upcoming shifts", icon: I.CalendarRange, tone: "var(--navy)" },
          { n: String(totals.open), label: "Open slots to fill", icon: I.UserPlus, tone: totals.open > 0 ? "#DE8C00" : "#159A63" },
          { n: String(totals.families), label: "Families volunteering", icon: I.HeartHandshake, tone: "#0E8C8C" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <div className="card p-5 flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: s.tone + "14", color: s.tone }}><s.icon size={19} strokeWidth={1.9} /></span>
              <div>
                <div className="display text-[26px] tnum leading-none">{s.n}</div>
                <div className="mt-1 text-[12px] font-semibold text-ink/55">{s.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* kanban columns by date */}
      <div className="grid grid-flow-col auto-cols-[300px] gap-5 overflow-x-auto pb-4 scroll-x items-start">
        {columns.map(([day, dayShifts]) => (
          <div key={day} className="rounded-[20px] bg-navy-50/60 border border-navy-100 p-3.5">
            <div className="flex items-center justify-between px-1.5 pb-3">
              <div className="display text-[15px] text-navy-700">{day}</div>
              <Chip tone="navy">{dayShifts.length} shift{dayShifts.length > 1 ? "s" : ""}</Chip>
            </div>
            <div className="space-y-3.5">
              {dayShifts.map(s => {
                const pct = Math.round((s.filled.length / s.needed) * 100);
                const full = s.filled.length >= s.needed;
                const tone = TONE[s.tone] || TONE.navy;
                return (
                  <div key={s.id} className="card-flat p-4 bg-white hover:shadow-lift transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone.bg, tone.fg)}>
                        {full ? <I.CheckCircle2 size={17} /> : <I.Hand size={17} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-bold leading-snug">{s.role}</div>
                        <div className="mt-0.5 text-[11.5px] text-ink/50">{s.when.split("·")[1]?.trim()}</div>
                      </div>
                    </div>
                    <div className="mt-3.5">
                      <Bar value={pct} tone={full ? "#159A63" : tone.dot} h={7} />
                      <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-ink/50">
                        <span>{s.filled.length} of {s.needed} filled</span>
                        {full && <span className="text-signal-green inline-flex items-center gap-1"><I.BadgeCheck size={11} /> Full</span>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex -space-x-2">
                        {s.filled.map(n => (
                          <button key={n} onClick={() => removeVolunteer(s.id, n)} aria-label={`Remove ${n}`}
                            title={`${n} — click to remove`} className="rounded-full ring-2 ring-white hover:opacity-75 transition-opacity">
                            <Avatar initials={n.split(" ").map(w => w[0]).join("")} tone={s.tone} size={26} />
                          </button>
                        ))}
                        {Array.from({ length: Math.max(0, s.needed - s.filled.length) }).map((_, i) => (
                          <span key={i} className="grid h-[26px] w-[26px] place-items-center rounded-full border border-dashed border-navy-200 text-navy-300"><I.Plus size={11} /></span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        {!full && <Button size="sm" variant="ghost" icon={I.UserPlus} onClick={() => setPick(s.id)} aria-label="Add volunteer" />}
                        {!full && <Button size="sm" variant="quiet" icon={I.CheckCheck} onClick={() => markFull(s.id)} aria-label="Mark shift full" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* footer note */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-navy-100 bg-white px-5 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700"><I.MapPin size={16} /></span>
        <p className="text-[12.5px] text-ink/60 leading-relaxed">
          All on-site volunteering happens at the <strong className="text-ink">Long Ridge Road center</strong> in Stamford.
          Volunteers check in at the front desk; campus-visit chaperones meet in the main lobby. Background checks are handled by Stamford Peace Youth Foundation staff before a first shift.
        </p>
      </div>

      {/* add-volunteer modal */}
      <Modal open={!!pickShift} onClose={() => setPick(null)} title="Add a volunteer"
        sub={pickShift ? `${pickShift.role} · ${pickShift.when}` : undefined}>
        {pickShift && (
          guardianPool.length === 0 ? (
            <p className="text-[13px] text-ink/55">Every guardian in the directory is already on this shift.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {guardianPool.map(g => {
                const kid = STUDENTS.find(s => s.guardian === g);
                return (
                  <button key={g} onClick={() => addVolunteer(pickShift.id, g)}
                    className="flex items-center gap-3 rounded-2xl border border-navy-100 p-3 text-left hover:bg-navy-50 hover:border-navy-200 transition-colors">
                    <Avatar initials={g.split(" ").map(w => w[0]).join("")} tone={kid?.tone || "navy"} size={34} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold truncate">{g}</span>
                      <span className="block text-[11px] text-ink/50">Guardian of {kid?.name}</span>
                    </span>
                    <I.Plus size={15} className="ml-auto text-navy-400" />
                  </button>
                );
              })}
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
