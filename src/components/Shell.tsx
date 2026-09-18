import React, { useEffect, useMemo, useState } from "react";
import * as I from "lucide-react";
import { useApp, NAV_ITEMS, HOME_ROUTE, type Role, type Route } from "../lib/store";
import { Lockup, BLMark } from "./Brand";
import { Avatar, Chip, cx, Button, Modal, Tip } from "./ui";
import { Editable } from "./Editable";
import { ME, DEMO_NOTICE } from "../lib/data";

const ROLE_META: Record<Role, { label: string; short: string; tone: string; blurb: string }> = {
  ops:     { label: "Program Ops", short: "Ops",    tone: "var(--navy)", blurb: "Run the whole program from one console." },
  tutor:   { label: "Peer Tutor",  short: "Tutor",  tone: "#0E8C8C", blurb: "Your sessions, students and notes." },
  family:  { label: "Family",      short: "Family", tone: "#6C4BD6", blurb: "Everything about your learner, in one place." },
  student: { label: "Student",     short: "Student",tone: "#DE8C00", blurb: "Your goals, sessions and labs." },
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { role, setRole, route, go, me, dispatched, threads } = useApp();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [demo, setDemo] = useState(false);
  const meta = ROLE_META[role];

  useEffect(() => { setOpen(false); setBell(false); }, [route]);

  const notes = useMemo(() => {
    const n: { icon: any; text: string; at: string; tone: string; go?: Route }[] = [];
    threads.filter(t => t.unread > 0).forEach(t => n.push({ icon: I.MessageSquare, text: `${t.unread} new message from ${t.with}`, at: "today", tone: "#6C4BD6", go: "ops-messages" }));
    dispatched.slice(0, 2).forEach(d => n.push({ icon: I.Megaphone, text: `${d.name} dispatched to ${d.reach} recipients`, at: d.at, tone: "var(--navy)" }));
    n.push({ icon: I.FileSignature, text: "Sliding-scale verification due Nov 14 (Reyes family)", at: "due", tone: "#DE8C00", go: "ops-forms" });
    n.push({ icon: I.UserCheck, text: "Tariq H. missed 2 sessions — follow-up suggested", at: "2d", tone: "#D93A2B", go: "ops-sessions" });
    return n;
  }, [threads, dispatched]);

  const groups = NAV_ITEMS[role];

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F1EA" }}>
      {/* ---------------------------------------------------------- sidebar */}
      <aside className={cx("fixed inset-y-0 left-0 z-50 w-[266px] flex-col navy-field on-dark grain transition-transform lg:static lg:flex",
        open ? "flex translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        {/* Brand band: full-width warm ground so the logo's own dark artwork sits
            on a light surface exactly as designed — no floating white box, and the
            glyphs are never recoloured. */}
        <div className="relative z-10" style={{ background: "#faf7f2" }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-4">
            <button onClick={() => go("home")} aria-label="Beyond Limits Hub home"><Lockup /></button>
            <button className="lg:hidden text-ink/45" onClick={() => setOpen(false)} aria-label="Close menu"><I.X size={18} /></button>
          </div>
          <span className="block h-[3px] w-full" style={{ background: "linear-gradient(90deg,var(--solar),var(--solar-600))" }} />
        </div>

        <div className="relative z-10 px-5">
          <RoleSwitch role={role} setRole={setRole} />
        </div>

        <nav className="relative z-10 mt-5 flex-1 overflow-y-auto px-3 pb-4">
          {groups.map(g => (
            <div key={g.group} className="mb-4">
              <div className="px-3 mb-1.5 text-[9.5px] font-bold uppercase tracking-[.15em] text-white/35">{g.group}</div>
              {g.items.map(it => {
                const Icon = (I as any)[it.icon] || I.Circle;
                const on = route === it.id;
                return (
                  <button key={it.id} onClick={() => go(it.id)}
                    className={cx("group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all",
                      on ? "bg-white text-ink shadow-lift" : "text-white/62 hover:bg-white/8 hover:text-white")}>
                    <Icon size={15.5} strokeWidth={on ? 2.4 : 2} style={{ color: on ? meta.tone : undefined }} />
                    <span className="truncate"><Editable id={`nav.${it.id}.label`} fallback={it.label} /></span>
                    {on && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full" style={{ background: "var(--solar)" }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="relative z-10 px-4 pb-4">
          <div className="rounded-2xl bg-white/7 border border-white/10 p-3.5">
            <div className="flex items-center gap-2.5">
              <Avatar initials={me.initials} tone={me.tone} size={34} dark />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-bold text-white">{me.name}</div>
                <div className="text-[10.5px] text-white/50">{ROLE_META[role].label}</div>
              </div>
            </div>
            <button onClick={() => setDemo(true)} className="mt-3 flex w-full items-center gap-1.5 text-[11.5px] font-semibold text-white/55 hover:text-solar transition-colors">
              <I.Info size={12} /> Demo data notice
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-ink/45 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ------------------------------------------------------------- main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[62px] items-center gap-3 px-4 sm:px-6">
            <button className="lg:hidden grid h-9 w-9 place-items-center rounded-xl text-navy-700 hover:bg-navy-50" onClick={() => setOpen(true)} aria-label="Open menu"><I.Menu size={18} /></button>

            <div className="hidden xl:block text-[13px] font-semibold text-ink/45">
              {role === "ops" ? "Program Operations" : ROLE_META[role].label} <span className="mx-1.5 text-ink/25">/</span>
              <span className="text-navy-700">{currentLabel(route, groups)}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
            {/* ------------------------------------------------- owner toggle */}
            <Tip side="bottom" text="Andy's supervision view — the whole program, the decisions outstanding and the migration status.">
              <button onClick={() => go(route === "owner" ? "ops-command" : "owner")}
                role="switch" aria-checked={route === "owner"} aria-label="Owner view"
                className={cx("inline-flex items-center gap-2 rounded-full border pl-2.5 pr-1.5 py-1 text-[11px] font-extrabold tracking-[.12em] transition-all",
                  route === "owner" ? "border-transparent text-white shadow-lift" : "border-navy-100 text-ink/50 hover:border-navy-300 hover:text-navy-700")}
                style={route === "owner" ? { background: "var(--navy)" } : undefined}>
                <I.Crown size={13} strokeWidth={2.4} /> OWNER
                <span className={cx("relative h-[16px] w-[28px] rounded-full transition-colors",
                  route === "owner" ? "bg-white/30" : "bg-navy-100")}>
                  <span className={cx("absolute top-[2px] h-[12px] w-[12px] rounded-full bg-white shadow transition-all",
                    route === "owner" ? "left-[14px]" : "left-[2px]")} />
                </span>
              </button>
            </Tip>


              <Tip side="bottom" text="212 family accounts · 96% reachable by SMS">
                <span className="hidden md:inline-flex chip"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#159A63" }} /> Hub live</span>
              </Tip>

              <div className="relative">
                <button onClick={() => setBell(b => !b)} aria-label="Notifications"
                  className="relative grid h-9 w-9 place-items-center rounded-xl text-navy-700 hover:bg-navy-50">
                  <I.Bell size={17} />
                  {notes.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full animate-pulseR" style={{ background: "#D93A2B" }} />}
                </button>
                {bell && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBell(false)} />
                    <div className="absolute right-0 top-11 z-50 w-[340px] overflow-hidden rounded-[18px] bg-white shadow-deep border border-navy-100 animate-rise">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100">
                        <span className="text-[12.5px] font-bold text-ink">Activity</span>
                        <span className="text-[11px] font-semibold text-ink/40">{notes.length} items</span>
                      </div>
                      <div className="max-h-[340px] overflow-y-auto">
                        {notes.map((n, i) => (
                          <button key={i} onClick={() => { if (n.go) go(n.go); setBell(false); }}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-navy-50/60 border-b border-navy-100 last:border-0">
                            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: n.tone + "1A", color: n.tone }}><n.icon size={14} /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12.5px] font-semibold text-ink leading-snug">{n.text}</span>
                              <span className="text-[10.5px] text-ink/40">{n.at}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => setRole(role)} className="hidden sm:flex items-center gap-2.5 rounded-xl border border-navy-100 pl-1.5 pr-3 py-1.5 hover:bg-navy-50">
                <Avatar initials={me.initials} tone={me.tone} size={28} />
                <span className="text-[12.5px] font-bold text-ink">{me.name}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>

        <footer className="border-t border-navy-100 bg-white/60 px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-ink/50">
            <span className="font-semibold text-ink/70">Beyond Limits Academic Program</span>
            <span>A program of Stamford Peace Youth Foundation, Inc.</span>
            <span>Founded 2014 · Long Ridge Road, Stamford, CT</span>
            <span className="ml-auto">Grades 4–10 · Fee-subsidised access</span>
          </div>
        </footer>
      </div>

      <Modal open={demo} onClose={() => setDemo(false)} title="About this workspace"
        sub="What is real here, and what is sample data">
        <div className="space-y-4 text-[13.5px] leading-relaxed text-ink/75">
          <p>{DEMO_NOTICE}</p>
          <div className="rounded-2xl bg-navy-50 p-4">
            <div className="eyebrow text-navy-500 mb-2">Institutional facts — sourced</div>
            <ul className="space-y-1.5 text-[13px] text-navy-700 font-medium">
              <li>· Founded 2014 by Brian Kriftcher and Andrew Sklover</li>
              <li>· 250+ enrolled students · 200+ served annually</li>
              <li>· 90% of participants eligible for discounted services</li>
              <li>· 90% of sessions held on-site · 81.6% report improved confidence · 99% parent satisfaction</li>
              <li>· Programs: Peer Tutoring, BFFS, Youth Employment, Summer Scholars, Mentoring, Enrichment</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="text-[11.5px] font-semibold text-navy-600 underline" target="_blank" rel="noreferrer" href="https://www.peaceyouthct.org/beyondlimits">peaceyouthct.org/beyondlimits</a>
              <a className="text-[11.5px] font-semibold text-navy-600 underline" target="_blank" rel="noreferrer" href="https://www.boardofreps.org/Data/Sites/43/userfiles/committees/fiscal/budget/budget_2026-2027/subs/stamford-peace-youth-fndtn-beyond-limits-academics-presentation-fy-26-27.pdf">FY26–27 program presentation</a>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function currentLabel(route: Route, groups: { items: { id: Route; label: string }[] }[]) {
  for (const g of groups) for (const it of g.items) if (it.id === route) return it.label;
  return "";
}

export function RoleSwitch({ role, setRole, compact = false }: { role: Role; setRole: (r: Role) => void; compact?: boolean }) {
  const roles: Role[] = ["ops", "tutor", "family", "student"];
  return (
    <div className={cx("flex rounded-[13px] p-1 bg-white/8 border border-white/10", compact && "scale-90 origin-left")}>
      {roles.map(r => {
        const on = role === r;
        return (
          <Tip key={r} text={ROLE_META[r].blurb}>
            <button onClick={() => setRole(r)}
              className={cx("flex-1 rounded-[10px] px-2 py-2 text-[11.5px] font-bold transition-all whitespace-nowrap",
                on ? "bg-white text-ink shadow-sm" : "text-white/55 hover:text-white")}>
              {ROLE_META[r].short}
            </button>
          </Tip>
        );
      })}
    </div>
  );
}

export function PageHead({ eyebrow, title, sub, actions, tone = "var(--navy)" }: { eyebrow?: string; title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode; tone?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="h-[26px] w-[3px] rounded-full" style={{ background: "var(--solar)" }} />
          <span className="eyebrow" style={{ color: tone }}>{eyebrow || "Beyond Limits Hub"}</span>
        </div>
        <h1 className="display mt-2.5 text-[30px] sm:text-[36px] text-ink balance">{title}</h1>
        {sub && <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink/58">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
