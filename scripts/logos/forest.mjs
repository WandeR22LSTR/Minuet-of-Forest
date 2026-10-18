// Minuet of Forest: the forest medallion, in two versions from one blade definition:
//   medallion: twelve-sided plate, engraved rune band, recessed face, three blades
//   mark:      the three blades alone on the shared tile
// Geometry is normalised: plate circumradius 1, centre 0,0, y pointing down.
// Depth: each blade is a ridge of height RIDGE_HEIGHT between its outer and inner edge,
// shaded in thin strips with the shared light (engine.mjs). Spec: docs/logo.md.
import { norm, cross, sub, rot, ramp, svgDoc, f1, pathOf, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";

// One blade, from its inner tip (near the centre) to its outer tip, sweeping clockwise.
// Fitted to the reference: the three blades of the original averaged into one.
const BLADE = {
  outer: [[-0.1637, -0.0192], [-0.139, -0.2636], [-0.0493, -0.4515], [0.1475, -0.5586], [0.3609, -0.4967], [0.5029, -0.323], [0.6064, -0.0512]],
  ridge: [[-0.1637, -0.0192], [-0.0375, -0.3], [0.1779, -0.4156], [0.4268, -0.3312], [0.6064, -0.0512]],
  inner: [[-0.1637, -0.0192], [0.0317, -0.1873], [0.2062, -0.2534], [0.3793, -0.2011], [0.6064, -0.0512]],
};

// Circumradii of the plate rings. The compact plate (no runes, for small sizes) has a narrow
// band so the blades can be drawn larger.
const PLATE = { chamfer: 0.962, band: 0.771, face: 0.68 };
const PLATE_COMPACT = { chamfer: 0.95, band: 0.87, face: 0.795 };
const RIDGE_HEIGHT = 0.075;

// Tone ramp built around the site palette (forest #1f4d34, link #2d6a46, sage #dfe9d6).
const { shade, deepest } = ramp([
  [0.0, "#0a2214"], [0.2, "#153a26"], [0.34, "#1f4d34"], [0.48, "#2d6a46"],
  [0.62, "#3a8650"], [0.76, "#5ea866"], [0.9, "#a0d388"], [1.0, "#e2f2cf"],
]);

// Centripetal Catmull-Rom through the points (ends extended by reflection), then arc-length resampled.
function smooth(pts, per = 16) {
  const reflect = (a, b) => [2 * a[0] - b[0], 2 * a[1] - b[1]];
  const P = [reflect(pts[0], pts[1]), ...pts, reflect(pts.at(-1), pts.at(-2))];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const d = (a, b) => Math.max(1e-6, Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5);
    const t1 = d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
    for (let s = 0; s < per; s++) {
      const t = t1 + ((t2 - t1) * s) / per;
      const L = (a, b, ta, tb) => [((tb - t) * a[0] + (t - ta) * b[0]) / (tb - ta), ((tb - t) * a[1] + (t - ta) * b[1]) / (tb - ta)];
      const A1 = L(p0, p1, 0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
      out.push(L(L(A1, A2, 0, t2), L(A2, A3, t1, t3), t1, t2));
    }
  }
  out.push(pts.at(-1));
  return out;
}
function resample(line, n) {
  const acc = [0];
  for (let i = 1; i < line.length; i++) acc.push(acc[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  const out = [];
  for (let k = 0, j = 1; k <= n; k++) {
    const s = (acc.at(-1) * k) / n;
    while (j < line.length - 1 && acc[j] < s) j++;
    const t = (s - acc[j - 1]) / (acc[j] - acc[j - 1] || 1);
    out.push([line[j - 1][0] + (line[j][0] - line[j - 1][0]) * t, line[j - 1][1] + (line[j][1] - line[j - 1][1]) * t]);
  }
  return out;
}

/** Blade edges sampled at matching parameters: outer, ridge, inner (n+1 points each). */
// Smoothness 0 keeps the straight segments of the game model (low-poly); 1 is a smooth spline
// through the same points (like the drawn reference). The logo uses a middle ground.
const SMOOTHNESS = 0.3;

function bladeEdges(curve, n) {
  const f = (pts) => {
    const a = resample(pts, n), b = resample(smooth(pts), n);
    return a.map((p, i) => [p[0] + (b[i][0] - p[0]) * curve, p[1] + (b[i][1] - p[1]) * curve]);
  };
  return { O: f(BLADE.outer), R: f(BLADE.ridge), I: f(BLADE.inner) };
}

/** Outline of each of the three blades, in normalised coordinates. */
function bladeOutlines({ curve = SMOOTHNESS, rotate = 0, n = 64 } = {}) {
  const { O, I } = bladeEdges(curve, n);
  return [0, 120, 240].map((a) => [...O, ...I.slice(1, -1).reverse()].map((p) => rot(p, a + rotate)));
}

/** Three shaded blades. `place` maps normalised coordinates to pixels. */
function blades(place, { curve = SMOOTHNESS, strips = 64, rotate = 0, light = {}, shadow, edge } = {}) {
  let back = "", front = "";
  const outlines = bladeOutlines({ curve, rotate, n: strips });
  for (const [b, a] of [0, 120, 240].entries()) {
    const { O, R, I } = bladeEdges(curve, strips);
    const T = (p) => rot(p, a + rotate);
    const outline = outlines[b].map(place);
    if (shadow) back += `<path d="${pathOf(outline.map(([x, y]) => [x + shadow.dx, y + shadow.dy]))}" fill="${shadow.color}" fill-opacity="${shadow.opacity}"${shadow.filter ? ` filter="url(#${shadow.filter})"` : ""}/>`;
    let faces = "", base = null;
    for (const side of [O, I]) {
      const tones = [];
      for (let i = 0; i < strips; i++) {
        const P3 = [[...T(side[i]), 0], [...T(side[i + 1]), 0], [...T(R[i + 1]), RIDGE_HEIGHT], [...T(R[i]), RIDGE_HEIGHT]];
        let n = cross(sub(P3[1], P3[0]), sub(P3[3], P3[0])).map((v, k) => v + cross(sub(P3[2], P3[1]), sub(P3[3], P3[1]))[k]);
        if (Math.hypot(...n) < 1e-12) { tones.push(null); continue; }
        if (n[2] < 0) n = n.map((v) => -v);
        tones.push(shade(norm(n), light));
      }
      for (let i = 0; i < strips; i++) if (!tones[i]) tones[i] = tones[i - 1] ?? tones.find(Boolean);
      base ??= tones[Math.floor(strips / 2)];
      // Each strip spans two steps and the next one paints over its second half,
      // so neighbouring strips overlap and no hairline seams show.
      for (let i = 0; i < strips; i++) {
        const j = Math.min(strips, i + 2);
        const pts = [...side.slice(i, j + 1), ...R.slice(i, j + 1).reverse()].map((p) => place(T(p)));
        faces += `<path d="${pathOf(pts)}" fill="${tones[i]}"/>`;
      }
    }
    front += `<path d="${pathOf(outline)}" fill="${base}"/>` + faces;
    if (edge) front += `<path d="${pathOf(outline)}" fill="none" stroke="${edge.color}" stroke-opacity="${edge.opacity}" stroke-width="${edge.width}" stroke-linejoin="round"/>`;
  }
  return { back, front };
}

// Twelve-sided plate, vertex at the top.
const vtx = (k, r) => [r * Math.cos(((-90 + 30 * k) * Math.PI) / 180), r * Math.sin(((-90 + 30 * k) * Math.PI) / 180)];
const gon = (r) => Array.from({ length: 12 }, (_, k) => vtx(k, r));
/** Radius of the twelve-gon (circumradius 1) in direction theta, degrees. */
function r12(theta) {
  const phi = ((((theta + 75) % 30) + 45) % 30) - 15;
  return Math.cos((15 * Math.PI) / 180) / Math.cos((phi * Math.PI) / 180);
}
/** Ring of 12 sloped facets between radii r0 (outer) and r1 (inner); tilt > 0 faces outwards. */
function slopedRing(place, r0, r1, tilt, light) {
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
function runes(place, { width = 0.0135, light }) {
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

function medallion({ size = 512, curve = SMOOTHNESS, compact = false, strips = 64, id = "fm" } = {}) {
  const R = size / 2 - size * 0.01, C = size / 2;
  const plate = compact ? PLATE_COMPACT : PLATE, k = plate.face / PLATE.face;
  const place = ([x, y]) => [C + x * R, C + y * R];
  const flat = [0, 0, 1];
  const face = gon(plate.face).map(place);
  const cast = { dx: R * 0.032, dy: R * 0.04 };
  const defs =
    `<linearGradient id="${id}-sheen" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${shade(flat, { exposure: 0.1 })}"/><stop offset="1" stop-color="${shade(flat, { exposure: -0.05 })}"/></linearGradient>` +
    `<linearGradient id="${id}-well" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="${shade(flat, { exposure: 0.02 })}"/><stop offset="1" stop-color="${shade(flat, { exposure: -0.1 })}"/></linearGradient>` +
    `<clipPath id="${id}-face"><path d="${pathOf(face)}"/></clipPath>`;
  const b = blades(([x, y]) => place([x * k, y * k]), {
    curve, strips,
    light: { ambient: 0.08, diffuse: 0.74, spec: 0.3, exposure: 0.02 },
    shadow: { dx: cast.dx * 0.55, dy: cast.dy * 0.55, color: deepest, opacity: 0.5 },
    edge: { color: deepest, opacity: 0.35, width: f1(R * 0.006) },
  });
  const body =
    `<path d="${pathOf(gon(1).map(place))}" fill="url(#${id}-sheen)"/>` +
    slopedRing(place, 1, plate.chamfer, 55, {}) +
    `<path d="${pathOf(gon(plate.chamfer).map(place))}" fill="url(#${id}-sheen)"/>` +
    (compact ? "" : runes(place, { width: 0.019, light: {} })) +
    slopedRing(place, plate.band, plate.face, -62, { exposure: -0.12 }) +
    `<path d="${pathOf(face)}" fill="url(#${id}-well)"/>` +
    // Shadow cast by the bevel wall onto the recessed face, then by the blades.
    `<g clip-path="url(#${id}-face)"><path d="${pathOf(face)}${pathOf(face.map(([x, y]) => [x + cast.dx, y + cast.dy]))}" fill-rule="evenodd" fill="${deepest}" fill-opacity="0.4"/>${b.back}</g>` +
    b.front;
  return svgDoc({ size, defs, body, title: "Forest medallion" });
}

/** Bounding box of the three blades, normalised. */
function bladeBox(curve) {
  const pts = bladeOutlines({ curve }).flat();
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), r: Math.max(...pts.map((p) => Math.hypot(...p))) };
}

function mark({ size = 512, curve = SMOOTHNESS, tile = true, square = false, strips = 64, fill = 0.4, id = "fk" } = {}) {
  const box = bladeBox(curve);
  const place = placement(size, { extent: box.r, box, fill });
  const b = blades(place, {
    curve, strips,
    light: { ambient: 0.12, diffuse: 0.68, spec: 0.2, exposure: -0.03 },
    shadow: { dx: size * SHADOW_OFFSET.dx, dy: size * SHADOW_OFFSET.dy, color: "#1f4d34", opacity: 0.24, filter: `${id}-soft` },
  });
  const defs = tileDefs(id, TILE) + softDefs(id, size);
  const body = (tile ? tileRect(id, size, { square }) : "") + b.back + b.front;
  return svgDoc({ size, defs, body, title: "Forest medallion mark" });
}

export const TILE = ["#f4f8ef", "#e1eada"];
export { bladeOutlines, gon, PLATE, SMOOTHNESS, medallion, mark };
