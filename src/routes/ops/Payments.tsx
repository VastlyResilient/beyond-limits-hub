import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, SectionTitle, Stat, Tip, useToast, Reveal } from "../../components/ui";
import { Donut } from "../../components/charts";
import { useApp } from "../../lib/store";
import { TONE, REVENUE_MIX } from "../../lib/data";

type SortKey = "family" | "billed" | "discount" | "status";
type Row = (typeof import("../../lib/data").LEDGER)[number];

const fmt = (n: number) => `$${n % 1 ? n.toFixed(2) : n.toLocaleString()}`;
const STATUS_TONE: Record<string, string> = { paid: "green", due: "amber", overdue: "red" };

export default function OpsPayments() {
  const { ledger, setDispatched } = useApp();
  const toast = useToast();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "family", dir: 1 });
  const [sel, setSel] = useState<string | null>(null);
  const [paidNow, setPaidNow] = useState<Record<string, boolean>>({});
  const [reminded, setReminded] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    const r = ledger.map(l => ({ ...l, status: paidNow[l.id] ? "paid" : l.status }));
    const val = (x: Row): string | number => sort.key === "family" ? x.family : sort.key === "status" ? x.status : x[sort.key];
    return [...r].sort((a, b) => {
      const av = val(a), bv = val(b);
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
  }, [ledger, paidNow, sort]);

  const gross = ledger.reduce((a, l) => a + l.gross, 0);
  const discount = ledger.reduce((a, l) => a + l.discount, 0);
  const collected = rows.filter(r => r.status === "paid").reduce((a, l) => a + l.billed, 0);
  const outstanding = rows.filter(r => r.status !== "paid").reduce((a, l) => a + l.billed, 0);
  const overdueRows = rows.filter(r => r.status === "overdue");

  const current = rows.find(r => r.id === sel) || null;
  const toggleSort = (k: SortKey) => setSort(s => s.key === k ? { key: k, dir: s.dir === 1 ? -1 : 1 } : { key: k, dir: 1 });

  const recordPayment = (r: Row) => {
    setPaidNow(p => ({ ...p, [r.id]: true }));
    toast(`Payment of ${fmt(r.billed)} recorded for the ${r.family} family`, "green");
  };
  const sendReminder = (r: Row) => {
    setReminded(p => ({ ...p, [r.id]: true }));
    toast(`Sliding-scale billing reminder sent to the ${r.family} family (App + SMS)`, "navy");
  };
  const nudgeAll = () => {
    overdueRows.forEach(r => setReminded(p => ({ ...p, [r.id]: true })));
    setDispatched(d => [{ id: `n-${Date.now()}`, name: "Attendance & billing nudge", at: "just now", reach: 4, channels: ["App", "SMS"], urgent: false }, ...d]);
    toast(`Nudge dispatched to ${overdueRows.length} famil${overdueRows.length === 1 ? "y" : "ies"} with overdue balances`, "green");
  };

  const Th = ({ k, children, right }: { k: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : undefined} className={right ? "text-right" : ""}>
      <button onClick={() => toggleSort(k)} className={cx("inline-flex items-center gap-1 uppercase tracking-[.1em] text-[10.5px] font-bold", sort.key === k ? "text-navy-700" : "text-navy-700/55 hover:text-navy-700")}>
        {children}
        <I.ArrowUpDown size={11} className={sort.key === k ? "opacity-100" : "opacity-35"} />
      </button>
    </th>
  );

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Families" title="Payments"
        sub="90% of participants are eligible for discounted services. The subsidy below is funded by grants and donors — families are never billed the full rate by default."
        actions={<Button variant="ghost" icon={I.Download} onClick={() => toast("Ledger exported as CSV", "navy")}>Export ledger</Button>} />

      {/* subsidy summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Reveal><Stat n={fmt(gross)} label="Gross program value" note="Before sliding-scale discounts" tone="var(--navy)" icon={I.Receipt} /></Reveal>
        <Reveal delay={60}><Stat n={fmt(discount)} label="Discount given" note="Grant-funded subsidy applied" tone="#159A63" icon={I.HandCoins} /></Reveal>
        <Reveal delay={120}><Stat n={fmt(collected)} label="Collected" note="Family payments received" tone="#0E8C8C" icon={I.BadgeCheck} /></Reveal>
        <Reveal delay={180}><Stat n={fmt(outstanding)} label="Outstanding" note={`${rows.filter(r => r.status !== "paid").length} open invoices`} tone="#D93A2B" icon={I.AlarmClock} /></Reveal>
      </div>

      {overdueRows.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[18px] border border-red-200 bg-red-50 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal-red text-white"><I.Siren size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold text-ink">{overdueRows.length} overdue invoice{overdueRows.length > 1 ? "s" : ""} — {fmt(overdueRows.reduce((a, r) => a + r.billed, 0))} past due</div>
            <div className="text-[12.5px] text-ink/60">Send the attendance &amp; billing nudge. It never threatens a family's sliding-scale rate.</div>
          </div>
          <Button size="sm" icon={I.Megaphone} onClick={nudgeAll}>Send nudge to all</Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
        <div className="stack" style={{ ["--gap" as any]: "20px" }}>
          {/* ledger table */}
          <Card pad={false} className="overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <SectionTitle eyebrow="Ledger" title="November invoices" />
            </div>
            <div className="overflow-x-auto">
              <table data-trim="payments" className="tbl md:min-w-[640px]">
                <thead>
                  <tr>
                    <Th k="family">Family · Student</Th>
                    <th>Program</th>
                    <Th k="discount" right>Subsidy</Th>
                    <Th k="billed" right>Billed</Th>
                    <Th k="status">Status</Th>
                    <th className="text-right">Due / Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const t = TONE[STATUS_TONE[r.status]] || TONE.navy;
                    const on = sel === r.id;
                    return (
                      <tr key={r.id} onClick={() => setSel(on ? null : r.id)}
                        className={cx("cursor-pointer transition-colors", on && "bg-navy-50/70")}
                        aria-selected={on} tabIndex={0}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(on ? null : r.id); } }}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={r.family.slice(0, 2).toUpperCase()} tone={t === TONE.green ? "green" : STATUS_TONE[r.status]} size={30} />
                            <div>
                              <div className="font-bold text-[13px]">{r.family}</div>
                              <div className="text-[11.5px] text-ink/45">{r.student}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-ink/70">{r.program}</td>
                        <td className="text-right"><Chip tone={r.discount === 0 ? "navy" : "green"}>{r.subsidy}</Chip></td>
                        <td className="text-right tnum font-bold">{fmt(r.billed)}</td>
                        <td><Chip tone={STATUS_TONE[r.status]} solid={r.status === "overdue"}>{r.status}</Chip></td>
                        <td className="text-right text-[12.5px] text-ink/55">{r.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* revenue mix */}
          <Card>
            <SectionTitle eyebrow="How the program is funded" title="Revenue mix" sub="Family fees are a minority of the model by design." />
            <div className="flex flex-wrap items-center gap-8">
              <Donut size={190} thickness={26}
                slices={REVENUE_MIX.map(m => ({ label: m.label, pct: m.pct, tone: TONE[m.tone]?.dot || "var(--navy)" }))}
                center={<div className="text-center"><div className="display text-[26px] tnum">62%</div><div className="text-[10.5px] font-semibold text-ink/50">grant-funded</div></div>} />
              <ul className="space-y-2.5 min-w-[220px] flex-1">
                {REVENUE_MIX.map(m => (
                  <li key={m.label} className="flex items-center gap-2.5 text-[13px]">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TONE[m.tone]?.dot }} />
                    <span className="font-semibold text-ink/80 flex-1">{m.label}</span>
                    <span className="tnum font-bold">{m.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* invoice preview */}
        <div className="xl:sticky xl:top-20">
          {current ? (
            <div className="animate-rise">
              <div className="card overflow-hidden">
                <div className="bg-paper-200 border-b border-paper-300 px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="eyebrow text-navy-500">Invoice preview</div>
                    <div className="display text-[19px] text-ink mt-1">{current.family} family</div>
                  </div>
                  <Chip tone={STATUS_TONE[current.status]} solid={current.status === "overdue"}>{current.status}</Chip>
                </div>
                {/* paper sheet */}
                <div className="bg-paper px-6 py-5 ruled">
                  <div className="bg-white rounded-[14px] border border-paper-300 shadow-lift p-5">
                    <div className="flex items-start justify-between pb-4 border-b border-dashed border-navy-100">
                      <div>
                        <div className="display text-[15px] text-navy-700">Beyond Limits Academic Program</div>
                        <div className="text-[11px] text-ink/50 mt-0.5">Stamford Peace Youth Foundation, Inc.<br />Long Ridge Road, Stamford, CT</div>
                      </div>
                      <div className="text-right text-[11px] text-ink/50 mono">INV-{current.id.toUpperCase()}-25<br />{current.date}</div>
                    </div>
                    <div className="py-4 space-y-3 text-[13px]">
                      <div className="flex justify-between"><span className="text-ink/65">{current.program} — {current.student}</span><span className="tnum font-semibold">{fmt(current.gross)}</span></div>
                      <div className="flex justify-between text-signal-green">
                        <span className="inline-flex items-center gap-1.5"><I.BadgePercent size={13} /> Sliding-scale credit ({current.subsidy})</span>
                        <span className="tnum font-semibold">−{fmt(current.discount)}</span>
                      </div>
                      <div className="hair" />
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold">Amount due</span>
                        <span className="display text-[24px] tnum text-navy-700">{fmt(current.billed)}</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-navy-50 px-3.5 py-2.5 text-[11.5px] text-navy-700 leading-snug">
                      This invoice already reflects the family's sliding-scale rate. No action is needed to keep the discount — it renews with income verification.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 px-5 py-4 border-t border-navy-100 bg-white">
                  {current.status !== "paid"
                    ? <Button size="sm" icon={I.Check} onClick={() => recordPayment(current)}>Record payment</Button>
                    : <Chip tone="green"><I.Check size={12} /> Paid · {current.method}</Chip>}
                  <Button size="sm" variant="ghost" icon={I.Send} disabled={!!reminded[current.id]}
                    onClick={() => sendReminder(current)}>{reminded[current.id] ? "Reminder sent" : "Send reminder"}</Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="grid place-items-center py-16 text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-500 mb-4"><I.FileText size={24} strokeWidth={1.8} /></span>
                <div className="display text-[18px]">Select an invoice</div>
                <p className="mt-1.5 text-[13px] text-ink/55 max-w-[240px]">Click any row in the ledger to preview the invoice exactly as the family sees it.</p>
              </div>
            </Card>
          )}
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-navy-100 bg-white px-4 py-3.5">
            <I.ShieldCheck size={16} className="text-signal-teal shrink-0 mt-0.5" />
            <p className="text-[12px] text-ink/60 leading-relaxed">Billing records are visible to program staff only. Families see just their own invoices and subsidy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
