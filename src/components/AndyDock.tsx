import React, { useEffect, useMemo, useRef, useState } from "react";
import * as I from "lucide-react";
import { Button, Chip, cx, useToast } from "./ui";
import { streamAndy, fetchPage, firstUrl, type ChatMessage } from "../lib/andy";
import { useOverrides } from "../lib/overrides";
import { builderFocus } from "../lib/builderFocus";
import { BUILDER_PROMPT, ASSISTANT_PROMPT } from "../lib/andyPrompts";
import { buildFacts } from "../lib/andyFacts";
import { EDIT_REGISTRY, REGISTRY_IDS, describeTarget, getTarget } from "../lib/editRegistry";
import { ANDY_MOCK } from "../lib/andyConfig";

/* ============================================================================
   Andy's AI dock.

   Builder  — proposes changes to the dashboard as validated edit operations,
              glows the target, shows a before/after preview, and only writes
              when Andy presses Apply. It cannot touch anything outside the
              registry and it never writes code.
   Assistant— answers questions about Andy's own system from grounded facts,
              with sources, and says "I don't know" rather than inventing.
   ========================================================================== */

type Mode = "builder" | "assistant";
type Phase = "idle" | "thinking" | "asking" | "preview" | "applied" | "error";

interface Turn { role: "user" | "assistant"; content: string; sources?: string[]; }
interface Pending { ops: any[]; say: string; questions: string[]; }

const STARTERS: Record<Mode, string[]> = {
  builder: [
    "Rename my home screen",
    "Change the greeting on my dashboard",
    "Change my Command Center headline",
  ],
  assistant: [
    "How many families are in my program?",
    "What can the Builder change for me?",
    "Which forms are outstanding?",
  ],
};

export function AndyDock() {
  const toast = useToast();
  const { commit, get, revert } = useOverrides();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("assistant");
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [lastAppliedId, setLastAppliedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const facts = useMemo(() => buildFacts({}), []);
  const currentValues = useMemo(
    () => EDIT_REGISTRY.map((t) => `${t.id} = "${get(t.id, t.defaultValue)}"`).join("\n"),
    [get]
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, streaming, pending]);

  // clear any highlight if the dock closes mid-preview
  useEffect(() => { if (!open) builderFocus.set(null); }, [open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || phase === "thinking") return;
    setDraft("");
    setError(null);
    setPending(null);
    setPhase("thinking");

    const nextTurns: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setStreaming("");

    // web fetch: if Andy pasted a link, read it first and hand it to the model
    const sources: string[] = [];
    let pagesBlock = "(none)";
    const url = firstUrl(message);
    if (url && mode === "assistant") {
      const doc = await fetchPage(url);
      if (doc) { pagesBlock = `${doc.title} — ${doc.url}\n${doc.text.slice(0, 6000)}`; sources.push(doc.title || doc.url); }
    }

    const systemPrompt = mode === "builder"
      ? BUILDER_PROMPT.replace("{{REGISTRY}}", EDIT_REGISTRY.map((t) => `${t.id} — ${t.label}: ${t.help}`).join("\n"))
                      .replace("{{CURRENT}}", currentValues)
      : ASSISTANT_PROMPT.replace("{{FACTS}}", facts).replace("{{PAGES}}", pagesBlock);

    let full = "";
    try {
      for await (const chunk of streamAndy({
        mode,
        systemPrompt,
        messages: nextTurns.map((t) => ({ role: t.role, content: t.content })) as ChatMessage[],
        registryIds: REGISTRY_IDS,
      })) {
        if (chunk.error) { setError(chunk.error); setPhase("error"); setStreaming(""); return; }
        if (chunk.delta) { full += chunk.delta; setStreaming(full); }
        if (chunk.done) {
          setStreaming("");
          setTurns((t) => [...t, { role: "assistant", content: chunk.parsed?.say || full, sources: sources.length ? sources : undefined }]);

          if (mode === "builder" && chunk.parsed) {
            const p = chunk.parsed;
            if (p.ops && p.ops.length) {
              builderFocus.set(p.ops[0].target, String(p.ops[0].value));
              setPending({ ops: p.ops, say: p.say || "Here is the change I would make.", questions: [] });
              setPhase("preview");
            } else if (p.questions && p.questions.length) {
              setPending({ ops: [], say: p.say || "I need one thing first.", questions: p.questions });
              setPhase("asking");
            } else {
              setPhase("idle");
            }
          } else {
            setPhase("idle");
          }
        }
      }
    } catch (e: any) {
      setError(String(e?.message || e));
      setPhase("error");
      setStreaming("");
    }
  }

  function applyPending() {
    if (!pending || !pending.ops.length) return;
    const id = commit(pending.ops, pending.say, "builder");
    setLastAppliedId(id);
    builderFocus.set(null);
    setPending(null);
    setPhase("applied");
    toast("Change applied", "green");
  }

  function dismissPending() {
    builderFocus.set(null);
    setPending(null);
    setPhase("idle");
    setTurns((t) => [...t, { role: "user", content: "Not now — don't make that change." }]);
  }

  function notWhatIWanted() {
    if (lastAppliedId) revert(lastAppliedId);
    setLastAppliedId(null);
    setPhase("idle");
    toast("Reverted", "navy");
    void send("That wasn't what I wanted — please put it back and suggest something else.");
  }

  const statusLabel: Record<Phase, string> = {
    idle: mode === "builder" ? "Ready to build" : "Ready to answer",
    thinking: "Thinking…",
    asking: "Asking a question…",
    preview: "Ready to preview",
    applied: "Applied — you can undo this",
    error: "Something went wrong",
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Ask Andy"
        className="fixed bottom-5 right-5 z-[190] inline-flex items-center gap-2.5 rounded-full px-4 py-3 text-[13px] font-bold text-white shadow-deep transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--navy)" }}>
        <I.Sparkles size={16} /> Ask Andy
      </button>
    );
  }

  return (
    <div className={cx("fixed bottom-5 right-5 z-[190] flex flex-col overflow-hidden rounded-[20px] border border-navy-100 bg-white shadow-deep",
      mode === "builder" ? "w-[430px]" : "w-[400px]")} style={{ maxHeight: "min(720px, 86vh)" }} role="dialog" aria-label="Andy's AI">

      {/* header + the two-mode toggle */}
      <div className="flex items-center gap-2 border-b border-navy-100 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "var(--navy)" }}>
          <I.Sparkles size={15} className="text-white" />
        </span>
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold leading-tight">Andy's AI</div>
          <div className="text-[11px] text-ink/45">{statusLabel[phase]}</div>
        </div>
        <button className="ml-auto grid h-8 w-8 place-items-center rounded-xl text-ink/45 hover:bg-navy-50"
          onClick={() => setOpen(false)} aria-label="Close"><I.X size={16} /></button>
      </div>

      <div className="flex gap-1 border-b border-navy-100 bg-navy-50/50 px-3 py-2" role="tablist" aria-label="AI mode">
        {(["builder", "assistant"] as Mode[]).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m}
            onClick={() => { setMode(m); setPending(null); builderFocus.set(null); setPhase("idle"); }}
            className={cx("flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12.5px] font-bold transition-all",
              mode === m ? "bg-white text-navy-700 shadow-lift" : "text-ink/50 hover:text-navy-700")}>
            {m === "builder" ? <I.Hammer size={13} /> : <I.MessageCircleQuestion size={13} />}
            {m === "builder" ? "Builder" : "Assistant"}
          </button>
        ))}
      </div>

      {/* transcript */}
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
        {turns.length === 0 && !streaming && (
          <div className="rounded-2xl bg-navy-50/70 p-3.5 text-[12.5px] leading-relaxed text-ink/70">
            {mode === "builder"
              ? "Tell me what you'd like changed. I'll show you exactly what I'd do before anything happens — and you can always undo it."
              : "Ask me anything about your Hub. I only answer from your own information. If I don't know, I'll say so."}
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className={cx("flex", t.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cx("max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
              t.role === "user" ? "text-white" : "bg-navy-50 text-ink")}
              style={t.role === "user" ? { background: "var(--navy)" } : undefined}>
              {t.content}
              {t.sources?.length ? (
                <div className="mt-2 border-t border-navy-100 pt-1.5 text-[11px] text-ink/50">
                  Sources: {t.sources.join(", ")}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-[86%] rounded-2xl bg-navy-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
              {streaming}<span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-navy-700 align-middle" />
            </div>
          </div>
        )}

        {/* clarifying questions become tappable chips */}
        {phase === "asking" && pending?.questions.length ? (
          <div className="space-y-2">
            <div className="text-[12px] text-ink/55">{pending.say}</div>
            <div className="flex flex-wrap gap-2">
              {pending.questions.map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-navy-700 hover:border-navy-400">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* the preview: what would change, before it changes */}
        {phase === "preview" && pending ? (
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <I.Eye size={13} className="text-emerald-700" />
              <span className="text-[12px] font-bold text-emerald-800">Preview — nothing has changed yet</span>
            </div>
            <div className="mt-2.5 space-y-2">
              {pending.ops.map((op) => {
                const before = get(op.target, getTarget(op.target)?.defaultValue ?? "(not set)");
                return (
                  <div key={op.target} className="rounded-xl bg-white p-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/40">
                      {describeTarget(op.target)}
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-ink">
                      {before} → {String(op.value)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" size="sm" icon={I.Check} onClick={applyPending}>Apply</Button>
              <Button variant="ghost" size="sm" onClick={dismissPending}>Not now</Button>
            </div>
          </div>
        ) : null}

        {phase === "applied" && (
          <div className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-white p-3">
            <I.CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-[12.5px] text-ink/70">Done. Not right?</span>
            <button onClick={notWhatIWanted}
              className="ml-auto rounded-full border border-navy-200 px-3 py-1 text-[11.5px] font-bold text-navy-700 hover:border-navy-400">
              Not what I wanted
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-800">
            <I.AlertTriangle size={14} className="mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
      </div>

      {/* starters */}
      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t border-navy-100 px-4 py-2.5">
          {STARTERS[mode].map((s) => (
            <button key={s} onClick={() => send(s)}
              className="rounded-full bg-navy-50 px-3 py-1.5 text-[11.5px] font-semibold text-navy-700 hover:bg-navy-100">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* composer */}
      <div className="flex items-end gap-2 border-t border-navy-100 px-3 py-3">
        <textarea ref={inputRef} rows={1} value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(draft); } }}
          placeholder={mode === "builder" ? "Ask me to change something…" : "Ask a question about your Hub…"}
          className="max-h-[110px] min-h-[42px] flex-1 resize-none rounded-xl border border-navy-100 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-navy-300" />
        <Button variant="primary" size="sm" icon={I.ArrowUp} disabled={phase === "thinking" || !draft.trim()}
          onClick={() => void send(draft)}>Send</Button>
      </div>

      {ANDY_MOCK && (
        <div className="border-t border-navy-100 bg-solar-50 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[.1em] text-solar-700">
          Demo mode — replies are simulated
        </div>
      )}
    </div>
  );
}
