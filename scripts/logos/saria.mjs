// Saria's Song: the Kokiri spiral, the mark in the corner of the Saria's Song screensaver.
// An original drawing in the spirit of the Hylian spiral glyph (the font itself stays out of
// this public repo): two tapering strokes, each a low-poly ridge shaded with the shared light
// (engine.mjs), in Kokiri greens.
//   sweep: from the top tip, down the left side and along the bottom to the right
//   curl:  from the bottom-left tail, up the right side and over into the inner hook
// Each stroke is a centreline [x, y, width] in a 1024-unit square (y down), smoothed with the
// forest blade's spline. A ridge runs down its middle, raised in proportion to the width.
import { norm, cross, sub, ramp, svgDoc, f1, pathOf, placement } from "./engine.mjs";
import { smooth } from "./forest.mjs";

// Centrelines and widths measured across the glyph's strokes, then drawn through by hand.
const STROKES = [
  // sweep (drawn first: its blunt end is hidden under the curl)
  [[437, 102, 0], [343, 160, 24], [301, 200, 33], [248, 280, 48], [223, 360, 62], [220, 440, 78], [240, 540, 92], [290, 615, 100],
    [380, 660, 105], [440, 684, 105], [500, 693, 93], [560, 690, 87], [620, 678, 85], [680, 661, 86], [740, 638, 87], [790, 615, 85]],
  // curl
  [[245, 843, 0], [320, 885, 15], [380, 901, 23], [440, 905, 30], [500, 899, 38], [560, 883, 48], [643, 840, 55], [693, 800, 58],
    [730, 760, 60], [758, 720, 62], [790, 650, 66], [808, 560, 69], [808, 480, 66], [800, 440, 67], [785, 400, 66], [761, 360, 63],
    [721, 320, 58], [680, 296, 55], [620, 291, 47], [565, 320, 42], [535, 360, 40], [529, 400, 38], [537, 440, 33], [560, 472, 22], [595, 492, 0]],
];
const WIDTH = 1.35; // bolder than the glyph, for a heavier icon
const RIDGE = 0.35; // ridge height, as a fraction of the half-width
const PER = 24; // samples per control segment: fine enough that the shading reads as smooth

export const RAMP = ramp([
  [0, "#0b2a14"], [0.2, "#124a22"], [0.34, "#1b6430"], [0.48, "#2a8240"],
  [0.62, "#4aa85a"], [0.76, "#7fd48a"], [0.9, "#cfe8d4"], [1, "#f4fbf5"],
]);
// Outline for the bare (tray) mark, so it reads on light and dark taskbars.
export const OUTLINE = "#124a22";

/** One stroke: centreline, left and right edges (raised ridge in the middle), and outline. */
function stroke(ctrl) {
  const c = smooth(ctrl.map(([x, y]) => [x, y]), PER);
  // Width: linear between the measured points, then averaged over one segment either side so it
  // swells and tapers without bumps at the points. Near the tips the narrower of the two is
  // used, so the tips stay sharp.
  const raw = c.map((_, i) => {
    const k = Math.min(ctrl.length - 1, i / PER), j = Math.min(ctrl.length - 2, Math.floor(k)), t = k - j;
    return ctrl[j][2] + (ctrl[j + 1][2] - ctrl[j][2]) * t;
  });
  const w = raw.map((v, i) => {
    let sum = 0, n = 0;
    for (let d = -PER; d <= PER; d++) { const q = raw[i + d]; if (q !== undefined) { sum += q; n++; } }
    const nearTip = i < 2 * PER || i > raw.length - 1 - 2 * PER;
    return nearTip ? Math.min(v, sum / n) : sum / n;
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
  return { facets, outline: [...L, ...[...R].reverse()], halves: [[...L, ...[...M].reverse()], [...M, ...[...R].reverse()]] };
}
const PARTS = STROKES.map(stroke);

function draw(place, m) {
  let silhouettes = "", body = "";
  for (const { facets, outline, halves } of PARTS) {
    let part = "";
    const cols = [[], []];
    facets.forEach((f, i) => {
      // Quads are slightly twisted; the cross of their diagonals gives a stable average normal.
      let n = cross(sub(f[2], f[0]), sub(f[3], f[1]));
      if (n[2] < 0) n = n.map((v) => -v);
      const col = RAMP.shade(norm(n), m);
      cols[i % 2].push(col);
      part += `<path d="${pathOf(f.map(place))}" fill="${col}"/>`;
    });
    // Each half of the stroke underneath in its middle tone, so the hairline seams between the
    // thin facets show a matching colour instead of the background.
    const under = halves.map((h, k) => `<path d="${pathOf(h.map(place))}" fill="${cols[k][cols[k].length >> 1]}"/>`).join("");
    silhouettes += `<path d="${pathOf(outline.map(place))}"/>`;
    body += under + part;
  }
  return { silhouettes, body, outlines: PARTS.map((p) => pathOf(p.outline.map(place))) };
}

function box() {
  const pts = PARTS.flatMap((p) => p.outline);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const model = { ambient: 0.16, diffuse: 0.66, spec: 0.28 };

/**
 * The spiral alone on a transparent background, with a dark green outline so it reads on light
 * and dark taskbars: the tray, app and installer icon, and the Ice Cavern door. There is no
 * tile version. `outline` is its width, of the size.
 */
export function bare({ size = 512, fill = 0.44, outline = 0.025 } = {}) {
  const b = box();
  const extent = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2;
  const place = placement(size, { extent, box: b, origin: [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], fill });
  const e = draw(place, { ...model, exposure: 0.02 });
  const ring = `<g fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${f1(size * outline * 2)}" stroke-linejoin="round">${e.silhouettes}</g>`;
  return svgDoc({ size, body: ring + e.body, title: "Kokiri spiral" });
}
