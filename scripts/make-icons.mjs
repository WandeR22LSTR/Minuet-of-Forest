// Regenerates public/apple-touch-icon.png and public/og-image.png from the logo mark
// and the self-hosted display font. Run after changing the logo: `node scripts/make-icons.mjs`.
import { readFile } from "node:fs/promises";
import { launch } from "./browser.mjs";
import { SITE_TITLE } from "../site.config.mjs";

const svg = await readFile("src/assets/logo/mark.svg", "utf8");
const font = (await readFile("src/assets/fonts/hylia-serif.woff2")).toString("base64");
const browser = await launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 180, height: 180 });
// iOS fills transparent corners with black, so the touch icon gets a full-bleed background.
await page.setContent(`<body style="margin:0;background:#e9f0e3">${svg.replace(/width="\d+" height="\d+"/, 'width="180" height="180"')}</body>`);
await page.screenshot({ path: "public/apple-touch-icon.png" });

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>@font-face{font-family:H;src:url(data:font/woff2;base64,${font})}
  body{margin:0;width:1200px;height:630px;background:#f4f6f0;display:flex;align-items:center;justify-content:center;gap:56px;font-family:H}
  h1{font-weight:400;font-size:104px;color:#1f4d34;margin:0}
  .band{position:absolute;inset:auto 0 0 0;height:26px;background:#dfe9d6}</style>
  <body>${svg.replace(/width="\d+" height="\d+"/, 'width="260" height="260"')}<h1>${SITE_TITLE}</h1><div class="band"></div></body>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-image.png" });
await browser.close();
console.log("wrote public/apple-touch-icon.png, public/og-image.png");
