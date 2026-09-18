// Beyond Limits Hub — Andy AI end-to-end (deterministic, runs against VITE_ANDY_MOCK=1)
// Usage: node andy.e2e.cjs
const { chromium } = require("playwright");

const BASE = process.env.SITE || "http://localhost:5175";
const fail = (m) => { throw new Error(m); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));

  // 1. the first-run welcome appears for a brand new user
  await p.goto(`${BASE}/#/ops-command`, { waitUntil: "networkidle" });
  await p.getByRole("dialog", { name: "Welcome" }).waitFor({ timeout: 15000 });
  console.log("OK  welcome shown to a new user");
  await p.getByRole("button", { name: "Later" }).click();
  await p.getByRole("dialog", { name: "Welcome" }).waitFor({ state: "detached", timeout: 5000 });

  await p.reload({ waitUntil: "networkidle" });
  if (await p.getByRole("dialog", { name: "Welcome" }).count()) fail("welcome reappeared after dismissal");
  console.log("OK  welcome does not reappear");

  // 2. the dock opens and has both modes
  await p.getByRole("button", { name: /Ask Andy/i }).click();
  await p.getByRole("dialog", { name: /Andy's AI/i }).waitFor({ timeout: 10000 });
  const tabs = await p.getByRole("tab").allInnerTexts();
  if (!tabs.join(",").includes("Builder") || !tabs.join(",").includes("Assistant")) fail("both modes missing: " + tabs);
  console.log("OK  dock opens with Builder + Assistant");

  // 3. Builder asks a question when Andy has not said what to change it to
  await p.getByRole("tab", { name: "Builder" }).click();
  await p.getByRole("textbox").fill("rename my home screen");
  await p.getByRole("textbox").press("Enter");
  await p.getByText("I need one thing first.").waitFor({ timeout: 15000 }).catch(() => {});
  const chipCount = await p.locator("button", { hasText: /Call it/ }).count();
  if (!chipCount) fail("no clarifying question was offered");
  console.log("OK  Builder asks before guessing");

  // 4. a full change: preview -> glow -> apply -> persist
  await p.getByRole("textbox").fill("rename my home screen to Today");
  await p.getByRole("textbox").press("Enter");
  await p.getByText("Command Center → Today").waitFor({ timeout: 15000 });
  console.log("OK  preview shows before → after");

  const glowing = await p.locator("[data-edit-focused='true']").count();
  if (!glowing) fail("target did not glow");
  console.log("OK  target outlined for Andy");

  await p.getByRole("button", { name: "Apply", exact: true }).click();
  await p.waitForTimeout(700);
  let label = await p.locator("[data-edit-id='nav.ops-command.label']").first().innerText();
  if (!label.includes("Today")) fail("override did not apply, got: " + label);
  console.log("OK  applied — sidebar reads:", label.trim());

  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  label = await p.locator("[data-edit-id='nav.ops-command.label']").first().innerText();
  if (!label.includes("Today")) fail("override did not persist, got: " + label);
  console.log("OK  persisted across reload");

  // 5. Activity records it and can revert it
  await p.getByRole("button", { name: "Activity", exact: true }).click();
  await p.waitForTimeout(900);
  await p.getByRole("button", { name: /Revert/i }).first().click();
  await p.waitForTimeout(400);
  await p.getByRole("button", { name: "Revert", exact: true }).first().click();
  await p.waitForTimeout(900);
  label = await p.locator("[data-edit-id='nav.ops-command.label']").first().innerText();
  if (!label.includes("Command Center")) fail("revert did not restore, got: " + label);
  console.log("OK  reverted from Activity — reads:", label.trim());

  // 6. Assistant mode answers and never proposes a change
  await p.getByRole("button", { name: /Ask Andy/i }).click();
  await p.getByRole("tab", { name: "Assistant" }).click();
  await p.getByRole("textbox").fill("How many families are in my program?");
  await p.getByRole("textbox").press("Enter");
  await p.waitForTimeout(1600);
  const previews = await p.getByText("Preview — nothing has changed yet").count();
  if (previews) fail("Assistant proposed a change — it must only answer");
  console.log("OK  Assistant answers without proposing changes");

  if (errors.length) fail("page errors: " + errors.join(" | "));
  console.log("\nE2E OK — no page errors");
  await b.close();
})().catch((e) => { console.error("E2E FAILED:", e.message); process.exit(1); });
