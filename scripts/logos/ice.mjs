// Ice Cavern: the water medallion (Serenade of Water is taught at the end of the Ice Cavern)
// in an ice palette. Six faceted crystals radiate from the centre at 60° steps, the top one
// vertical. Positions measured from the in-game medallion; normalised to the plate
// (circumradius 1, centre 0,0, y down).
// Each crystal is a low-poly solid: a ridge along its axis, raised to RIDGE at the shoulders,
// with a short pointed cap, so its facets are shaded by the shared light (engine.mjs).
// The full medallion is "frozen": frosted facets over the recessed face.
import { norm, cross, sub, rot, ramp, svgDoc, f1, pathOf, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";
import { plateMedallion, gon } from "./plate.mjs";

// One crystal pointing right (+x): inner tip, shoulders, cap corners, outer tip.
const CRYSTAL = { inner: 0.05, shoulder: [0.48, 0.2], cap: [0.59, 0.135], tip: 0.655 };
const RIDGE = 0.09;
const ANGLES = [-90, -30, 30, 90, 150, 210];

const iceRamp = ramp([
  [0, "#08223a"], [0.2, "#0f3d63"], [0.34, "#185a8a"], [0.48, "#2878ad"],
  [0.62, "#4f9cc9"], [0.76, "#8cc4e3"], [0.9, "#d2ecf8"], [1, "#ffffff"],
]);
export const TILE = ["#f2f8fc", "#d9e9f4"];

/** Facets of one crystal (3D points) and its outline, rotated to `deg`. */
function crystal(deg) {
  const { inner, shoulder: [su, sw], cap: [cu, cw], tip } = CRYSTAL;
  const P = (u, v, z = 0) => [...rot([u, v], deg), z];
  const A = P(inner, 0), B = P(su, 0, RIDGE), C = P(cu, 0, RIDGE * 0.8), D = P(tip, 0);
  const L1 = P(su, -sw), L2 = P(cu, -cw), R1 = P(su, sw), R2 = P(cu, cw);
  return {
    facets: [[A, L1, B], [A, B, R1], [L1, L2, C, B], [B, C, R2, R1], [L2, D, C], [C, D, R2]],
    outline: [A, L1, L2, D, R2, R1],
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

export function mark({ size = 512, fill = 0.4, square = false, id = "ic" } = {}) {
  const b = box();
  const place = placement(size, { extent: b.r, box: b, fill });
  const e = draw(place, { ambient: 0.12, diffuse: 0.7, spec: 0.3, exposure: -0.04 });
  const shadow = `<g transform="translate(${f1(size * SHADOW_OFFSET.dx)} ${f1(size * SHADOW_OFFSET.dy)})" fill="#0f3d63" fill-opacity="0.26" filter="url(#${id}-soft)">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: tileDefs(id, TILE) + softDefs(id, size), body: tileRect(id, size, { square }) + shadow + e.body, title: "Water medallion mark" });
}

/** Frost over the recessed face: twelve wedges from the centre in alternating white tints. */
function frost(place) {
  const face = gon(0.8);
  // Deepen the face first, like dark water under the ice, so the crystals stand out.
  let s = `<path d="${pathOf(face.map(place))}" fill="${iceRamp.deepest}" fill-opacity="0.28"/>`;
  for (let k = 0; k < 12; k++) {
    const op = [0.1, 0.03, 0.07, 0.02][k % 4];
    s += `<path d="${pathOf([[0, 0], face[k], face[(k + 1) % 12]].map(place))}" fill="#ffffff" fill-opacity="${op}"/>`;
  }
  return s;
}

export function medallion({ size = 512, compact = false, id = "im" } = {}) {
  return plateMedallion({
    size, compact, id, ramp: iceRamp, title: "Water medallion (frozen)",
    content: (place, cast) => {
      const e = draw(place, { ambient: 0.1, diffuse: 0.74, spec: 0.38, exposure: 0.04 });
      const back = frost(place) + `<g transform="translate(${f1(cast.dx * 0.5)} ${f1(cast.dy * 0.5)})" fill="${iceRamp.deepest}" fill-opacity="0.45">${e.silhouettes}</g>`;
      // A frosted rim of light on the crystals' edges.
      const rim = `<g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${f1(cast.R * 0.004)}" stroke-linejoin="round">${e.silhouettes}</g>`;
      return { back, front: e.body + rim };
    },
  });
}
