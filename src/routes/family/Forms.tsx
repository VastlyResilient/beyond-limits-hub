import React, { useRef, useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, Ring, Modal, useToast, Reveal } from "../../components/ui";

type FormRow = { id: string; name: string; status: string; who: string; due: string; pages: number; required: boolean; note: string };

function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const [path, setPath] = useState("");
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const ref = useRef<SVGSVGElement>(null);

  const pt = (e: React.PointerEvent): [number, number] => {
    const r = ref.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 400, ((e.clientY - r.top) / r.height) * 120];
  };
  const down = (e: React.PointerEvent) => {
    drawing.current = true; const [x, y] = pt(e); last.current = [x, y];
    setPath(p => p + `M${x.toFixed(1)},${y.toFixed(1)} `);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const [x, y] = pt(e);
    setPath(p => p + `L${x.toFixed(1)},${y.toFixed(1)} `);
    last.current = [x, y]; onChange(true);
  };
  const up = () => { drawing.current = false; };

  return (
    <div>
      <div className="rounded-xl border-2 border-dashed border-navy-200 bg-paper overflow-hidden">
        <svg ref={ref} viewBox="0 0 400 120" className="w-full h-[120px] touch-none"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
          role="img" aria-label="Signature pad — draw your signature">
          <path d={path} fill="none" stroke="var(--navy)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {!path && <text x="200" y="64" textAnchor="middle" fontSize="13" fill="rgba(10,18,32,.35)" fontWeight="600">Sign here with your finger or mouse</text>}
        </svg>
      </div>
      {path && <button onClick={() => { setPath(""); onChange(false); }} className="mt-2 text-[11.5px] font-semibold text-ink/50 hover:text-ink inline-flex items-center gap-1"><I.Eraser size={12} /> Clear signature</button>}
    </div>
  );
}

export default function FamilyForms() {
  const { forms, setForms } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState<FormRow | null>(null);
  const [signed, setSigned] = useState(false);

  const needs = forms.filter(f => f.status !== "signed");
  const done = forms.filter(f => f.status === "signed");
  const pct = Math.round((done.length / forms.length) * 100);

  const submit = () => {
    if (!open) return;
    setForms(forms.map(f => f.id === open.id ? { ...f, status: "signed", due: "Signed today" } : f));
    setOpen(null); setSigned(false);
    toast(`${open.name} signed — thank you`, "green");
  };

  const Row = ({ f }: { f: FormRow }) => (
    <div className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-4 flex-wrap">
      <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
        f.status === "signed" ? "bg-emerald-50 text-signal-green" : f.status === "review" ? "bg-amber-50 text-signal-amber" : "bg-violet-50 text-signal-violet")}>
        {f.status === "signed" ? <I.CheckCircle2 size={18} /> : <I.FileSignature size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-bold text-ink">{f.name}</span>
          {f.required && f.status !== "signed" && <Chip tone="red">Required</Chip>}
          {f.status === "review" && <Chip tone="amber">In review</Chip>}
        </div>
        <div className="mt-0.5 text-[11.5px] text-ink/50">{f.note} · {f.pages} page{f.pages > 1 ? "s" : ""} · {f.due}</div>
      </div>
      {f.status === "outstanding"
        ? <Button size="sm" variant="primary" icon={I.PenLine} onClick={() => { setOpen(f); setSigned(false); }}>Sign</Button>
        : f.status === "review"
          ? <Button size="sm" variant="quiet" icon={I.Clock} onClick={() => toast("We're reviewing this one — nothing to do", "navy")}>Pending</Button>
          : <Button size="sm" variant="ghost" icon={I.Eye} onClick={() => setOpen(f)}>View</Button>}
    </div>
  );

  return (
    <div>
      <PageHead eyebrow="Family · Forms" tone="#6C4BD6"
        title="Paperwork, minus the paperwork"
        sub="Everything Amara needs signed, in one list. Most take under two minutes."
        actions={<Chip tone="violet">{needs.length} to go</Chip>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
        <div className="space-y-7">
          <Reveal><section>
            <h2 className="display text-[19px] text-ink mb-3">Needs you</h2>
            <div className="space-y-3">{needs.length ? needs.map(f => <Row key={f.id} f={f} />)
              : <Card flat className="p-6 text-center text-[13px] text-ink/55">All clear — nothing waiting on you.</Card>}</div>
          </section></Reveal>
          <Reveal><section>
            <h2 className="display text-[19px] text-ink mb-3">Done</h2>
            <div className="space-y-3">{done.map(f => <Row key={f.id} f={f} />)}</div>
          </section></Reveal>
        </div>

        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Card className="text-center">
            <Ring value={pct} size={110} stroke={10} tone="#6C4BD6"><span className="display tnum text-[22px]">{pct}%</span></Ring>
            <div className="mt-3 text-[13px] font-bold text-ink">{done.length} of {forms.length} complete</div>
            <div className="text-[11.5px] text-ink/50 mt-1">Almost there — two signatures left.</div>
          </Card>
          <Card flat className="border-violet-200 bg-violet-50/40">
            <div className="flex gap-2.5">
              <I.ShieldCheck size={17} className="text-signal-violet shrink-0 mt-0.5" />
              <p className="text-[12px] leading-relaxed text-ink/70">
                <b className="text-ink">About the income verification:</b> it's what keeps Amara's 90% sliding-scale discount in place — and it funds the same discount for every family here. It's never shared, never judged, and help filling it in is always available.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name || ""}
        sub={open ? `${open.who} · ${open.pages} page${open.pages > 1 ? "s" : ""} · ${open.due}` : ""} width={640}>
        {open && (
          <div className="space-y-5">
            <div className="rounded-xl border border-navy-100 bg-paper p-5 text-[12.5px] leading-relaxed text-ink/70 space-y-3">
              <div className="eyebrow text-navy-500">Form preview</div>
              <p><b className="text-ink">Beyond Limits Academic Program</b> — Stamford Peace Youth Foundation, Inc.</p>
              <p>{open.note}. This document confirms {open.who}'s enrollment details for the current term and is kept on file at the Long Ridge Road center.</p>
              <p>By signing, you confirm the information above is accurate and agree to the terms described in this document. You may request a paper copy or translation at any time.</p>
              <div className="grid grid-cols-2 gap-3 pt-1 text-[12px]">
                <div className="rounded-lg bg-white border border-navy-100 p-2.5"><span className="text-ink/45">Student</span><br /><b>{open.who}</b></div>
                <div className="rounded-lg bg-white border border-navy-100 p-2.5"><span className="text-ink/45">Guardian</span><br /><b>Lena R.</b></div>
              </div>
            </div>
            {open.status !== "signed" && <>
              <div className="eyebrow text-navy-500">Your signature</div>
              <SignaturePad onChange={setSigned} />
            </>}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="quiet" onClick={() => setOpen(null)}>Close</Button>
          {open?.status !== "signed" && (
            <Button variant="primary" icon={I.Check} disabled={!signed} onClick={submit}>Sign & submit</Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
