# Design spec

## Minuet of Forest (public, light)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f4f6f0` | Page background (warm off-white, green tint) |
| `--sage` | `#dfe9d6` | Header bands, text bubbles, tags, hover |
| `--forest` | `#1f4d34` | Headings, buttons, nav: the main color |
| `--link` | `#2d6a46` | Links |
| `--text` | `#1d2a21` | Body text |
| `--muted` | `#4f6356` | Captions, dates |

Contrast (WCAG): text/bg 13.7, forest/bg 8.9, white on forest 9.7, forest on sage 7.7, muted on sage 5.2. All pass AA for normal text. Keep any new pairing at 4.5:1 or better.

Light only for now (`color-scheme: light`). A small gold accent is reserved for the medallion logo in the theming pass.

Type: system font stack for body text. Display font for headings, card titles and the site title: **Hylia Serif Beta** (Omni Jacala, artsyomni.com/hyliaserif), self-hosted as `src/assets/fonts/hylia-serif.woff2` (`--font-display`). It covers ASCII only, so keep headings free of accented characters (they fall back to Georgia).

### Logo
See `docs/logo.md`. Earlier flat version, replaced in 0.6.1:

Flat forest medallion (`src/components/Logo.astro`, `public/favicon.svg`), in the style of the Prelude of Light mark: an icon tile next to the title in the display font, no rendered/3D medallion. Colors: ring `--forest`, disc `--link`, blades `#b9d89a`, accents `#7fae6a`, tile `#e6eedf`. It appears in the site header, docs header, home hero, 404, favicon, touch icon and Open Graph image; not in the PDFs.

Resume PDF stays white with the same forest green accents.

## Nocturne of Shadow
Separate private project; its palette is defined in its own repo.
