// Ice Cavern: the water medallion (Serenade of Water is taught at the end of the Ice Cavern)
// in an ice palette. Six faceted crystals radiate from the centre at 60° steps, the top one
// vertical. Positions measured from the in-game medallion; normalised to the plate
// (circumradius 1, centre 0,0, y down).
// Each crystal is a low-poly solid: a ridge along its axis, raised to RIDGE at the shoulders,
// with a short pointed cap, so its facets are shaded by the shared light (engine.mjs).
// The full medallion is "frozen": the recessed face is darkened like water under ice, with a soft frosted glow.
import { norm, cross, sub, rot, ramp, svgDoc, f1, pathOf, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";
import { plateMedallion, gon } from "./plate.mjs";

// One crystal pointing right (+x), double-terminated like a quartz crystal: a short point at
// the centre, a crease where the body starts, the body widening slightly to the shoulders, then
// a single pyramid cap to the outer tip. [distance from centre, half-width], from the render.
// The inner points stop short of the centre, leaving a small open hub where the channels
// between the crystals meet, as in the original.
const CRYSTAL = { inner: 0.07, base: [0.21, 0.096], shoulder: [0.5, 0.163], tip: 0.65 };
const RIDGE = 0.08;
const ANGLES = [-90, -30, 30, 90, 150, 210];

const iceRamp = ramp([
  [0, "#08223a"], [0.2, "#0f3d63"], [0.34, "#185a8a"], [0.48, "#2878ad"],
  [0.62, "#4f9cc9"], [0.76, "#8cc4e3"], [0.9, "#d2ecf8"], [1, "#ffffff"],
]);
export const TILE = ["#f2f8fc", "#d9e9f4"];
// Dark tile for a dark (navy / ink) interface.
export const TILE_DARK = ["#12263a", "#08172a"];

/** Facets of one crystal (3D points) and its outline, rotated to `deg`. */
function crystal(deg) {
  const { inner, base: [bu, bw], shoulder: [su, sw], tip } = CRYSTAL;
  const P = (u, v, z = 0) => [...rot([u, v], deg), z];
  // Ridge along the axis: flat at both points, raised along the body.
  const A = P(inner, 0), C1 = P(bu, 0, RIDGE), C2 = P(su, 0, RIDGE), T = P(tip, 0);
  const L1 = P(bu, -bw), L2 = P(su, -sw), R1 = P(bu, bw), R2 = P(su, sw);
  return {
    facets: [[A, L1, C1], [A, C1, R1], [L1, L2, C2, C1], [C1, C2, R2, R1], [L2, T, C2], [C2, T, R2]],
    outline: [A, L1, L2, T, R2, R1],
  };
}
const CRYSTALS = ANGLES.map(crystal);

function draw(place, model) {
  let silhouettes = "", body = "";
  for (const { facets, outline } of CRYSTALS) {
    for (const f of facets) {
      let n = cross(sub(f[1], f[0]), sub(f[2], f[0]));
      if (n[2] < 0) n = n.map((v) => -v);
      const c = iceRamp.shade(norm(n), model);
      body += `<path d="${pathOf(f.map((p) => place(p)))}" fill="${c}" stroke="${c}" stroke-width="0.5" stroke-linejoin="round"/>`;
    }
    silhouettes += `<path d="${pathOf(outline.map((p) => place(p)))}"/>`;
  }
  return { silhouettes, body };
}

function box() {
  const pts = CRYSTALS.flatMap((c) => c.outline);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), r: Math.max(...pts.map((p) => Math.hypot(p[0], p[1]))) };
}

export function mark({ size = 512, fill = 0.4, square = false, dark = false, id = dark ? "icd" : "ic" } = {}) {
  const b = box();
  const place = placement(size, { extent: b.r, box: b, fill });
  const e = draw(place, { ambient: 0.12, diffuse: 0.7, spec: 0.3, exposure: dark ? 0.06 : -0.04 });
  const [shadowColour, shadowOpacity] = dark ? ["#000000", 0.5] : ["#0f3d63", 0.26];
  const shadow = `<g transform="translate(${f1(size * SHADOW_OFFSET.dx)} ${f1(size * SHADOW_OFFSET.dy)})" fill="${shadowColour}" fill-opacity="${shadowOpacity}" filter="url(#${id}-soft)">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: tileDefs(id, dark ? TILE_DARK : TILE) + softDefs(id, size), body: tileRect(id, size, { square }) + shadow + e.body, title: "Water medallion mark" });
}

/** Under the crystals: the face deepened like dark water under ice, with a soft frosted glow. */
function frost(place, id) {
  const face = gon(0.8).map(place);
  return `<path d="${pathOf(face)}" fill="${iceRamp.deepest}" fill-opacity="0.28"/>` +
    `<path d="${pathOf(face)}" fill="url(#${id}-frost)"/>`;
}

export function medallion({ size = 512, compact = false, id = "im" } = {}) {
  return plateMedallion({
    size, compact, id, ramp: iceRamp, title: "Water medallion (frozen)",
    content: (place, cast) => {
      const e = draw(place, { ambient: 0.1, diffuse: 0.74, spec: 0.38, exposure: 0.04 });
      const back = frost(place, id) + `<g transform="translate(${f1(cast.dx * 0.5)} ${f1(cast.dy * 0.5)})" fill="${iceRamp.deepest}" fill-opacity="0.45">${e.silhouettes}</g>`;
      // A frosted rim of light on the crystals' edges.
      const rim = `<g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${f1(cast.R * 0.004)}" stroke-linejoin="round">${e.silhouettes}</g>`;
      const defs = `<radialGradient id="${id}-frost" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
      return { back, front: e.body + rim, defs };
    },
  });
}
