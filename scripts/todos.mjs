// Lists every remaining TODO(Luca) and every draft page. Finish or keep drafted before going live.
import { readFile } from "node:fs/promises";
import { walk, draftFiles, routeOf } from "./lib.mjs";

const files = (await walk("src")).filter((f) => /\.(md|mdx|astro|ya?ml|ts|mjs)$/.test(f));
let count = 0;
for (const f of files) {
  (await readFile(f, "utf8")).split("\n").forEach((line, i) => {
    if (line.includes("TODO(Luca)") && !line.includes('"TODO(Luca)")')) {
      console.log(`${f}:${i + 1}: ${line.trim()}`);
      count++;
    }
  });
}
const drafts = await draftFiles();
console.log(`\n${count} TODO(Luca) item(s).\n\nDraft pages (excluded from the build):`);
for (const d of drafts) console.log(`  ${routeOf(d)}  (${d})`);
