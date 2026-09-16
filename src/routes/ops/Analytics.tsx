import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, SectionTitle, useToast, Reveal } from "../../components/ui";
import { AreaLine, BarSeries, Donut, HBars } from "../../components/charts";
import { useApp } from "../../lib/store";
import { TONE, IMPACT, ENGAGEMENT_TREND, ATTENDANCE_TREND, REACH_BY_GROUP, CHANNEL_FIT, AUDIT, LANGUAGES } from "../../lib/data";

type Range = "3m" | "6m";
const RANGE_LABEL: Record<Range, string> = { "3m": "Last 3 months", "6m": "Last 6 months" };

export default function OpsAnalytics() {
  const { go } = useApp();
  const toast = useToast();
  const [range, setRange] = useState<Range>("6m");

  // honest recomputation: slice the source arrays by the selected range
  const trend = useMemo(() => range === "3m" ? ENGAGEMENT_TREND.slice(-3) : ENGAGEMENT_TREND, [range]);
  const attend = useMemo(() => range === "3m" ? ATTENDANCE_TREND.slice(-3) : ATTENDANCE_TREND, [range]);

  const reads = trend.map(t => t.read);
  const posts = trend.reduce((a, t) => a + t.posts, 0);
  const replies = trend.reduce((a, t) => a + t.replies, 0);
  const avgRead = Math.round(trend.reduce((a, t) => a + t.read, 0) / trend.length);
  const onsitePct = Math.round(attend.reduce((a, t) => a + t.onsite, 0) / attend.length);

  const channelSlices = CHANNEL_FIT.map((c, i) => ({ label: c.ch, pct: [30, 27, 18, 14, 11][i], tone: TONE[c.tone]?.dot || "var(--navy)" }));
  const totalFamilies = LANGUAGES.reduce((a, l) => a + l.families, 0);

  return (
    <div className="wrap-wide py-8">
      <PageHead eyebrow="Reach" title="Engagement"
        sub="Who we're reaching, on which channel, and where the gaps are — recomputed from live program data."
        actions={
          <div className="inline-flex p-1 rounded-[13px] bg-navy-50" role="group" aria-label="Date range">
            {(Object.keys(RANGE_LABEL) as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={cx("px-3.5 py-1.5 rounded-[10px] text-[12.5px] font-semibold transition-all",
                  range === r ? "bg-white text-navy-700 shadow-sm" : "text-ink/50 hover:text-ink/80")}>
                {RANGE_LABEL[r]}
              </button>
            ))}
          </div>
        } />

      {/* stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {IMPACT.map((s, i) => (
          <Reveal key={s.label} delay={i * 45}>
            <div className="card p-4.5 p-4">
              <div className="display text-[24px] tnum leading-none text-navy-700">{s.n}</div>
              <div className="mt-1.5 text-[11.5px] font-semibold text-ink/65 leading-snug">{s.label}</div>
              <div className="mt-0.5 text-[10.5px] text-ink/40">{s.note}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* chart wall */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="Engagement" title="Message read rate"
            sub={`${posts} posts · ${replies} replies · ${avgRead}% average read rate — ${RANGE_LABEL[range].toLowerCase()}`}
            right={<Chip tone="green"><I.TrendingUp size={12} /> {avgRead}% avg</Chip>} />
          <AreaLine data={reads} labels={trend.map(t => t.m)} tone="var(--navy)" h={180} />
        </Card>

        <Card>
          <SectionTitle eyebrow="Channel mix" title="Where messages land" />
          <div className="flex flex-col items-center gap-4">
            <Donut slices={channelSlices} size={180} thickness={24}
              center={<div className="text-center"><div className="display text-[24px] tnum">5</div><div className="text-[10px] font-bold text-ink/45 uppercase tracking-wider">channels</div></div>} />
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5">
              {channelSlices.map(s => (
                <div key={s.label} className="flex items-center gap-2 text-[11.5px]">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: s.tone }} />
                  <span className="font-semibold text-ink/70 truncate">{s.label}</span>
                  <span className="ml-auto tnum font-bold">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="Attendance" title="On-site vs remote vs missed"
            sub={`${onsitePct}% of sessions held on-site at the Long Ridge Road center — ${RANGE_LABEL[range].toLowerCase()}`} />
          <BarSeries data={attend.map(a => ({ values: [a.onsite, a.remote, a.missed] }))} labels={attend.map(a => a.wk)} h={170} />
        </Card>

        <Card>
          <SectionTitle eyebrow="Equity lens" title="Reach by group" />
          <HBars items={REACH_BY_GROUP.map(g => ({ label: g.group, value: g.pct, tone: g.pct >= 95 ? "#159A63" : g.pct >= 85 ? "var(--navy)" : "#DE8C00", note: "%" }))} />
          <div className="mt-4 rounded-xl bg-navy-50 px-3.5 py-2.5 text-[11.5px] text-navy-700 leading-snug">
            {REACH_BY_GROUP[2].group} is the softest group at {REACH_BY_GROUP[2].pct}% — {REACH_BY_GROUP[2].engaged} of {REACH_BY_GROUP[2].families} families engaged.
          </div>
        </Card>

        {/* channel fit matrix */}
        <Card className="xl:col-span-2" pad={false}>
          <div className="px-5 pt-4"><SectionTitle eyebrow="Channel fit" title="Right channel, right message" /></div>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[520px]">
              <thead><tr><th>Channel</th><th className="text-right">Reach</th><th>Best for</th><th className="w-[34%]">Coverage</th></tr></thead>
              <tbody>
                {CHANNEL_FIT.map(c => (
                  <tr key={c.ch}>
                    <td><Chip tone={c.tone}>{c.ch}</Chip></td>
                    <td className="text-right tnum font-bold">{c.reach}%</td>
                    <td className="text-ink/65 text-[12.5px]">{c.best}</td>
                    <td>
                      <div className="h-2 rounded-full bg-navy-100/70 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.reach}%`, background: TONE[c.tone]?.dot }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* reach every family */}
        <Card className="navy-field on-dark grain border-0">
          <SectionTitle dark eyebrow="Reach every family" title="Language access" />
          <div className="space-y-2.5">
            {LANGUAGES.map(l => (
              <div key={l.code} className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="font-semibold text-white/85">{l.label}</span>
                <span className="text-white/50 tnum">{l.families} families</span>
              </div>
            ))}
          </div>
          <div className="hair-dark my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-[12.5px] font-semibold text-white/70">Total households</span>
            <span className="display text-[26px] tnum text-solar">{totalFamilies}</span>
          </div>
          <Button variant="solar" size="sm" icon={I.Languages} className="mt-4 w-full justify-center"
            onClick={() => go("ops-translation")}>Open translation review</Button>
        </Card>
      </div>

      {/* activity console */}
      <Card className="mt-6" pad={false}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-100">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-solar"><I.Terminal size={15} /></span>
            <div>
              <div className="text-[13.5px] font-bold">Activity log</div>
              <div className="text-[11px] text-ink/45">Every staff and system action, auditable</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" icon={I.Download} onClick={() => toast("Activity log exported", "navy")}>Export</Button>
        </div>
        <div className="bg-ink/[.02] px-5 py-4 font-mono text-[12px]">
          {AUDIT.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-navy-100/60 last:border-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE[a.tone]?.dot }} />
              <span className="text-ink/40 w-[130px] shrink-0 tnum">{a.at}</span>
              <span className="font-semibold text-navy-700 w-[110px] shrink-0 truncate">{a.who}</span>
              <span className="text-ink/70">{a.what}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
