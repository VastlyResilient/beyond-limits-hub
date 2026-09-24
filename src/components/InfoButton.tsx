import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { INFO } from "../lib/infoButtons";

/* ---------------------------------------------------------------------------
   Info button.

   Directive (Add-On v3): "Open the same explanation on hover, click, and
   keyboard focus." So the popup is driven by three independent sources and
   stays open while ANY of them holds:

     hovered  — pointer is over the button or the popup
     focused  — the button has keyboard focus (Tab)
     pinned   — Andy clicked it

   Escape always closes, and releasing focus closes it, so the button can never
   trap the user. A `pending` definition renders nothing at all: the deck is
   explicit that those explanations must not be invented.

   Position: measured against the nearest clipping ancestor, not the viewport —
   the same rule the Tip bubbles use, so an icon in a table cell cannot be cut
   off by the card that owns it.
--------------------------------------------------------------------------- */

export function InfoButton({ id, headingOverride, side = "top" }: {
  id: string;
  /** Dynamic headings, e.g. the live floor percentage. */
  headingOverride?: string;
  side?: "top" | "bottom";
}) {
  const def = INFO[id];
  const wrap = useRef<HTMLSpanElement>(null);
  const bub = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const domId = useId();
  const popId = `info-pop-${domId}`;

  const open = hovered || focused || pinned;

  // Escape closes and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setPinned(false); setFocused(false); setHovered(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // A click anywhere else releases a pinned popup.
  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pinned]);

  // Same clamping contract as Tip: stay inside the panel that clips you.
  useLayoutEffect(() => {
    const w = wrap.current, b = bub.current;
    if (!w || !b || !open) return;
    const PAD = 8;
    const place = () => {
      const wr = w.getBoundingClientRect(), br = b.getBoundingClientRect();
      let box: DOMRect | null = null;
      const aside = w.closest("aside");
      if (aside) box = aside.getBoundingClientRect();
      else {
        for (let n = w.parentElement; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.overflowX !== "visible" || cs.overflowY !== "visible") { box = n.getBoundingClientRect(); break; }
        }
      }
      const left = box ? Math.max(box.left, 0) : 0;
      const right = box ? Math.min(box.right, window.innerWidth) : window.innerWidth;
      const centred = wr.left + wr.width / 2 - br.width / 2;
      let shift = 0;
      if (centred < left + PAD) shift = left + PAD - centred;
      else if (centred + br.width > right - PAD) shift = right - PAD - (centred + br.width);
      b.style.setProperty("--tx", `${Math.round(shift)}px`);

      /* Vertical placement, in priority order:
           1. above, inside BOTH the clipping panel and the viewport (the norm)
           2. below, inside the viewport
           3. above the viewport edge, even if it leaves the panel — an overlay
              that overhangs its card is fine, one cut off by the screen is not
           4. whichever side has more room
         Checking only the panel (as this first did) put the popup under a phone's
         bottom edge whenever the panel itself started low. */
      b.style.top = ""; b.style.bottom = "";
      const vh = window.innerHeight;
      const need = br.height + 9;
      const boxTop = (box ? Math.max(box.top, 0) : 0) + PAD;
      const boxBottom = (box ? Math.min(box.bottom, vh) : vh) - PAD;
      const fitsAboveBox = (wr.top - need) >= boxTop;
      const fitsBelowBox = (wr.bottom + need) <= boxBottom;
      const fitsAboveVp = (wr.top - need) >= PAD;
      const fitsBelowVp = (wr.bottom + need) <= vh - PAD;
      let openBelow: boolean;
      if (fitsAboveBox) openBelow = false;
      else if (fitsBelowBox) openBelow = true;
      else if (fitsAboveVp) openBelow = false;
      else if (fitsBelowVp) openBelow = true;
      else openBelow = (vh - wr.bottom) > wr.top;
      if (openBelow) { b.style.bottom = "auto"; b.style.top = "calc(100% + 9px)"; }
      else { b.style.bottom = "calc(100% + 9px)"; b.style.top = "auto"; }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(b); ro.observe(w);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { ro.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, side]);

  // `pending` carries no confirmed copy, so it renders nothing at all.
  if (!def || def.status === "pending") return null;

  const heading = headingOverride ?? def.heading;

  return (
    <span ref={wrap} className="info-wrap inline-flex"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        type="button"
        className="info-btn"
        aria-label={`More information: ${heading}`}
        aria-describedby={open ? popId : undefined}
        aria-expanded={open}
        data-info-id={id}
        onClick={(e) => { e.stopPropagation(); setPinned((p) => !p); }}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setPinned(false); }}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="4.6" r="1.05" fill="currentColor" />
          <rect x="7.15" y="6.6" width="1.7" height="5.2" rx="0.85" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <span ref={bub} id={popId} role="tooltip" className="info-pop" data-info-pop={id}>
          <span className="info-pop-head">{heading}</span>
          <span className="info-pop-body">{def.body}</span>
        </span>
      )}
    </span>
  );
}
