import { STUDENTS, PROGRAMS, ORG, LEDGER, FORMS } from "./data";
import { EDIT_REGISTRY } from "./editRegistry";
import { NAV_ITEMS } from "./store";

/* Figures about the real program, taken from the project record (Andy's own
   spreadsheet and the 5 Sept call). These are NOT in data.ts because data.ts
   holds synthetic demo records. Keeping them separate stops the Assistant from
   describing sample data as if it were Andy's real roster. */
export const REAL_PROGRAM = {
  families: 113,
  familiesOriginallyListed: 152,
  familiesRemovedByAndy: 39,
  codesIssued: 9,
  codesThatAreTestRows: 2,
  familiesWithoutACode: 104,
  programs: ["Main", "Horizons", "SCSE", "Starfish"],
  unidentified: "BFFS",
};

export function buildFacts(overrides: Record<string, unknown> = {}): string {
  const lines: string[] = [];

  lines.push(`ORGANISATION: ${ORG.program} (${ORG.short}), founded ${ORG.founded}, based at ${ORG.hq}. ${ORG.grades}.`);
  lines.push(`PARENT BODY: ${ORG.parent}.`);
  lines.push(`MISSION: ${ORG.mission}`);

  lines.push(
    `THE REAL PROGRAM (from Andy's own records): about ${REAL_PROGRAM.families} active families, ` +
    `down from ${REAL_PROGRAM.familiesOriginallyListed} after Andy removed ${REAL_PROGRAM.familiesRemovedByAndy}. ` +
    `${REAL_PROGRAM.codesIssued} participant codes exist and ${REAL_PROGRAM.codesThatAreTestRows} of those are test rows, ` +
    `so ${REAL_PROGRAM.familiesWithoutACode} families still have no code. Programs: ${REAL_PROGRAM.programs.join(", ")}, ` +
    `plus a group called ${REAL_PROGRAM.unidentified} that nobody has identified yet.`
  );

  lines.push(
    `THE DEMO DATA IN THIS APP: ${STUDENTS.length} sample learners, ${LEDGER.length} sample invoices and ` +
    `${FORMS.length} sample forms. These are synthetic examples, NOT real families. Never present them as real.`
  );

  lines.push(`PROGRAMS OFFERED: ${PROGRAMS.map((p: any) => p.name).join(", ")}.`);

  for (const g of NAV_ITEMS.ops) {
    const items = g.items.map((i) => overrides[`nav.${i.id}.label`] ?? i.label);
    lines.push(`SIDEBAR GROUP "${g.group}": ${items.join(", ")}.`);
  }

  lines.push(
    `WHAT THE BUILDER CAN CHANGE: ` +
    EDIT_REGISTRY.map((t) => `${t.label} [${t.id}] — ${t.help}`).join(" | ")
  );

  return lines.join("\n");
}
