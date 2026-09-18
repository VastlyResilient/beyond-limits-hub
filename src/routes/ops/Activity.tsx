import React, { useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { Button, Card, Chip, Reveal, SectionTitle, cx, useToast } from "../../components/ui";
import { useOverrides } from "../../lib/overrides";

/* ============================================================================
   Build activity — every change the Builder has made, with a one-click revert.

   This is the safety net Andy asked for: he can see exactly what changed, when,
   and put any of it back. Nothing the AI does is invisible.
   ========================================================================== */

function when(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Value({ v }: { v: unknown }) {
  if (v === null || v === undefined || v === "") return <span className="italic text-ink/35">nothing</span>;
  const s = String(v);
  return <span className="font-semibold text-ink">{s.length > 90 ? s.slice(0, 90) + "…" : s}</span>;
}

export default function OpsActivity() {
  const toast = useToast();
  const { entries, revert, clearAll } = useOverrides();
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHead eyebrow="Settings" title="Build activity"
        sub="Everything the Builder has changed in your Hub, newest first. Nothing is hidden and anything can be put back."
        actions={
          entries.length > 0
            ? <Button variant="ghost" icon={I.Trash2}
                onClick={() => { clearAll(); toast("Activity cleared", "navy"); }}>
                Clear history</Button>
            : undefined
        } />

      {entries.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-50">
              <I.History size={20} className="text-navy-500" />
            </span>
            <div className="text-[14px] font-bold text-ink">No changes yet</div>
            <p className="max-w-[46ch] text-[12.5px] leading-relaxed text-ink/55">
              When you ask the Builder to change something, it will appear here with the time, what it did,
              and a button to undo it.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e, idx) => (
            <Reveal key={e.id} delay={Math.min(idx * 30, 180)}>
              <Card>
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: "rgba(24,56,104,.08)" }}>
                    <I.Hammer size={17} className="text-navy-700" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[13.5px] font-bold text-ink">{e.description}</span>
                      <Chip tone={e.source === "builder" ? "navy" : "teal"}>
                        {e.source === "builder" ? "Andy's AI" : "You"}
                      </Chip>
                      <span className="text-[11.5px] text-ink/45">{when(e.at)}</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {e.changes.map((c, i) => (
                        <div key={i} className="rounded-xl border border-navy-100 bg-navy-50/40 px-3.5 py-2.5">
                          <div className="text-[10.5px] font-bold uppercase tracking-[.1em] text-ink/40">{c.label}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
                            <Value v={c.from} />
                            <I.ArrowRight size={12} className="text-ink/35" />
                            <Value v={c.to} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {confirming === e.id ? (
                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" icon={I.RotateCcw}
                          onClick={() => { revert(e.id); setConfirming(null); toast("Change reverted", "navy"); }}>
                          Revert</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" icon={I.RotateCcw}
                        onClick={() => setConfirming(e.id)}>Revert</Button>
                    )}
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={60}>
        <Card className="bg-navy-50/60">
          <div className="flex items-start gap-3">
            <I.ShieldCheck size={16} className="mt-0.5 shrink-0 text-navy-500" />
            <div className="text-[12.5px] leading-relaxed text-ink/65">
              <b className="text-ink/80">What the Builder can and cannot touch.</b> It can only change the items listed in
              its registry — sidebar names, the Command Center wording, and the accent colour. It cannot change numbers,
              delete anything, or reach anything outside that list. Every change is recorded here before you ever see it.
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
