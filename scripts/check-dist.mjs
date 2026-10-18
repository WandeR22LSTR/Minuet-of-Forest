// Verifies the built site in dist/: no TODO(Luca) text, no draft pages, no external
// resource loads, every internal link/asset resolves under the base path, sitemap sane,
// medallion never on resume/CV. Run after `npm run build`.
import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { walk, draftFiles, routeOf } from "./lib.mjs";
import { SITE, BASE, NOCTURNE_URL } from "../site.config.mjs";

const prefix = BASE.replace(/\/$/, "");
const siteRoot = new URL(prefix + "/", SITE).href;
const files = await walk("dist", []);
const html = files.filter((f) => f.endsWith(".html"));
const errors = [];
const exists = (p) => access(p).then(() => true, () => false);

for (const f of files.filter((f) => /\.(html|css|js|xml|txt)$/.test(f))) {
  if ((await readFile(f, "utf8")).includes("TODO(Luca)")) errors.push(`${f}: contains TODO(Luca)`);
}
for (const d of await draftFiles()) {
  if (await exists(join("dist", routeOf(d), "index.html"))) errors.push(`draft built: ${routeOf(d)}`);
}

let links = 0;
for (const f of html) {
  const src = await readFile(f, "utf8");
  // Resource loads: must be same-origin.
  for (const m of src.matchAll(/<(script|img|link|iframe|source|video|audio)\b[^>]*?\s(src|href)="([^"]+)"/g)) {
    const [tag, , , val] = m;
    const isNav = /rel="(canonical|sitemap)"/.test(tag);
    if (/^(https?:)?\/\//.test(val) && !isNav) errors.push(`${f}: external resource ${val}`);
  }
  for (const m of src.matchAll(/url\((["']?)(https?:)?\/\/[^)]+\)/g)) errors.push(`${f}: external css url ${m[0]}`);
  // Internal links and assets: must carry the base and resolve to a file.
  for (const m of src.matchAll(/<[^>]*\s(?:href|src)="([^"#?]*)[^"]*"[^>]*>/g)) {
    if (/rel="canonical"/.test(m[0])) continue;
    let val = m[1];
    if (!val || /^(mailto:|tel:|data:)/.test(val)) continue;
    if (val.startsWith(siteRoot)) val = val.slice(SITE.length);
    else if (/^(https?:)?\/\//.test(val)) continue;
    if (!val.startsWith("/")) val = new URL(val, "http://x" + prefix + f.slice(4).replace(/[^/]*$/, "")).pathname;
    if (!val.startsWith("/")) { errors.push(`${f}: relative link ${val}`); continue; }
    links++;
    if (!val.startsWith(prefix + "/")) { errors.push(`${f}: link drops base: ${val}`); continue; }
    let target = join("dist", val.slice(prefix.length));
    if (val.endsWith("/")) target = join(target, "index.html");
    if (!(await exists(target))) errors.push(`${f}: broken link ${val}`);
  }
}

for (const f of ["dist/resume/index.html", "dist/cv/index.html"]) {
  if ((await readFile(f, "utf8")).includes('class="medallion')) errors.push(`${f}: medallion must not appear here`);
}
const sitemap = files.filter((f) => /sitemap.*\.xml$/.test(f));
for (const f of sitemap) {
  const s = await readFile(f, "utf8");
  if (/404/.test(s)) errors.push(`${f}: lists 404`);
  if (NOCTURNE_URL && s.includes(NOCTURNE_URL)) errors.push(`${f}: lists Nocturne`);
}
for (const pdf of ["dist/resume.pdf", "dist/cv.pdf"]) {
  if (!(await exists(pdf))) { errors.push(`missing ${pdf}`); continue; }
  const b = (await readFile(pdf)).toString("latin1");
  if (!b.includes(siteRoot)) errors.push(`${pdf}: no link back to the site`);
  if (NOCTURNE_URL && b.includes(NOCTURNE_URL)) errors.push(`${pdf}: contains Nocturne URL`);
}

console.log(`${html.length} pages, ${links} internal links checked.`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("dist OK");
