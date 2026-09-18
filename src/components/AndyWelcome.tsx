import React, { useEffect, useState } from "react";
import * as I from "lucide-react";
import { Button, cx } from "./ui";

/* ============================================================================
   First-run welcome.

   Andy has never used AI. This says three plain things, sets the expectation
   that nothing can break, and then gets out of the way forever.
   ========================================================================== */

const WELCOMED_KEY = "bl.andy.welcomed";

const CARDS = [
  {
    icon: I.Sparkles,
    title: "You have an AI helper now",
    body: "It lives in the round button at the bottom right. Two ways to use it — and neither one can break your dashboard.",
  },
  {
    icon: I.Hammer,
    title: "Builder changes the screen for you",
    body: "Ask it to rename something or reword a heading. It shows you the change first and waits for your yes. If you don't like it, undo it in one click.",
  },
  {
    icon: I.MessageCircleQuestion,
    title: "Assistant answers questions",
    body: "Ask about your families, your forms, your numbers. It only tells you what is actually in your Hub. If it doesn't know, it says so instead of guessing.",
  },
];

export function AndyWelcome({ onOpenBuilder }: { onOpenBuilder?: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(WELCOMED_KEY) !== "1") setShow(true); } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem(WELCOMED_KEY, "1"); } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]" />
      <div className="relative w-full max-w-[660px] overflow-hidden rounded-[24px] bg-white shadow-deep">
        <div className="navy-field on-dark grain relative p-7">
          <div className="relative z-10">
            <div className="flex items-center gap-3.5">
              <img src="./brand/andy-avatar.png" alt="" width={64} height={64}
                style={{ width: 64, height: 64, display: "block" }} />
              <div className="eyebrow text-white/50">Welcome</div>
            </div>
            <h2 className="display mt-2.5 text-[26px] leading-tight text-white sm:text-[30px]">
              This is your Hub. Now it has a helper.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13px] leading-relaxed text-white/60">
              Nothing here is complicated, and nothing you do can break anything.
            </p>
          </div>
        </div>

        <div className="space-y-3 p-6">
          {CARDS.map((c) => (
            <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-navy-100 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "rgba(24,56,104,.08)" }}>
                <c.icon size={17} className="text-navy-700" />
              </span>
              <div>
                <div className="text-[13.5px] font-bold text-ink">{c.title}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-navy-100 px-6 py-4">
          <Button variant="primary" icon={I.Hammer} onClick={() => { dismiss(); onOpenBuilder?.(); }}>
            Show me how it works
          </Button>
          <Button variant="ghost" onClick={dismiss}>Later</Button>
          <span className="ml-auto text-[11.5px] text-ink/40">You can reopen this any time from Settings.</span>
        </div>
      </div>
    </div>
  );
}
