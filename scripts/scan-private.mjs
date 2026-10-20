// Scans the repo (and dist/ if built) for identifiers that must never be published
// (docs/temple-of-time-summary.md, "Never publish"). Exits 1 on any hit.
import { readFile } from "node:fs/promises";
import { walk } from "./lib.mjs";

const PATTERNS = [
  ["IPv4 address", /\b(?!127\.0\.0\.1\b)(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b(?![.\d])/g],
  ["IPv6 address", /\b(?:[0-9a-f]{1,4}:){4,7}[0-9a-f]{1,4}\b/gi],
  ["MAC address", /\b(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}\b/gi],
  ["tailnet name", /\b[\w-]+\.ts\.net\b|\btail[0-9a-f]{4,}\b/gi],
  ["Discord webhook", /discord(?:app)?\.com\/api\/webhooks/gi],
  ["Discord ID / long number", /\b\d{17,20}\b/g],
  ["token-like secret", /\b(?:ghp_|gho_|github_pat_|xox[abp]-|sk-|tskey-)[\w-]{10,}/g],
  ["private key", /BEGIN [A-Z ]*PRIVATE KEY/g],
  ["SSH alias / user@host", /\b[a-z_][\w-]*@(?!v?\d)(?!anthropic\.com|users\.noreply)[a-z][\w-]*(?:\.local|\.lan|\.home)?\b(?!\.)/g],
  ["phone number", /\+\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/g],
  ["time-of-day schedule", /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g],
  ["cron expression", /^\s*(?:[\d*\/,-]+\s+){4}[\d*\/,-]+\s+\S/gm],
];
// Files that legitimately contain digits/patterns (lockfile hashes, this scanner).
const SKIP = [/package-lock\.json$/, /scripts\/scan-private\.mjs$/, /\.(pdf|png|ico|woff2?|zip)$/, /dist\/_astro\//]; // zips: their contents are also in the repo unzipped

const files = [...(await walk(".")), ...(await walk("dist", []).catch(() => []))];
let hits = 0;
for (const f of files) {
  if (SKIP.some((r) => r.test(f))) continue;
  const lines = (await readFile(f, "utf8")).split("\n");
  lines.forEach((line, i) => {
    for (const [name, re] of PATTERNS) {
      for (const m of line.matchAll(re)) {
        console.log(`${f}:${i + 1}: ${name}: ${m[0]}`);
        hits++;
      }
    }
  });
}
if (hits) { console.error(`\n${hits} possible private identifier(s). Remove them or, if a false positive, adjust the scanner.`); process.exit(1); }
console.log(`Scanned ${files.length} files: no private identifiers found.`);
