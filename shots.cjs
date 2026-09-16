
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  for (const [route, name] of [["ops-command","cmd"],["ops-composer","composer"],["home","home"]]) {
    await p.goto(`http://localhost:5174/#/${route}`, { waitUntil: "load" });
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `/Users/bobby/beyond-limits-hub/qa/v-${name}.png` });
    // scroll a bit for long pages
    await p.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight*0.95)));
    await p.waitForTimeout(900);
    await p.screenshot({ path: `/Users/bobby/beyond-limits-hub/qa/v-${name}-2.png` });
  }
  await b.close(); console.log("shots done");
})();
