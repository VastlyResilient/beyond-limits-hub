
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:940}})).newPage();
  await p.goto("http://localhost:4173/#/ops-composer", {waitUntil:"load"});
  await p.waitForTimeout(1400);
  const out = await p.evaluate(() => {
    const vw = window.innerWidth;
    const worst = [];
    document.querySelectorAll("body *").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1) {
        worst.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0,90), right: Math.round(r.right), w: Math.round(r.width), txt: (el.textContent||"").trim().slice(0,40) });
      }
    });
    worst.sort((a,c)=>c.right-a.right);
    return { vw, docW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, top: worst.slice(0,10) };
  });
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
