# Prelude of Light logo

The light medallion's emblem: three orbs and three faceted pyramids, no disc. Source: `scripts/logos/light.mjs`.

| File | Use |
|---|---|
| `logo-light.svg` | Light theme (default): tab icon and header |
| `logo-dark.svg` | Dark (Zelda blue) theme: tab icon and header |
| `favicon.ico` | 32 + 48 px, light |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` | Bookmarks and home screen, light (bookmarks can't switch themes) |
| `discord-avatar-1024.png` | Bot avatar: dark, emblem small enough to clear Discord's circle crop |
| `medallion-light.svg`, `medallion-dark.svg` | Full medallion (emblem on the shared plate with runes), 96px and up |
| `medallion-light-compact.svg`, `medallion-dark-compact.svg` | Medallion without runes: the footer, next to the version |
| `medallion-light-1024.png`, `medallion-dark-1024.png` | Large transparent renders, kept for a future project |

## Changes from the previous version
- All facets are lit from the top left, matching the orbs and the other project logos. Before, the pyramids were lit from the right.
- Shapes fill 80% of the tile, optically centred, instead of running into the corners.
- A soft shadow under the shapes, and a highlight on each orb.
- The raster icons are rendered from the SVG by script (previously macOS Quick Look); the touch and manifest icons are full-bleed squares, since the system rounds them itself.
- Geometry and colours are unchanged; the soft glow behind the emblem was dropped.
