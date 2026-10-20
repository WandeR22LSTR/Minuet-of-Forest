// Temple of Time: the Triforce above the Door of Time, as three raised gold triangles.
// Each piece is a low-poly solid like the other project logos: a flat top raised RISE above
// its outline, joined to it by three bevelled faces, so the facets are shaded by the shared
// light (engine.mjs). The gold is Prelude of Light's; the tile and plate are the temple's
// grey-blue stone, so the two logos read apart on the Ice Cavern doors.
// Normalised: the whole Triforce has side 1, its centroid at 0,0, y down.
import { norm, cross, sub, ramp, svgDoc, f1, pathOf, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";
import { plateMedallion } from "./plate.mjs";

const GAP = 0.035; // each piece shrunk towards its own centre, opening a gap between pieces
const TOP = 0.5; // flat top, as a fraction of the piece
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

const model = { ambient: 0.14, diffuse: 0.66, spec: 0.28 };
export const THEMES = {
  // Pale temple stone, deeper gold (Prelude of Light's light ramp) for contrast.
  light: {
    tile: ["#eef1f5", "#d8dee7"], shadow: ["#3a3220", 0.24],
    gold: ramp([[0, "#4a3505"], [0.25, "#7f5f10"], [0.45, "#a87f1c"], [0.6, "#c0952b"], [0.75, "#e0b947"], [0.9, "#f3d36c"], [1, "#fff4c8"]]),
  },
  // Dark temple stone, brighter gold (Prelude of Light's dark ramp).
  dark: {
    tile: ["#1c2433", "#0f141e"], shadow: ["#000000", 0.5],
    gold: ramp([[0, "#5c430c"], [0.25, "#9a7a22"], [0.45, "#c09a33"], [0.6, "#d8b34a"], [0.75, "#f6d869"], [0.9, "#fbe68a"], [1, "#fffbe6"]]),
  },
};
// Grey-blue stone of the Temple of Time, for the plate.
const stone = ramp([[0, "#161b24"], [0.2, "#2a3240"], [0.34, "#3d4757"], [0.48, "#566273"], [0.62, "#75818f"], [0.76, "#9ba5b1"], [0.9, "#c9d0d8"], [1, "#f1f4f7"]]);

function draw(place, gold, m) {
  let silhouettes = "", body = "";
  for (const { facets, outline } of PIECES) {
    for (const f of facets) {
      let n = cross(sub(f[1], f[0]), sub(f[2], f[0]));
      if (n[2] < 0) n = n.map((v) => -v);
      const c = gold.shade(norm(n), m);
      body += `<path d="${pathOf(f.map(place))}" fill="${c}" stroke="${c}" stroke-width="0.5" stroke-linejoin="round"/>`;
    }
    silhouettes += `<path d="${pathOf(outline.map(place))}"/>`;
  }
  return { silhouettes, body };
}

const BOX = { x0: -0.5, x1: 0.5, y0: APEX[1], y1: LEFT[1] };

export function mark({ theme = "light", size = 512, fill = 0.4, square = false, id = `tt-${theme}` } = {}) {
  const t = THEMES[theme];
  const place = placement(size, { extent: 0.5, box: BOX, fill });
  const e = draw(place, t.gold, { ...model, exposure: theme === "dark" ? 0.04 : -0.02 });
  const shadow = `<g transform="translate(${f1(size * SHADOW_OFFSET.dx)} ${f1(size * SHADOW_OFFSET.dy)})" fill="${t.shadow[0]}" fill-opacity="${t.shadow[1]}" filter="url(#${id}-soft)">${e.silhouettes}</g>`;
  return svgDoc({ size, defs: tileDefs(id, t.tile) + softDefs(id, size), body: tileRect(id, size, { square }) + shadow + e.body, title: "Triforce mark" });
}

// On the plate the Triforce is centred optically like the marks (three quarters of the way from
// its centroid to its box centre), with the base corners at 0.62 of the plate radius.
const LIFT = (0.75 * H) / 6;
const PLATE_SCALE = 0.62 / Math.hypot(0.5, H / 3 + LIFT);
export function medallion({ size = 512, compact = false, id = "ttm" } = {}) {
  const gold = THEMES.light.gold;
  return plateMedallion({
    size, compact, id, ramp: stone, title: "Triforce on the temple plate",
    content: (place, cast) => {
      const p = ([x, y]) => place([x * PLATE_SCALE, (y + LIFT) * PLATE_SCALE]);
      const e = draw(p, gold, { ambient: 0.1, diffuse: 0.74, spec: 0.32, exposure: 0.04 });
      const back = `<g transform="translate(${f1(cast.dx * 0.55)} ${f1(cast.dy * 0.55)})" fill="${stone.deepest}" fill-opacity="0.5">${e.silhouettes}</g>`;
      return { back, front: e.body };
    },
  });
}
