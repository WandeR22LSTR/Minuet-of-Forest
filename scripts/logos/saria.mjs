// Saria's Song: the Kokiri spiral, the mark in the corner of the Saria's Song screensaver.
// An original drawing in the spirit of the Hylian spiral glyph (the font itself stays out of
// this public repo): two tapering strokes, each a low-poly ridge shaded with the shared light
// (engine.mjs), in Kokiri greens.
//   sweep: from the top tip, down the left side and along the bottom to the right
//   curl:  from the bottom-left tail, up the right side and over into the inner hook
// Each stroke is a centreline [x, y, width] in a 1024-unit square (y down), smoothed with the
// forest blade's spline. A ridge runs down its middle, raised in proportion to the width.
import { norm, cross, sub, ramp, svgDoc, f1, pathOf, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";
import { smooth } from "./forest.mjs";

const STROKES = [
  // sweep (drawn first: its blunt end is hidden under the curl)
  [[437, 102, 0], [330, 170, 30], [245, 285, 58], [215, 420, 75], [250, 560, 85], [350, 655, 90], [500, 695, 90], [650, 665, 80], [790, 610, 70]],
  // curl
  [[243, 842, 0], [370, 900, 28], [500, 880, 42], [650, 810, 55], [760, 700, 62], [805, 590, 70], [805, 480, 70], [785, 390, 64], [735, 320, 55], [650, 288, 45], [578, 318, 36], [535, 390, 28], [550, 455, 20], [595, 492, 0]],
];
const WIDTH = 1.25; // widths scaled to the reference's weight
const RIDGE = 0.35; // ridge height, as a fraction of the half-width
const PER = 5; // samples per control segment: few, broad facets, low-poly like the other logos

export const RAMP = ramp([
  [0, "#0b2a14"], [0.2, "#124a22"], [0.34, "#1b6430"], [0.48, "#2a8240"],
  [0.62, "#4aa85a"], [0.76, "#7fd48a"], [0.9, "#cfe8d4"], [1, "#f4fbf5"],
]);
// Outline for the bare (tray) mark, so it reads on light and dark taskbars.
export const OUTLINE = "#124a22";
export const THEMES = {
  light: { tile: ["#f3f8f1", "#dcebd9"], shadow: ["#124a22", 0.24], exposure: -0.12 },
  dark: { tile: ["#14261a", "#0a160e"], shadow: ["#000000", 0.5], exposure: 0.06 },
};

/** One stroke: centreline, left and right edges (raised ridge in the middle), and outline. */
function stroke(ctrl) {
  const c = smooth(ctrl.map(([x, y]) => [x, y]), PER);
  const w = c.map((_, i) => {
    const k = Math.min(ctrl.length - 1, i / PER), j = Math.min(ctrl.length - 2, Math.floor(k)), t = k - j;
    const s = t * t * (3 - 2 * t);
    return ctrl[j][2] + (ctrl[j + 1][2] - ctrl[j][2]) * s;
  });
  const L = [], R = [], M = [];
  c.forEach((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    const [tx, ty] = norm([b[0] - a[0], b[1] - a[1], 0]);
    const h = (w[i] * WIDTH) / 2;
    L.push([p[0] - ty * h, p[1] + tx * h, 0]);
    R.push([p[0] + ty * h, p[1] - tx * h, 0]);
    M.push([p[0], p[1], h * RIDGE]);
  });
  const facets = [];
  for (let i = 0; i < c.length - 1; i++) facets.push([L[i], L[i + 1], M[i + 1], M[i]], [M[i], M[i + 1], R[i + 1], R[i]]);
  return { facets, outline: [...L, ...R.reverse()] };
}
const PARTS = STROKES.map(stroke);

function draw(place, m) {
  let silhouettes = "", body = "";
  for (const { facets, outline } of PARTS) {
    let part = "";
    for (const f of facets) {
      // Quads are slightly twisted; the cross of their diagonals gives a stable average normal.
      let n = cross(sub(f[2], f[0]), sub(f[3], f[1]));
      if (n[2] < 0) n = n.map((v) => -v);
      const col = RAMP.shade(norm(n), m);
      part += `<path d="${pathOf(f.map(place))}" fill="${col}" stroke="${col}" stroke-width="1" stroke-linejoin="round"/>`;
    }
    silhouettes += `<path d="${pathOf(outline.map(place))}"/>`;
    body += part;
  }
  return { silhouettes, body, outlines: PARTS.map((p) => pathOf(p.outline.map(place))) };
}

function box() {
  const pts = PARTS.flatMap((p) => p.outline);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const model = { ambient: 0.16, diffuse: 0.66, spec: 0.28 };

/** The spiral on the shared tile (light or dark). */
export function mark({ theme = "light", size = 512, fill = 0.4, square = false, id = `ss-${theme}` } = {}) {
  const t = THEMES[theme], b = box();
  const extent = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2;
  const place = placement(size, { extent, box: b, origin: [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], fill });
  const e = draw(place, { ...model, exposure: t.exposure });
  const shadow = `<g transform="translate(${f1(size * SHADOW_OFFSET.dx)} ${f1(size * SHADOW_OFFSET.dy)})" fill="${t.shadow[0]}" fill-opacity="${t.shadow[1]}" filter="url(#${id}-soft)">${e.silhouettes}</g>`;
  // A thin dark edge under the strokes, so the lit faces don't wash into the tile (drawn
  // underneath, so the sweep's hidden end stays hidden under the curl).
  const edge = `<g fill="none" stroke="${OUTLINE}" stroke-opacity="0.55" stroke-width="${f1(size * 0.01)}" stroke-linejoin="round">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: tileDefs(id, t.tile) + softDefs(id, size), body: tileRect(id, size, { square }) + shadow + edge + e.body, title: "Kokiri spiral mark" });
}

/**
 * The spiral alone on a transparent background, with a dark green outline so it reads on light
 * and dark taskbars: the tray, app and installer icon. `outline` is its width, of the size.
 */
export function bare({ size = 512, fill = 0.44, outline = 0.025 } = {}) {
  const b = box();
  const extent = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2;
  const place = placement(size, { extent, box: b, origin: [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], fill });
  const e = draw(place, { ...model, exposure: 0.02 });
  const ring = `<g fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${f1(size * outline * 2)}" stroke-linejoin="round">${e.silhouettes}</g>`;
  return svgDoc({ size, body: ring + e.body, title: "Kokiri spiral" });
}
