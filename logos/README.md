# Project logos

Generated logo sets for Luca's other projects, made with the same engine as this site's logo
(`scripts/logos/`), so they share one light direction, tile and spacing. Copy a folder's files into
the project that uses them. Regenerate with `node scripts/make-logos.mjs <project>`; never hand-edit.

| Folder | Project | Source |
|---|---|---|
| `prelude-of-light/` | Prelude of Light | `scripts/logos/light.mjs` |
| `nocturne-of-shadow/` | Nocturne of Shadow | `scripts/logos/shadow.mjs` |
| `ice-cavern/` | Ice Cavern | `scripts/logos/ice.mjs` |
| `temple-of-time/` | Temple of Time | `scripts/logos/temple.mjs` |
| `sarias-song/` (git-ignored) | Saria's Song | `scripts/logos/saria.mjs` |

Saria's Song lives in a private repo, so its generated files are not committed here: run `node scripts/make-logos.mjs saria` and hand the folder over.

## Handoffs
`handoffs/` holds ready-to-use zips for each project's own Claude Code session, with directions (`HANDOFF.md` inside; the `.md` beside each zip is a copy for reading here):
- `prelude-of-light-part1.zip`: logo and icon update, Discord avatar steps
- `prelude-of-light-part2.zip`: full medallion, versioned footer, large renders to keep
- `nocturne-of-shadow.zip`: logo, icons, link back to Minuet, versioned footer, palette proposal
- `ice-cavern.zip`: logo (light and dark), icons, ice palette as the hub's look, project logos for the doors (Saria's Song's comes separately, as it is private), versioned footer, Blue Fire note. Meant to go with the hub's own handoff, which is private and not stored here
- `temple-of-time.zip`: Triforce logo (light and dark), icons, Discord bot avatar, large medallion for the documentation

Rebuild a zip after regenerating a project's logos, so it carries the new files.

The emblems are original drawings based on the medallions from *The Legend of Zelda: Ocarina of Time* (Nintendo).
