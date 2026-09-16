// Beyond Limits Hub — QA probe
// Usage: SITE=http://localhost:4173 node qa.cjs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE || "http://localhost:4173";
const OUT = process.env.OUT || "/Users/bobby/beyond-limits-hub/qa";
const SHOTS = process.env.SHOTS === "1";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

const ROUTES = ["home","ops-command","ops-composer","ops-sessions","ops-calendar","ops-progress",
  "ops-payments","ops-forms","ops-volunteers","ops-directory","ops-messages","ops-translation",
  "ops-analytics","ops-programs","tutor-today","tutor-roster","tutor-log","tutor-messages",
  "family-feed","family-calendar","family-progress","family-forms","family-billing","family-messages",
  "student-quests","student-sessions","student-lab"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const report = [];
  const allErrors = [];

  for (const r of ROUTES) {
    if (ONLY && !ONLY.includes(r)) continue;
    const local = [];
    const onErr = e => local.push("pageerror: " + e.message);
    const onCon = m => { if (m.type() === "error") local.push("console: " + m.text()); };
    page.on("pageerror", onErr); page.on("console", onCon);

    await page.goto(`${SITE}/#/${r}`, { waitUntil: "load" });
    await page.waitForTimeout(1500);

    const probe = await page.evaluate(() => {
      const de = document.documentElement;
      const overflowing = [...document.querySelectorAll("body *")].filter(el => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && (b.right > window.innerWidth + 2);
      }).slice(0, 12).map(el => `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ").slice(0, 3).join(".")}`);
      const btns = [...document.querySelectorAll("button")];
      const dead = btns.filter(b => !b.onclick && !b.getAttribute("data-hermes-send") && b.disabled === false && b.type !== "submit" && !b.closest("[aria-hidden]")).length;
      const small = [...document.querySelectorAll("p,span,div,li,td,th")].filter(el => {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        return el.children.length === 0 && el.textContent.trim().length > 12 && fs > 0 && fs < 10;
      }).length;
      return {
        title: document.title,
        h: de.scrollHeight, w: de.scrollWidth,
        hOverflow: de.scrollWidth > window.innerWidth + 4,
        buttons: btns.length, links: document.querySelectorAll("a").length,
        h1: document.querySelectorAll("h1,h2").length,
        imgs: [...document.images].map(i => ({ src: i.currentSrc.split("/").pop(), ok: i.complete && i.naturalWidth > 0 })),
        overflowing, deadButtons: dead, tinyText: small,
        bodyText: (document.body.innerText || "").length,
        hasContent: (document.body.innerText || "").trim().length > 400,
      };
    }).catch(e => ({ fatal: String(e) }));

    const brokenImgs = (probe.imgs || []).filter(i => !i.ok).map(i => i.src);
    const row = { route: r, ...probe, brokenImgs, errors: local };
    report.push(row);
    allErrors.push(...local.map(e => `${r} :: ${e}`));

    if (SHOTS) {
      await page.screenshot({ path: path.join(OUT, `${r}.png`) });
    }
    page.off("pageerror", onErr); page.off("console", onCon);
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

  let fail = 0;
  console.log("route".padEnd(20), "h".padStart(7), "btns".padStart(5), "hOv".padStart(5), "broken".padStart(6), "errs".padStart(5));
  for (const r of report) {
    const bad = r.hOverflow || r.brokenImgs.length || r.errors.length || !r.hasContent;
    if (bad) fail++;
    console.log(String(r.route).padEnd(20), String(r.h || "-").padStart(7), String(r.buttons ?? "-").padStart(5),
      String(r.hOverflow ? "YES" : "no").padStart(5), String(r.brokenImgs.length).padStart(6), String(r.errors.length).padStart(5), bad ? "  <-- REVIEW" : "");
  }
  console.log("\nTotal routes:", report.length, "| routes needing review:", fail);
  if (allErrors.length) { console.log("\n--- errors ---"); allErrors.slice(0, 40).forEach(e => console.log(" ", e)); }
  process.exit(0);
})();
