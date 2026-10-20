// The twelve-sided medallion plate shared by the full medallion logos: outer chamfer,
// engraved rune band, dark bevel into a recessed face. The emblem (blades, pyramids, orbs)
// is drawn on the face by the caller. Proportions match the in-game medallions.
// Geometry is normalised: plate circumradius 1, centre 0,0, y pointing down.
import { norm, svgDoc, f1, pathOf } from "./engine.mjs";

// Circumradii of the plate rings. The compact plate (no runes, for small sizes) has a narrow
// band so the blades can be drawn larger.
const PLATE = { chamfer: 0.962, band: 0.771, face: 0.68 };
const PLATE_COMPACT = { chamfer: 0.95, band: 0.87, face: 0.795 };

// Twelve-sided plate, vertex at the top.
const vtx = (k, r) => [r * Math.cos(((-90 + 30 * k) * Math.PI) / 180), r * Math.sin(((-90 + 30 * k) * Math.PI) / 180)];
const gon = (r) => Array.from({ length: 12 }, (_, k) => vtx(k, r));
/** Radius of the twelve-gon (circumradius 1) in direction theta, degrees. */
function r12(theta) {
  const phi = ((((theta + 75) % 30) + 45) % 30) - 15;
  return Math.cos((15 * Math.PI) / 180) / Math.cos((phi * Math.PI) / 180);
}
/** Ring of 12 sloped facets between radii r0 (outer) and r1 (inner); tilt > 0 faces outwards. */
function slopedRing(shade, place, r0, r1, tilt, light) {
  let s = "";
  for (let k = 0; k < 12; k++) {
    const mid = ((-75 + 30 * k) * Math.PI) / 180, t = (tilt * Math.PI) / 180;
    const n = norm([Math.cos(mid) * Math.sin(t), Math.sin(mid) * Math.sin(t), Math.cos(t)]);
    const c = shade(n, light);
    s += `<path d="${pathOf([vtx(k, r0), vtx(k + 1, r0), vtx(k + 1, r1), vtx(k, r1)].map(place))}" fill="${c}" stroke="${c}" stroke-width="0.6"/>`;
  }
  return s;
}

// Rune band. Each glyph is a polyline in (a, r): a = degrees away from the top/bottom centre,
// r = 0 (inner edge of the band) .. 1 (outer). One quadrant is drawn and mirrored four ways,
// like the original's band, which mirrors left/right and top/bottom.
const QUADRANT_GLYPHS = [
  [[7.2, 0.18], [7.2, 0.58], [9.2, 0.8], [12.2, 0.8]],
  [[17.5, 0.2], [17.5, 0.8], [24, 0.8], [24, 0.42], [26.5, 0.42]],
  [[31, 0.8], [36.5, 0.8], [32.5, 0.2], [38.5, 0.2]],
  [[43, 0.22], [43, 0.8], [49.5, 0.8], [49.5, 0.22]],
  [[55, 0.8], [58.5, 0.8], [58.5, 0.45], [62, 0.45], [62, 0.18]],
  [[66.5, 0.8], [69.5, 0.55], [72.5, 0.75], [75.5, 0.25]],
  [[78.5, 0.3], [81.5, 0.72], [84.5, 0.55]],
];
const CENTRE_GLYPHS = {
  ring: Array.from({ length: 17 }, (_, i) => [2.3 * Math.sin((i / 16) * 2 * Math.PI), 0.55 + 0.26 * Math.cos((i / 16) * 2 * Math.PI)]),
  stem: [[0, 0.24], [0, 0.08]],
  box: [[-1.7, 0.3], [1.7, 0.3], [1.7, 0.74], [-1.7, 0.74], [-1.7, 0.3]],
};
function runes({ shade, deepest }, place, { width = 0.0135, light }) {
  const lines = [];
  const map = (pts, base, dir) => {
    const dense = [];
    for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < 6; s++) {
      const t = s / 6; dense.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
    }
    dense.push(pts.at(-1));
    return dense.map(([a, r]) => {
      const th = base + dir * a, rad = r12(th) * (0.805 + 0.135 * r), t = (th * Math.PI) / 180;
      return place([rad * Math.cos(t), rad * Math.sin(t)]);
    });
  };
  for (const [base, dir] of [[-90, -1], [-90, 1], [90, 1], [90, -1]]) for (const g of QUADRANT_GLYPHS) lines.push(map(g, base, dir));
  for (const base of [-90, 90]) { lines.push(map(CENTRE_GLYPHS.ring, base, 1)); lines.push(map(CENTRE_GLYPHS.stem, base, 1)); }
  for (const base of [0, 180]) lines.push(map(CENTRE_GLYPHS.box, base, 1));
  const px = Math.abs(place([width, 0])[0] - place([0, 0])[0]);
  const lit = shade(norm([0.6, 0.75, 0.5]), light), core = deepest;
  const d = lines.map((l) => pathOf(l, false)).join("");
  const off = lines.map((l) => pathOf(l.map(([x, y]) => [x + px * 0.5, y + px * 0.55]), false)).join("");
  const st = `fill="none" stroke-width="${f1(px)}" stroke-linejoin="miter" stroke-linecap="square"`;
  return `<path d="${off}" ${st} stroke="${lit}"/><path d="${d}" ${st} stroke="${core}"/>`;
}


/**
 * Full medallion. `content(place, cast)` draws the emblem: `place` maps the emblem's
 * normalised coordinates (designed for the full plate's face) onto the face, scaled up on the
 * compact plate; it returns { back, front }, where `back` is clipped to the face (shadows).
 */
export function plateMedallion({ size = 512, compact = false, id, ramp, title, content }) {
  const { shade, deepest } = ramp;
  const R = size / 2 - size * 0.01, C = size / 2;
  const plate = compact ? PLATE_COMPACT : PLATE, k = plate.face / PLATE.face;
  const place = ([x, y]) => [C + x * R, C + y * R];
  const flat = [0, 0, 1];
  const face = gon(plate.face).map(place);
  const cast = { dx: R * 0.032, dy: R * 0.04, R };
  const defs =
    `<linearGradient id="${id}-sheen" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${shade(flat, { exposure: 0.1 })}"/><stop offset="1" stop-color="${shade(flat, { exposure: -0.05 })}"/></linearGradient>` +
    `<linearGradient id="${id}-well" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="${shade(flat, { exposure: 0.02 })}"/><stop offset="1" stop-color="${shade(flat, { exposure: -0.1 })}"/></linearGradient>` +
    `<clipPath id="${id}-face"><path d="${pathOf(face)}"/></clipPath>`;
  const b = content(([x, y]) => place([x * k, y * k]), cast);
  const body =
    `<path d="${pathOf(gon(1).map(place))}" fill="url(#${id}-sheen)"/>` +
    slopedRing(shade, place, 1, plate.chamfer, 55, {}) +
    `<path d="${pathOf(gon(plate.chamfer).map(place))}" fill="url(#${id}-sheen)"/>` +
    (compact ? "" : runes(ramp, place, { width: 0.019, light: {} })) +
    slopedRing(shade, place, plate.band, plate.face, -62, { exposure: -0.12 }) +
    `<path d="${pathOf(face)}" fill="url(#${id}-well)"/>` +
    // Shadow cast by the bevel wall onto the recessed face, then by the emblem.
    `<g clip-path="url(#${id}-face)"><path d="${pathOf(face)}${pathOf(face.map(([x, y]) => [x + cast.dx, y + cast.dy]))}" fill-rule="evenodd" fill="${deepest}" fill-opacity="0.4"/>${b.back}</g>` +
    b.front;
  return svgDoc({ size, defs: defs + (b.defs ?? ""), body, title });
}

export { gon, PLATE };
