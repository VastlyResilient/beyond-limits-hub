import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, Bar, Ring, useToast, Reveal } from "../../components/ui";
import { STUDENTS, SESSIONS, ENRICHMENT, TONE } from "../../lib/data";

export default function FamilyFeed() {
  const { posts, readPost, setReadPost, me, go } = useApp();
  const toast = useToast();
  const [extra, setExtra] = useState<Record<string, Record<string, number>>>({});
  const [mine, setMine] = useState<Record<string, string>>({});

  const unread = posts.filter(p => !readPost[p.id]).length;
  const amara = STUDENTS[0];
  const lastSession = SESSIONS.find(s => s.student === amara.name);

  const markRead = (id: string) => { setReadPost({ ...readPost, [id]: true }); };
  const markAll = () => {
    const next = { ...readPost };
    posts.forEach(p => { next[p.id] = true; });
    setReadPost(next);
    toast("All caught up — every post marked as read", "green");
  };

  const react = (id: string, emoji: string) => {
    if (mine[id] === emoji) return;
    setExtra(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [emoji]: ((prev[id] || {})[emoji] || 0) + 1 } }));
    setMine(prev => ({ ...prev, [id]: emoji }));
    toast("Reaction added", "green");
  };

  return (
    <div>
      <PageHead eyebrow="Family · Home" tone="#6C4BD6"
        title={`Good evening, ${me.name.split(" ")[0]}`}
        sub="Everything the program has shared, in one calm place. Nothing here is urgent unless it says so."
        actions={<>
          {unread > 0 && <Chip tone="violet">{unread} unread</Chip>}
          <Button variant="ghost" icon={I.CheckCheck} onClick={markAll} disabled={unread === 0}>Mark all read</Button>
        </>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        {/* ------------------------------------------------ posts column */}
        <div className="space-y-5">
          {posts.map((p, i) => {
            const isRead = !!readPost[p.id];
            const t = TONE[p.tone] || TONE.navy;
            const rx = { ...(p.reactions as unknown as Record<string, number>), ...(extra[p.id] || {}) };
            return (
              <Reveal key={p.id} delay={i * 60}>
                <Card className={cx("transition-opacity", isRead && "opacity-75")} pad={false}>
                  <div className="p-5">
                    <div className="flex items-start gap-3.5">
                      <Avatar initials={p.initials} tone={p.tone} size={42} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-bold text-ink">{p.author}</span>
                          <span className="text-[11.5px] text-ink/45">{p.role} · {p.when}</span>
                          {p.pinned && <Chip tone="solar"><I.Pin size={11} /> Pinned</Chip>}
                        </div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Chip tone={p.tone}>{p.scope}</Chip>
                          <Chip tone="navy">{p.tag}</Chip>
                        </div>
                      </div>
                      {!isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: "#6C4BD6" }} aria-label="Unread" />}
                    </div>
                    <h3 className="display text-[19px] mt-4 text-ink">{p.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink/68">{p.body}</p>

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {Object.entries(rx).map(([e, n]) => (
                        <button key={e} onClick={() => react(p.id, e)}
                          className={cx("chip transition-all hover:border-navy-300", mine[p.id] === e && "border-violet-300 bg-violet-50")}
                          aria-label={`React ${e}`}>
                          <span aria-hidden>{e}</span><span className="tnum">{n}</span>
                        </button>
                      ))}
                      <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/45">
                        <I.MessageCircle size={13} /> {p.replies} replies
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-navy-100/70 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10.5px] font-semibold text-ink/45 mb-1">
                          <span>Read by families</span><span className="tnum">{p.read} of {p.of}</span>
                        </div>
                        <Bar value={Math.round((p.read / p.of) * 100)} tone={t.dot} h={5} />
                      </div>
                      {!isRead
                        ? <Button size="sm" variant="quiet" icon={I.Check} onClick={() => { markRead(p.id); }}>Mark as read</Button>
                        : <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-signal-green"><I.CheckCheck size={13} /> Read</span>}
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>

        {/* ------------------------------------------------ right rail */}
        <div className="space-y-5 lg:sticky lg:top-[86px]">
          <Card className="overflow-hidden" pad={false}>
            <div className="px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#F3EEFB,#FBF7EC)" }}>
              <div className="eyebrow text-signal-violet mb-3">Your learner</div>
              <div className="flex items-center gap-3.5">
                <Avatar initials={amara.initials} tone={amara.tone} size={52} />
                <div>
                  <div className="display text-[19px] text-ink">{amara.name}</div>
                  <div className="text-[12px] text-ink/55">Grade {amara.grade} · {amara.school}</div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <Ring value={amara.attendance} size={66} stroke={7} tone="#6C4BD6"><span className="tnum text-[13px] font-bold">{amara.attendance}%</span></Ring>
                <div className="text-[12.5px] text-ink/60 leading-relaxed">
                  <div className="font-bold text-ink text-[13px]">Attendance</div>
                  Amara has been showing up — that's the whole game.
                </div>
              </div>
              <div className="rounded-xl bg-navy-50 p-3.5 text-[12.5px]">
                <div className="font-bold text-navy-700 flex items-center gap-1.5"><I.Sparkles size={13} /> Up next for Amara</div>
                <div className="mt-1 text-ink/65">{lastSession ? lastSession.next : "Graphing practice"} with {amara.tutor} · Room A</div>
              </div>
              <Button variant="ghost" className="w-full" icon={I.TrendingUp} onClick={() => go("family-calendar")}>See full progress</Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow text-navy-500">Paperwork</div>
              <Chip tone="amber">2 need you</Chip>
            </div>
            <p className="text-[12.5px] text-ink/60 leading-relaxed">Two short forms keep Amara's spot and her discount in place. Each takes under two minutes.</p>
            <Button variant="primary" size="sm" className="mt-3 w-full" icon={I.FileSignature} onClick={() => go("family-forms")}>Review forms</Button>
          </Card>

          <Card>
            <div className="eyebrow text-navy-500 mb-3">Coming up</div>
            <div className="space-y-3">
              {ENRICHMENT.slice(0, 3).map(e => (
                <button key={e.name} onClick={() => go("family-calendar")}
                  className="w-full text-left flex items-start gap-3 rounded-xl p-2.5 -m-1 hover:bg-navy-50 transition-colors">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-solar-100 text-solar-700"><I.CalendarDays size={15} /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-bold text-ink">{e.name}</span>
                    <span className="text-[11px] text-ink/50">{e.when}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
