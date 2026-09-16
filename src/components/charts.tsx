import React, { useEffect, useRef, useState } from "react";

const anim = (on: boolean) => on ? "all 1.1s cubic-bezier(.22,1,.36,1)" : "none";

/* ---------------------------------------------------------------- AreaLine */
export function AreaLine({ data, w = 520, h = 150, tone = "var(--navy)", fill = "rgb(var(--c-navy-700) / .13)", labels, dark = false, dots = true }:
{ data: number[]; w?: number; h?: number; tone?: string; fill?: string; labels?: string[]; dark?: boolean; dots?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 120); return () => clearTimeout(t); }, []);
  const max = Math.max(...data) * 1.12 || 1, min = Math.min(...data) * 0.86;
  const px = (i: number) => 8 + (i * (w - 16)) / Math.max(1, data.length - 1);
  const py = (v: number) => h - 22 - ((v - min) / (max - min || 1)) * (h - 38);
  const line = data.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = `${line} L${px(data.length - 1).toFixed(1)},${h - 22} L${px(0).toFixed(1)},${h - 22} Z`;
  const gid = `g${tone.replace(/[^a-z0-9]/gi, "")}${w}${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Trend">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={fill} stopOpacity="1" /><stop offset="100%" stopColor={fill} stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map(i => <line key={i} x1={8} x2={w - 8} y1={14 + i * ((h - 36) / 3)} y2={14 + i * ((h - 36) / 3)}
        stroke={dark ? "rgba(255,255,255,.08)" : "rgb(var(--c-navy-700) / .07)"} strokeDasharray="3 5" />)}
      <path d={area} fill={`url(#${gid})`} opacity={on ? 1 : 0} style={{ transition: anim(on) }} />
      <path d={line} fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 1400, strokeDashoffset: on ? 0 : 1400, transition: "stroke-dashoffset 1.35s cubic-bezier(.22,1,.36,1)" }} />
      {dots && data.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r="3.2" fill={dark ? "#fff" : "#fff"} stroke={tone} strokeWidth="2"
        opacity={on ? 1 : 0} style={{ transition: `opacity .5s ease ${0.9 + i * 0.06}s` }} />)}
      {labels && labels.map((l, i) => <text key={l} x={px(i)} y={h - 6} textAnchor="middle" fontSize="10.5" fontWeight="600"
        fill={dark ? "rgba(255,255,255,.5)" : "rgba(10,18,32,.42)"}>{l}</text>)}
    </svg>
  );
}

/* --------------------------------------------------------------- BarSeries */
export function BarSeries({ data, labels, h = 148, tones = ["var(--navy)", "var(--navy-300)", "#D93A2B"], dark = false, stacked = true, showLegend = true }:
{ data: { values: number[] }[]; labels?: string[]; h?: number; tones?: string[]; dark?: boolean; stacked?: boolean; showLegend?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 120); return () => clearTimeout(t); }, []);
  const total = Math.max(...data.map(d => d.values.reduce((a, b) => a + b, 0))) || 1;
  const bw = 100 / (data.length * 1.9);
  return (
    <div>
      <svg viewBox={`0 0 100 ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label="Series">
        {[0, .25, .5, .75, 1].map(p => <line key={p} x1="0" x2="100" y1={h - 20 - p * (h - 34)} y2={h - 20 - p * (h - 34)} stroke={dark ? "rgba(255,255,255,.08)" : "rgb(var(--c-navy-700) / .07)"} strokeWidth=".3" />)}
        {data.map((d, i) => {
          const x = (i + .5) * (100 / data.length) - bw / 2;
          let acc = 0;
          return <g key={i}>{d.values.map((v, j) => {
            const bh = ((v / total) * (h - 34));
            const y = h - 20 - acc - bh; acc += bh;
            return <rect key={j} x={x} y={on ? y : h - 20} width={bw} height={on ? bh : 0} rx=".8" fill={tones[j % tones.length]}
              style={{ transition: `y .85s cubic-bezier(.22,1,.36,1) ${i * .05}s, height .85s cubic-bezier(.22,1,.36,1) ${i * .05}s` }} />;
          })}</g>;
        })}
      </svg>
      {labels && <div className="flex" style={{ marginTop: -14 }}>{labels.map(l => <div key={l} className="flex-1 text-center text-[10.5px] font-semibold" style={{ color: dark ? "rgba(255,255,255,.5)" : "rgba(10,18,32,.42)" }}>{l}</div>)}</div>}
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-3.5">
          {["On-site", "Remote", "Missed"].slice(0, 3).map((n, i) => (
            <span key={n} className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: dark ? "rgba(255,255,255,.6)" : "rgba(10,18,32,.55)" }}>
              <span className="h-2 w-2 rounded-sm" style={{ background: tones[i % tones.length] }} />{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- Donut */
export function Donut({ slices, size = 168, thickness = 22, dark = false, center }:
{ slices: { label: string; pct: number; tone: string }[]; size?: number; thickness?: number; dark?: boolean; center?: React.ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 120); return () => clearTimeout(t); }, []);
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Composition">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,.09)" : "rgb(var(--c-navy-700) / .07)"} strokeWidth={thickness} />
        {slices.map((s, i) => {
          const len = (s.pct / 100) * c, off = acc; acc += len;
          return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.tone} strokeWidth={thickness}
            strokeDasharray={`${on ? len : 0} ${c}`} strokeDashoffset={-off} strokeLinecap="butt"
            style={{ transition: `stroke-dasharray 1.05s cubic-bezier(.22,1,.36,1) ${i * .12}s` }} />;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
    </div>
  );
}

/* -------------------------------------------------------------------- Radar */
export function Radar({ axes, series, size = 260, dark = false }:
{ axes: string[]; series: { name: string; values: number[]; tone: string; fill?: string }[]; size?: number; dark?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 140); return () => clearTimeout(t); }, []);
  const cx0 = size / 2, cy0 = size / 2, R = size / 2 - 30;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2, rr = (v / 100) * R;
    return [cx0 + rr * Math.cos(a), cy0 + rr * Math.sin(a)];
  };
  return (
    <svg viewBox={`0 0 ${size} ${size + 8}`} width="100%" height={size + 8} role="img" aria-label="Skills radar">
      {[25, 50, 75, 100].map(p => (
        <polygon key={p} points={axes.map((_, i) => pt(i, p).join(",")).join(" ")} fill="none"
          stroke={dark ? "rgba(255,255,255,.1)" : "rgb(var(--c-navy-700) / .09)"} strokeWidth="1" />
      ))}
      {axes.map((_, i) => { const [x, y] = pt(i, 100); return <line key={i} x1={cx0} y1={cy0} x2={x} y2={y} stroke={dark ? "rgba(255,255,255,.09)" : "rgb(var(--c-navy-700) / .08)"} />; })}
      {series.map((s, si) => (
        <g key={s.name}>
          <polygon points={s.values.map((v, i) => pt(i, on ? v : 0).join(",")).join(" ")}
            fill={s.fill || (s.tone.startsWith("#") ? s.tone + "26" : `color-mix(in srgb, ${s.tone} 15%, transparent)`)} stroke={s.tone} strokeWidth="2.2" strokeLinejoin="round"
            style={{ transition: `all 1.1s cubic-bezier(.22,1,.36,1) ${si * .15}s` }} />
          {s.values.map((v, i) => { const [x, y] = pt(i, on ? v : 0); return <circle key={i} cx={x} cy={y} r="3" fill={s.tone}
            style={{ transition: `all 1.1s cubic-bezier(.22,1,.36,1) ${si * .15}s` }} />; })}
        </g>
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 126);
        return <text key={a} x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fontWeight="700"
          fill={dark ? "rgba(255,255,255,.62)" : "rgba(10,18,32,.55)"}>{a}</text>;
      })}
    </svg>
  );
}

/* ----------------------------------------------------------------- Heatmap */
export function Heatmap({ cols, rows, get, dark = false, cell = 26 }:
{ cols: string[]; rows: string[]; get: (r: number, c: number) => number; dark?: boolean; cell?: number }) {
  const shade = (v: number) => v < 0 ? (dark ? "rgba(255,255,255,.05)" : "rgb(var(--c-navy-700) / .05)")
    : `rgb(var(--c-navy-700) / ${(0.12 + (v / 100) * 0.78).toFixed(2)})`;
  return (
    <div className="overflow-x-auto scroll-x">
      <div className="inline-block">
        <div className="flex gap-1 mb-1.5 pl-[64px]">{cols.map(c => <div key={c} className="text-center text-[10px] font-bold" style={{ width: cell, color: dark ? "rgba(255,255,255,.5)" : "rgba(10,18,32,.42)" }}>{c}</div>)}</div>
        {rows.map((r, ri) => (
          <div key={r} className="flex items-center gap-1 mb-1">
            <div className="w-[60px] pr-2 text-right text-[10.5px] font-semibold" style={{ color: dark ? "rgba(255,255,255,.55)" : "rgba(10,18,32,.45)" }}>{r}</div>
            {cols.map((_, ci) => {
              const v = get(ri, ci);
              return <div key={ci} title={v < 0 ? "No session" : `${v}% attendance`} style={{ width: cell, height: cell, background: shade(v), borderRadius: 6, border: dark ? "1px solid rgba(255,255,255,.06)" : "1px solid rgba(255,255,255,.7)", transition: "transform .18s ease" }}
                className="hover:scale-[1.09]" />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Sparkline */
export function Spark({ data, tone = "var(--navy)", w = 100, h = 30, fill }: { data: number[]; tone?: string; w?: number; h?: number; fill?: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const px = (i: number) => (i * w) / (data.length - 1);
  const py = (v: number) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
  const d = data.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden>
      {fill && <path d={`${d} L${w},${h} L0,${h} Z`} fill={tone} opacity=".1" />}
      <path d={d} fill="none" stroke={tone} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ------------------------------------------------------------------ HBars */
export function HBars({ items, dark = false, max }: { items: { label: string; value: number; tone?: string; note?: string }[]; dark?: boolean; max?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 110); return () => clearTimeout(t); }, []);
  const M = max ?? Math.max(...items.map(i => i.value));
  return (
    <div className="space-y-3.5">
      {items.map((it, i) => (
        <div key={it.label}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className={dark ? "text-[12.5px] font-semibold text-white/85" : "text-[12.5px] font-semibold text-ink/80"}>{it.label}</span>
            <span className={dark ? "text-[12px] tnum font-bold text-white" : "text-[12px] tnum font-bold text-ink"}>{it.value}{it.note || "%"}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: dark ? "rgba(255,255,255,.1)" : "rgb(var(--c-navy-700) / .08)" }}>
            <div style={{ width: on ? `${(it.value / M) * 100}%` : 0, height: "100%", background: it.tone || "var(--navy)", borderRadius: 99, transition: `width 1s cubic-bezier(.22,1,.36,1) ${i * .07}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Meter row */
export function DeltaBars({ items, dark = false }: { items: { label: string; before: number; now: number }[]; dark?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 110); return () => clearTimeout(t); }, []);
  return (
    <div className="space-y-5">
      {items.map((it, i) => (
        <div key={it.label}>
          <div className="flex items-baseline justify-between mb-2">
            <span className={dark ? "text-[13px] font-semibold text-white/88" : "text-[13px] font-semibold text-ink/85"}>{it.label}</span>
            <span className="text-[11.5px] font-bold tnum" style={{ color: "#159A63" }}>+{it.now - it.before} pts</span>
          </div>
          <div className="relative">
            <div className="h-[10px] rounded-full" style={{ background: dark ? "rgba(255,255,255,.09)" : "rgb(var(--c-navy-700) / .08)" }}>
              <div style={{ width: on ? `${it.before}%` : 0, height: 10, borderRadius: 99, background: dark ? "rgba(255,255,255,.28)" : "var(--navy-200)", transition: `width .9s cubic-bezier(.22,1,.36,1) ${i * .06}s` }} />
            </div>
            <div className="absolute left-0 top-0 h-[10px] rounded-full" style={{ width: on ? `${it.now}%` : 0, background: "var(--navy)", opacity: .95, transition: `width 1.1s cubic-bezier(.22,1,.36,1) ${.15 + i * .06}s` }} />
          </div>
          <div className="mt-1.5 flex gap-4 text-[10.5px] font-semibold" style={{ color: dark ? "rgba(255,255,255,.5)" : "rgba(10,18,32,.45)" }}>
            <span>Start {it.before}</span><span>Now {it.now}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
