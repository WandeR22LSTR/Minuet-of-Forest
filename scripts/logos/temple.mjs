// Temple of Time: the Triforce above the Door of Time, in the temple's grey-blue stone.
// Each piece is a low-poly solid like the other project logos: a flat top raised RISE above
// its outline, joined to it by three bevelled faces, so the facets are shaded by the shared
// light (engine.mjs). On the marks it is raised from a stone tile; on the medallion it is
// engraved into the plate. The same stone ramp shades all of them.
// Normalised: the whole Triforce has side 1, its centroid at 0,0, y down.
import { norm, cross, sub, ramp, svgDoc, f1, pathOf, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";
import { plateMedallion } from "./plate.mjs";

const GAP = 0; // pieces shrunk towards their own centres by this much; 0: they meet at the corners
const TOP = 0.8; // flat top, as a fraction of the piece: narrow bevels close to the edges
const RISE = 0.06;

const H = Math.sqrt(3) / 2;
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const APEX = [0, (-2 * H) / 3], LEFT = [-0.5, H / 3], RIGHT = [0.5, H / 3];
const PIECES = [
  [APEX, mid(APEX, LEFT), mid(APEX, RIGHT)],
  [mid(APEX, LEFT), LEFT, mid(LEFT, RIGHT)],
  [mid(APEX, RIGHT), mid(LEFT, RIGHT), RIGHT],
].map((tri) => {
  const c = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
  const shrink = (k) => tri.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]);
  const base = shrink(1 - 2 * GAP), top = shrink((1 - 2 * GAP) * TOP);
  const B = base.map((p) => [...p, 0]), T = top.map((p) => [...p, RISE]);
  return {
    facets: [[B[0], B[1], T[1], T[0]], [B[1], B[2], T[2], T[1]], [B[2], B[0], T[0], T[2]], T],
    outline: B,
  };
});

// Grey-blue stone of the Temple of Time: the plate, and the Triforce everywhere.
const stone = ramp([[0, "#161b24"], [0.2, "#2a3240"], [0.34, "#3d4757"], [0.48, "#566273"], [0.62, "#75818f"], [0.76, "#9ba5b1"], [0.9, "#c9d0d8"], [1, "#f1f4f7"]]);

const model = { ambient: 0.14, diffuse: 0.66, spec: 0.28 };
export const THEMES = {
  // Pale stone tile; the Triforce darkened so it stands off it.
  light: { tile: ["#eef1f5", "#d8dee7"], shadow: ["#161b24", 0.26], exposure: -0.14 },
  // Dark stone tile; the Triforce brightened.
  dark: { tile: ["#1c2433", "#0f141e"], shadow: ["#000000", 0.5], exposure: 0.08 },
};

/** Shaded pieces. `engraved` cuts them into the surface, `depth` times as deep as they are raised. */
function draw(place, tones, m, { engraved = false, depth = 1 } = {}) {
  let silhouettes = "", body = "";
  for (const { facets, outline } of PIECES) {
    for (let f of facets) {
      if (engraved) f = f.map(([x, y, z]) => [x, y, -z * depth]);
      let n = cross(sub(f[1], f[0]), sub(f[2], f[0]));
      if (n[2] < 0) n = n.map((v) => -v);
      const c = tones.shade(norm(n), m);
      body += `<path d="${pathOf(f.map(place))}" fill="${c}" stroke="${c}" stroke-width="0.5" stroke-linejoin="round"/>`;
    }
    silhouettes += `<path d="${pathOf(outline.map(place))}"/>`;
  }
  return { silhouettes, body, outlines: PIECES.map((pc) => pc.outline.map(place)) };
}

const BOX = { x0: -0.5, x1: 0.5, y0: APEX[1], y1: LEFT[1] };

export function mark({ theme = "light", size = 512, fill = 0.4, square = false, id = `tt-${theme}` } = {}) {
  const t = THEMES[theme];
  const place = placement(size, { extent: 0.5, box: BOX, fill });
  const e = draw(place, stone, { ...model, exposure: t.exposure });
  const shadow = `<g transform="translate(${f1(size * SHADOW_OFFSET.dx)} ${f1(size * SHADOW_OFFSET.dy)})" fill="${t.shadow[0]}" fill-opacity="${t.shadow[1]}" filter="url(#${id}-soft)">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: tileDefs(id, t.tile) + softDefs(id, size), body: tileRect(id, size, { square }) + shadow + e.body, title: "Triforce mark" });
}

// On the plate the Triforce is centred on its centroid, so its three corners point at three of
// the twelve-gon's vertices (top, lower left, lower right), at 0.592 of the plate radius: a clear
// margin inside the recessed face (0.68). Then moved slightly down (LIFT, in Triforce units).
const LIFT = 0.035;
const PLATE_SCALE = 0.592 / (1 / Math.sqrt(3));
export function medallion({ size = 512, id = "ttm" } = {}) {
  return plateMedallion({
    size, id, ramp: stone, title: "Triforce on the temple plate",
    // Every cut in this medallion (runes, Triforce) is lit the same way: the lower-right wall of
    // a groove faces the light, so its lip is bright; the bevel into the face is lighter too.
    lighting: { runeLip: [-0.6, -0.75, 0.5], bevelExposure: -0.04 },
    content: (place, cast) => {
      const p = ([x, y]) => place([x * PLATE_SCALE, (y + LIFT) * PLATE_SCALE]);
      // Engraved into the face: the pieces are cut in, so the walls facing the light go dark
      // and the top-left walls cast a shadow onto each cut's floor. Nothing is cast outside.
      const e = draw(p, stone, { ambient: 0.1, diffuse: 0.74, spec: 0.3, exposure: -0.02 }, { engraved: true, depth: 2 });
      const off = [cast.dx * 0.6, cast.dy * 0.6];
      let defs = "", inner = "";
      e.outlines.forEach((o, i) => {
        defs += `<clipPath id="${id}-cut${i}"><path d="${pathOf(o)}"/></clipPath>`;
        inner += `<path clip-path="url(#${id}-cut${i})" fill-rule="evenodd" fill="${stone.deepest}" fill-opacity="0.45" d="${pathOf(o)}${pathOf(o.map(([x, y]) => [x + off[0], y + off[1]]))}"/>`;
      });
      // A thin dark line where the cut meets the face.
      const edge = `<g fill="none" stroke="${stone.deepest}" stroke-opacity="0.4" stroke-width="${f1(cast.R * 0.005)}" stroke-linejoin="round">${e.silhouettes}</g>`;
      return { back: "", front: e.body + inner + edge, defs };
    },
  });
}
