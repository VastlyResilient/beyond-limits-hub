import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { useNav } from "../lib/store";
import { Chip, Button, Card, Reveal, SectionTitle, Tip, cx, Drawer } from "../components/ui";

/* ============================================================================
   OWNER VIEW — Andy's supervision surface.

   Everything here is drawn from the record of the project: the New Canaan
   Diner lunch, the 5 Sept Zoom call, his four emails, and what we verified in
   the live spreadsheet and Apps Script on 7 Sept 2026.
   ========================================================================== */

const RECORD = {
  listed: 152, removed: 39, families: 113, codes: 9, testRows: 2, uncoded: 104,
  programs: [
    { name: "PA (Main)", families: 94, code: "BLA·2026·####", coded: true, note: "The comprehensive list. Never remove a family from here." },
    { name: "PA (Horizons)", families: 12, code: "BLH·2026·####", coded: true, note: "Own series today — folding into one BL series." },
    { name: "PA (SCSE)", families: 10, code: "BLS·2026·####", coded: true, note: "Has a stray 38th column holding a real code." },
    { name: "PA (Starfish)", families: 4, code: "none", coded: false, note: "No code question on the form. All four were pasted in by hand." },
    { name: "BFFS", families: 13, code: "unknown", coded: false, note: "Appears in your dashboard. Nobody has told us what it is." },
  ],
  defects: [
    { n: 1, what: "The Master has no participant code column", impact: "Even fully coded, your main view shows nothing", state: "open" },
    { n: 2, what: "The Master carries no preferred-language field", impact: "Likely needed before ParentSquare onboarding", state: "open" },
    { n: 3, what: "Starfish has no Participant Code question on its form", impact: "The script has nowhere to write", state: "open" },
    { n: 4, what: "The Starfish tab is structurally broken", impact: "Headers on row 1, pasted families on rows 2–5, the form's real header on row 10 one column across. The script only reads row 1", state: "open" },
    { n: 5, what: "Starfish appears nowhere in the Master", impact: "Those four families are invisible in your summary", state: "open" },
    { n: 6, what: "SCSE has a stray 38th column titled \u201cColumn 37\u201d", impact: "A real code is parked outside the real field — why you saw a code where we saw an empty cell", state: "open" },
    { n: 7, what: "The script does not recognise Starfish at all", impact: "Missing from its lookup table; matches none of the fallbacks", state: "open" },
    { n: 8, what: "A dangerous fallback wrote to column 37 regardless", impact: "Guessing where a child's identifier goes is how codes end up in the wrong place. Removed in v2.", state: "fixed" },
    { n: 9, what: "One of our test rows is visible in your Master", impact: "It should never have reached your view", state: "fixing" },
  ],
  decisions: [
    { q: "Rojas, Annabella — which copy survives?", detail: "Main 8 Nov 2024 and SCSE 5 Dec 2024. Same child, two records.", route: "ops-directory" },
    { q: "Lopez, Anthony — which copy survives?", detail: "Main 2 Jan 2025, Main again 4 Sep 2025, plus a Starfish row copied from the second.", route: "ops-directory" },
    { q: "Has any code been used outside the spreadsheet?", detail: "Printed, texted, written on a calendar. This gates the switch to one BL series.", route: "ops-forms" },
    { q: "What is BFFS?", detail: "Thirteen families in your dashboard under a name that appears in none of the four tabs. Every one is grade 9 or 10.", route: "ops-programs" },
    { q: "Who owns the spreadsheet and the script?", detail: "Both sit on a personal Google account today.", route: "ops-appearance" },
    { q: "Can we get ParentSquare's import format?", detail: "We shape the data to it rather than guessing and reshaping twice.", route: "ops-analytics" },
  ],
  questions: [],
};

function Status({ s }: { s: string }) {
  const map: Record<string, [string, string, string]> = {
    open: ["Open", "#DE8C00", "Not started"],
    fixing: ["In hand", "var(--navy)", "Being worked"],
    fixed: ["Fixed", "#159A63", "Done in v2"],
    done: ["Done", "#159A63", "Complete"],
    blocked: ["Blocked", "#D93A2B", "Waiting on you"],
    progress: ["In progress", "#DE8C00", "Underway"],
  };
  const [label, tone, why] = map[s] || map.open;
  return (
    <Tip text={why}>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={{ background: `${tone === "var(--navy)" ? "rgba(24,56,104,.1)" : tone}1A`, color: tone }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />{label}
      </span>
    </Tip>
  );
}

function Row({ k, v, tone, note }: { k: string; v: string; tone?: string; note?: string }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-navy-100 py-3.5 last:border-0">
      <div className="w-[190px] shrink-0 text-[12.5px] font-bold uppercase tracking-[.08em] text-ink/45">{k}</div>
      <div className="flex-1 text-[13.5px] leading-relaxed text-ink/80">{v}</div>
      {tone && <Chip tone={tone as any}>{note}</Chip>}
    </div>
  );
}

export default function Owner() {
  const { go } = useNav();
  const [openDefect, setOpenDefect] = useState<number | null>(null);
  const defect = useMemo(() => RECORD.defects.find(d => d.n === openDefect), [openDefect]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------- masthead */}
      <Reveal>
        <div className="navy-field on-dark grain relative overflow-hidden rounded-[24px] p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <Chip dark><I.Eye size={12} /> Owner view</Chip>
              <Chip dark>Supervision</Chip>
              <span className="ml-auto text-[11.5px] font-semibold text-white/45">Beyond Limits Academic Program · Stamford</span>
            </div>
            <h1 className="display mt-5 max-w-[720px] text-[30px] leading-tight text-white sm:text-[38px]">
              One number is holding up the entire ParentSquare migration.
            </h1>
            <p className="mt-4 max-w-[62ch] text-[13.5px] leading-relaxed text-white/62">
              Beyond Limits is being moved off Remind onto ParentSquare — an external deadline, not a choice. Because the
              program sits outside the district it cannot use school-assigned student numbers, so the identifier has to be
              ours. Until every family carries one, the migration cannot start. That is the whole reason this is urgent.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { k: "Families on the roster", v: String(RECORD.families), s: `down from ${RECORD.listed}` },
                { k: "Codes issued", v: String(RECORD.codes), s: `${RECORD.testRows} are our test rows` },
                { k: "Still without a code", v: String(RECORD.uncoded), s: "the migration gate" },
                { k: "Programs", v: "4 + 1", s: "BFFS unidentified" },
              ].map(t => (
                <div key={t.k} className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-[.1em] text-white/50">{t.k}</div>
                  <div className="display mt-1.5 text-[26px] tnum text-white">{t.v}</div>
                  <div className="mt-1 text-[11.5px] text-white/55">{t.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* --------------------------------------------------- build order */}
      <Reveal delay={40}>
        <Card>
          <SectionTitle eyebrow="The order we agreed" title="Build order"
            sub="You set this yourself, three times, in three conversations." />
          <div className="space-y-3">
            {[
              { n: 1, t: "Clean the family list", d: "You have deleted 39. Two families still need your decision.", s: "done" },
              { n: 2, t: "A participant code on every family", d: `${RECORD.uncoded} families have no code. This unblocks ParentSquare.`, s: "progress" },
              { n: 3, t: "The parent onboarding chatbot", d: "Waiting on your orientation slides. You asked us not to build against the draft.", s: "blocked" },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-4 rounded-2xl border border-navy-100 p-4">
                <span className="display grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-700 text-[14px] text-white">{step.n}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[14px] font-bold text-ink">{step.t}</span>
                    <Status s={step.s} />
                  </div>
                  <div className="mt-1 text-[12.5px] leading-relaxed text-ink/55">{step.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-solar-50 p-4">
            <I.Quote size={15} className="mt-0.5 shrink-0 text-solar-700" />
            <div className="text-[12.5px] leading-relaxed text-ink/70">
              <b className="text-ink">\u201cThis coding is number one… If we don't get this right, then it's not going to be efficient.
              It's going to be worse.\u201d</b>
              <span className="ml-1 text-ink/45">— 5 September Zoom call</span>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* ------------------------------------------- family records health */}
      <Reveal delay={60}>
        <Card>
          <SectionTitle eyebrow="Family records" title="Where every family stands"
            sub="A family can appear in more than one program — that is the duplicate problem, not a counting error." />
          <div className="overflow-hidden rounded-2xl border border-navy-100">
            <div className="grid grid-cols-[1.4fr_.6fr_.9fr_1fr] bg-navy-50/70 px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[.1em] text-ink/50">
              <div>Program</div><div className="text-right">Families</div><div>Code series</div><div>Status</div>
            </div>
            {RECORD.programs.map(p => (
              <div key={p.name} className="grid grid-cols-[1.4fr_.6fr_.9fr_1fr] items-center gap-2 border-t border-navy-100 px-4 py-3">
                <div>
                  <div className="text-[13.5px] font-bold text-ink">{p.name}</div>
                  <div className="mt-0.5 text-[11.5px] leading-snug text-ink/50">{p.note}</div>
                </div>
                <div className="display text-right text-[17px] tnum text-navy-700">{p.families}</div>
                <div className="mono text-[11px] text-ink/60">{p.code}</div>
                <div>{p.coded ? <Status s="fixed" /> : <Status s="open" />}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-ink/55">
            <I.Info size={13} className="text-navy-500" />
            The code series is the one decision we would rather make now, at nine codes, than at 113.
            <Tip text="An identifier that changes when a family moves program is not an identifier.">
              <span className="cursor-help font-semibold text-navy-700 underline decoration-dotted">Why one series</span>
            </Tip>
          </div>
        </Card>
      </Reveal>

      {/* ------------------------------------------------- the nine defects */}
      <Reveal delay={80}>
        <Card>
          <SectionTitle eyebrow="Verified 7 September" title="The nine defects in the live spreadsheet"
            sub="Read from the actual file and the Apps Script, not from memory. Tap any row for the impact." />
          <div className="space-y-2">
            {RECORD.defects.map(d => (
              <button key={d.n} onClick={() => setOpenDefect(d.n)}
                className="flex w-full items-start gap-4 rounded-2xl border border-navy-100 p-3.5 text-left transition-colors hover:border-navy-300 hover:bg-navy-50/40">
                <span className="mono mt-0.5 w-5 shrink-0 text-[12px] font-bold text-ink/30">{String(d.n).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-ink">{d.what}</span>
                <Status s={d.state} />
              </button>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* ---------------------------------------------- duplicate, proved */}
      <Reveal delay={100}>
        <Card>
          <SectionTitle eyebrow="The duplicate problem" title="One family, two identities — proved"
            sub="Both submissions were correct. You require a separate agreement per program. The mistake is that the system issued a second identity." />
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { src: "PA (Main) row 105", when: "3 June 2026", code: "BLA-2026-0002", phone: "203-570-8219" },
              { src: "PA (SCSE) row 16", when: "6 June 2026", code: "BLA-2026-0003", phone: "475-257-8689" },
            ].map(side => (
              <div key={side.src} className="rounded-2xl border border-navy-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-bold text-navy-700">{side.src}</span>
                  <span className="text-[11.5px] text-ink/45">{side.when}</span>
                </div>
                <div className="mt-3 space-y-2 text-[12.5px]">
                  {[["Name", "Shalauddin, Ethan"], ["Date of birth", "05/26/2013"], ["Address", "61 West Glen Drive"], ["Parent phone", side.phone]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <span className="text-ink/45">{k}</span><span className="font-semibold text-ink">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-3 border-t border-navy-100 pt-2">
                    <span className="text-ink/45">Code issued</span><span className="mono font-bold text-ink">{side.code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-navy-100 bg-navy-50/50 p-4 text-[12.5px] leading-relaxed text-ink/70">
            <b className="text-ink">The matching lesson:</b> name plus date of birth catches this. Phone alone would not have —
            the two records carry different numbers for the same parent.
          </div>
        </Card>
      </Reveal>

      {/* ------------------------------------------- decisions only Andy can make */}
      <Reveal delay={120}>
        <Card>
          <SectionTitle eyebrow="Waiting on you" title="Six decisions only you can make"
            sub="Each one blocks something downstream. Nothing here can be settled from the data alone." />
          <div className="grid gap-3 lg:grid-cols-2">
            {RECORD.decisions.map((d, i) => (
              <div key={d.q} className="rounded-2xl border border-navy-100 p-4">
                <div className="flex items-start gap-3">
                  <span className="display grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-solar-100 text-[12px] font-bold text-solar-700">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold leading-snug text-ink">{d.q}</div>
                    <div className="mt-1 text-[12px] leading-relaxed text-ink/55">{d.detail}</div>
                    <button onClick={() => go(d.route as any)}
                      className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-navy-700 hover:underline">
                      Open the screen <I.ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* --------------------------------------------- ParentSquare migration */}
      <Reveal delay={140}>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <Card>
            <SectionTitle eyebrow="ParentSquare" title="Why the codes gate the migration"
              sub="In your words, 5 September." />
            <div className="rounded-2xl border-l-[3px] border-solar-600 bg-solar-50/70 p-4 text-[13px] leading-relaxed text-ink/75">
              \u201cBy having these codes, we can use our own code to onboard people on ParentSquare… we're not using the school-
              assigned number that they might have. We have to use our own number because we're not in the district. So once we
              have these codes, it'll help us with that ParentSquare transition.\u201d
            </div>
            <div className="mt-4">
              <Row k="What's forcing it" v="Remind is being shut down and folded into ParentSquare. An external deadline — not our schedule." />
              <Row k="What it needs from us" v="One identifier per family, on every family, in a stable format." />
              <Row k="What we need from it" v="ParentSquare's import format, so we shape the data once instead of twice." />
              <Row k="Export readiness" v="A clean export view is part of the Family Records Fix — one row per family, code on every row." />
            </div>
          </Card>
          <Card className="bg-navy-950 border-navy-950">
            <div className="on-dark">
              <div className="eyebrow text-white/40">Ownership risk</div>
              <h3 className="display mt-2 text-[20px] leading-snug text-white">Your data sits on someone else's personal account</h3>
              <div className="mt-4 space-y-3 text-[12.5px] leading-relaxed text-white/60">
                <div className="flex items-start gap-2.5">
                  <I.AlertTriangle size={14} className="mt-0.5 shrink-0 text-solar" />
                  <span><b className="text-white/85">The Google Forms</b> are owned by Beyond Limits. Everything else is not.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <I.AlertTriangle size={14} className="mt-0.5 shrink-0 text-solar" />
                  <span><b className="text-white/85">The whole spreadsheet</b> — every name, birthday, home address, phone, income
                  and ethnicity — sits on <span className="mono text-white/80">maansishah@gmail.com</span>, a personal account.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <I.AlertTriangle size={14} className="mt-0.5 shrink-0 text-solar" />
                  <span><b className="text-white/85">The script that generates codes</b> runs on the same account, on RJ's own login.</span>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-white/12 bg-white/7 p-3.5 text-[12px] leading-relaxed text-white/70">
                If either account is closed or lost, Beyond Limits loses the data or the automation.
                <b className="text-white/90"> Transferring ownership does not carry the triggers over</b> — they must be recreated
                afterwards, or code generation stops silently.
              </div>
            </div>
          </Card>
        </div>
      </Reveal>

      {/* ------------------------------------------------- automations */}
      <Reveal delay={160}>
        <Card>
          <SectionTitle eyebrow="Automations on the board" title="The nudges and the chatbot"
            sub="One is ready to spec. The other is blocked until the slides land." />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-navy-100 p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "rgba(21,154,99,.1)", color: "#159A63" }}>
                  <I.BellRing size={16} /></span>
                <div>
                  <div className="text-[13.5px] font-bold text-ink">Missed-session nudge</div>
                  <div className="text-[11.5px] text-ink/45">You raised this on the call</div>
                </div>
                <Status s="progress" />
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink/60">
                Reach out to a family automatically once a learner misses a number of sessions, so nobody drifts quietly
                out of the program.
              </p>
              <div className="mt-3 rounded-xl bg-navy-50/70 p-3 text-[12px] leading-relaxed text-ink/70">
                <span className="font-bold text-ink">Open question for you:</span> how many missed sessions should trigger it,
                and should it message the guardian, the tutor, or both?
              </div>
            </div>
            <div className="rounded-2xl border border-navy-100 p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "rgba(217,58,43,.1)", color: "#D93A2B" }}>
                  <I.MessageCircle size={16} /></span>
                <div>
                  <div className="text-[13.5px] font-bold text-ink">Parent onboarding chatbot</div>
                  <div className="text-[11.5px] text-ink/45">Blocked on your orientation slides</div>
                </div>
                <Status s="blocked" />
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink/60">
                What you have asked to be true of it when it is built:
              </p>
              <div className="mt-3 space-y-2 text-[12px] text-ink/70">
                {[
                  "Something you can reword yourself on the back end, without sending us a new deck",
                  "Works as well on a phone as on a computer",
                  "An object — a calculator or a book — not a figure. You softened on this once.",
                  "Careful with children. You would rather it hands off to a person than answer freely.",
                ].map(t => (
                  <div key={t} className="flex items-start gap-2.5">
                    <I.Check size={13} strokeWidth={3} className="mt-0.5 shrink-0 text-navy-500" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* --------------------------------------------- scope and commercials */}
      <Reveal delay={180}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <SectionTitle eyebrow="Scope" title="What is in and what is not"
              sub="You have been clear about this at every step." />
            <div className="space-y-2.5">
              {[
                { ok: true, t: "Back-filling codes onto existing families", n: "On us" },
                { ok: true, t: "Standardising the code format to one series", n: "On us" },
                { ok: true, t: "Restructuring Starfish and adding its code field", n: "On us" },
                { ok: true, t: "Fixing the SCSE stray column", n: "On us" },
                { ok: true, t: "Deleting our own test rows and empty tabs", n: "On us" },
                { ok: false, t: "The Family Records Fix — your list, one row per family", n: "Paid · Project 1" },
                { ok: false, t: "The parent onboarding chatbot", n: "Paid · Project 2, blocked" },
              ].map(r => (
                <div key={r.t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                    style={r.ok ? { background: "rgba(21,154,99,.12)", color: "#159A63" } : { background: "rgba(24,56,104,.1)", color: "var(--navy)" }}>
                    {r.ok ? <I.Check size={12} strokeWidth={3} /> : <I.Circle size={8} />}
                  </span>
                  <span className="flex-1 text-[12.5px] leading-relaxed text-ink/75">{r.t}</span>
                  <span className="whitespace-nowrap text-[11px] font-bold text-ink/45">{r.n}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-navy-50/70 p-4">
              <div className="eyebrow text-navy-500">Not being built</div>
              <div className="mt-2 text-[12.5px] leading-relaxed text-ink/70">
                No chatbot yet, no custom dashboard, no grants portal, no monthly retainer — and nothing student-facing.
                Parents only, no exceptions.
              </div>
            </div>
          </Card>
          <Card>
            <SectionTitle eyebrow="How you want to work" title="Project by project, and paid"
              sub="You have said this four separate times." />
            <div className="rounded-2xl border-l-[3px] border-navy-700 bg-navy-50/60 p-4 text-[12.5px] leading-relaxed text-ink/75">
              \u201cI'm not in a position to do a monthly retainer. I'd rather do project by project for now.\u201d
              <span className="ml-1 text-ink/45">— 5 September</span>
            </div>
            <div className="mt-4">
              <Row k="Script work" v="Stays free. That was our offer and it stands." />
              <Row k="Working session" v="Paid, in person, at your office — one afternoon or evening." />
              <Row k="Deliverables" v="Fixed fee per project. No retainer, no subscription." />
              <Row k="What we need" v="A proposal you can approve before we book the visit." />
            </div>
            <div className="mt-5 rounded-2xl border border-navy-100 p-4 text-[12.5px] leading-relaxed text-ink/70">
              <b className="text-ink">Why the format decision should happen now:</b> nine codes exist today, and two of them
              are ours. Changing the series now costs an afternoon. Changing it after 113 codes have been printed, texted or
              written on a calendar is a different project.
            </div>
          </Card>
        </div>
      </Reveal>

      {/* ------------------------------------------------------- timeline */}
      <Reveal delay={200}>
        <Card>
          <SectionTitle eyebrow="How we got here" title="Timeline" />
          <div className="space-y-0">
            {[
              { d: "June 2026", t: "The participant code system is built on the Main form." },
              { d: "27 July 2026", t: "Codes added to the Horizons and SCSE forms." },
              { d: "14 Aug 2026", t: "Working lunch, New Canaan Diner. Three voice memos, about ninety minutes." },
              { d: "Late Aug 2026", t: "Your email: coding is the priority, ParentSquare is the blocker, and you offered to pay for an office session." },
              { d: "31 Aug 2026", t: "A review workbook of all 152 families goes to you." },
              { d: "5 Sep 2026", t: "Zoom call. You share your screen and walk the spreadsheet. You find the duplicate-code bug live." },
              { d: "5 Sep 2026", t: "You return the cleaned list and ask for delete-and-reassign without a second agreement." },
              { d: "6 Sep 2026", t: "The Starfish tab was manually assigned, and it needs reformatting." },
              { d: "7 Sep 2026", t: "We open the live spreadsheet and Apps Script and verify everything. Nine defects." },
              { d: "9 Sep 2026", t: "We meet." },
            ].map((e, i, arr) => (
              <div key={e.d + i} className="flex gap-4">
                <div className="flex w-[110px] shrink-0 flex-col items-end">
                  <span className="text-[11.5px] font-bold text-navy-700">{e.d}</span>
                </div>
                <div className="relative flex-1 pb-5 pl-5">
                  {i < arr.length - 1 && <span className="absolute bottom-0 left-[3px] top-2 w-px bg-navy-100" />}
                  <span className="absolute left-0 top-[5px] h-[7px] w-[7px] rounded-full bg-navy-700" />
                  <div className="text-[12.5px] leading-relaxed text-ink/70">{e.t}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* ---------------------------------------------------- the one line */}
      <Reveal delay={220}>
        <Card className="bg-navy-50/60">
          <div className="flex items-start gap-3">
            <I.FileText size={16} className="mt-0.5 shrink-0 text-navy-500" />
            <div>
              <div className="text-[13px] font-bold text-ink">The one-paragraph version</div>
              <p className="mt-1.5 max-w-[86ch] text-[12.5px] leading-relaxed text-ink/65">
                Beyond Limits runs free tutoring and mentoring for about 113 families in Stamford across four programs. You are
                being moved off Remind onto ParentSquare, and because the program is not part of the district you cannot use
                school-assigned student numbers — so you need your own code on every family, and about 104 of them do not have
                one. The chatbot waits until that back end is right. Everything else — the dashboard, the grants portal — comes
                after.
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* ------------------------------------------------------ defect sheet */}
      <Drawer open={openDefect !== null} onClose={() => setOpenDefect(null)} title={defect ? `Defect ${defect.n}` : ""}
        sub={defect ? defect.what : ""}>
        {defect && (
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Status s={defect.state} /></div>
            <div>
              <div className="eyebrow text-navy-500">Why it matters</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink/75">{defect.impact}</p>
            </div>
            <div className="rounded-2xl bg-navy-50/70 p-4 text-[12.5px] leading-relaxed text-ink/70">
              <b className="text-ink">Who this blocks:</b>{" "}
              {defect.n <= 2 ? "your own view of the roster — the summary you look at most."
                : defect.n <= 5 ? "the Starfish families, who are currently invisible in your summary."
                : defect.n === 6 ? "any read of SCSE codes, including ours and yours."
                : defect.n === 7 ? "every Starfish family getting a code at all."
                : defect.n === 8 ? "nothing now — it was removed before it wrote to a wrong cell."
                : "clean reporting for as long as it sits in your view."}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
