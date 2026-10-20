// Lens of Truth: the Sheikah eye, in the Lens of Truth's colours. Drawn after the Sheikah
// symbol: three spikes above (the symbol's triangles, as the lens's red spikes), the eye with
// curled ends and an oval pupil, and a stem down to a teardrop. The spikes and eye are one
// pinkish red, from the eye on the lens's glass, teardrop included. The eye and the pupil are
// filled with the lens's glass: nearly opaque, so it looks the same on light and dark backgrounds.
// Every part is a solid lit by the shared light (engine.mjs). One mark on a transparent
// background with a dark outline, like Saria's Song's, so it reads on light and dark.
// Coordinates are measured in a 512-unit drawing of the symbol (y down), centred on the eye.
import { norm, cross, sub, ramp, svgDoc, f1, pathOf, placement, emblem } from "./engine.mjs";
import { smooth } from "./forest.mjs";

// The pinkish red of the eye on the lens's glass: spikes and eye (and the teardrop, if pink).
const eyeRed = ramp([
  [0, "#3a0418"], [0.2, "#6e0a2e"], [0.38, "#a8123f"], [0.55, "#d81b4f"],
  [0.7, "#ef4a72"], [0.85, "#f88aa5"], [1, "#ffe3ec"],
]);
export const OUTLINE = "#1a0630";

const C = [268, 250], U = 200; // the symbol's eye centre and unit, in its 512-unit drawing
const n = ([x, y, w]) => [(x - C[0]) / U, (y - C[1]) / U, w / U];

/**
 * A ribbon solid along a centreline: [x, y, width] points, smoothed, with a ridge down the
 * middle raised `ridge` × the half-width. Closed ribbons loop. Shaded in fine facets over an
 * underlay of each half in its middle tone, so no slices show (as on Saria's Song).
 */
function ribbon(ctrl, { closed = false, ridge = 0.35, per = 16 } = {}) {
  const pts = closed ? [...ctrl, ctrl[0]] : ctrl;
  const c = smooth(pts.map(([x, y]) => [x, y]), per);
  const w = c.map((_, i) => {
    const k = Math.min(pts.length - 1, i / per), j = Math.min(pts.length - 2, Math.floor(k)), t = k - j;
    return pts[j][2] + (pts[j + 1][2] - pts[j][2]) * t;
  });
  const L = [], R = [], M = [];
  c.forEach((p, i) => {
    const a = c[i === 0 && closed ? c.length - 2 : Math.max(0, i - 1)], b = c[i === c.length - 1 && closed ? 1 : Math.min(c.length - 1, i + 1)];
    const [tx, ty] = norm([b[0] - a[0], b[1] - a[1], 0]);
    const h = w[i] / 2;
    L.push([p[0] - ty * h, p[1] + tx * h, 0]);
    R.push([p[0] + ty * h, p[1] - tx * h, 0]);
    M.push([p[0], p[1], h * ridge]);
  });
  const facets = [];
  for (let i = 0; i < c.length - 1; i++) facets.push([L[i], L[i + 1], M[i + 1], M[i]], [M[i], M[i + 1], R[i + 1], R[i]]);
  const rev = (a) => [...a].reverse();
  return closed
    ? { facets, halves: [[L, rev(M)], [M, rev(R)]], silhouette: [L, rev(R)] }
    : { facets, halves: [[[...L, ...rev(M)]], [[...M, ...rev(R)]]], silhouette: [[...L, ...rev(R)]] };
}

function drawRibbon(place, rb, r, m) {
  const cols = [[], []];
  let body = "";
  rb.facets.forEach((f, i) => {
    let n = cross(sub(f[2], f[0]), sub(f[3], f[1]));
    if (n[2] < 0) n = n.map((v) => -v);
    const col = r.shade(norm(n), m);
    cols[i % 2].push(col);
    body += `<path d="${pathOf(f.map(place))}" fill="${col}"/>`;
  });
  const loops = (ls) => ls.map((l) => pathOf(l.map(place))).join("");
  const under = rb.halves.map((h, k) => `<path fill-rule="evenodd" d="${loops(h)}" fill="${cols[k][cols[k].length >> 1]}"/>`).join("");
  return { body: under + body, silhouette: `<path fill-rule="evenodd" d="${loops(rb.silhouette)}"/>`, filled: `<path d="${pathOf(rb.silhouette[0].map(place))}"/>` };
}


// Upper lid, running on into a curl at each end, and the lower lid (its ends hidden under the upper's).
const UPPER = ribbon([[128, 250, 4], [117, 243, 12], [118, 232, 16], [135, 226, 17], [152, 228, 17], [190, 198, 17], [230, 183, 17], [268, 178, 17],
  [306, 183, 17], [346, 198, 17], [384, 228, 17], [401, 226, 17], [418, 232, 16], [419, 243, 12], [408, 250, 4]].map(n), { ridge: 0.45 });
const LOWER = ribbon([[156, 232, 12], [190, 268, 17], [230, 286, 17], [268, 291, 17], [306, 286, 17], [346, 268, 17], [380, 232, 12]].map(n), { ridge: 0.45 });
const PUPIL = ribbon(Array.from({ length: 12 }, (_, k) => { const t = (2 * Math.PI * k) / 12; return n([268 + 24 * Math.cos(t), 232 + 32 * Math.sin(t), 14]); }), { closed: true, ridge: 0.45 });
// Stem from the pupil down through the lower lid, swelling into the teardrop. It is round, so
// it is shaded across its width (lit from the left) rather than with a ridge.
const DROP = ribbon([[268, 262, 13], [268, 300, 13], [268, 330, 15], [268, 360, 30], [268, 395, 52], [268, 425, 58], [268, 445, 52], [268, 458, 40], [268, 466, 26], [268, 470, 12], [268, 471, 0]].map(n), { ridge: 0.45, per: 12 });

// The three spikes: at the top and 42° either side, radiating from the eye centre, clear of the lid.
const SPIKES = [-90, -132, -48].map((deg) => {
  const t = (deg * Math.PI) / 180, u = [Math.cos(t), Math.sin(t)], v = [-u[1], u[0]];
  const at = (r, s) => [(u[0] * r + v[0] * s) / U, (u[1] * r + v[1] * s) / U];
  return [at(184, 0), at(120, -30), at(120, 30), at(140, 0)];
});

// Inside of the eye, between the lids' centrelines, and the pupil's hole: filled with glass.
const EYE_GLASS = [...smooth([[152, 230], [190, 198], [230, 183], [268, 178], [306, 183], [346, 198], [384, 230]], 8),
  ...smooth([[384, 230], [346, 268], [306, 286], [268, 291], [230, 286], [190, 268], [152, 230]], 8)].map(([x, y]) => n([x, y, 0]));
const PUPIL_GLASS = Array.from({ length: 32 }, (_, k) => { const t = (2 * Math.PI * k) / 32; return n([268 + 24 * Math.cos(t), 232 + 32 * Math.sin(t), 0]); });

/** The lens's glass: pale lavender to violet, nearly opaque, with a soft highlight at the top left. */
const glassDefs = (id) =>
  `<radialGradient id="${id}-glass" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#eef0ff" stop-opacity="0.94"/><stop offset="0.55" stop-color="#c3b2f0" stop-opacity="0.9"/><stop offset="1" stop-color="#7a5cc4" stop-opacity="0.92"/></radialGradient>` +
  `<radialGradient id="${id}-sheen" cx="0.3" cy="0.25" r="0.45"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;

function draw(place, m, { id = "lt" } = {}) {
  const sp = emblem(place, { pyramids: SPIKES, peakHeight: 0.12, ramp: eyeRed, model: m });
  const glass = [EYE_GLASS, PUPIL_GLASS].map((g) => { const d = pathOf(g.map(place)); return `<path d="${d}" fill="url(#${id}-glass)"/><path d="${d}" fill="url(#${id}-sheen)"/>`; }).join("");
  const dropPath = pathOf(DROP.silhouette[0].map(place));
  const [l, r] = [place(n([238, 0, 0])), place(n([298, 0, 0]))];
  const tones = [[0, 0.62], [0.3, 0.9], [0.55, 0.6], [1, 0.22]].map(([o, v]) => `<stop offset="${o}" stop-color="${eyeRed.tone(v + (m.exposure ?? 0))}"/>`).join("");
  const drop = {
    defs: `<linearGradient id="${id}-drop" gradientUnits="userSpaceOnUse" x1="${f1(l[0])}" y1="0" x2="${f1(r[0])}" y2="0">${tones}</linearGradient>`,
    body: `<path d="${dropPath}" fill="url(#${id}-drop)"/>`,
    silhouette: `<path d="${dropPath}"/>`,
  };
  const lower = drawRibbon(place, LOWER, eyeRed, m), upper = drawRibbon(place, UPPER, eyeRed, m), pupil = drawRibbon(place, PUPIL, eyeRed, m);
  const silhouettes = sp.silhouettes + drop.silhouette + lower.silhouette + upper.silhouette + pupil.silhouette;
  return { defs: drop.defs + glassDefs(id), silhouettes, body: sp.body + drop.body + glass + lower.body + upper.body + pupil.body };
}

const BOX = { x0: n([108, 0, 0])[0], x1: n([428, 0, 0])[0], y0: n([0, 66, 0])[1], y1: n([0, 471, 0])[1] };

/** The eye on a transparent background with a dark outline: app icon, favicon, door. */
export function bare({ size = 512, fill = 0.44, outline = 0.022, id = "lt" } = {}) {
  const extent = Math.max(BOX.x1 - BOX.x0, BOX.y1 - BOX.y0) / 2;
  const place = placement(size, { extent, box: BOX, origin: [(BOX.x0 + BOX.x1) / 2, (BOX.y0 + BOX.y1) / 2], fill });
  const e = draw(place, { ambient: 0.14, diffuse: 0.68, spec: 0.3 }, { id });
  const ring = `<g fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${f1(size * outline * 2)}" stroke-linejoin="round">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: e.defs, body: ring + e.body, title: "Lens of Truth" });
}
