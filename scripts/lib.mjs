import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function walk(dir, skip = ["node_modules", ".git", "dist", ".astro"]) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (skip.includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p, skip)));
    else out.push(p);
  }
  return out;
}

/** Markdown files under src/content with `draft: true` in their frontmatter. */
export async function draftFiles() {
  const files = (await walk("src/content")).filter((f) => /\.mdx?$/.test(f));
  const drafts = [];
  for (const f of files) {
    const fm = (await readFile(f, "utf8")).match(/^---\n([\s\S]*?)\n---/);
    if (fm && /^draft:\s*true\s*$/m.test(fm[1])) drafts.push(f);
  }
  return drafts;
}

/** Route a content file builds to, relative to the base. */
export function routeOf(file) {
  return file
    .replace(/^src\/content\/docs\//, "/")
    .replace(/^src\/content\/pages\//, "/")
    .replace(/(\/index)?\.mdx?$/, "/");
}
