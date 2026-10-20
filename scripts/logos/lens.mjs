// Lens of Truth: the in-game lens with the Sheikah eye. An octagonal faceted frame in purple
// with three red spikes on top, violet glass with the Sheikah eye raised on it in crimson, and
// the Sheikah symbol's teardrop as the handle, with a gold collar. All solids are lit by the
// shared light (engine.mjs). One mark on a transparent background with a dark outline, like
// Saria's Song's, so it reads on light and dark backgrounds.
// Normalised: frame circumradius 1, centre 0,0, y down.
import { norm, cross, sub, ramp, svgDoc, f1, pathOf, placement, emblem } from "./engine.mjs";
import { smooth } from "./forest.mjs";

const purple = ramp([
  [0, "#1a0630"], [0.2, "#33105c"], [0.34, "#4b1a85"], [0.48, "#6526a8"],
  [0.62, "#8240c8"], [0.76, "#a670de"], [0.9, "#d4b2f2"], [1, "#f6ecff"],
]);
const crimson = ramp([
  [0, "#2a0510"], [0.2, "#5a0c20"], [0.38, "#8c1632"], [0.55, "#b8233f"],
  [0.7, "#dc3d55"], [0.85, "#f17a86"], [1, "#ffe0e4"],
]);
const gold = ramp([[0, "#4a3505"], [0.3, "#8a6614"], [0.55, "#c0952b"], [0.75, "#e0b947"], [0.9, "#f3d36c"], [1, "#fff4c8"]]);
export const OUTLINE = "#1a0630";

// Frame: an octagon with a flat top, in rings by circumradius.
const FRAME = { chamfer: 0.94, band: 0.86, glass: 0.76 };
const oct = (r) => Array.from({ length: 8 }, (_, k) => { const t = ((-112.5 + 45 * k) * Math.PI) / 180; return [r * Math.cos(t), r * Math.sin(t)]; });

/** Ring of 8 sloped facets between radii r0 (outer) and r1 (inner); tilt > 0 faces outwards. */
function ring(place, r0, r1, tilt, m) {
  const a = oct(r0), b = oct(r1);
  let s = "";
  for (let k = 0; k < 8; k++) {
    const mid = ((-90 + 45 * k) * Math.PI) / 180, t = (tilt * Math.PI) / 180;
    const n = norm([Math.cos(mid) * Math.sin(t), Math.sin(mid) * Math.sin(t), Math.cos(t)]);
    const c = purple.shade(n, m);
    s += `<path d="${pathOf([a[k], a[(k + 1) % 8], b[(k + 1) % 8], b[k]].map(place))}" fill="${c}" stroke="${c}" stroke-width="0.6"/>`;
  }
  return s;
}

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

// The Sheikah eye on the glass: an almond outline and an oval pupil.
const almond = (rx, ry, n = 24) => {
  const up = [], down = [];
  for (let i = 0; i <= n; i++) {
    const x = -rx + (2 * rx * i) / n, y = ry * (1 - (x / rx) ** 2);
    up.push([x, -y]); down.push([x, y]);
  }
  return [...up, ...down.reverse().slice(1, -1)];
};
const EYE = ribbon(almond(0.56, 0.27, 12).map(([x, y]) => [x, y + 0.02, 0.11]), { closed: true, ridge: 0.5 });
const PUPIL = ribbon(Array.from({ length: 12 }, (_, k) => { const t = (2 * Math.PI * k) / 12; return [0.115 * Math.cos(t), 0.02 + 0.15 * Math.sin(t), 0.1]; }), { closed: true, ridge: 0.5 });

// The handle: the Sheikah teardrop hanging from the frame, a narrow neck swelling to a bulb.
const HANDLE = ribbon([[0, 0.9, 0.15], [0, 1.05, 0.13], [0, 1.2, 0.12], [0, 1.38, 0.16], [0, 1.55, 0.26], [0, 1.7, 0.3], [0, 1.82, 0.24], [0, 1.9, 0.1], [0, 1.93, 0]], { ridge: 0.45, per: 12 });
const COLLAR = ribbon([[0, 1.0, 0.2], [0, 1.08, 0.2]], { ridge: 0.6, per: 2 });

// Spikes: three red pyramids on the frame's top edges, at the top and 50° either side.
const SPIKES = [-90, -140, -40].map((deg) => {
  const t = (deg * Math.PI) / 180, u = [Math.cos(t), Math.sin(t)], v = [-u[1], u[0]];
  const at = (r, s) => [u[0] * r + v[0] * s, u[1] * r + v[1] * s];
  return [at(1.42, 0), at(0.9, -0.15), at(0.9, 0.15), at(1.02, 0)];
});

function draw(place, m) {
  const p = place;
  // Spikes behind the frame.
  const sp = emblem(p, { pyramids: SPIKES, peakHeight: 0.12, ramp: crimson, model: m });
  const handle = drawRibbon(p, HANDLE, purple, m), collar = drawRibbon(p, COLLAR, gold, m);
  const frame = `<path d="${pathOf(oct(1).map(p))}" fill="${purple.shade([0, 0, 1], m)}"/>` +
    ring(p, 1, FRAME.chamfer, 55, m) +
    `<path d="${pathOf(oct(FRAME.chamfer).map(p))}" fill="${purple.shade([0, 0, 1], { ...m, exposure: (m.exposure ?? 0) - 0.04 })}"/>` +
    ring(p, FRAME.band, FRAME.glass, -55, { ...m, exposure: (m.exposure ?? 0) - 0.1 });
  const glassPts = oct(FRAME.glass).map(p);
  const glass = `<path d="${pathOf(glassPts)}" fill="url(#lt-glass)"/><path d="${pathOf(glassPts)}" fill="url(#lt-sheen)"/>`;
  const eye = drawRibbon(p, EYE, crimson, m), pupil = drawRibbon(p, PUPIL, crimson, m);
  // The eye's shadow on the glass.
  const R = place.scale;
  const shadow = `<g transform="translate(${f1(R * 0.02)} ${f1(R * 0.028)})" fill="#12031f" fill-opacity="0.45">${eye.silhouette}${pupil.silhouette}</g>`;
  const defs = `<radialGradient id="lt-glass" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#7a4fc4"/><stop offset="0.7" stop-color="#4d2a92"/><stop offset="1" stop-color="#2e1563"/></radialGradient>` +
    `<radialGradient id="lt-sheen" cx="0.32" cy="0.26" r="0.55"><stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
  const silhouettes = sp.silhouettes + handle.filled + `<path d="${pathOf(oct(1).map(p))}"/>`;
  return { defs, silhouettes, body: sp.body + handle.body + collar.body + frame + glass + shadow + eye.body + pupil.body };
}

// Bounding box, from the spikes' tips to the handle's end.
const BOX = { x0: -1.12, x1: 1.12, y0: -1.42, y1: 1.93 };

/** The lens on a transparent background with a dark outline: app icon, favicon, door. */
export function bare({ size = 512, fill = 0.46, outline = 0.022 } = {}) {
  const extent = Math.max(BOX.x1 - BOX.x0, BOX.y1 - BOX.y0) / 2;
  const place = placement(size, { extent, box: BOX, origin: [(BOX.x0 + BOX.x1) / 2, (BOX.y0 + BOX.y1) / 2], fill });
  const e = draw(place, { ambient: 0.14, diffuse: 0.68, spec: 0.3 });
  const ring = `<g fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${f1(size * outline * 2)}" stroke-linejoin="round">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: e.defs, body: ring + e.body, title: "Lens of Truth" });
}
