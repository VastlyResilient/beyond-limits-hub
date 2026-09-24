import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, Tabs, Tip, useToast, Bar, Select, Ring } from "../../components/ui";
import { HBars, Spark } from "../../components/charts";
import { InfoButton } from "../../components/InfoButton";
import { ALERT_TEMPLATES, LANGUAGES, CHANNEL_FIT, REACH_BY_GROUP, STUDENTS, TUTORS, TONE, ORG } from "../../lib/data";

type ChId = "app" | "sms" | "email" | "voice";

const CHANNELS: { id: ChId; label: string; icon: any; reach: number; limit: number; warn: string; tone: string }[] = [
  { id: "app",   label: "App push", icon: I.Smartphone,    reach: 96, limit: 400, warn: "Best for day-to-day", tone: "var(--navy)" },
  { id: "sms",   label: "SMS",      icon: I.MessageSquare, reach: 99, limit: 160, warn: "Trims at 160 characters", tone: "var(--solar-600)" },
  { id: "email", label: "Email",    icon: I.Mail,          reach: 88, limit: 1200, warn: "Good for forms", tone: "#0E8C8C" },
  { id: "voice", label: "Voice call", icon: I.PhoneCall,   reach: 71, limit: 320, warn: "Used for closures", tone: "#6C4BD6" },
];

const AUDIENCES = [
  { id: "all", label: "All families", count: 212, note: "Every enrolled learner's guardian", icon: I.Users },
  { id: "g46", label: "Grades 4–6", count: 46, note: "Elementary + bridge cohort", icon: I.Baby },
  { id: "g78", label: "Grades 7–8", count: 38, note: "Middle school", icon: I.Backpack },
  { id: "g910", label: "Grades 9–10", count: 27, note: "High school", icon: I.GraduationCap },
  { id: "ecs", label: "ECS scholars", count: 7, note: "Stamford High Early College Studies", icon: I.Compass },
  { id: "tutors", label: "Peer tutors", count: 6, note: "Paid + volunteer tutors", icon: I.BadgeCheck },
  { id: "atrisk", label: "Attendance watch-list", count: 2, note: "Missed 2+ sessions this month", icon: I.AlertTriangle },
  { id: "sat", label: "Saturday families", count: 31, note: "Sessions on Saturdays", icon: I.Sun },
];

const VARS = ["{student}", "{time}", "{room}", "{tutor}", "{workshop}", "{seats}", "{when}"];

export default function OpsComposer() {
  const { setDispatched, dispatched, me } = useApp();
  const toast = useToast();

  const [aud, setAud] = useState<string[]>(["all"]);
  const [ch, setCh] = useState<ChId[]>(["app", "sms"]);
  const [urgent, setUrgent] = useState(false);
  const [when, setWhen] = useState("now");
  const [subject, setSubject] = useState("Beyond Limits · schedule update");
  const [body, setBody] = useState("Reminder: your student has a tutoring session today at 4:00 PM in Room A with Marcus D. The family lounge is open — water and snacks are available.");
  const [esBody, setEsBody] = useState("Recordatorio: su estudiante tiene una sesión de tutoría hoy a las 4:00 PM en el Salón A con Marcus D. La sala familiar está abierta — hay agua y refrigerios disponibles.");
  const [esReviewed, setEsReviewed] = useState(true);
  const [sendEs, setSendEs] = useState(true);
  const [mounted, setMounted] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<null | { reach: number; channels: string[]; aud: string[]; texts: number; at: string; urgent: boolean; name: string }>(null);

  const recipients = useMemo(() => AUDIENCES.filter(a => aud.includes(a.id)).reduce((acc, a) => acc + a.count, 0), [aud]);
  const smsLen = body.length;
  const overSms = ch.includes("sms") && smsLen > 160;

  const projections = useMemo(() => CHANNELS.filter(c => ch.includes(c.id)).map(c => ({
    ...c, delivered: Math.round((recipients * c.reach) / 100),
  })), [ch, recipients]);

  const worstReach = projections.length ? Math.min(...projections.map(p => p.reach)) : 0;
  const hardToReach = Math.round(recipients * (1 - worstReach / 100));

  const toggle = <T,>(list: T[], v: T, set: (x: T[]) => void) =>
    set(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

  function dispatch() {
    if (!recipients) { toast("Pick at least one audience", "red"); return; }
    if (!ch.length) { toast("Pick at least one channel", "red"); return; }
    if (!body.trim()) { toast("Write a message first", "red"); return; }
    if (sendEs && !esReviewed) { toast("Spanish copy still needs a review", "red"); return; }
    const name = subject.replace(/^Beyond Limits ·\s*/, "");
    const rec = {
      reach: Math.round((recipients * Math.max(...projections.map(p => p.reach))) / 100),
      channels: ch.map(c => CHANNELS.find(x => x.id === c)!.label),
      aud: AUDIENCES.filter(a => aud.includes(a.id)).map(a => a.label),
      texts: overSms ? Math.ceil(recipients / 2) : Math.ceil(recipients * 1.6),
      at: "Just now", urgent, name,
    };
    setReceipt(rec);
    setDispatched(d => [{ id: "d" + Date.now(), name, at: "Just now", reach: rec.reach, channels: rec.channels, urgent }, ...d]);
    toast(`Dispatched to ${rec.reach} recipients`, urgent ? "red" : "green");
  }

  if (receipt) {
    return (
      <>
        <PageHead eyebrow="Message sent" title="Dispatch receipt" sub="What left the building, to whom, on which channel — and where it needs a human follow-up."
          actions={<Button variant="primary" icon={I.PenLine} onClick={() => setReceipt(null)}>Write another</Button>} />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <Card>
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: (receipt.urgent ? TONE.red.dot : TONE.green.dot) + "16", color: receipt.urgent ? TONE.red.dot : TONE.green.dot }}>
                <I.Send size={20} strokeWidth={2.2} />
              </span>
              <div>
                <h3 className="display text-[22px]">{receipt.name}</h3>
                <p className="mt-1 text-[13px] text-ink/55">Sent by {me.name} · {receipt.at}</p>
              </div>
              {receipt.urgent && <Chip tone="red" className="ml-auto">Urgent</Chip>}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Confirmed", v: `${receipt.reach}`, s: `of ${recipients} recipients`, tone: TONE.green.dot },
                { k: "Channels", v: `${receipt.channels.length}`, s: receipt.channels.join(" · "), tone: "var(--navy)" },
                { k: "Texts", v: `${receipt.texts}`, s: "segments billed", tone: "var(--solar-600)" },
                { k: "Needs a person", v: `${hardToReach}`, s: "queued for a call", tone: TONE.amber.dot },
              ].map(t => (
                <div key={t.k} className="rounded-2xl border border-navy-100 bg-paper/60 px-4 py-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">{t.k}</div>
                  <div className="display mt-1.5 text-[24px] tnum" style={{ color: t.tone }}>{t.v}</div>
                  <div className="mt-0.5 text-[10.5px] leading-snug text-ink/45">{t.s}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 hair" />
            <div className="mt-5 space-y-4">
              <div className="eyebrow text-navy-500">Delivery by channel</div>
              {projections.map(p => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: p.tone + "16", color: p.tone }}><p.icon size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[12.5px] font-bold text-ink"><span>{p.label}</span><span className="tnum text-ink/50">{p.delivered}/{recipients}</span></div>
                    <div className="mt-1.5"><Bar value={p.reach} tone={p.tone} h={7} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="eyebrow text-navy-500">Audiences reached</div>
              <div className="mt-4 space-y-2.5">
                {receipt.aud.map(a => (
                  <div key={a} className="flex items-center gap-3 rounded-xl bg-paper/70 border border-navy-100 px-3.5 py-2.5">
                    <I.Check size={14} className="text-signal-green" strokeWidth={3} />
                    <span className="text-[12.5px] font-semibold text-ink/75">{a}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="!bg-solar-50 !border-solar-100">
              <div className="flex items-start gap-3">
                <I.Languages size={17} className="mt-0.5 shrink-0 text-solar-700" />
                <div>
                  <div className="text-[13px] font-bold text-ink">Spanish copy went out with it</div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink/65">
                    {sendEs ? "Reviewed by staff before sending. The pair is stored against this message." : "Spanish was left off this send — families who prefer Spanish fall back to English."}
                  </p>
                  {!sendEs && <Button size="sm" variant="ghost" className="mt-3" onClick={() => { setSendEs(true); toast("Spanish added to the next send"); setReceipt(null); }}>Add Spanish</Button>}
                </div>
              </div>
            </Card>
            <Card>
              <div className="eyebrow text-navy-500">This term</div>
              <div className="mt-3 space-y-2">
                {dispatched.slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center gap-3 text-[12px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.urgent ? TONE.red.dot : "var(--navy)" }} />
                    <span className="flex-1 truncate font-semibold text-ink/70">{d.name}</span>
                    <span className="tnum text-ink/40">{d.reach}</span>
                  </div>
                ))}
                {!dispatched.length && <p className="text-[12px] text-ink/45">No dispatches yet this session.</p>}
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Reach"
        title="Posts & Alerts"
        sub="One message, every channel the family actually uses — with the Spanish copy reviewed before it leaves, not after."
        actions={
          <>
            <Chip tone={urgent ? "red" : "navy"}>{urgent ? "Urgent alert" : "Standard notice"}</Chip>
            <Button variant="primary" icon={I.Send} onClick={dispatch} disabled={!recipients || !ch.length}>Dispatch to {recipients}</Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
        {/* ------------------------------------------------------- left rail */}
        <div className="min-w-0 space-y-4">
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-navy-100">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink">Audience</span>
                <span className="text-[11.5px] font-bold tnum text-navy-600">{recipients}</span>
              </div>
            </div>
            <div className="max-h-[340px] overflow-y-auto">
              {AUDIENCES.map(a => {
                const on = aud.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggle(aud, a.id, setAud)}
                    className={cx("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-navy-100 last:border-0", on ? "bg-navy-50/70" : "hover:bg-paper/60")}>
                    <span className={cx("grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition-all", on ? "border-transparent bg-navy-700" : "border-navy-200 bg-white")}>
                      {on && <I.Check size={12} className="text-white" strokeWidth={3.4} />}
                    </span>
                    <a.icon size={14} className={on ? "text-navy-700" : "text-ink/35"} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-ink">{a.label}</span>
                      <span className="block truncate text-[10.5px] text-ink/45">{a.note}</span>
                    </span>
                    <span className="text-[11px] font-bold tnum text-ink/45">{a.count}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="text-[13px] font-bold text-ink">Channels</div>
            <p className="mt-0.5 text-[11.5px] text-ink/50">Reach percentages are measured, not assumed.</p>
            <div className="mt-3.5 space-y-2">
              {CHANNELS.map(c => {
                const on = ch.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggle(ch, c.id, setCh)}
                    className={cx("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all", on ? "border-transparent bg-white shadow-lift" : "border-navy-100 bg-paper/40 hover:bg-white")}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: c.tone + "16", color: c.tone }}><c.icon size={14} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-ink">{c.label}</span>
                      <span className="block text-[10.5px] text-ink/45">{c.warn}</span>
                    </span>
                    <span className={cx("grid h-[16px] w-[16px] place-items-center rounded-full border-2 transition-all", on ? "border-transparent bg-navy-700" : "border-navy-200")}>
                      {on && <I.Check size={10} className="text-white" strokeWidth={4} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="text-[13px] font-bold text-ink">Urgency & timing</div>
            <button onClick={() => setUrgent(u => !u)}
              className={cx("mt-3.5 flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all", urgent ? "border-transparent bg-signal-red/8" : "border-navy-100")}>
              <span className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors", urgent ? "bg-signal-red" : "bg-navy-200")}>
                <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", urgent ? "left-[18px]" : "left-0.5")} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-bold text-ink">Urgent alert</span>
                <span className="block text-[10.5px] leading-snug text-ink/45">Bypasses quiet hours, escalates to voice if unread</span>
              </span>
            </button>
            <div className="mt-2.5">
              <Select value={when} onChange={setWhen} className="w-full" options={[
                { value: "now", label: "Send now" },
                { value: "8am", label: "Tomorrow at 8:00 AM" },
                { value: "4pm", label: "Tomorrow at 4:00 PM" },
                { value: "thu", label: "Thursday at 8:00 AM" },
              ]} />
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------- composer */}
        <div className="min-w-0 space-y-4">
          <Card className="!p-0 overflow-hidden">
            <div className="flex min-w-0 flex-wrap items-center gap-2 border-b border-navy-100 px-4 py-3">
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-[.09em] text-ink/40">Templates</span>
              {ALERT_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setBody(t.body); setUrgent(t.urgent); setSubject("Beyond Limits · " + t.name); toast(`${t.name} template loaded`); }}
                  className="shrink-0 rounded-full border border-navy-100 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-navy-700 transition-colors hover:bg-navy-50">
                  {t.name}
                </button>
              ))}
            </div>

            <div className="p-5">
              <label className="block">
                <span className="eyebrow text-navy-500">Subject line</span>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  className="field mt-2 font-semibold" placeholder="Beyond Limits · …" />
              </label>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <span className="eyebrow text-navy-500">Message</span>
                <div className="flex flex-wrap items-center gap-2">
                  {VARS.map(v => (
                    <button key={v} onClick={() => setBody(b => b + " " + v)}
                      className="mono rounded-md bg-navy-50 px-1.5 py-1 text-[10px] font-bold text-navy-700 transition-colors hover:bg-navy-100">{v}</button>
                  ))}
                </div>
              </div>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={7}
                className="field mt-2 resize-none leading-relaxed" aria-label="Message body" />
              <div className="mt-2 flex items-center justify-between">
                <span className={cx("text-[11px] font-semibold", overSms ? "text-signal-amber" : "text-ink/40")}>
                  {overSms ? `${smsLen} characters — SMS will send as ${Math.ceil(smsLen / 160)} segments` : `${body.length} characters`}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink/40">
                  Personalises per family with {VARS.length} merge fields
                  <InfoButton id="C-05" />
                </span>
              </div>
            </div>
          </Card>

          {/* phone preview */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="display text-[17px]">How it lands</h3>
                <p className="mt-0.5 text-[12px] text-ink/50">App push and SMS, as a guardian sees it at 9pm.</p>
              </div>
              <div className="flex gap-1.5">
                {(["app", "sms"] as ChId[]).map(v => (
                  <button key={v} onClick={() => setMounted(mounted === v ? null : v)}
                    className={cx("rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition-all", mounted === v ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-700 hover:bg-navy-100")}>
                    {v === "app" ? "App" : "SMS"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-[300px] rounded-[30px] border-[7px] border-ink/85 bg-ink p-1 shadow-deep">
                <div className="overflow-hidden rounded-[23px] bg-paper-200">
                  <div className="flex items-center gap-2 bg-ink/90 px-3 py-1.5 text-[9px] font-semibold text-white/60">
                    <span>9:41</span>
                    <span className="ml-auto flex items-center gap-1"><I.Wifi size={9} /> <I.BatteryMedium size={11} /></span>
                  </div>
                  <div className="min-h-[300px] p-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-lift">
                      <img src="./brand/favicon.png" alt="" width={16} height={16} className="rounded" />
                      <span className="text-[10px] font-bold text-ink">Beyond Limits</span>
                      <span className="ml-auto text-[9px] text-ink/35">now</span>
                    </div>
                    <div className={cx("mt-2.5 rounded-2xl bg-white p-3 shadow-lift", urgent && "ring-1 ring-signal-red/30")}>
                      {urgent && <div className="mb-1.5 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide text-signal-red"><I.Zap size={10} /> Urgent</div>}
                      <div className="text-[11.5px] font-bold leading-snug text-ink">{subject}</div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink/70">{body.slice(0, 260)}{body.length > 260 ? "…" : ""}</p>
                      <div className="mt-2.5 flex gap-1.5">
                        <span className="rounded-lg bg-navy-700 px-2 py-1 text-[9.5px] font-bold text-white">Open the Hub</span>
                        <span className="rounded-lg bg-navy-50 px-2 py-1 text-[9.5px] font-bold text-navy-700">RSVP</span>
                      </div>
                    </div>
                    {sendEs && (
                      <div className="mt-2.5 rounded-2xl bg-white/70 p-3 shadow-lift">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-signal-teal"><I.Languages size={10} /> Español</div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink/60">{esBody.slice(0, 200)}{esBody.length > 200 ? "…" : ""}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------ right rail */}
        <div className="min-w-0 space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold text-ink">Projected delivery</div>
              <span className="inline-flex items-center gap-1.5">
                <Chip tone={worstReach >= 96 ? "green" : worstReach >= 85 ? "amber" : "red"}>{worstReach}% floor</Chip>
                <InfoButton id="C-02" headingOverride={`${worstReach}% floor`} />
              </span>
            </div>
            <div className="mt-4 space-y-3.5">
              {projections.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-[12px] font-semibold">
                    <span className="text-ink/70">{p.label}</span>
                    <span className="tnum text-ink/50">{p.delivered} of {recipients}</span>
                  </div>
                  <div className="mt-1.5"><Bar value={p.reach} tone={p.tone} h={7} /></div>
                </div>
              ))}
              {!projections.length && <p className="text-[12px] text-ink/45">Select a channel to see projected delivery.</p>}
            </div>
            {hardToReach > 0 && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-solar-50 border border-solar-100 p-3.5">
                <I.AlertTriangle size={14} className="mt-0.5 shrink-0 text-solar-700" />
                <p className="text-[11.5px] leading-relaxed text-ink/70">
                  Up to <strong className="tnum">{hardToReach}</strong> families may not be reached on the weakest selected channel.
                  Add voice, or the Hub will queue them for a call.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><I.Languages size={15} className="text-signal-teal" /><span className="text-[13px] font-bold text-ink">Spanish copy</span></div>
              <button onClick={() => setSendEs(s => !s)} className={cx("relative h-5 w-9 rounded-full transition-colors", sendEs ? "bg-navy-700" : "bg-navy-200")}>
                <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", sendEs ? "left-[18px]" : "left-0.5")} />
              </button>
            </div>
            <textarea value={esBody} onChange={e => { setEsBody(e.target.value); setEsReviewed(false); }} rows={6}
              className={cx("field mt-3 resize-none text-[12.5px] leading-relaxed", !sendEs && "opacity-45")} aria-label="Spanish message body" />
            <div className="mt-3 flex items-center gap-2">
              {esReviewed
                ? <Chip tone="green"><I.Check size={11} strokeWidth={3.5} /> Reviewed</Chip>
                : <Chip tone="amber"><I.Clock size={11} /> Needs review</Chip>}
              {!esReviewed && <Button size="sm" variant="ghost" onClick={() => { setEsReviewed(true); toast("Marked as reviewed", "green"); }}>Approve</Button>}
            </div>
            <p className="mt-2.5 text-[11px] leading-snug text-ink/45">
              Auto-translated, then held until a staff member approves it. The pair is stored against the message either way.
            </p>
          </Card>

          <Card>
            <div className="eyebrow text-navy-500">Languages in use</div>
            <div className="mt-3.5"><HBars dark={false} max={212} items={LANGUAGES.map((l, i) => ({ label: `${l.label} · ${l.families} families`, value: l.reach, tone: ["var(--navy)", "#0E8C8C", "var(--navy-300)", "var(--navy-200)", "#DCE7F5"][i], note: " reached" }))} /></div>
            <p className="mt-3.5 text-[11.5px] leading-snug text-ink/50">People reached per language over the last 90 days of sends — a count, not a share.</p>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-navy-100 text-[13px] font-bold text-ink">Before you send</div>
            <div className="divide-y divide-navy-100">
              {[
                { ok: recipients > 0, t: `${recipients} recipients selected`, d: AUDIENCES.filter(a => aud.includes(a.id)).map(a => a.label).join(", ") || "None" },
                { ok: ch.length > 0, t: `${ch.length} channel${ch.length === 1 ? "" : "s"} active`, d: ch.map(c => CHANNELS.find(x => x.id === c)!.label).join(" · ") || "None" },
                { ok: !overSms, t: overSms ? "SMS will split into segments" : "SMS fits one segment", d: overSms ? "Shorten for cleaner delivery" : `${smsLen} / 160 characters` },
                { ok: !sendEs || esReviewed, t: sendEs ? (esReviewed ? "Spanish reviewed" : "Spanish awaiting review") : "Spanish switched off", d: "A staff member, not a machine, approves the Spanish copy" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: (c.ok ? "#159A63" : TONE.amber.dot) + "18", color: c.ok ? "#159A63" : TONE.amber.dot }}>
                    {c.ok ? <I.Check size={11} strokeWidth={3.5} /> : <I.AlertTriangle size={11} />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-ink">{c.t}</div>
                    <div className="mt-0.5 truncate text-[10.5px] text-ink/45">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-paper/60">
              <Button variant="primary" className="w-full justify-center" icon={I.Send} onClick={dispatch}
                disabled={!recipients || !ch.length || (sendEs && !esReviewed)}>
                Dispatch to {recipients}
              </Button>
              <p className="mt-2.5 text-center text-[10.5px] text-ink/40">
                {when === "now" ? "Sends immediately" : "Scheduled"} · logged in the activity trail
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
