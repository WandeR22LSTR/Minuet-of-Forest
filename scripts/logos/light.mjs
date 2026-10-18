// Prelude of Light: the light medallion's emblem (three orbs, three faceted pyramids), no disc.
// Positions were measured from the Light Medallion and mapped into a 64-unit square.
import { ramp, emblemMark } from "./engine.mjs";

const SHAPE = {
  // Outline triangle (apex, base left, base right), then the peak's position inside it.
  pyramids: [
    [[16.6, 16.6], [9, 30.5], [28.9, 32.5], [24.4, 26.4]],
    [[47.4, 16.6], [55, 30.5], [35.1, 32.5], [39.6, 26.4]],
    [[31.8, 37.3], [23.9, 55.8], [40, 55.8], [32.2, 50.8]],
  ],
  peakHeight: 5,
  orbs: [[32, 15], [15.2, 43.5], [48.8, 43.5]],
  orbR: 6.6,
};

const model = { ambient: 0.14, diffuse: 0.66, spec: 0.25 };
export const THEMES = {
  // Temple of Time white: deeper gold so it holds contrast on the pale tile.
  light: {
    tile: ["#f8f5ee", "#ece6d8"], shadow: ["#5e450a", 0.22], model,
    ramp: ramp([[0, "#4a3505"], [0.25, "#7f5f10"], [0.45, "#a87f1c"], [0.6, "#c0952b"], [0.75, "#e0b947"], [0.9, "#f3d36c"], [1, "#fff4c8"]]),
  },
  // Zelda blue: brighter gold on navy.
  dark: {
    tile: ["#121c30", "#0b1220"], shadow: ["#000000", 0.5], model,
    ramp: ramp([[0, "#5c430c"], [0.25, "#9a7a22"], [0.45, "#c09a33"], [0.6, "#d8b34a"], [0.75, "#f6d869"], [0.9, "#fbe68a"], [1, "#fffbe6"]]),
  },
};

export function mark({ theme = "light", size = 512, fill = 0.4, square = false, id = `pl-${theme}` } = {}) {
  return emblemMark(SHAPE, { size, fill, square, id, theme: THEMES[theme], title: "Light medallion mark" });
}
