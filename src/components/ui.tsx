import React, { useLayoutEffect, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { X, Check, ChevronDown, Search, Info } from "lucide-react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ Avatar */
export function Avatar({ initials, tone = "navy", size = 38, dark = false }: { initials: string; tone?: string; size?: number; dark?: boolean }) {
  const map: Record<string, [string, string]> = {
    navy: ["#E7EFFA", "var(--navy)"], solar: ["#FFF6C9", "#7A6200"], teal: ["#DFF6F6", "#0B6B6B"],
    violet: ["#EDE7FB", "#5636B8"], pink: ["#FBE6F2", "#A3316F"], amber: ["#FBEEDC", "#A56500"],
    green: ["#DDF3E9", "#0E7A4E"], red: ["#FBE3E0", "#B02A1D"],
  };
  const [bg, fg] = map[tone] || map.navy;
  return (
    <span aria-hidden className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: dark ? "rgba(255,255,255,.12)" : bg, color: dark ? "#fff" : fg,
               fontSize: Math.max(10, size * 0.36), border: dark ? "1px solid rgba(255,255,255,.18)" : "1px solid rgba(10,18,32,.06)" }}>
      {initials}
    </span>
  );
}

/* -------------------------------------------------------------------- Chip */
export function Chip({ children, tone = "navy", dark = false, solid = false, className = "" }:
  { children: React.ReactNode; tone?: string; dark?: boolean; solid?: boolean; className?: string }) {
  const map: Record<string, [string, string]> = {
    navy: ["rgb(var(--c-navy-700) / .08)", "var(--navy)"], solar: ["rgba(254,222,39,.22)", "#6E5700"], teal: ["rgba(14,140,140,.12)", "#0B6B6B"],
    violet: ["rgba(108,75,214,.12)", "#5636B8"], pink: ["rgba(194,65,143,.12)", "#A3316F"], amber: ["rgba(222,140,0,.14)", "#8C5900"],
    green: ["rgba(21,154,99,.13)", "#0E7A4E"], red: ["rgba(217,58,43,.12)", "#B02A1D"],
  };
  const [bg, fg] = map[tone] || map.navy;
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap", className)}
    style={dark ? { background: "rgba(255,255,255,.1)", color: "#fff", border: "1px solid rgba(255,255,255,.14)" }
                : { background: solid ? fg : bg, color: solid ? "#fff" : fg, border: "1px solid transparent" }}>{children}</span>;
}

/* ------------------------------------------------------------------ Button */
export function Button({ children, variant = "primary", size = "md", icon: Icon, className = "", ...rest }:
  { children?: React.ReactNode; variant?: "primary"|"solar"|"ghost"|"quiet"|"dark"|"danger"; size?: "sm"|"md"|"lg"; icon?: any; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = { primary: "btn-primary", solar: "btn-solar", ghost: "btn-ghost", quiet: "btn-quiet", dark: "btn-dark", danger: "bg-signal-red text-white hover:brightness-95" }[variant];
  const s = { sm: "text-[12.5px] px-3 py-2 rounded-[10px]", md: "", lg: "text-[15px] px-6 py-3.5 rounded-[14px]" }[size];
  return <button className={cx("btn", v, s, className)} {...rest}>{Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.1} />}{children}</button>;
}

/* -------------------------------------------------------------------- Card */
export function Card({ children, className = "", pad = true, flat = false, as: As = "div", ...rest }:
  { children: React.ReactNode; className?: string; pad?: boolean; flat?: boolean; as?: any } & React.HTMLAttributes<HTMLElement>) {
  return <As className={cx(flat ? "card-flat" : "card", pad && "p-5", className)} {...rest}>{children}</As>;
}

export function SectionTitle({ eyebrow, title, sub, right, dark = false }:
  { eyebrow?: string; title: string; sub?: string; right?: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap mb-5">
      <div className="min-w-0">
        {eyebrow && <div className={cx("eyebrow mb-2", dark ? "text-solar" : "text-navy-500")}>{eyebrow}</div>}
        <h2 className={cx("display text-[27px] sm:text-[32px]", dark ? "text-white" : "text-ink")}>{title}</h2>
        {sub && <p className={cx("mt-2 text-[14px] max-w-2xl", dark ? "text-white/62" : "text-ink/60")}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------------------------------------------------------------- Progress */
export function Bar({ value, tone = "var(--navy)", h = 8, track = "rgb(var(--c-navy-700) / .1)", label, animate = true }:
  { value: number; tone?: string; h?: number; track?: string; label?: string; animate?: boolean }) {
  const [w, setW] = useState(animate ? 0 : value);
  useEffect(() => { const t = setTimeout(() => setW(value), 80); return () => clearTimeout(t); }, [value, animate]);
  return (
    <div>
      {label && <div className="flex justify-between text-[11.5px] font-semibold text-ink/55 mb-1.5"><span>{label}</span><span className="tnum">{value}%</span></div>}
      <div style={{ height: h, background: track, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: tone, borderRadius: 99, transition: "width 1.05s cubic-bezier(.22,1,.36,1)" }} />
      </div>
    </div>
  );
}

export function Ring({ value, size = 76, stroke = 7, tone = "var(--navy)", track = "rgb(var(--c-navy-700) / .1)", children }:
  { value: number; size?: number; stroke?: number; tone?: string; track?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children ?? <span className="display text-[17px] tnum">{value}%</span>}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Statbox */
export function Stat({ n, label, note, tone = "var(--navy)", dark = false, trend, icon: Icon }:
  { n: string; label: string; note?: string; tone?: string; dark?: boolean; trend?: string; icon?: any }) {
  return (
    <div className={cx("relative overflow-hidden rounded-[18px] p-5", dark ? "glass-dark" : "card")}>
      {Icon && <Icon size={17} strokeWidth={1.9} style={{ color: tone }} className="mb-3" />}
      <div className={cx("display text-[30px] leading-none tnum", dark ? "text-white" : "text-ink")}>{n}</div>
      <div className={cx("mt-2 text-[12.5px] font-semibold", dark ? "text-white/78" : "text-ink/72")}>{label}</div>
      {note && <div className={cx("mt-1.5 text-[12px] leading-snug", dark ? "text-white/55" : "text-ink/52")}>{note}</div>}
      {trend && <div className="mt-2 text-[12px] font-semibold" style={{ color: tone }}>{trend}</div>}
      <span className="absolute inset-x-5 bottom-0 h-[3px]" style={{ background: tone, opacity: dark ? .85 : .9 }} />
    </div>
  );
}

/* -------------------------------------------------------------------- Tabs */
export function Tabs<T extends string>({ items, value, onChange, dark = false, variant = "pill" }:
  { items: { id: T; label: string; badge?: string | number }[]; value: T; onChange: (v: T) => void; dark?: boolean; variant?: "pill"|"underline" }) {
  if (variant === "underline") return (
    <div className={cx("flex gap-6 border-b", dark ? "border-white/12" : "border-navy-100")}>
      {items.map(i => (
        <button key={i.id} onClick={() => onChange(i.id)}
          className={cx("relative pb-3 text-[13.5px] font-semibold transition-colors", value === i.id ? (dark ? "text-white" : "text-navy-700") : (dark ? "text-white/45 hover:text-white/75" : "text-ink/45 hover:text-ink/75"))}>
          {i.label}{i.badge != null && <span className="ml-1.5 text-[11px] opacity-60 tnum">{i.badge}</span>}
          {value === i.id && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full" style={{ background: dark ? "var(--solar)" : "var(--navy)" }} />}
        </button>
      ))}
    </div>
  );
  return (
    <div className={cx("inline-flex p-1 rounded-[13px]", dark ? "bg-white/8" : "bg-navy-50")}>
      {items.map(i => (
        <button key={i.id} onClick={() => onChange(i.id)}
          className={cx("px-3.5 py-1.5 rounded-[10px] text-[12.5px] font-semibold transition-all", value === i.id
            ? (dark ? "bg-white text-ink shadow-sm" : "bg-white text-navy-700 shadow-sm") : (dark ? "text-white/55 hover:text-white" : "text-ink/50 hover:text-ink/80"))}>
          {i.label}{i.badge != null && <span className="ml-1.5 opacity-60 tnum">{i.badge}</span>}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Tooltip */
export function Tip({ text, children, side = "top" }: { text: string; children: React.ReactNode; side?: "top" | "bottom" }) {
  const wrap = useRef<HTMLSpanElement>(null);
  const bub = useRef<HTMLSpanElement>(null);

  /* Keep the bubble inside whatever actually clips it — the sidebar, not the
     viewport. A centred bubble on a 40px tab used to run off the left edge and
     get cut in half by the nav's overflow. */
  useLayoutEffect(() => {
    const w = wrap.current, b = bub.current;
    if (!w || !b) return;
    const place = () => {
      const PAD = 8;
      const wr = w.getBoundingClientRect(), br = b.getBoundingClientRect();
      // nearest ancestor that clips
      let box: DOMRect | null = null;
      for (let n = w.parentElement; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.overflowX !== "visible" || cs.overflowY !== "visible") { box = n.getBoundingClientRect(); break; }
      }
      const left = box ? Math.max(box.left, 0) : 0;
      const right = box ? Math.min(box.right, window.innerWidth) : window.innerWidth;
      const centred = wr.left + wr.width / 2 - br.width / 2;
      let shift = 0;
      if (centred < left + PAD) shift = left + PAD - centred;
      else if (centred + br.width > right - PAD) shift = right - PAD - (centred + br.width);
      b.style.setProperty("--tx", `${Math.round(shift)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(b); if (w) ro.observe(w);
    window.addEventListener("resize", place);
    return () => { ro.disconnect(); window.removeEventListener("resize", place); };
  }, [text]);

  return (
    <span ref={wrap} className="tip inline-flex">
      {children}
      <span ref={bub} role="tooltip" data-tip
        style={side === "bottom" ? { bottom: "auto", top: "calc(100% + 9px)" } : undefined}>{text}</span>
    </span>
  );
}

/* ------------------------------------------------------------------- Modal */
export function Modal({ open, onClose, title, sub, children, footer, width = 620, dark = false }:
  { open: boolean; onClose: () => void; title: string; sub?: string; children: React.ReactNode; footer?: React.ReactNode; width?: number; dark?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[3px] animate-fade" onClick={onClose} />
      <div className={cx("relative w-full rounded-[22px] shadow-deep animate-rise overflow-hidden", dark ? "navy-field on-dark" : "bg-white")} style={{ maxWidth: width }}>
        <div className={cx("flex items-start justify-between gap-5 px-6 pt-5 pb-4 border-b", dark ? "border-white/10" : "border-navy-100")}>
          <div>
            <h3 className={cx("display text-[21px]", dark ? "text-white" : "text-ink")}>{title}</h3>
            {sub && <p className={cx("mt-1 text-[13px]", dark ? "text-white/55" : "text-ink/55")}>{sub}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className={cx("grid h-9 w-9 place-items-center rounded-xl transition-colors", dark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-ink/40 hover:bg-navy-50 hover:text-ink")}><X size={17} /></button>
        </div>
        <div className="px-6 py-5 max-h-[62vh] overflow-y-auto">{children}</div>
        {footer && <div className={cx("flex items-center justify-end gap-3 px-6 py-4 border-t", dark ? "border-white/10" : "border-navy-100")}>{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Drawer */
export function Drawer({ open, onClose, title, sub, children, footer, width = 520, dark = false }:
  { open: boolean; onClose: () => void; title: string; sub?: string; children: React.ReactNode; footer?: React.ReactNode; width?: number; dark?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <aside className={cx("absolute right-0 top-0 h-full w-full shadow-deep flex flex-col animate-fade", dark ? "navy-field on-dark" : "bg-white")}
        style={{ maxWidth: width, animation: "rise .42s cubic-bezier(.22,1,.36,1) both" }}>
        <div className={cx("flex items-start justify-between gap-4 px-6 py-5 border-b", dark ? "border-white/10" : "border-navy-100")}>
          <div><h3 className={cx("display text-[20px]", dark ? "text-white" : "text-ink")}>{title}</h3>
            {sub && <p className={cx("mt-1 text-[12.5px]", dark ? "text-white/55" : "text-ink/55")}>{sub}</p>}</div>
          <button onClick={onClose} aria-label="Close" className={cx("grid h-9 w-9 place-items-center rounded-xl", dark ? "text-white/60 hover:bg-white/10" : "text-ink/40 hover:bg-navy-50")}><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className={cx("flex items-center justify-end gap-3 px-6 py-4 border-t", dark ? "border-white/10" : "border-navy-100")}>{footer}</div>}
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------- EmptyState */
export function Empty({ icon: Icon = Info, title, body, action }:
  { icon?: any; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center text-center py-14 px-6">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-500 mb-4"><Icon size={24} strokeWidth={1.8} /></div>
      <div className="display text-[18px]">{title}</div>
      <p className="mt-1.5 text-[13px] text-ink/55 max-w-sm">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ h = 14, w = "100%", r = 8 }: { h?: number; w?: string | number; r?: number }) {
  return <div style={{ height: h, width: w, borderRadius: r,
    background: "linear-gradient(90deg,rgb(var(--c-navy-700) / .06) 25%,rgb(var(--c-navy-700) / .11) 37%,rgb(var(--c-navy-700) / .06) 63%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.8s linear infinite" }} />;
}

/* ------------------------------------------------------------------- Toasts */
type Toast = { id: number; text: string; tone?: string };
const ToastCtx = createContext<(t: string, tone?: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastHost({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = (text: string, tone = "navy") => {
    const id = Date.now() + Math.random();
    setList(l => [...l, { id, text, tone }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 3600);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none" aria-live="polite">
        {list.map(t => (
          <div key={t.id} className="animate-rise flex items-center gap-2.5 rounded-full bg-ink/92 px-4 py-2.5 text-[13px] font-semibold text-white shadow-deep backdrop-blur">
            <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: t.tone === "green" ? "#159A63" : t.tone === "red" ? "#D93A2B" : "var(--solar)", color: t.tone === "green" || t.tone === "red" ? "#fff" : "var(--ink)" }}><Check size={12} strokeWidth={3} /></span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* -------------------------------------------------------------- Reveal (IO) */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={cx("reveal", seen && "in", className)} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ------------------------------------------------------------------ Search */
export function SearchBox({ value, onChange, placeholder = "Search…", dark = false, className = "" }:
  { value: string; onChange: (v: string) => void; placeholder?: string; dark?: boolean; className?: string }) {
  return (
    <label className={cx("flex items-center gap-2.5 rounded-xl px-3 py-2.5", dark ? "bg-white/8 border border-white/12" : "bg-white border border-navy-100", className)}>
      <Search size={15} className={dark ? "text-white/45" : "text-ink/35"} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={cx("flex-1 bg-transparent text-[13.5px] outline-none", dark ? "text-white placeholder:text-white/40" : "text-ink placeholder:text-ink/35")} />
      {value && <button onClick={() => onChange("")} aria-label="Clear" className={dark ? "text-white/45" : "text-ink/35"}><X size={14} /></button>}
    </label>
  );
}

export function Select({ value, onChange, options, dark = false, className = "" }:
  { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; dark?: boolean; className?: string }) {
  return (
    <div className={cx("relative inline-flex", className)}>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={cx("appearance-none rounded-xl pl-3 pr-9 py-2.5 text-[13px] font-semibold outline-none", dark ? "bg-white/8 border border-white/12 text-white" : "bg-white border border-navy-100 text-navy-700")}>
        {options.map(o => <option key={o.value} value={o.value} className="text-ink">{o.label}</option>)}
      </select>
      <ChevronDown size={14} className={cx("absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none", dark ? "text-white/50" : "text-ink/40")} />
    </div>
  );
}
