import React, { useState, useEffect, useRef } from "react";
import * as I from "lucide-react";
import { useApp } from "../lib/store";
import { Lockup, Wordmark, BLMark, BLLogo, SolarRule } from "../components/Brand";
import { cx, Chip, Button, Reveal, Tip, Avatar } from "../components/ui";
import { ORG, IMPACT, PROGRAMS, ENRICHMENT, SCHOLARSHIPS, SPONSORS, COMMUNITY_PARTNERS, CONTEXT_STAT, LANGUAGES, DEMO_NOTICE } from "../lib/data";

const CAPS = [
  { icon: I.Megaphone, t: "One message, every channel", d: "Send once — it lands as app push, SMS, email, voice and on the web portal. Urgent alerts escalate and confirm delivery per family.", tone: "var(--navy)" },
  { icon: I.Languages, t: "Translated, not bolted on", d: "Every message carries an English/Spanish pair with a review queue, so nothing goes out in a language nobody checked.", tone: "#0E8C8C" },
  { icon: I.CalendarDays, t: "Sessions, RSVPs and rooms", d: "Three tutoring rooms, weeknight and Saturday blocks. Families RSVP, you see demand before you staff it.", tone: "#6C4BD6" },
  { icon: I.FileSignature, t: "Agreements that stay signed", d: "Participant agreements, income verification, field-trip permission — chased automatically, signed on a phone.", tone: "#DE8C00" },
  { icon: I.Receipt, t: "Sliding scale, handled quietly", d: "Fees shown as an explicit subsidy credit. No family ever sees a full-price invoice they cannot pay.", tone: "#159A63" },
  { icon: I.TrendingUp, t: "Confidence, tracked honestly", d: "Goals, tutor notes and subject movement per learner — the thing this program actually exists to move.", tone: "#C2418F" },
  { icon: I.HeartHandshake, t: "Volunteers without the group text", d: "Shift board for front desk, snacks, chaperones and workshop greeters, with families claiming slots themselves.", tone: "var(--navy)" },
  { icon: I.BadgeCheck, t: "Youth employment records", d: "Paid peer tutors get hours, stipends and a record of their work — a first job with a paper trail.", tone: "#0E8C8C" },
];

const ROLES = [
  { id: "family", label: "For families", icon: I.Home, tone: "#6C4BD6", head: "Everything about your learner in one place", body: "The next session, what was worked on, what comes next, what still needs signing and what you actually owe — without a phone call.", bullets: ["Feed, translated into your language", "Sign forms with a finger", "See the fee with the subsidy shown", "Message the tutor directly"] },
  { id: "tutor", label: "For peer tutors", icon: I.GraduationCap, tone: "#0E8C8C", head: "A first job that runs itself", body: "Upperclassmen and college-corps tutors get their shift, their students and a two-minute note form — plus paid hours on record.", bullets: ["Today's brief and prep", "Log a note in under a minute", "See each student's goals", "Hours, stipend and history"] },
  { id: "ops", label: "For the program", icon: I.LayoutDashboard, tone: "var(--navy)", head: "Run the whole program from one console", body: "Reach, attendance, forms, sliding-scale billing, volunteer shifts and translation in a single operating picture.", bullets: ["Reach every family, verified", "Attendance intervention, early", "One ledger for every subsidy", "Translation with a review trail"] },
];

const COMPARE = [
  { need: "Built for", them: "School districts with a Student Information System", us: "A community program with no SIS at all" },
  { need: "Roster source", them: "Syncs from the district SIS", us: "Imported, invited and self-served — no SIS required" },
  { need: "Who pays", them: "Licensed to the school or district", us: "Sliding-scale families, subsidised by grants" },
  { need: "Tutors", them: "Teachers and staff accounts", us: "Peer tutors — students who are also paid employees" },
  { need: "The unit of progress", them: "Attendance and engagement", us: "Attendance and engagement, plus confidence and goals" },
  { need: "Language", them: "Translation across district languages", us: "Translation with a named human review before it sends" },
];

function useParallax() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

export default function Landing() {
  const { go } = useApp();
  const y = useParallax();
  const [role, setRole] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const R = ROLES[role];

  return (
    <div className="min-h-screen bg-paper">
      {/* ============================================================ nav */}
      <header className="sticky top-0 z-50">
        <div className={cx("transition-all duration-300", y > 24 ? "border-b border-navy-100 bg-paper/85 backdrop-blur-xl shadow-[0_1px_0_rgb(var(--c-navy-700) / .04)]" : "bg-transparent")}>
          <div className="wrap-wide flex h-[74px] items-center gap-6">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Top"><Wordmark /></button>
            <nav className="ml-auto hidden lg:flex items-center gap-1">
              {[["Why", "#why"], ["How it works", "#how"], ["Capabilities", "#caps"], ["Programs", "#programs"], ["Beyond ParentSquare", "#compare"]].map(([l, h]) => (
                <a key={l} href={h} className="rounded-xl px-3.5 py-2 text-[13px] font-semibold text-ink/60 transition-colors hover:bg-white hover:text-navy-700">{l}</a>
              ))}
            </nav>
            <div className="ml-auto lg:ml-0 flex items-center gap-2.5">
              <Button variant="ghost" size="sm" onClick={() => go("ops-command")} className="hidden sm:inline-flex">Open the Hub</Button>
              <Button variant="primary" size="sm" icon={I.ArrowRight} onClick={() => go("family-feed")}>See it as a family</Button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================== hero */}
      <section className="relative overflow-x-clip">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-56 h-[620px] w-[620px] rounded-full" style={{ background: "radial-gradient(circle,rgba(254,222,39,.34),transparent 62%)", transform: `translateY(${y * 0.06}px)` }} />
          <div className="absolute -left-56 top-24 h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(circle,rgb(var(--c-navy-700) / .12),transparent 65%)" }} />
          <div className="absolute inset-0 ruled opacity-[.5]" />
        </div>

        <div className="wrap-wide relative grid gap-14 pb-20 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
          <div className="max-w-[620px]">
            <Reveal>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-navy-100 bg-white px-3 py-1.5 shadow-lift">
                <BLMark size={20} radius={6} />
                <span className="text-[11.5px] font-bold tracking-tight text-navy-700">A program of {ORG.parent.replace(", Inc.", "")}</span>
                <span className="text-[11.5px] font-semibold text-ink/35">Est. {ORG.founded}</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display mt-6 text-[46px] leading-[.98] sm:text-[62px] lg:text-[68px] text-ink balance">
                The family engagement platform {ORG.short} <span className="relative inline-block">
                  <span className="relative z-10">needed to exist</span>
                  <span aria-hidden className="absolute inset-x-0 bottom-[.1em] z-0 h-[.34em] rounded-sm" style={{ background: "var(--solar)" }} />
                </span>.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-6 text-[16.5px] leading-relaxed text-ink/62 max-w-[560px]">
                {ORG.short} runs on relationships: a peer tutor, a guardian, a room on Long Ridge Road.
                The Hub puts that whole network in one place — messages that actually arrive, translated;
                sessions and RSVPs; agreements signed on a phone; fees shown with the subsidy already applied;
                and confidence you can watch move.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" variant="primary" icon={I.Play} onClick={() => go("ops-command")}>Enter the Program console</Button>
                <Button size="lg" variant="ghost" icon={I.Users} onClick={() => go("family-feed")}>Open the family view</Button>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
                {[["250+", "learners enrolled"], ["90%", "on a discounted fee"], ["81.6%", "report more confidence"], ["99%", "parent satisfaction"]].map(([n, l]) => (
                  <div key={l} className="flex items-baseline gap-2">
                    <span className="display text-[22px] tnum text-navy-700">{n}</span>
                    <span className="text-[12px] font-semibold text-ink/45">{l}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10.5px] text-ink/35">Figures published by Beyond Limits in their own program materials.</p>
            </Reveal>
          </div>

          {/* live product peep */}
          <Reveal delay={140} className="relative">
            <div className="relative mx-auto max-w-[520px]">
              <div className="card overflow-hidden shadow-deep" style={{ transform: `translateY(${Math.min(y * .03, 22)}px)` }}>
                <div className="flex items-center gap-2 border-b border-navy-100 bg-paper-200/60 px-4 py-3">
                  <span className="flex gap-1.5">
                    {["#D93A2B", "var(--solar)", "#159A63"].map(c => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
                  </span>
                  <span className="mx-auto text-[11px] font-semibold text-ink/45">Beyond Limits Hub · Program Ops</span>
                </div>
                <div className="bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials="AS" tone="navy" size={34} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-ink">Andy Sklover</div>
                      <div className="text-[10.5px] text-ink/45">Drafting · All Families · 212 recipients</div>
                    </div>
                    <Chip tone="red" className="ml-auto">Urgent</Chip>
                  </div>
                  <div className="mt-3.5 rounded-xl border border-navy-100 bg-paper/60 p-3">
                    <div className="eyebrow text-navy-500 mb-1.5">Weather closure</div>
                    <p className="text-[12.5px] leading-relaxed text-ink/75">
                      Beyond Limits is closed this afternoon due to the winter weather advisory. All sessions are cancelled and will be rescheduled.
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[["App push", "96%"], ["SMS", "99%"], ["Voice", "71%"], ["Email", "88%"]].map(([c, r]) => (
                      <div key={c} className="flex items-center justify-between rounded-lg bg-navy-50 px-2.5 py-2">
                        <span className="text-[10.5px] font-bold text-navy-700">{c}</span>
                        <span className="text-[10.5px] font-bold tnum text-ink/50">{r}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-solar-50 px-3 py-2.5">
                    <I.Languages size={14} className="text-solar-700" />
                    <span className="text-[11px] font-semibold text-ink/70">Spanish translation attached · reviewed by staff</span>
                  </div>
                  <div className="mt-3.5 flex gap-2">
                    <span className="btn btn-primary flex-1 justify-center text-[12.5px] py-2">Dispatch to 212</span>
                    <span className="btn btn-ghost text-[12.5px] py-2 px-3">Schedule</span>
                  </div>
                </div>
              </div>

              <div className="card absolute -bottom-7 -left-5 w-[232px] p-3.5 shadow-deep">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "#159A631A", color: "#159A63" }}><I.Check size={14} strokeWidth={3} /></span>
                  <span className="text-[11px] font-bold text-ink">Delivered to 209 of 212</span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-navy-50"><div className="h-full w-[98%] rounded-full" style={{ background: "#159A63" }} /></div>
                <div className="mt-2 text-[10.5px] font-semibold text-ink/45">3 by voice call in progress</div>
              </div>

              <div className="card absolute -right-4 -top-5 w-[196px] p-3.5 shadow-lift">
                <div className="eyebrow text-navy-500">Saturday load</div>
                <div className="mt-1 flex items-baseline gap-1.5"><span className="display text-[24px] tnum text-ink">16/16</span><span className="text-[11px] font-semibold text-ink/45">slots</span></div>
                <div className="mt-2 text-[10.5px] font-semibold" style={{ color: "#DE8C00" }}>Add a tutor? Demand is ahead.</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================= the gap (navy) */}
      <section id="why" className="navy-field on-dark grain relative overflow-x-clip">
        <div className="wrap-wide relative grid gap-12 py-20 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <div className="eyebrow text-solar">Why this exists</div>
            <div className="display mt-4 text-[74px] leading-[.92] text-white sm:text-[92px] tnum">{CONTEXT_STAT.n}</div>
            <div className="mt-4 max-w-[380px] text-[14.5px] leading-relaxed text-white/62">{CONTEXT_STAT.text}</div>
            <div className="mt-4 text-[11.5px] font-semibold text-white/40">Source: {CONTEXT_STAT.src}</div>
          </Reveal>
          <Reveal delay={100} className="lg:pt-6">
            <SolarRule w={70} />
            <h2 className="display mt-6 text-[32px] leading-tight text-white sm:text-[40px] balance">
              A gap that big cannot be closed by tutoring alone — it is closed by the whole support system around a learner staying connected.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/65">
              Every year {ORG.short} builds that system by hand: phone calls, group texts, paper forms, a spreadsheet of who has paid what.
              The relationships are the program. The admin is what gets in the way.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {ORG.values.map(v => (
                <div key={v.k} className="glass-dark p-5">
                  <div className="display text-[15.5px] text-solar">{v.k}</div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">{v.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================== impact (light) */}
      <section className="bg-white">
        <div className="wrap-wide py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="eyebrow text-navy-500">The program, in numbers</div>
                <h2 className="display mt-3 text-[34px] text-ink sm:text-[42px]">Twelve years of proof, not promises.</h2>
              </div>
              <p className="max-w-[420px] text-[13.5px] leading-relaxed text-ink/55">
                Founded in {ORG.founded} by {ORG.founders.join(" and ")}, {ORG.short} serves {ORG.grades.toLowerCase()} across
                Stamford and lower Fairfield County from a centre on {ORG.hq}.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {IMPACT.map((m, i) => (
              <Reveal key={m.label} delay={i * 70}>
                <div className="group relative pt-6">
                  <span aria-hidden className="absolute left-0 top-0 h-[3px] w-9 rounded-full transition-all duration-500 group-hover:w-16" style={{ background: "var(--solar)" }} />
                  <div className="display text-[44px] leading-none tnum text-ink">{m.n}</div>
                  <div className="mt-3 text-[13.5px] font-bold leading-snug text-navy-700">{m.label}</div>
                  <div className="mt-1.5 text-[11.5px] leading-snug text-ink/42">{m.note}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== roles (tabs) */}
      <section id="how" className="bg-paper">
        <div className="wrap-wide py-20">
          <Reveal>
            <div className="eyebrow text-navy-500">One system, four surfaces</div>
            <h2 className="display mt-3 max-w-[760px] text-[34px] leading-tight text-ink sm:text-[42px] balance">
              The same program, shown to each person the way they actually need to see it.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {ROLES.map((r, i) => (
              <button key={r.id} onClick={() => setRole(i)}
                className={cx("group relative overflow-hidden rounded-[20px] border p-5 text-left transition-all duration-300",
                  role === i ? "border-transparent bg-white shadow-deep" : "border-navy-100 bg-white/55 hover:bg-white")}>
                <span className="absolute inset-x-0 top-0 h-[3px] transition-transform duration-300" style={{ background: r.tone, transform: role === i ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left" }} />
                <span className="grid h-11 w-11 place-items-center rounded-2xl mb-4" style={{ background: r.tone + "14", color: r.tone }}><r.icon size={20} strokeWidth={1.9} /></span>
                <div className="display text-[19px] text-ink">{r.label}</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/55">{r.head}</p>
              </button>
            ))}
          </div>

          <Reveal delay={80}>
            <div className="mt-4 card overflow-hidden">
              <div className="grid lg:grid-cols-[1.1fr_.9fr]">
                <div className="p-8 sm:p-10">
                  <Chip tone={R.id === "ops" ? "navy" : R.id === "tutor" ? "teal" : "violet"}>{R.label}</Chip>
                  <h3 className="display mt-5 text-[27px] leading-tight text-ink sm:text-[31px] balance">{R.head}</h3>
                  <p className="mt-4 max-w-[520px] text-[14.5px] leading-relaxed text-ink/60">{R.body}</p>
                  <ul className="mt-7 grid gap-3 sm:grid-cols-2 max-w-[560px]">
                    {R.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full" style={{ background: R.tone + "18", color: R.tone }}><I.Check size={11} strokeWidth={3.4} /></span>
                        <span className="text-[13px] font-semibold text-ink/72">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8" variant="primary" icon={I.ArrowRight}
                    onClick={() => go(R.id === "family" ? "family-feed" : R.id === "tutor" ? "tutor-today" : "ops-command")}>
                    Open the {R.label.replace("For ", "")} view
                  </Button>
                </div>
                <div className="relative border-t border-navy-100 bg-paper-200/50 p-8 sm:p-10 lg:border-l lg:border-t-0">
                  <div className="eyebrow text-navy-500 mb-4">What it looks like</div>
                  <div className="space-y-3">
                    {ROLE_PEEKS[R.id].map((p, i) => (
                      <div key={i} className="card-flat flex items-start gap-3 bg-white p-3.5 shadow-lift">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: R.tone + "14", color: R.tone }}><p.icon size={15} strokeWidth={2} /></span>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-bold text-ink">{p.t}</div>
                          <div className="mt-0.5 text-[11.5px] leading-snug text-ink/50">{p.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================== capabilities bento */}
      <section id="caps" className="bg-white">
        <div className="wrap-wide py-20">
          <Reveal>
            <div className="eyebrow text-navy-500">Capabilities</div>
            <h2 className="display mt-3 max-w-[720px] text-[34px] leading-tight text-ink sm:text-[42px] balance">
              Eight things that stop being someone's evening.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAPS.map((c, i) => (
              <Reveal key={c.t} delay={i * 55}>
                <div className="group h-full rounded-[20px] border border-navy-100 bg-paper/45 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-white hover:shadow-deep">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105" style={{ background: c.tone + "12", color: c.tone }}>
                      <c.icon size={18} strokeWidth={2} />
                    </span>
                    <span className="mono text-[10px] font-bold text-ink/22">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="display mt-4 text-[16px] leading-snug text-ink">{c.t}</div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink/55">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ compare (honest table) */}
      <section id="compare" className="bg-paper">
        <div className="wrap-wide py-20">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <div className="eyebrow text-navy-500">Why not just use ParentSquare</div>
                <h2 className="display mt-3 text-[34px] leading-tight text-ink sm:text-[40px] balance">
                  ParentSquare is a good product for a school district. {ORG.short} is not a district.
                </h2>
                <p className="mt-5 text-[14.5px] leading-relaxed text-ink/60">
                  It is sold to schools and syncs with their Student Information System. A community program with no SIS,
                  no enrolment office, peer tutors who are themselves students, and a sliding-scale fee covered by grants
                  falls outside the shape it was built for — which is exactly why Andy could not adopt it.
                </p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-ink/60">
                  The Hub keeps everything a district tool does well and rebuilds the parts that assume a school exists.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  <Chip tone="navy"><I.Building2 size={12} /> No SIS required</Chip>
                  <Chip tone="solar"><I.Receipt size={12} /> Sliding-scale native</Chip>
                  <Chip tone="teal"><I.GraduationCap size={12} /> Peer-tutor accounts</Chip>
                  <Chip tone="violet"><I.Target size={12} /> Confidence tracked</Chip>
                </div>
              </div>

              <Reveal delay={80}>
                <div className="card overflow-hidden">
                  <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-navy-100 bg-paper-200/50">
                    {["", "A district platform", ORG.short + " Hub"].map((h, i) => (
                      <div key={i} className={cx("px-4 py-3.5 text-[11px] font-bold uppercase tracking-[.09em]", i === 2 ? "bg-solar text-ink" : "text-ink/45")}>{h}</div>
                    ))}
                  </div>
                  {COMPARE.map((row, i) => (
                    <div key={row.need} className={cx("grid grid-cols-[1.1fr_1fr_1fr]", i % 2 ? "bg-paper/40" : "bg-white")}>
                      <div className="border-r border-navy-100 px-4 py-4 text-[12.5px] font-bold text-navy-700">{row.need}</div>
                      <div className="border-r border-navy-100 px-4 py-4 text-[12.5px] leading-snug text-ink/50">{row.them}</div>
                      <div className="px-4 py-4 text-[12.5px] font-semibold leading-snug text-ink/80">{row.us}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-ink/35">
                  Describing a generic district platform's shape, on the basis of publicly available product information — not a critique of any vendor's quality.
                </p>
              </Reveal>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================= programs rail */}
      <section id="programs" className="navy-field relative on-dark grain">
        <div className="wrap-wide py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="eyebrow text-solar">What the Hub runs</div>
                <h2 className="display mt-3 max-w-[560px] text-[32px] leading-tight text-white sm:text-[40px]">
                  Six programs, one operating picture.
                </h2>
              </div>
              <div className="flex gap-2">
                <a href="#caps" className="btn btn-dark text-[12.5px] py-2"><I.Layers size={14} /> Capabilities</a>
              </div>
            </div>
          </Reveal>
          <div className="mt-11">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PROGRAMS.map((p, i) => (
                <Reveal key={p.id} delay={i * 55}>
                  <div className="glass-dark w-full p-6">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "rgba(254,222,39,.16)", color: "var(--solar)" }}><I.BookOpen size={19} strokeWidth={1.9} /></span>
                      <span className="mono text-[10px] font-bold text-white/25">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="display mt-5 text-[18px] leading-snug text-white">{p.name}</div>
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/60">{p.blurb}</p>
                    <div className="mt-4 border-t border-white/10 pt-4 text-[11.5px] leading-relaxed text-white/42">{p.detail}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-2">
            <Reveal>
              <div className="eyebrow text-white/45">Enrichment on the calendar</div>
              <div className="mt-4 space-y-2.5">
                {ENRICHMENT.map(e => {
                  const pct = Math.round((e.filled / e.seats) * 100);
                  return (
                    <div key={e.name} className="flex items-center gap-4">
                      <span className="w-[190px] shrink-0 text-[12.5px] font-semibold text-white/85">{e.name}</span>
                      <span className="hidden sm:block w-[150px] shrink-0 text-[11.5px] text-white/40">{e.when}</span>
                      <span className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--solar)" : "var(--navy-300)" }} />
                      </span>
                      <span className="w-[62px] shrink-0 text-right text-[11.5px] font-bold tnum text-white/70">{e.filled}/{e.seats}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="eyebrow text-white/45">Where it happens</div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-white/60">
                Dedicated tutoring rooms with Chromebooks and reference books, a family lounge with Wi-Fi,
                and a kitchen with water and snacks — open while sessions run.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[["Rooms", "A · B · C"], ["Weeknights", "4:00 – 6:45 PM"], ["Saturdays", "10:00 AM – 2:15 PM"], ["Chromebooks", "On site"], ["Family lounge", "Wi-Fi · snacks"], ["Languages", "5 in use"]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[.1em] text-white/38">{k}</div>
                    <div className="mt-1 text-[12.5px] font-bold text-white">{v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================ equity / language */}
      <section className="bg-white">
        <div className="wrap-wide py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <div className="eyebrow text-navy-500">Reaching every family</div>
              <h2 className="display mt-3 text-[32px] leading-tight text-ink sm:text-[38px] balance">
                A message only counts if it arrives, in a language someone reads.
              </h2>
              <p className="mt-5 text-[14.5px] leading-relaxed text-ink/60">
                Reach is tracked per channel and per family — not estimated. Where a family cannot be reached digitally,
                the Hub queues a voice call so nobody quietly drops out of the program's view.
              </p>
              <div className="mt-8 space-y-4">
                {LANGUAGES.map(l => (
                  <div key={l.code} className="flex items-center gap-4">
                    <span className="w-[130px] shrink-0 text-[13px] font-bold text-ink">{l.label}</span>
                    <span className="flex-1 h-2 rounded-full bg-navy-50 overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${(l.reach / 212) * 100}%`, background: l.code === "en" ? "var(--navy)" : l.code === "es" ? "#0E8C8C" : "var(--navy-300)" }} />
                    </span>
                    <span className="w-[86px] shrink-0 text-right text-[11.5px] font-semibold text-ink/50">{l.families} families</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="rounded-[22px] border border-navy-100 bg-paper/50 p-7">
                <div className="eyebrow text-navy-500">Scholarships the Hub administers</div>
                <div className="mt-5 space-y-4">
                  {SCHOLARSHIPS.map(s => (
                    <div key={s.name} className="card-flat bg-white p-5">
                      <div className="display text-[16.5px] text-ink">{s.name}</div>
                      <div className="mt-1 text-[11.5px] font-semibold text-navy-500">{s.type} · {s.who}</div>
                      <ul className="mt-3 space-y-1.5">
                        {s.awarded.map(a => <li key={a} className="flex items-start gap-2 text-[12.5px] text-ink/65"><I.Award size={13} className="mt-0.5 shrink-0 text-solar-700" />{a}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-navy-100 pt-5">
                  <div className="eyebrow text-ink/40">Funded and partnered by</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SPONSORS.map(s => <Chip key={s.name} tone="solar">{s.name}</Chip>)}
                    {COMMUNITY_PARTNERS.map(p => <Chip key={p} tone="navy">{p}</Chip>)}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================== trust + faq */}
      <section className="bg-paper">
        <div className="wrap-wide py-20">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
            <Reveal>
              <div className="eyebrow text-navy-500">How it stays safe</div>
              <h2 className="display mt-3 text-[30px] leading-tight text-ink sm:text-[36px] balance">
                Built around minors, so the defaults are cautious.
              </h2>
              <div className="mt-7 space-y-3.5">
                {[
                  [I.EyeOff, "Family contact details are never visible to other families — staff and tutors only, per role."],
                  [I.ShieldCheck, "Tutors see the students they are paired with and nothing more."],
                  [I.History, "Every send, signature and payment lands in an audit trail."],
                  [I.Lock, "Nobody outside the program can be messaged from the Hub."],
                ].map(([Icon, t]: any, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-navy-700 shadow-lift"><Icon size={16} strokeWidth={2} /></span>
                    <p className="pt-2 text-[13px] leading-relaxed text-ink/62">{t}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="eyebrow text-navy-500">Straight answers</div>
              <div className="mt-5 space-y-3">
                {FAQ.map((f, i) => (
                  <div key={f.q} className="card-flat overflow-hidden bg-white">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                      <span className="display flex-1 text-[15.5px] leading-snug text-ink">{f.q}</span>
                      <I.Plus size={16} className={cx("shrink-0 text-navy-500 transition-transform duration-300", openFaq === i && "rotate-[135deg]")} />
                    </button>
                    <div className={cx("grid transition-all duration-300", openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-[13px] leading-relaxed text-ink/60">{f.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================ CTA */}
      <section className="relative overflow-x-clip" style={{ background: "var(--solar)" }}>
        <div aria-hidden className="absolute inset-0 ruled opacity-40" />
        <div className="wrap-wide relative py-20 text-center">
          <Reveal>
            <BLMark size={54} radius={16} />
            <h2 className="display mx-auto mt-7 max-w-[760px] text-[36px] leading-[1.02] text-ink sm:text-[50px] balance">
              One session, one relationship, one student at a time — at the scale of a real program.
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-relaxed text-ink/70">
              Open any of the four surfaces and click around. Everything is live: dispatch a message, sign a form,
              move a session, watch a learner's confidence move with it.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="primary" icon={I.LayoutDashboard} onClick={() => go("ops-command")}>Program console</Button>
              <Button size="lg" variant="ghost" icon={I.Home} onClick={() => go("family-feed")}>Family view</Button>
              <Button size="lg" variant="ghost" icon={I.GraduationCap} onClick={() => go("tutor-today")}>Tutor view</Button>
              <Button size="lg" variant="ghost" icon={I.Target} onClick={() => go("student-sessions")}>Student view</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================= footer */}
      <footer className="navy-field relative on-dark grain">
        <div className="wrap-wide relative py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <Lockup dark />
              <p className="mt-5 max-w-[380px] text-[12.5px] leading-relaxed text-white/55">{ORG.mission}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Chip dark>Est. {ORG.founded}</Chip>
                <Chip dark>{ORG.hq}</Chip>
                <Chip dark>{ORG.grades}</Chip>
              </div>
            </div>
            <div>
              <div className="eyebrow text-white/40">Programs</div>
              <ul className="mt-4 space-y-2">
                {PROGRAMS.map(p => <li key={p.id} className="text-[12.5px] text-white/60">{p.name}</li>)}
              </ul>
            </div>
            <div>
              <div className="eyebrow text-white/40">Sources & the original site</div>
              <ul className="mt-4 space-y-2.5">
                <li><a href="https://www.peaceyouthct.org/beyondlimits" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/75 hover:text-solar">Beyond Limits Academics <I.ExternalLink size={12} className="opacity-50" /></a></li>
                <li><a href="https://www.peaceyouthct.org/" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/75 hover:text-solar">Stamford Peace Youth Foundation <I.ExternalLink size={12} className="opacity-50" /></a></li>
                <li><a href="https://www.boardofreps.org/Data/Sites/43/userfiles/committees/fiscal/budget/budget_2026-2027/subs/stamford-peace-youth-fndtn-beyond-limits-academics-presentation-fy-26-27.pdf" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/75 hover:text-solar">FY26–27 program presentation <I.ExternalLink size={12} className="opacity-50" /></a></li>
              </ul>
              <p className="mt-5 text-[11px] leading-relaxed text-white/35">
                Institutional figures and program names are taken from Beyond Limits' own published materials.
                {ORG.short} Hub is an independently built platform prototype; people, sessions and messages shown are sample data.
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[11px] text-white/35">
            <span>© {new Date().getFullYear()} {ORG.short} Hub prototype</span>
            <span>A program of {ORG.parent}</span>
            <span className="ml-auto flex items-center gap-2"><I.ShieldCheck size={12} /> Safeguarding-first defaults</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const ROLE_PEEKS: Record<string, { icon: any; t: string; d: string }[]> = {
  family: [
    { icon: I.Megaphone, t: "Tomorrow: session at 4:00 PM", d: "Room A · Marcus D. · Algebra I" },
    { icon: I.FileSignature, t: "2 forms need you", d: "Income verification due Nov 14" },
    { icon: I.Receipt, t: "November: $9.00", d: "$81.00 covered by the sliding scale" },
    { icon: I.Languages, t: "Ver en Español", d: "Every message has a reviewed translation" },
  ],
  tutor: [
    { icon: I.Clock, t: "Next: 4:00 PM · Amara R.", d: "Algebra I · graphing slope-intercept form" },
    { icon: I.CheckCircle2, t: "3 of 5 sessions done", d: "Two notes still to log" },
    { icon: I.PenLine, t: "Log a note in ~40 seconds", d: "Templates for progress, blockers, wins" },
    { icon: I.Wallet, t: "18 hours this month", d: "Paid through Youth Employment" },
  ],
  ops: [
    { icon: I.Radio, t: "209 of 212 reached", d: "3 queued for a voice call" },
    { icon: I.AlertTriangle, t: "Tariq H. missed two sessions", d: "Suggested: attendance follow-up" },
    { icon: I.CalendarDays, t: "Saturday is full", d: "16 of 16 slots · demand ahead of staffing" },
    { icon: I.Receipt, t: "$1,240 subsidy issued", d: "Two invoices outstanding" },
  ],
};

const FAQ = [
  { q: "Does this replace our Student Information System?", a: "It replaces the need for one. Beyond Limits has no SIS, so the Hub imports a roster, invites families, and keeps its own record of sessions, goals, agreements and fees — nothing to sync, nothing to license per student." },
  { q: "How do sliding-scale fees work without embarrassing anyone?", a: "The subsidy appears as an explicit credit line on the invoice, alongside the standard rate. Families see exactly what the program is covering. Program staff see the aggregate subsidy so they can report it to funders." },
  { q: "Our tutors are students. Is that safe here?", a: "Tutors sign in with their own account and see only the learners they are paired with. Guardian contact details are not exposed to tutors by default, and every reply is retained in the conversation record." },
  { q: "What happens when a family cannot be reached at all?", a: "Reach is tracked per channel and per family. If push and SMS do not land, the Hub queues a voice call and flags the family in the Program console so a person follows up." },
  { q: "Can we send in Spanish without a translator?", a: "Every message is translated automatically and then held in a review queue where a staff member approves or flags it before it is sent in that language. The translated copy is stored alongside the original." },
  { q: "Is the Hub a real, running system?", a: "This is a working platform prototype: every screen is interactive and state really changes. Institutional facts come from Beyond Limits' published materials; individual people, sessions and messages are sample data." },
];
