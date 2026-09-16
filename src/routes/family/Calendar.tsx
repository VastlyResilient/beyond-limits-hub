import React from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Chip, Button, Card, useToast, Reveal } from "../../components/ui";
import { SESSIONS, ENRICHMENT, ORG } from "../../lib/data";

type Row = { id: string; day: string; time: string; title: string; detail: string; tone: string; kind: string };

const GROUPS: { name: string; hint: string; rows: Row[] }[] = [
  { name: "This week", hint: "Nov 6 – 8", rows: [
    ...SESSIONS.filter(s => s.status !== "missed").slice(0, 3).map(s => ({
      id: s.id, day: s.when, time: s.time, title: `${s.subject} · ${s.student}`,
      detail: `${s.room} · with ${s.tutor}`, tone: "navy", kind: "Tutoring session",
    })),
    { id: "w1", day: "Nov 8", time: "10:00 AM", title: ENRICHMENT[0].name, detail: "Main room · free for enrolled families", tone: "solar", kind: "Workshop" },
  ]},
  { name: "Next week", hint: "Nov 9 – 15", rows: [
    { id: "w2", day: "Nov 13", time: "5:30 PM", title: ENRICHMENT[1].name, detail: "Main room · 8 seats left", tone: "teal", kind: "Workshop" },
    { id: "w3", day: "Nov 15", time: "10:00 AM", title: ENRICHMENT[2].name, detail: "Main room · 4 seats left", tone: "violet", kind: "Workshop" },
  ]},
  { name: "Later", hint: "Nov 16 onward", rows: [
    { id: "w4", day: "Nov 19", time: "4:30 PM", title: ENRICHMENT[3].name, detail: "Computer lab · laptops provided", tone: "amber", kind: "Workshop" },
    { id: "w5", day: "Nov 22", time: "9:00 AM - 2:00 PM", title: "Sacred Heart campus visit", detail: "Transportation provided · permission form required", tone: "pink", kind: "Field trip" },
    { id: "w6", day: "Nov 25", time: "6:30 PM", title: ENRICHMENT[4].name, detail: "Family lounge · children welcome", tone: "navy", kind: "Family workshop" },
  ]},
];

export default function FamilyCalendar() {
  const { rsvps, setRsvps } = useApp();
  const toast = useToast();

  const toggle = (r: Row) => {
    const on = !rsvps[r.id];
    setRsvps({ ...rsvps, [r.id]: on });
    toast(on ? `You're on the list for ${r.title}` : `RSVP removed for ${r.title}`, on ? "green" : "navy");
  };

  return (
    <div>
      <PageHead eyebrow="Family · Sessions & Events" tone="#6C4BD6"
        title="What's coming up"
        sub="Sessions, workshops and trips — grouped by week. Tap RSVP and we'll have a seat (and a snack) ready." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <div className="space-y-8">
          {GROUPS.map((g, gi) => (
            <Reveal key={g.name} delay={gi * 70}>
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="display text-[21px] text-ink">{g.name}</h2>
                  <span className="text-[11.5px] font-semibold text-ink/40">{g.hint}</span>
                  <span className="hair flex-1" />
                </div>
                <div className="space-y-3">
                  {g.rows.map(r => (
                    <Card key={r.id} flat className="flex items-center gap-4 p-4 flex-wrap">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-center"
                        style={{ background: "rgba(108,75,214,.09)" }}>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-signal-violet">{r.day.split(" ")[0]}</div>
                          <div className="display text-[17px] leading-none text-ink tnum">{r.day.split(" ")[1]}</div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-bold text-ink">{r.title}</span>
                          <Chip tone={r.tone}>{r.kind}</Chip>
                        </div>
                        <div className="mt-1 text-[12px] text-ink/55 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1"><I.Clock size={12} /> {r.time}</span>
                          <span className="inline-flex items-center gap-1"><I.MapPin size={12} /> {r.detail}</span>
                        </div>
                      </div>
                      <Button size="sm" variant={rsvps[r.id] ? "primary" : "ghost"}
                        icon={rsvps[r.id] ? I.Check : I.CalendarPlus}
                        onClick={() => toggle(r)}
                        aria-pressed={!!rsvps[r.id]}>
                        {rsvps[r.id] ? "Going" : "RSVP"}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* centre info */}
        <Card className="lg:sticky lg:top-[86px]" pad={false}>
          <div className="navy-field relative on-dark grain rounded-t-[20px] p-5">
            <div className="eyebrow text-solar mb-2">The center</div>
            <div className="display text-[20px] text-white">Come as you are</div>
            <p className="mt-1.5 text-[12.5px] text-white/65 leading-relaxed">
              {ORG.hq}. Doors open 15 minutes before sessions — the family lounge is yours while you wait.
            </p>
          </div>
          <div className="p-5 space-y-3">
            {[
              { icon: I.Armchair, t: "Family lounge", d: "Comfortable seating while your learner is in session" },
              { icon: I.Wifi, t: "Free Wi-Fi", d: "Catch up on email or stream while you wait" },
              { icon: I.Coffee, t: "Water & snacks", d: "Always available, always free — help yourself" },
              { icon: I.Bus, t: "Easy to reach", d: "On Long Ridge Road with parking at the door" },
            ].map(x => (
              <div key={x.t} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600"><x.icon size={15} /></span>
                <div>
                  <div className="text-[13px] font-bold text-ink">{x.t}</div>
                  <div className="text-[11.5px] text-ink/55 leading-snug">{x.d}</div>
                </div>
              </div>
            ))}
            <Button variant="primary" className="w-full mt-2" icon={I.Navigation}
              onClick={() => { window.open("https://maps.google.com/?q=Long+Ridge+Road+Stamford+CT", "_blank"); toast("Opening directions", "navy"); }}>
              Get directions
            </Button>
            <p className="text-[11px] text-ink/45 text-center">Questions? Call the center — a person answers.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
