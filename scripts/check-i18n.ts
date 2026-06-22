#!/usr/bin/env ts-node
/**
 * scripts/check-i18n.ts
 *
 * Compares translation keys between ar.json and en.json and reports differences.
 *
 * Usage:
 *   npx ts-node scripts/check-i18n.ts
 *   -- or via npm script --
 *   npm run check-i18n
 *
 * Exit code:
 *   0 — files are in sync
 *   1 — missing keys detected (fails CI / pre-push hook)
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const AR_PATH = path.join(ROOT, "messages", "ar.json");
const EN_PATH = path.join(ROOT, "messages", "en.json");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively flattens a nested object to dot-separated keys */
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

/** Returns keys that are in `source` but not in `target` */
function missingIn(source: string[], target: string[]): string[] {
  const targetSet = new Set(target);
  return source.filter((k) => !targetSet.has(k));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("🔍  Checking i18n key parity between ar.json and en.json …\n");

  if (!fs.existsSync(AR_PATH) || !fs.existsSync(EN_PATH)) {
    console.error("❌  Could not find messages/ar.json or messages/en.json");
    process.exit(1);
  }

  const ar = JSON.parse(fs.readFileSync(AR_PATH, "utf-8")) as Record<string, unknown>;
  const en = JSON.parse(fs.readFileSync(EN_PATH, "utf-8")) as Record<string, unknown>;

  const arKeys = flattenKeys(ar).sort();
  const enKeys = flattenKeys(en).sort();

  const missingInEn = missingIn(arKeys, enKeys);
  const missingInAr = missingIn(enKeys, arKeys);

  let hasErrors = false;

  if (missingInEn.length > 0) {
    hasErrors = true;
    console.error(`⚠️  Keys present in ar.json but MISSING in en.json (${missingInEn.length}):`);
    missingInEn.forEach((k) => console.error(`   • ${k}`));
    console.log();
  }

  if (missingInAr.length > 0) {
    hasErrors = true;
    console.error(`⚠️  Keys present in en.json but MISSING in ar.json (${missingInAr.length}):`);
    missingInAr.forEach((k) => console.error(`   • ${k}`));
    console.log();
  }

  if (!hasErrors) {
    console.log(`✅  All ${arKeys.length} keys are in sync between ar.json and en.json.`);
    process.exit(0);
  } else {
    console.error(
      `\n❌  Fix the missing keys above before pushing to production.\n` +
        `   Add them to both ar.json and en.json with appropriate translations.\n`
    );
    process.exit(1);
  }
}

main();
