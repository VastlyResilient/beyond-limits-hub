/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT:"rgb(var(--c-ink) / <alpha-value>)", 800:"rgb(var(--c-ink-800) / <alpha-value>)", 700:"rgb(var(--c-ink-700) / <alpha-value>)" },
        navy:   { 950:"rgb(var(--c-navy-950) / <alpha-value>)", 900:"rgb(var(--c-navy-900) / <alpha-value>)", 800:"rgb(var(--c-navy-800) / <alpha-value>)", 700:"rgb(var(--c-navy-700) / <alpha-value>)", 600:"rgb(var(--c-navy-600) / <alpha-value>)", 500:"rgb(var(--c-navy-500) / <alpha-value>)", 400:"rgb(var(--c-navy-400) / <alpha-value>)", 300:"rgb(var(--c-navy-300) / <alpha-value>)", 200:"rgb(var(--c-navy-200) / <alpha-value>)", 100:"rgb(var(--c-navy-100) / <alpha-value>)", 50:"rgb(var(--c-navy-50) / <alpha-value>)" },
        solar:  { DEFAULT:"rgb(var(--c-solar) / <alpha-value>)", 600:"rgb(var(--c-solar-600) / <alpha-value>)", 700:"rgb(var(--c-solar-700) / <alpha-value>)", 100:"rgb(var(--c-solar-100) / <alpha-value>)", 50:"rgb(var(--c-solar-50) / <alpha-value>)" },
        paper:  { DEFAULT:"rgb(var(--c-paper) / <alpha-value>)", 200:"rgb(var(--c-paper-200) / <alpha-value>)", 300:"rgb(var(--c-paper-300) / <alpha-value>)", 400:"rgb(var(--c-paper-400) / <alpha-value>)" },
        signal: { red:"#D93A2B", amber:"#DE8C00", green:"#159A63", teal:"#0E8C8C", violet:"#6C4BD6", pink:"#C2418F" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["'JetBrains Mono'","ui-monospace","monospace"],
      },
      boxShadow: {
        lift: "0 1px 2px rgba(10,18,32,.06), 0 8px 24px -8px rgba(10,18,32,.14)",
        deep: "0 24px 60px -24px rgba(10,18,32,.35), 0 2px 6px rgba(10,18,32,.08)",
        glow: "0 0 0 1px rgba(254,222,39,.35), 0 12px 40px -12px rgba(254,222,39,.35)",
        inset: "inset 0 1px 0 rgba(255,255,255,.6)",
      },
      borderRadius: { xl2:"1.25rem", xl3:"1.75rem" },
      keyframes: {
        rise:   { "0%":{opacity:"0",transform:"translateY(14px)"}, "100%":{opacity:"1",transform:"none"} },
        fade:   { "0%":{opacity:"0"}, "100%":{opacity:"1"} },
        sweep:  { "0%":{transform:"translateX(-110%)"}, "100%":{transform:"translateX(210%)"} },
        pulseR: { "0%,100%":{opacity:"1"}, "50%":{opacity:".42"} },
        draw:   { "0%":{strokeDashoffset:"var(--len)"}, "100%":{strokeDashoffset:"0"} },
        shimmer:{ "0%":{backgroundPosition:"-200% 0"}, "100%":{backgroundPosition:"200% 0"} },
                tick:   { "0%":{transform:"translateY(0)"}, "100%":{transform:"translateY(-50%)"} },
      },
      animation: {
        rise:"rise .5s cubic-bezier(.22,1,.36,1) both", fade:"fade .4s ease both",
        sweep:"sweep 2.4s cubic-bezier(.4,0,.2,1) infinite", pulseR:"pulseR 2s ease-in-out infinite",
        draw:"draw 1.1s cubic-bezier(.22,1,.36,1) forwards", shimmer:"shimmer 2.2s linear infinite",
         tick:"tick 32s linear infinite",
      },
    },
  },
  plugins: [],
};
