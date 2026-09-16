import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, SectionTitle, Ring, Tabs, Modal, useToast, Reveal } from "../../components/ui";
import { useApp } from "../../lib/store";

type Filter = "all" | "signed" | "outstanding" | "review";
const STATUS_META: Record<string, { tone: string; label: string }> = {
  signed: { tone: "green", label: "Signed" },
  outstanding: { tone: "red", label: "Outstanding" },
  review: { tone: "amber", label: "In review" },
};

/* realistic page lines per known form */
const PREVIEW: Record<string, { heading: string; lines: string[] }> = {
  f1: { heading: "Beyond Limits Participant Agreement", lines: [
    "1. Enrollment. The participant named below is enrolled in the Beyond Limits Academic Program, a program of Stamford Peace Youth Foundation, Inc.",
    "2. Tuition & sliding scale. Tuition is assessed on a sliding scale. 90% of participants are eligible for discounted services; the discounted rate is confirmed by income verification and never requires a family to pay full price.",
    "3. Sessions. Tutoring sessions are held at the Long Ridge Road center, Monday–Thursday 4:00–6:45 PM and Saturday 10:00 AM–2:15 PM.",
    "4. Attendance. Families agree to notify the Hub before a missed session so the tutor hour can be reassigned.",
    "5. Code of conduct. Participants, tutors and families agree to treat one another with respect in person and in the Hub.",
  ]},
  f3: { heading: "Sliding-Scale Income Verification", lines: [
    "1. Purpose. This form confirms eligibility for the discounted tuition rate. It is required to hold the 90% discount for the current term.",
    "2. Documentation. Attach one of: prior-year tax return, two recent pay stubs, or a benefits letter. Documents are reviewed by program staff only.",
    "3. Confidentiality. Income information is never shared with other families, tutors or partner organizations.",
    "4. Renewal. Verification renews annually; the discounted rate continues while verification is in review.",
  ]},
  f4: { heading: "Field Trip Permission — Sacred Heart Campus Visit", lines: [
    "1. Event. Campus visit to Sacred Heart University, Saturday Nov 22, 9:00 AM – 2:00 PM.",
    "2. Transportation. Provided by the program; chaperones are background-checked volunteers and staff.",
    "3. Emergency contact. The guardian below authorizes program staff to seek emergency care if needed.",
    "4. Cost. Free for enrolled families — meals and transportation are covered.",
  ]},
};
const genericPreview = (name: string) => ({ heading: name, lines: [
  "1. Scope. This document forms part of the family's Beyond Limits enrollment record.",
  "2. Consent. By signing, the guardian confirms they have read and agree to the terms above.",
  "3. Questions. Message the Hub at any time — staff reply within one school day.",
]});

export default function OpsForms() {
  const { forms, setForms } = useApp();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);

  const counts = useMemo(() => ({
    all: forms.length,
    signed: forms.filter(f => f.status === "signed").length,
    outstanding: forms.filter(f => f.status === "outstanding").length,
    review: forms.filter(f => f.status === "review").length,
  }), [forms]);

  const shown = forms.filter(f => filter === "all" || f.status === filter);
  const required = forms.filter(f => f.required);
  const completion = Math.round((required.filter(f => f.status === "signed").length / Math.max(1, required.length)) * 100);
  const chase = forms.filter(f => f.required && f.status === "outstanding");
  const current = forms.find(f => f.id === open) || null;

  const markSigned = (id: string) => {
    setForms(fs => fs.map(f => f.id === id ? { ...f, status: "signed", due: "Signed just now" } : f));
    toast("Form marked as signed", "green");
  };
  const requestSig = (id: string) => {
    setForms(fs => fs.map(f => f.id === id ? { ...f, status: "outstanding", due: "Reminder sent — due Nov 21" } : f));
    toast("Signature request sent (App + Email)", "navy");
  };

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Families" title="Digital Forms"
        sub="Every enrollment document, tracked from sent to signed. Required forms gate nothing until a family has been personally contacted."
        actions={<Button variant="ghost" icon={I.Plus} onClick={() => toast("New form builder opened", "navy")}>New form</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="min-w-0">
          <Tabs<Filter> value={filter} onChange={setFilter} items={[
            { id: "all", label: "All forms", badge: counts.all },
            { id: "signed", label: "Signed", badge: counts.signed },
            { id: "outstanding", label: "Outstanding", badge: counts.outstanding },
            { id: "review", label: "In review", badge: counts.review },
          ]} />

          {/* filing-cabinet grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {shown.map((f, i) => {
              const meta = STATUS_META[f.status] || STATUS_META.review;
              return (
                <Reveal key={f.id} delay={i * 45}>
                  <button onClick={() => setOpen(f.id)} aria-label={`Open ${f.name}`}
                    className="group relative w-full text-left rounded-[18px] bg-paper border border-paper-300 p-5 shadow-lift hover:shadow-deep transition-all hover:-translate-y-1 overflow-hidden">
                    {/* folded corner */}
                    <span className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-l-[30px] border-t-paper-300 border-l-transparent" aria-hidden />
                    <span className="absolute top-0 right-0 w-0 h-0 border-t-[22px] border-l-[22px] border-t-white/70 border-l-transparent" aria-hidden />
                    <div className="flex items-start justify-between gap-3 pr-8">
                      <span className={cx("grid h-10 w-10 place-items-center rounded-xl", f.status === "signed" ? "bg-emerald-50 text-signal-green" : f.status === "outstanding" ? "bg-red-50 text-signal-red" : "bg-amber-50 text-signal-amber")}>
                        {f.status === "signed" ? <I.FileCheck2 size={18} /> : f.status === "outstanding" ? <I.FileWarning size={18} /> : <I.FileClock size={18} />}
                      </span>
                      {f.required && <Chip tone="navy">Required</Chip>}
                    </div>
                    <div className="mt-3.5 display text-[16px] leading-snug text-ink">{f.name}</div>
                    <div className="mt-1 text-[12px] text-ink/55 leading-snug">{f.note}</div>
                    <div className="mt-4 flex items-center justify-between text-[11.5px] font-semibold text-ink/50">
                      <span className="inline-flex items-center gap-1.5"><I.Files size={12} /> {f.pages} page{f.pages > 1 ? "s" : ""}</span>
                      <span>{f.due}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-paper-300 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/55"><I.UserRound size={12} /> {f.who}</span>
                      <Chip tone={meta.tone}>{meta.label}</Chip>
                    </div>
                  </button>
                </Reveal>
              );
            })}
            {shown.length === 0 && (
              <Card className="col-span-full grid place-items-center py-14 text-center">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-500 mb-4"><I.Archive size={24} strokeWidth={1.8} /></span>
                  <div className="display text-[18px]">Nothing in this drawer</div>
                  <p className="mt-1.5 text-[13px] text-ink/55">No forms match this filter right now.</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* right rail */}
        <div className="stack lg:sticky lg:top-20" style={{ ["--gap" as any]: "18px" }}>
          <Card className="flex items-center gap-5">
            <Ring value={completion} size={92} stroke={9} tone="#159A63">
              <div className="text-center"><div className="display text-[19px] tnum">{completion}%</div><div className="text-[9px] font-bold text-ink/45 uppercase tracking-wider">required</div></div>
            </Ring>
            <div>
              <div className="display text-[16px]">Completion rate</div>
              <p className="mt-1 text-[12px] text-ink/55 leading-snug">{required.filter(f => f.status === "signed").length} of {required.length} required forms signed.</p>
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Chase list" title="Outstanding & required" />
            <div className="space-y-3">
              {chase.length === 0 && <p className="text-[13px] text-ink/55">Every required form is signed. Nice work.</p>}
              {chase.map(f => (
                <div key={f.id} className="rounded-2xl border border-red-200 bg-red-50/60 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Avatar initials={f.who.split(" ").map(w => w[0]).join("")} tone="red" size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold leading-snug">{f.name}</div>
                      <div className="text-[11px] text-ink/50 mt-0.5">{f.who} · {f.due}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" icon={I.BellRing} className="mt-2.5 w-full justify-center"
                    onClick={() => { requestSig(f.id); }}>Send reminder</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* form preview modal */}
      <Modal open={!!current} onClose={() => setOpen(null)} title={current?.name || ""}
        sub={current ? `${current.who} · ${current.pages} page${current && current.pages > 1 ? "s" : ""} · ${current.due}` : undefined}
        width={680}
        footer={current && (
          <>
            {current.status !== "signed"
              ? <Button icon={I.PenLine} onClick={() => { markSigned(current.id); setOpen(null); }}>Mark signed</Button>
              : <Chip tone="green"><I.Check size={12} /> Signed on file</Chip>}
            <Button variant="ghost" icon={I.Send} onClick={() => requestSig(current.id)}>Request signature</Button>
          </>
        )}>
        {current && (() => {
          const p = PREVIEW[current.id] || genericPreview(current.name);
          return (
            <div className="rounded-2xl bg-paper border border-paper-300 p-5 sm:p-7 ruled">
              <div className="bg-white rounded-[14px] border border-paper-300 shadow-lift px-6 py-6">
                <div className="eyebrow text-navy-500">Beyond Limits Academic Program</div>
                <h4 className="display text-[19px] text-ink mt-1.5">{p.heading}</h4>
                <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-ink/72">
                  {p.lines.map((l, i) => <p key={i}>{l}</p>)}
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className={cx("rounded-xl border-2 border-dashed px-4 py-4", current.status === "signed" ? "border-signal-green/50 bg-emerald-50/60" : "border-navy-200 bg-navy-50/40")}>
                    <div className="text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">Guardian signature</div>
                    {current.status === "signed"
                      ? <div className="mt-2 display text-[19px] text-navy-700 italic">{current.who}</div>
                      : <div className="mt-3 h-7 border-b border-navy-200" />}
                    <div className="mt-1.5 text-[10.5px] text-ink/40">{current.status === "signed" ? `Signed · ${current.due.replace("Signed ", "")}` : "Awaiting signature"}</div>
                  </div>
                  <div className="rounded-xl border border-navy-100 px-4 py-4">
                    <div className="text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">Participant</div>
                    <div className="mt-2 text-[14px] font-bold">{current.who}</div>
                    <div className="mt-1 text-[11px] text-ink/45">Beyond Limits Academic Program · Stamford, CT</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
