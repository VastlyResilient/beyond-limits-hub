import React from "react";

/* Brand assets are the REAL files pulled from Beyond Limits' own site.
   The Beyond Limits logo is dark art (navy var(--navy) + black + var(--solar)) designed for
   light backgrounds — it is used unmodified on light surfaces and never recoloured.
   The Stamford Peace Youth Foundation square mark is a self-contained tile and is
   used for dark surfaces. */

export function BLMark({ size = 34, radius = 11 }: { size?: number; radius?: number }) {
  return <img src="./brand/stamford-peace-mark.png" alt="Stamford Peace Youth Foundation" width={size} height={size}
    style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", display: "block" }} />;
}

export function BLLogo({ h = 34, className = "", alt = "Beyond Limits Academic Program" }: { h?: number; className?: string; alt?: string }) {
  return <img src="./brand/beyond-limits-logo.webp" alt={alt} className={className}
    style={{ height: h, width: "auto", display: "block" }} />;
}

export function Lockup({ dark = false, sub = "Hub" }: { dark?: boolean; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <BLMark size={34} />
      <div className="leading-none">
        <div className="display text-[16.5px] tracking-tight" style={{ color: dark ? "#fff" : "var(--ink)" }}>
          Beyond Limits <span style={{ color: dark ? "var(--solar)" : "var(--navy)" }}>{sub}</span>
        </div>
        <div className="mt-[3px] text-[9.5px] font-semibold uppercase tracking-[.14em]" style={{ color: dark ? "rgba(255,255,255,.5)" : "rgba(10,18,32,.45)" }}>
          Stamford Peace Youth Foundation
        </div>
      </div>
    </div>
  );
}

/* Small decorative yellow rule mirroring the logo's underline motif */
export function SolarRule({ w = 54, h = 3, className = "" }: { w?: number; h?: number; className?: string }) {
  return <span className={"inline-block rounded-full " + className} style={{ width: w, height: h, background: "linear-gradient(90deg,var(--solar),var(--solar-600))" }} />;
}
