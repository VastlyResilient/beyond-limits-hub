import React from "react";

/* ---------------------------------------------------------------------------
   Brand assets are the REAL files from Beyond Limits' own materials.

   The Beyond Limits logo is dark artwork by design — navy books (#1e3d6b, the
   exact navy in their 2020 original) plus black lettering. Two rules govern it:
     1. Never recolour or redraw the glyphs. A dark->white flip ruins it.
     2. It is drawn for light grounds, so on the navy sidebar it sits on a warm
        brand plate rather than being inverted.
   The transparent PNGs below were cut from their master file; interior whites
   (book pages, letter counters) are preserved.
--------------------------------------------------------------------------- */

export function BLLogo({ h = 34, className = "", alt = "Beyond Limits Academics" }: { h?: number; className?: string; alt?: string }) {
  return <img src="./brand/beyond-limits-logo.png" alt={alt} className={className}
    style={{ height: h, width: "auto", display: "block" }} />;
}

/* The mark alone — squares, avatars, tight spaces. */
export function BLMark({ size = 34, radius = 11 }: { size?: number; radius?: number }) {
  return <img src="./brand/stamford-peace-mark.png" alt="Stamford Peace Youth Foundation" width={size} height={size}
    style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", display: "block" }} />;
}

/* The full brand lockup. On dark surfaces the logo keeps its own colours on a
   warm plate; it is never inverted. */
export function Lockup({ dark = false, width }: { dark?: boolean; width?: number }) {
  // Transparent PNG, no plate of any kind. It is dark artwork, so it belongs on
  // a light ground — the sidebar gives it a full-width warm brand band.
  const w = width ?? 150;
  return (
    <div className="flex items-center select-none">
      <img src="./brand/beyond-limits-logo.png"
        alt="Beyond Limits Academics — a program of Stamford Peace Youth Foundation"
        style={{ width: w, height: "auto", display: "block" }} />
    </div>
  );
}

/* Header-scale lockup: the mark plus a crisp text wordmark. The full logo is a
   stacked lockup, so at ~70px tall its tagline cannot be read — this is the
   readable form for tight horizontal bars. The real logo is used wherever there
   is room for it (the app sidebar, footers, large placements). */
export function Wordmark({ dark = false, sub = "Hub" }: { dark?: boolean; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <BLMark size={34} />
      <div className="leading-none">
        <div className="display text-[16.5px] tracking-tight" style={{ color: dark ? "#fff" : "var(--ink)" }}>
          Beyond Limits <span style={{ color: dark ? "var(--solar)" : "var(--navy)" }}>{sub}</span>
        </div>
        <div className="mt-[3px] text-[9.5px] font-semibold uppercase tracking-[.14em]"
          style={{ color: dark ? "rgba(255,255,255,.5)" : "rgba(10,18,32,.45)" }}>
          Stamford Peace Youth Foundation
        </div>
      </div>
    </div>
  );
}

/* Small decorative rule mirroring the logo's yellow underline motif */
export function SolarRule({ w = 54, h = 3, className = "" }: { w?: number; h?: number; className?: string }) {
  return <span className={"inline-block rounded-full " + className} style={{ width: w, height: h, background: "linear-gradient(90deg,var(--solar),var(--solar-600))" }} />;
}
