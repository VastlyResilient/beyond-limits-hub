import React, { useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, Card, Select, useToast } from "../../components/ui";
import { STUDENTS } from "../../lib/data";

export default function TutorMessages() {
  const { threads, setThreads, go } = useApp();
  const toast = useToast();
  const [active, setActive] = useState(threads[0].id);
  const [draft, setDraft] = useState("");
  const [linkStudent, setLinkStudent] = useState(STUDENTS[0].name);
  const t = threads.find(x => x.id === active) || threads[0];

  const send = () => {
    if (!draft.trim()) return;
    setThreads(threads.map(x => x.id === t.id
      ? { ...x, unread: 0, msgs: [...x.msgs, { from: "me", text: draft.trim(), at: "now" }] } : x));
    setDraft("");
    toast("Sent", "green");
  };

  return (
    <div>
      <PageHead eyebrow="Peer Tutor · Messages" tone="#0E8C8C"
        title="Guardian threads"
        sub="Short, kind, specific. That's the whole messaging policy." />

      <div className="grid gap-5 lg:grid-cols-[260px_1fr_280px] items-start">
        {/* thread list */}
        <Card pad={false} className="overflow-hidden">
          {threads.map(x => (
            <button key={x.id} onClick={() => setActive(x.id)}
              className={cx("w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-navy-100/60 transition-colors",
                x.id === active ? "bg-teal-50/70" : "hover:bg-navy-50")}>
              <Avatar initials={x.initials} tone={x.tone} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-bold text-ink">{x.with}</div>
                <div className="truncate text-[11px] text-ink/50">{x.topic}</div>
              </div>
              {x.unread > 0 && <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-signal-teal px-1 text-[10px] font-bold text-white tnum">{x.unread}</span>}
            </button>
          ))}
        </Card>

        {/* conversation */}
        <Card pad={false} className="overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-navy-100">
            <Avatar initials={t.initials} tone={t.tone} size={38} />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">{t.with}</div>
              <div className="text-[11.5px] text-ink/50">Topic: {t.topic}</div>
            </div>
          </div>
          <div className="px-5 py-5 space-y-3.5 max-h-[44vh] overflow-y-auto bg-paper/60">
            {t.msgs.map((m, i) => (
              <div key={i} className={cx("flex", m.from === "me" && "justify-end")}>
                <div className={cx("max-w-[78%] rounded-2xl px-4 py-2.5 text-[12.5px] leading-relaxed shadow-sm",
                  m.from === "me" ? "bg-navy-700 text-white rounded-br-md" : "bg-white border border-navy-100 text-ink/80 rounded-bl-md")}>
                  {m.text}
                  <div className={cx("mt-1 text-[9.5px] font-semibold", m.from === "me" ? "text-white/50 text-right" : "text-ink/35")}>{m.at}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-navy-100 flex gap-2.5">
            <input className="field flex-1" placeholder="Reply…" value={draft}
              onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} aria-label="Reply" />
            <Button variant="primary" icon={I.Send} onClick={send} disabled={!draft.trim()} aria-label="Send" />
          </div>
        </Card>

        {/* quick log */}
        <Card>
          <div className="eyebrow text-navy-500 mb-2">Quick log</div>
          <p className="text-[12px] text-ink/55 leading-relaxed mb-4">
            Mentioned progress in this chat? Attach a note so staff see it too.
          </p>
          <label className="block mb-3"><span className="eyebrow text-navy-500 block mb-1.5">Student</span>
            <Select className="w-full" value={linkStudent} onChange={setLinkStudent}
              options={STUDENTS.map(s => ({ value: s.name, label: s.name }))} /></label>
          <Button variant="primary" size="sm" className="w-full" icon={I.Link2}
            onClick={() => toast(`Note linked to this conversation for ${linkStudent}`, "green")}>
            Link a note to this chat
          </Button>
          <div className="hair my-4" />
          <Button variant="ghost" size="sm" className="w-full" icon={I.PenLine} onClick={() => go("tutor-log")}>
            Open full note form
          </Button>
          <div className="mt-4 rounded-xl bg-teal-50 p-3 flex gap-2">
            <I.Lightbulb size={14} className="text-signal-teal shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug text-ink/65">Good message formula: one specific win, one next step, one invitation to ask questions.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
