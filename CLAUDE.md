# Minuet of Forest

Public portfolio and docs site for Luca (WandeR). Static site, hosted free on GitHub Pages as a project site at `https://wander22lstr.github.io/minuet-of-forest/`. `site` and `base` live in one place, `site.config.mjs` (`BASE = "/minuet-of-forest"`), so a future custom domain only needs those values changed. Every internal link and asset must respect `base` (use `url()` from `src/lib/site.ts`). **This repo is public: every file in it, including this one, is visible to anyone.**

## Hard rules
- Never put private information in this repo: no IP addresses, tailnet or host names, MAC addresses, SSH aliases, usernames of machines, schedules, tokens, webhooks, Discord IDs, home address, phone number. `npm run scan` checks for these.
- Never invent content. Resume bullets, dates, research claims, publications, grades, affiliations and links come from Luca. Use `TODO(Luca)` placeholders and mark unfinished pages `draft: true`; drafts are excluded from the production build and navigation.
- Luca writes all prose on the site, including the docs write-up. You build structure, outlines and layout only; any text a visitor reads goes in as a `[placeholder]` (in `src/data/copy.yaml` where possible).
- No paid services, no analytics or trackers, no third-party scripts, no CDN fonts. Everything is self-hosted and works offline once built.
- Do not touch GitHub settings or any account. Luca does that; the steps are in `DEPLOY.md`.
- Nothing from the private sibling site (Nocturne of Shadow) belongs here: no content, no screenshots, no descriptions of what is inside. The one allowed connection is the hidden footer medallion, which points to its login page only, using one config value (`NOCTURNE_URL`).

## Stack
Astro (static output) with Starlight for the `/docs/` section. Builds on the Mac or in GitHub Actions, never on the Pi. The resume and CV PDFs are generated at build time (headless Chromium via Playwright) from the same YAML as the web pages.

## Look
Light, easy on the eyes: warm off-white, sage tints, dark forest green as the main color. Tokens in `docs/design-spec.md` and `src/styles/tokens.css`. Function and accessibility first; decorative Ocarina of Time theming and logos come in a later handoff.

## Layout
- `CLAUDE.md` (this file), `DEPLOY.md` (Luca's deploy steps)
- `docs/`: handoff 01, design spec, sibling projects, Temple of Time summary and outline
- `site.config.mjs`: SITE, BASE, NOCTURNE_URL
- `src/data/copy.yaml`: all site copy, as `[placeholders]` until Luca writes it
- `src/data/*.yaml`: resume, CV, projects, contact
- `src/content/pages/*.md`: about, research, now. `src/content/docs/docs/`: Starlight docs
- `scripts/`: PDF build, dist checks, accessibility, privacy scan, todo listing; `scripts/logos/`: shared logo engine (`engine.mjs`), medallion plate (`plate.mjs`) and one file per project
- `logos/`: generated logo sets for Luca's other projects (not part of the site build)

## Commands
| Command | What |
|---|---|
| `npm run dev` | Dev server (drafts visible, with a banner) |
| `npm run build` | Static build + `resume.pdf` and `cv.pdf` |
| `npm run preview` | Serve the build under the base path |
| `npm run check` | Built output: no TODO text, no drafts, no external loads, no broken or base-less links |
| `npm run a11y` | axe, 360px overflow, keyboard walkthrough, medallion |
| `npm run scan` | Repo and build scan for never-publish identifiers |
| `npm run todos` | Every remaining `TODO(Luca)`, `[placeholder]` and draft page |
| `node scripts/make-logos.mjs [forest\|light\|shadow]` | Regenerate project logos: this site's (`src/assets/logo/`, icons in `public/`) and other projects' (`logos/<project>/`). Spec: `docs/logo.md` |

Set `CHROMIUM_PATH` to use an installed Chromium instead of `npx playwright install chromium`.

## Versioning
The site version lives in `package.json` and shows in the footer next to the medallion. Bump it for each release and add an entry to `CHANGELOG.md`.

## Workflow
Read the handoff you were given, meet its acceptance test, and list anything you could not verify. Commit in small steps.
