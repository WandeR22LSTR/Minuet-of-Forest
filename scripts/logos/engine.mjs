// Shared drawing engine for the project logos (medallion marks).
// Every mark is lit the same way (from the top left, slightly in front), sits on the same
// rounded tile and is rendered to the same set of files, so the projects match.
import { writeFile } from "node:fs/promises";

export function norm(v) { const l = Math.hypot(...v); return v.map((x) => x / l); }
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const rot = ([x, y], deg) => { const t = (deg * Math.PI) / 180; return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)]; };

export const LIGHT = norm([-0.55, -0.7, 0.85]);
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

/** A tone ramp: [value, colour] stops from 0 (deepest shadow) to 1 (specular peak). */
export function ramp(stops) {
  function tone(v) {
    v = Math.min(1, Math.max(0, v));
    for (let i = 1; i < stops.length; i++) {
      if (v <= stops[i][0]) {
        const [a, ca] = stops[i - 1], [b, cb] = stops[i], t = (v - a) / (b - a);
        const [x, y] = [hex(ca), hex(cb)];
        return "#" + x.map((c, k) => Math.round(c + (y[k] - c) * t).toString(16).padStart(2, "0")).join("");
      }
    }
    return stops.at(-1)[1];
  }
  /** Lambert + Blinn-Phong for a unit normal. `exposure` shifts the whole ramp. */
  function shade(n, { ambient = 0.16, diffuse = 0.62, spec = 0.3, shine = 22, exposure = 0 } = {}) {
    return tone(ambient + diffuse * Math.max(0, dot(n, LIGHT)) + spec * Math.max(0, dot(n, HALF)) ** shine + exposure);
  }
  return { tone, shade, deepest: stops[0][1] };
}

// --- SVG helpers -------------------------------------------------------------
export function svgDoc({ size = 512, body, defs = "", title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    (title ? `<title>${title}</title>` : "") + (defs ? `<defs>${defs}</defs>` : "") + body + `</svg>\n`;
}
export const f1 = (v) => (Math.round(v * 10) / 10).toString();
export const pathOf = (pts, close = true) => "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join("L") + (close ? "Z" : "");

/** The shared tile: rounded square, corner radius 22%, soft vertical gradient. */
export const tileDefs = (id, [top, bottom]) =>
  `<linearGradient id="${id}-tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
export const tileRect = (id, size, { square = false } = {}) =>
  `<rect width="${size}" height="${size}"${square ? "" : ` rx="${f1(size * 0.22)}"`} fill="url(#${id}-tile)"/>`;
/** The shared soft shadow under a mark's shapes. */
export const softDefs = (id, size) =>
  `<filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f1(size * 0.012)}"/></filter>`;
export const SHADOW_OFFSET = { dx: 0.012, dy: 0.02 }; // of the size

/**
 * Placement for a mark: scales `extent` (half-size of the shapes in their own units) to `fill`
 * of the tile and centres them optically, three quarters of the way from `origin` to the
 * centre of their bounding box.
 */
export function placement(size, { extent, box, origin = [0, 0], fill = 0.4 }) {
  const S = (size * fill) / extent;
  const ox = origin[0] + ((box.x0 + box.x1) / 2 - origin[0]) * 0.75;
  const oy = origin[1] + ((box.y0 + box.y1) / 2 - origin[1]) * 0.75;
  const place = ([x, y]) => [size / 2 + (x - ox) * S, size / 2 + (y - oy) * S];
  place.scale = S;
  return place;
}

// --- Raster output -----------------------------------------------------------
/** Renders SVG strings to PNG files with headless Chromium. jobs: [{ svg, size, path, background }] */
export async function renderPngs(jobs) {
  const { launch } = await import("../browser.mjs");
  const browser = await launch();
  const page = await browser.newPage();
  try {
    for (const { svg, size, path, background } of jobs) {
      await page.setViewportSize({ width: size, height: size });
      const sized = svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
      await page.setContent(`<body style="margin:0;background:${background ?? "transparent"}">${sized}</body>`);
      await page.screenshot({ path, omitBackground: !background });
    }
  } finally {
    await browser.close();
  }
}

/** Packs PNG buffers (each with its pixel size) into a .ico file. */
export async function writeIco(path, images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(png.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  await writeFile(path, Buffer.concat([head, ...images.map((i) => i.png)]));
}
