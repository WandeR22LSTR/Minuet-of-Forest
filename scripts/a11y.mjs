// Accessibility checks on the built site: axe-core (WCAG 2 A/AA), 360px width with no
// horizontal scroll, keyboard walkthrough of the main nav, and the footer medallion.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { serve } from "./serve.mjs";
import { launch } from "./browser.mjs";
import { NOCTURNE_URL } from "../site.config.mjs";

const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const PAGES = ["/", "/resume/", "/cv/", "/projects/", "/docs/", "/contact/", "/404.html"];
const srv = await serve();
const browser = await launch();
let failed = false;
const fail = (msg) => { failed = true; console.error("FAIL " + msg); };

try {
  for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(srv.origin + srv.base + p);
    await page.addScriptTag({ content: axeSource });
    const r = await page.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }));
    const serious = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    const minor = r.violations.filter((v) => !serious.includes(v));
    console.log(`${p.padEnd(12)} axe: ${r.passes.length} passed, ${serious.length} serious/critical, ${minor.length} minor/moderate${minor.length ? " (" + minor.map((v) => v.id).join(", ") + ")" : ""}`);
    for (const v of serious) fail(`${p} ${v.id}: ${v.help} (${v.nodes.map((n) => n.target).join(" | ")})`);

    await page.setViewportSize({ width: 360, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail(`${p} overflows by ${overflow}px at 360px`);

    if (["/resume/", "/cv/"].includes(p) && (await page.$(".medallion"))) fail(`${p} shows the medallion`);
    await page.close();
  }

  // Keyboard walkthrough: Tab from the top must reach skip link, then every nav link, with visible focus.
  const page = await browser.newPage();
  await page.goto(srv.origin + srv.base + "/");
  const navCount = await page.$$eval(".site-nav a", (a) => a.length);
  const seen = [];
  for (let i = 0; i < navCount + 2; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => {
      const el = document.activeElement;
      const s = getComputedStyle(el);
      return { text: el.textContent.trim(), visible: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 };
    }));
  }
  console.log("Tab order:", seen.map((s) => s.text).join(" > "));
  if (seen[0].text !== "Skip to content") fail("first Tab stop is not the skip link");
  if (seen.some((s) => !s.visible)) fail("a focused element has no visible outline");
  await page.goto(srv.origin + srv.base + "/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  if ((await page.evaluate(() => document.activeElement.id)) !== "main") fail("skip link does not move focus to main");

  // Medallion
  const med = await page.$(".medallion");
  if (!NOCTURNE_URL) {
    if (med) fail("medallion rendered with empty NOCTURNE_URL"); else console.log("Medallion: absent (NOCTURNE_URL empty)");
  } else if (!med) fail("medallion missing although NOCTURNE_URL is set");
  else {
    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await page.evaluate(() => document.activeElement.classList.contains("medallion"));
    }
    if (!reached) fail("medallion not reachable by Tab");
    await page.waitForTimeout(300); // let the fade-in finish
    const info = await page.evaluate(() => {
      const a = document.activeElement;
      return { label: a.getAttribute("aria-label"), rel: a.rel, shown: getComputedStyle(a.querySelector(".medallion-label")).opacity };
    });
    console.log("Medallion:", info);
    if (info.label !== "Nocturne of Shadow (friends only)") fail("medallion aria-label");
    if (info.shown !== "1") fail("medallion label not shown on focus");
    if (!/noopener/.test(info.rel) || !/nofollow/.test(info.rel)) fail("medallion rel");
  }
} finally {
  await browser.close();
  srv.close();
}
if (failed) process.exit(1);
console.log("a11y OK");
