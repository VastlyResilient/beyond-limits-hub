import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import { PageHead } from "../../components/Shell";
import { Avatar, Bar, Button, Card, Chip, SearchBox, Tabs, cx, useToast } from "../../components/ui";
import { STUDENTS, CHANNEL_FIT } from "../../lib/data";
import { useApp } from "../../lib/store";
import { InfoButton } from "../../components/InfoButton";

const QUICK = [
  "Thanks for letting us know — we'll reschedule.",
  "Your student did great work today.",
  "Can we find a time that works better for your family?",
  "Reminder: session is tomorrow at 4:00 PM.",
];

export default function OpsMessages() {
  const toast = useToast();
  const { threads, setThreads, me } = useApp();
  const [active, setActive] = useState(threads[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [draft, setDraft] = useState("");

  const list = useMemo(() => threads.filter(t =>
    (tab === "all" || t.unread > 0) &&
    (t.with.toLowerCase().includes(q.toLowerCase()) || t.topic.toLowerCase().includes(q.toLowerCase()))
  ), [threads, q, tab]);

  const thread = threads.find(t => t.id === active) ?? list[0];

  const open = (id: string) => {
    setActive(id);
    setThreads(ts => ts.map(t => t.id === id ? { ...t, unread: 0 } : t));
  };
  const send = (text: string) => {
    if (!thread || !text.trim()) return;
    setThreads(ts => ts.map(t => t.id === thread.id
      ? { ...t, msgs: [...t.msgs, { from: "me", text: text.trim(), at: "just now" }] } : t));
    setDraft("");
    toast(`Reply sent to ${thread.with.split(" (")[0]} · App + SMS`, "green");
  };

  const learner = useMemo(() => {
    if (!thread) return undefined;
    const first = thread.with.split(" ")[0];
    return STUDENTS.find(s => thread.with.includes(s.name.split(" ")[0])) ?? STUDENTS.find(s => s.guardian.split(" ")[0] === first);
  }, [thread]);

  const unreadTotal = threads.reduce((a, t) => a + t.unread, 0);

  return (
    <div className="space-y-6">
      <PageHead eyebrow="Reach" title="Inbox"
        sub={`${threads.length} conversations · ${unreadTotal} unread · families, guardians and tutors in one place`}
        actions={<Button variant="ghost" icon={I.Archive} onClick={() => toast("Conversations older than 30 days archived")}>Archive read</Button>} />

      <div className="grid gap-5 xl:grid-cols-[280px_1fr_260px] items-start">
        {/* ------------------------------------------------ conversation list */}
        <Card pad={false} className="overflow-hidden lg:sticky lg:top-6">
          <div className="p-3 border-b border-navy-100 space-y-2.5">
            <SearchBox value={q} onChange={setQ} placeholder="Search people or topics…" />
            <Tabs items={[{ id: "all", label: "All", badge: threads.length }, { id: "unread", label: "Unread", badge: unreadTotal }]}
              value={tab} onChange={(v) => setTab(v as any)} />
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {list.map(t => (
              <button key={t.id} onClick={() => open(t.id)}
                className={cx("flex w-full items-start gap-3 border-b border-navy-50 px-3.5 py-3 text-left transition-colors last:border-0",
                  t.id === thread?.id ? "bg-navy-50" : "hover:bg-navy-50/60")}>
                <Avatar initials={t.initials} tone={t.tone} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cx("truncate text-[13px] font-semibold", t.unread ? "text-ink" : "text-ink/70")}>{t.with.split(" (")[0]}</span>
                    {t.unread > 0 && <span className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full bg-signal-red px-1 text-[10.5px] font-bold text-white">{t.unread}</span>}
                  </div>
                  <div className="truncate text-[11.5px] text-ink/45">{t.topic}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-ink/38">{t.msgs[t.msgs.length - 1]?.text}</div>
                </div>
              </button>
            ))}
            {list.length === 0 && <div className="px-4 py-8 text-center text-[12.5px] text-ink/45">Nothing matches that.</div>}
          </div>
        </Card>

        {/* ------------------------------------------------------------ thread */}
        {thread ? (
          <Card pad={false} className="flex min-h-[560px] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-navy-100 px-4 py-3">
              <Avatar initials={thread.initials} tone={thread.tone} size={40} />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-bold">{thread.with}</div>
                <div className="text-[11.5px] text-ink/45">{thread.topic} · replies reach App, SMS and email</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Chip tone="teal"><I.Languages size={12} /> Auto-translated</Chip>
                <InfoButton id="C-01" />
                <Button size="sm" variant="quiet" icon={I.Phone} onClick={() => toast(`Calling ${thread.with.split(" (")[0]} through the program line`)}>Call</Button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {thread.msgs.map((m, i) => (
                <div key={i} className={cx("flex gap-3", m.from === "me" && "flex-row-reverse")}>
                  <Avatar initials={m.from === "me" ? me.initials : thread.initials} tone={m.from === "me" ? "navy" : thread.tone} size={30} />
                  <div className={cx("max-w-[76%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
                    m.from === "me" ? "bg-navy-600 text-white rounded-tr-sm" : "bg-white border border-navy-100 text-ink rounded-tl-sm")}>
                    {m.text}
                    <div className={cx("mt-1.5 text-[10.5px]", m.from === "me" ? "text-white/55" : "text-ink/38")}>{m.at}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-navy-100 p-4">
              <div className="mb-2.5 flex flex-wrap gap-2">
                {QUICK.map(rep => (
                  <button key={rep} onClick={() => send(rep)}
                    className="rounded-full border border-navy-100 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-50">
                    {rep}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                  placeholder="Write a reply — it is translated into the family's language before it sends…"
                  className="min-h-[46px] flex-1 resize-y rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-navy-300" />
                <Button icon={I.Send} onClick={() => send(draft)} disabled={!draft.trim()}>Send</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="grid min-h-[560px] place-items-center text-[13px] text-ink/45">Choose a conversation.</Card>
        )}

        {/* ------------------------------------------------------- context rail */}
        <div className="space-y-5">
          {learner && (
            <Card>
              <div className="eyebrow text-ink/35 mb-3">Who you are writing about</div>
              <div className="flex items-center gap-3">
                <Avatar initials={learner.initials} tone={learner.tone} size={42} />
                <div className="min-w-0">
                  <div className="text-[14px] font-bold">{learner.name}</div>
                  <div className="text-[11.5px] text-ink/45">Grade {learner.grade} · {learner.school}</div>
                </div>
              </div>
              <div className="mt-3.5 space-y-2 text-[12.5px]">
                <div className="flex justify-between"><span className="text-ink/50">Subjects</span><b className="text-right">{learner.subjects.join(", ")}</b></div>
                <div className="flex justify-between"><span className="text-ink/50">Tutor</span><b>{learner.tutor}</b></div>
                <div className="flex justify-between"><span className="text-ink/50">Last session</span><b>{learner.lastSession}</b></div>
                <div className="flex justify-between"><span className="text-ink/50">Attendance</span><b className="tnum">{learner.attendance}%</b></div>
                <div className="flex justify-between"><span className="text-ink/50">Fees</span><b>{learner.subsidy}</b></div>
              </div>
            </Card>
          )}

          <Card>
            <div className="eyebrow text-ink/35 mb-3">How this family prefers to be reached</div>
            <div className="space-y-3">
              {CHANNEL_FIT.map(c => (
                <div key={c.ch}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                    <span className="text-ink/60">{c.ch}</span><b className="tnum">{c.reach}%</b>
                  </div>
                  <Bar value={c.reach} tone={c.reach >= 95 ? "#159A63" : c.reach >= 80 ? "var(--navy)" : "#DE8C00"} h={6} />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-navy-50 p-3 text-[11.5px] leading-relaxed text-navy-700">
              SMS reaches almost everyone. Anything that needs a signature also goes by email, and closures always get a voice call.
            </div>
          </Card>

          <Card>
            <div className="eyebrow text-ink/35 mb-3">House rules</div>
            <ul className="m-0 space-y-2 pl-4 text-[12.5px] leading-relaxed text-ink/60">
              <li>Never discuss another family's child in a thread.</li>
              <li>Attendance concerns go to the guardian, never to the student.</li>
              <li>Anything about money is answered by the office, not a tutor.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
