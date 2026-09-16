import React, { useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, Modal, useToast, Reveal } from "../../components/ui";
import { ORG } from "../../lib/data";

const fmt = (n: number) => `$${n.toFixed(2)}`;

export default function FamilyBilling() {
  const { ledger } = useApp();
  const toast = useToast();
  const [pay, setPay] = useState(false);
  const [paid, setPaid] = useState(false);
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });

  const mine = ledger.filter(l => l.family === "Reyes");
  const current = mine[0]; // November invoice
  const credit = current.gross - current.billed;
  const outstanding = !paid && current.status !== "paid" ? current.billed : 0;

  return (
    <div>
      <PageHead eyebrow="Family · Billing" tone="#6C4BD6"
        title="Simple, honest billing"
        sub="One page per month. The discount is the point of the program — not a favor, not a secret." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        {/* ------------------------------------------------ receipt */}
        <Reveal>
          <Card className="overflow-hidden" pad={false}>
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-dashed border-navy-200">
              <div>
                <div className="eyebrow text-navy-500">Invoice · November</div>
                <div className="display text-[24px] text-ink mt-1">{ORG.short} · Peer Tutoring</div>
                <div className="text-[12px] text-ink/50 mt-0.5">Reyes family · Amara R. · {current.date}</div>
              </div>
              <Chip tone={paid || current.status === "paid" ? "green" : "amber"}>
                {paid || current.status === "paid" ? "Paid" : "Due"}
              </Chip>
            </div>

            <div className="px-7 py-5 space-y-3.5 text-[13.5px]">
              <div className="flex justify-between"><span className="text-ink/70">One-on-one peer tutoring · 4 sessions × 75 min</span><span className="tnum font-semibold">{fmt(current.gross)}</span></div>
              <div className="flex justify-between"><span className="text-ink/70">Materials, Chromebook & lounge access</span><span className="tnum font-semibold">Included</span></div>
              <div className="flex justify-between items-center rounded-xl bg-emerald-50 px-4 py-3 -mx-2">
                <span className="inline-flex items-center gap-2 text-signal-green font-semibold"><I.BadgePercent size={15} /> Sliding-scale credit ({current.discount}%)</span>
                <span className="tnum font-bold text-signal-green">−{fmt(credit)}</span>
              </div>
              <div className="hair" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-ink">Amount due</span>
                <span className="display tnum text-[30px] text-navy-700">{paid ? fmt(0) : fmt(current.billed)}</span>
              </div>
              <div className="text-[11.5px] text-ink/45">
                {paid || current.status === "paid"
                  ? `Paid by ${current.method} on ${current.date}. Thank you.`
                  : `Due ${current.date}. Pay here, at the front desk, or talk to us — always.`}
              </div>
            </div>

            <div className="px-7 pb-6 flex gap-3 flex-wrap">
              {paid || current.status === "paid"
                ? <Button variant="ghost" icon={I.Download} onClick={() => toast("Receipt downloaded", "green")}>Download receipt</Button>
                : <Button variant="primary" icon={I.CreditCard} onClick={() => setPay(true)}>Pay now</Button>}
              <Button variant="quiet" icon={I.Mail} onClick={() => toast("Invoice emailed to you", "navy")}>Email me a copy</Button>
            </div>
          </Card>
        </Reveal>

        {/* ------------------------------------------------ side rail */}
        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Card flat className="border-violet-200 bg-violet-50/40">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-signal-violet shadow-sm"><I.Scale size={16} /></span>
              <div className="eyebrow text-signal-violet">How sliding scale works</div>
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink/70">
              Every family pays what fits their income — most pay 10% of the full rate. Grants and donors cover the rest, deliberately. Using the discount is using the program exactly as designed.
            </p>
          </Card>

          <Card>
            <div className="eyebrow text-navy-500 mb-3">Payment history</div>
            <div className="space-y-2.5">
              {mine.map(l => (
                <div key={l.id} className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-3">
                  <div>
                    <div className="text-[12.5px] font-bold text-ink">{l.program}</div>
                    <div className="text-[11px] text-ink/50">{l.date} · {l.method}</div>
                  </div>
                  <div className="text-right">
                    <div className="tnum text-[13px] font-bold text-ink">{fmt(l.billed)}</div>
                    <Chip tone={l.status === "paid" ? "green" : "amber"}>{l.status}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="navy-field on-dark grain border-0">
            <div className="eyebrow text-solar mb-2">Money should never be the reason</div>
            <p className="text-[12.5px] text-white/75 leading-relaxed">
              If this month's fee is hard — even temporarily — tell us. We'll adjust the scale, pause billing, or set a plan. Amara's seat is not at risk.
            </p>
            <Button variant="solar" size="sm" className="mt-4" icon={I.MessagesSquare}
              onClick={() => toast("Opening a private conversation with the program", "navy")}>
              Talk to us about the fee
            </Button>
          </Card>
        </div>
      </div>

      <Modal open={pay} onClose={() => setPay(false)} title="Pay November invoice" sub={`Amount due: ${fmt(current.billed)} · secure checkout`}>
        <div className="space-y-4">
          <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">Card number</span>
            <input className="field mono" placeholder="4242 4242 4242 4242" value={card.num}
              onChange={e => setCard({ ...card, num: e.target.value })} inputMode="numeric" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">Expiry</span>
              <input className="field mono" placeholder="MM / YY" value={card.exp}
                onChange={e => setCard({ ...card, exp: e.target.value })} /></label>
            <label className="block"><span className="eyebrow text-navy-500 block mb-1.5">CVC</span>
              <input className="field mono" placeholder="123" value={card.cvc}
                onChange={e => setCard({ ...card, cvc: e.target.value })} inputMode="numeric" /></label>
          </div>
          <p className="text-[11.5px] text-ink/45 flex items-center gap-1.5"><I.Lock size={12} /> Encrypted. You can also pay at the front desk — whatever's easier.</p>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="quiet" onClick={() => setPay(false)}>Cancel</Button>
          <Button variant="primary" icon={I.Check} disabled={!card.num || !card.exp || !card.cvc}
            onClick={() => { setPay(false); setPaid(true); toast(`Paid ${fmt(current.billed)} — receipt on its way`, "green"); }}>
            Pay {fmt(current.billed)}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
