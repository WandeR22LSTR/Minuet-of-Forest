// Builds every project logo with the shared engine (scripts/logos/).
//   node scripts/make-logos.mjs            all projects
//   node scripts/make-logos.mjs forest     Minuet of Forest only (this site)
//   node scripts/make-logos.mjs light      Prelude of Light only
//   node scripts/make-logos.mjs shadow     Nocturne of Shadow only
//   node scripts/make-logos.mjs ice        Ice Cavern only
//   node scripts/make-logos.mjs temple     Temple of Time only
//   node scripts/make-logos.mjs lens       Lens of Truth only
//   node scripts/make-logos.mjs saria      Saria's Song only (output is git-ignored: it goes to a private repo)
// Forest goes into the site (src/assets/logo, public/). Other projects go into logos/<project>/,
// for copying into their own repos.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as forest from "./logos/forest.mjs";
import * as light from "./logos/light.mjs";
import * as shadow from "./logos/shadow.mjs";
import * as ice from "./logos/ice.mjs";
import * as temple from "./logos/temple.mjs";
import * as saria from "./logos/saria.mjs";
import * as lens from "./logos/lens.mjs";
import { renderPngs, writeIco } from "./logos/engine.mjs";
import { SITE_TITLE } from "../site.config.mjs";

const only = process.argv[2];
const want = (name) => !only || only === name;

/** Standard raster set from one square (full-bleed) SVG and one tile SVG. */
async function rasters(dir, { square, tile }) {
  await renderPngs([
    { svg: square, size: 180, path: `${dir}/apple-touch-icon.png` },
    { svg: square, size: 192, path: `${dir}/icon-192.png` },
    { svg: square, size: 512, path: `${dir}/icon-512.png` },
    { svg: tile, size: 32, path: `${dir}/.ico-32.png` },
    { svg: tile, size: 48, path: `${dir}/.ico-48.png` },
  ]);
  await writeIco(`${dir}/favicon.ico`, await Promise.all([32, 48].map(async (size) => ({ size, png: await readFile(`${dir}/.ico-${size}.png`) }))));
  const { rm } = await import("node:fs/promises");
  await rm(`${dir}/.ico-32.png`); await rm(`${dir}/.ico-48.png`);
}
const manifest = (name, short, colour) => JSON.stringify({
  name, short_name: short,
  icons: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png" }],
  theme_color: colour, background_color: colour, display: "browser",
}, null, 2) + "\n";

if (want("forest")) {
  const out = "src/assets/logo";
  await mkdir(out, { recursive: true });
  const files = {
    "medallion.svg": forest.medallion(),
    "medallion-compact.svg": forest.medallion({ compact: true, strips: 20 }),
    "mark-compact.svg": forest.mark({ strips: 20 }),
    "mark.svg": forest.mark(),
    "mark-bare.svg": forest.mark({ tile: false, strips: 32 }),
  };
  for (const [name, svg] of Object.entries(files)) await writeFile(`${out}/${name}`, svg);
  // Tab icon, bookmarks and home-screen icons use the mark.
  await writeFile("public/favicon.svg", files["mark-compact.svg"]);
  await rasters("public", { square: forest.mark({ square: true }), tile: files["mark-compact.svg"] });
  await writeFile("public/site.webmanifest", manifest(SITE_TITLE, "Minuet", forest.TILE[0]));
  // Link preview: the mark next to the title in the display font.
  const font = (await readFile("src/assets/fonts/hylia-serif.woff2")).toString("base64");
  const og = `<style>@font-face{font-family:H;src:url(data:font/woff2;base64,${font})}
  body{margin:0;width:1200px;height:630px;background:#f4f6f0;display:flex;align-items:center;justify-content:center;gap:56px;font-family:H}
  h1{font-weight:400;font-size:104px;color:#1f4d34;margin:0}
  .band{position:absolute;inset:auto 0 0 0;height:26px;background:#dfe9d6}</style>
  <body>${files["mark.svg"].replace(/width="\d+" height="\d+"/, 'width="260" height="260"')}<h1>${SITE_TITLE}</h1><div class="band"></div></body>`;
  await renderOg(og);
  console.log(`forest: ${out}/, public/ icons`);
}

if (want("light")) {
  const out = "logos/prelude-of-light";
  await mkdir(out, { recursive: true });
  await writeFile(`${out}/logo-light.svg`, light.mark({ theme: "light" }));
  await writeFile(`${out}/logo-dark.svg`, light.mark({ theme: "dark" }));
  // Full medallion (footer, large display), per theme, plus a compact one for small sizes.
  for (const theme of ["light", "dark"]) {
    await writeFile(`${out}/medallion-${theme}.svg`, light.medallion({ theme }));
    await writeFile(`${out}/medallion-${theme}-compact.svg`, light.medallion({ theme, compact: true }));
  }
  // Large transparent renders, kept for future use.
  await renderPngs(["light", "dark"].map((theme) => ({ svg: light.medallion({ theme }), size: 1024, path: `${out}/medallion-${theme}-1024.png` })));
  // Bookmarks can't switch themes, so the raster set uses the light logo.
  await rasters(out, { square: light.mark({ theme: "light", square: true }), tile: light.mark({ theme: "light" }) });
  await writeFile(`${out}/site.webmanifest`, manifest("Prelude of Light", "Prelude", light.THEMES.light.tile[0]));
  // Discord crops avatars to a circle: square dark tile, emblem small enough to clear the crop.
  await renderPngs([{ svg: light.mark({ theme: "dark", square: true, fill: 0.31 }), size: 1024, path: `${out}/discord-avatar-1024.png` }]);
  console.log(`light: ${out}/`);
}

if (want("shadow")) {
  const out = "logos/nocturne-of-shadow";
  await mkdir(out, { recursive: true });
  const files = {
    "logo.svg": shadow.mark(),
    "medallion.svg": shadow.medallion(),
    "medallion-compact.svg": shadow.medallion({ compact: true }),
  };
  for (const [name, svg] of Object.entries(files)) await writeFile(`${out}/${name}`, svg);
  await rasters(out, { square: shadow.mark({ square: true }), tile: files["logo.svg"] });
  await writeFile(`${out}/site.webmanifest`, manifest("Nocturne of Shadow", "Nocturne", shadow.TILE[1]));
  // This site's hidden footer link to Nocturne uses the mark.
  await writeFile("src/assets/logo/nocturne-mark.svg", files["logo.svg"]);
  console.log(`shadow: ${out}/`);
}

if (want("ice")) {
  const out = "logos/ice-cavern";
  await mkdir(out, { recursive: true });
  const files = {
    "logo.svg": ice.mark(),
    "logo-dark.svg": ice.mark({ dark: true }),
    "medallion.svg": ice.medallion(),
    "medallion-compact.svg": ice.medallion({ compact: true }),
  };
  for (const [name, svg] of Object.entries(files)) await writeFile(`${out}/${name}`, svg);
  await rasters(out, { square: ice.mark({ square: true }), tile: files["logo.svg"] });
  await writeFile(`${out}/site.webmanifest`, manifest("Ice Cavern", "Ice Cavern", ice.TILE[0]));
  await renderPngs([{ svg: files["medallion.svg"], size: 1024, path: `${out}/medallion-1024.png` }]);
  console.log(`ice: ${out}/`);
}

if (want("temple")) {
  const out = "logos/temple-of-time";
  await mkdir(out, { recursive: true });
  const files = {
    "logo.svg": temple.mark(),
    "logo-dark.svg": temple.mark({ theme: "dark" }),
    "medallion.svg": temple.medallion(),
  };
  for (const [name, svg] of Object.entries(files)) await writeFile(`${out}/${name}`, svg);
  await rasters(out, { square: temple.mark({ square: true }), tile: files["logo.svg"] });
  await writeFile(`${out}/site.webmanifest`, manifest("Temple of Time", "Temple", temple.THEMES.light.tile[0]));
  await renderPngs([
    { svg: files["medallion.svg"], size: 1024, path: `${out}/medallion-1024.png` },
    // Discord crops avatars to a circle: square dark tile, emblem small enough to clear the crop.
    { svg: temple.mark({ theme: "dark", square: true, fill: 0.31 }), size: 1024, path: `${out}/discord-avatar-1024.png` },
  ]);
  console.log(`temple: ${out}/`);
}

if (want("saria")) {
  // Saria's Song lives in a private repo: these files are git-ignored here and handed over as a zip.
  const out = "logos/sarias-song";
  await mkdir(`${out}/png`, { recursive: true });
  const files = { "spiral.svg": saria.bare() };
  for (const [name, svg] of Object.entries(files)) await writeFile(`${out}/${name}`, svg);
  // App, tray and installer icon: the bare spiral with its outline, at the Windows icon sizes.
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  await renderPngs(sizes.map((size) => ({ svg: files["spiral.svg"], size, path: `${out}/png/spiral-${size}.png` })));
  await writeIco(`${out}/saria-song.ico`, await Promise.all([16, 24, 32, 48, 64, 128, 256].map(async (size) => ({ size, png: await readFile(`${out}/png/spiral-${size}.png` ) }))));
  await writeFile(`${out}/saria-song.png`, await readFile(`${out}/png/spiral-256.png`));
  console.log(`saria: ${out}/`);
}

if (want("lens")) {
  const out = "logos/lens-of-truth";
  await mkdir(`${out}/png`, { recursive: true });
  const svg = lens.bare();
  await writeFile(`${out}/lens.svg`, svg);
  // Variant for comparison: the teardrop in the same pink, no purple.
  await writeFile(`${out}/lens-pink.svg`, lens.bare({ drop: "pink" }));
  await renderPngs([{ svg: lens.bare({ drop: "pink" }), size: 1024, path: `${out}/lens-pink-1024.png` }]);
  // App icon, favicon and door: the outlined lens, at the usual icon sizes.
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  await renderPngs(sizes.map((size) => ({ svg, size, path: `${out}/png/lens-${size}.png` })));
  await writeIco(`${out}/lens-of-truth.ico`, await Promise.all([16, 24, 32, 48, 64, 128, 256].map(async (size) => ({ size, png: await readFile(`${out}/png/lens-${size}.png`) }))));
  console.log(`lens: ${out}/`);
}

async function renderOg(html) {
  const { launch } = await import("./browser.mjs");
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/og-image.png" });
  await browser.close();
}
