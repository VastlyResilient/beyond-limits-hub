import React, { useState } from "react";
import * as I from "lucide-react";
import { useApp } from "../../lib/store";
import { PageHead } from "../../components/Shell";
import { cx, Avatar, Chip, Button, useToast } from "../../components/ui";

const QUICK = ["Can we move a session?", "Thank you", "I have a question about fees", "Amara will be a few minutes late"];

export default function FamilyMessages() {
  const { threads, setThreads } = useApp();
  const toast = useToast();
  const thread = threads[0]; // Amara's tutor thread
  const [draft, setDraft] = useState("");

  const send = (text?: string) => {
    const body = (text ?? draft).trim();
    if (!body) return;
    setThreads(threads.map(t => t.id === thread.id
      ? { ...t, unread: 0, msgs: [...t.msgs, { from: "them", text: body, at: "now" }] } : t));
    setDraft("");
    toast("Message sent to Marcus", "green");
  };

  return (
    <div>
      <PageHead eyebrow="Family · Messages" tone="#6C4BD6"
        title="A direct line to Amara's tutor"
        sub="No ticket numbers, no waiting rooms. Just a conversation." />

      <div className="card overflow-hidden max-w-3xl">
        {/* warm header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-navy-100" style={{ background: "linear-gradient(135deg,#F3EEFB,#FBF6EA)" }}>
          <Avatar initials="MD" tone="teal" size={48} />
          <div className="min-w-0 flex-1">
            <div className="display text-[18px] text-ink">Marcus D.</div>
            <div className="text-[12px] text-ink/55">Amara's Algebra I tutor · Grade 12, Stamford High — ECS</div>
          </div>
          <Chip tone="violet"><I.MessageSquare size={11} /> Topic: Algebra I confidence</Chip>
        </div>

        {/* bubbles */}
        <div className="px-6 py-6 space-y-4 max-h-[46vh] overflow-y-auto bg-paper/60">
          {thread.msgs.map((m, i) => {
            const mineMsg = m.from === "them"; // family POV: guardian is "them" in this thread
            return (
              <div key={i} className={cx("flex gap-2.5", mineMsg && "flex-row-reverse")}>
                {!mineMsg && <Avatar initials="MD" tone="teal" size={30} />}
                <div className={cx("max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm",
                  mineMsg ? "bg-navy-700 text-white rounded-tr-md" : "bg-white border border-navy-100 text-ink/80 rounded-tl-md")}>
                  {m.text}
                  <div className={cx("mt-1 text-[10px] font-semibold", mineMsg ? "text-white/50 text-right" : "text-ink/35")}>{m.at}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* quick replies + composer */}
        <div className="px-6 pt-4 pb-5 border-t border-navy-100 bg-white">
          <div className="flex gap-2 flex-wrap mb-3">
            {QUICK.map(q => (
              <button key={q} onClick={() => setDraft(q)}
                className="chip hover:border-violet-300 hover:bg-violet-50 transition-colors">{q}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <input className="field flex-1" placeholder="Write to Marcus…" value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              aria-label="Message" />
            <Button variant="primary" icon={I.Send} onClick={() => send()} disabled={!draft.trim()} aria-label="Send message">Send</Button>
          </div>
          <p className="mt-2.5 text-[11px] text-ink/40 flex items-center gap-1.5">
            <I.Clock size={11} /> Tutors usually reply between sessions, 4–7 PM on weekdays.
          </p>
        </div>
      </div>
    </div>
  );
}
