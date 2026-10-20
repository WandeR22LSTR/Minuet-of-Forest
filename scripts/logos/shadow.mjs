// Nocturne of Shadow: the shadow medallion. An inverted three-faced pyramid with its peak at the
// centre, and three orbs (top, lower left, lower right). Positions measured from the in-game
// medallion; normalised to the plate (circumradius 1, centre 0,0, y down), so the emblem sits
// on the medallion's recessed face as in the original.
import { ramp, emblem, emblemMark, f1 } from "./engine.mjs";
import { plateMedallion } from "./plate.mjs";

const SHAPE = {
  pyramids: [[[-0.417, -0.247], [0.417, -0.247], [0, 0.486], [0, 0]]],
  peakHeight: 0.12,
  orbs: [[0, -0.472], [-0.389, 0.208], [0.389, 0.208]],
  orbR: 0.178,
};

// Purple and black, for Nocturne's dark theme.
const shadowRamp = ramp([
  [0, "#0e0716"], [0.2, "#24103d"], [0.34, "#3a1763"], [0.48, "#55208f"],
  [0.62, "#7330bd"], [0.76, "#9550dc"], [0.9, "#c79af0"], [1, "#f3e6ff"],
]);
const THEME = {
  tile: ["#1e1330", "#0c0814"], shadow: ["#000000", 0.55], ramp: shadowRamp,
  model: { ambient: 0.14, diffuse: 0.66, spec: 0.25 },
};

export function mark({ size = 512, fill = 0.4, square = false, id = "ns" } = {}) {
  return emblemMark(SHAPE, { size, fill, square, id, theme: THEME, title: "Shadow medallion mark" });
}

export function medallion({ size = 512, compact = false, id = "nm" } = {}) {
  return plateMedallion({
    size, compact, id, ramp: shadowRamp, title: "Shadow medallion",
    content: (place, cast) => {
      place.scale = place([1, 0])[0] - place([0, 0])[0];
      const e = emblem(place, { ...SHAPE, ramp: shadowRamp, model: { ambient: 0.08, diffuse: 0.74, spec: 0.3, exposure: 0.02 }, id });
      const back = `<g transform="translate(${f1(cast.dx * 0.55)} ${f1(cast.dy * 0.55)})" fill="${shadowRamp.deepest}" fill-opacity="0.5">${e.silhouettes}</g>`;
      return { back, front: e.body, defs: e.defs };
    },
  });
}

export const TILE = THEME.tile;
