// Prelude of Light: the light medallion's emblem (three orbs, three faceted pyramids), no disc.
// Positions were measured from the Light Medallion and mapped into a 64-unit square.
// Each pyramid is a tetrahedron: its outline triangle (apex, base left, base right) on the
// tile, and a peak raised PEAK_HEIGHT above the inner point, so its three facets are shaded
// with the shared light (engine.mjs) like the Forest blades.
import { norm, cross, sub, ramp, svgDoc, f1, tileDefs, tileRect, softDefs, SHADOW_OFFSET, placement } from "./engine.mjs";

const PYRAMIDS = [
  // apex, base left, base right, peak
  [[16.6, 16.6], [9, 30.5], [28.9, 32.5], [24.4, 26.4]],
  [[47.4, 16.6], [55, 30.5], [35.1, 32.5], [39.6, 26.4]],
  [[31.8, 37.3], [23.9, 55.8], [40, 55.8], [32.2, 50.8]],
];
const ORBS = [[32, 15], [15.2, 43.5], [48.8, 43.5]];
const ORB_R = 6.6, PEAK_HEIGHT = 5;

export const THEMES = {
  // Temple of Time white: deeper gold so it holds contrast on the pale tile.
  light: {
    tile: ["#f8f5ee", "#ece6d8"], shadow: ["#5e450a", 0.22],
    ramp: ramp([[0, "#4a3505"], [0.25, "#7f5f10"], [0.45, "#a87f1c"], [0.6, "#c0952b"], [0.75, "#e0b947"], [0.9, "#f3d36c"], [1, "#fff4c8"]]),
  },
  // Zelda blue: brighter gold on navy.
  dark: {
    tile: ["#121c30", "#0b1220"], shadow: ["#000000", 0.5],
    ramp: ramp([[0, "#5c430c"], [0.25, "#9a7a22"], [0.45, "#c09a33"], [0.6, "#d8b34a"], [0.75, "#f6d869"], [0.9, "#fbe68a"], [1, "#fffbe6"]]),
  },
};
const LIGHT_MODEL = { ambient: 0.14, diffuse: 0.66, spec: 0.25 };

function box() {
  const pts = [...PYRAMIDS.flatMap((p) => p.slice(0, 3)), ...ORBS.flatMap(([x, y]) => [[x - ORB_R, y - ORB_R], [x + ORB_R, y + ORB_R]])];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

export function mark({ theme = "light", size = 512, fill = 0.4, square = false, id = `pl-${theme}` } = {}) {
  const { tile, shadow, ramp: r } = THEMES[theme];
  const b = box();
  const extent = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2;
  const place = placement(size, { extent, box: b, origin: [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], fill });
  const pts = (a) => a.map((p) => place(p).map(f1).join(",")).join(" ");
  let shadows = "", body = "";
  for (const [apex, left, right, peak] of PYRAMIDS) {
    const top = [...peak, PEAK_HEIGHT];
    for (const [a, c] of [[apex, left], [apex, right], [left, right]]) {
      let n = cross(sub([...c, 0], [...a, 0]), sub(top, [...a, 0]));
      if (n[2] < 0) n = n.map((v) => -v);
      body += `<polygon points="${pts([a, c, peak])}" fill="${r.shade(norm(n), LIGHT_MODEL)}"/>`;
    }
    shadows += `<polygon points="${pts([apex, left, right])}"/>`;
  }
  // Orbs: a sphere gradient with its highlight towards the light.
  for (const o of ORBS) {
    const [x, y] = place(o).map(f1), rr = f1(ORB_R * place.scale);
    shadows += `<circle cx="${x}" cy="${y}" r="${rr}"/>`;
    body += `<circle cx="${x}" cy="${y}" r="${rr}" fill="url(#${id}-orb)"/>`;
  }
  const orbStops = [[0, 1], [0.35, 0.82], [0.7, 0.55], [1, 0.3]].map(([o, v]) => `<stop offset="${o}" stop-color="${r.tone(v)}"/>`).join("");
  const defs = tileDefs(id, tile) + `<radialGradient id="${id}-orb" cx="0.36" cy="0.3" r="0.78">${orbStops}</radialGradient>` + softDefs(id, size);
  const shadowGroup = `<g transform="translate(${f1(size * SHADOW_OFFSET.dx)} ${f1(size * SHADOW_OFFSET.dy)})" fill="${shadow[0]}" fill-opacity="${shadow[1]}" filter="url(#${id}-soft)">${shadows}</g>`;
  return svgDoc({ size, defs, body: tileRect(id, size, { square }) + shadowGroup + body, title: "Light medallion mark" });
}
