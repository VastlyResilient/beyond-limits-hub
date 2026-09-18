import fs from "node:fs";

export function createSpendStore(file, capUsd) {
  let total = 0;
  try { total = JSON.parse(fs.readFileSync(file, "utf8")).total || 0; } catch {}
  const save = () => fs.writeFileSync(file, JSON.stringify({ total }));

  return {
    get total() { return total; },
    get cap() { return capUsd; },
    remaining() { return Math.max(0, capUsd - total); },
    /** returns false and refuses once the cap would be exceeded */
    charge(usd) {
      if (!Number.isFinite(usd) || usd <= 0) return true;
      if (total + usd > capUsd) return false;
      total += usd; save(); return true;
    },
  };
}
