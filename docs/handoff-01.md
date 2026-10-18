# Handoff 01: public site

## Goal
Build the public site so the professionally important parts work, are accessible, and are clear. Theming beyond the palette is handoff 02. Deployed as a GitHub project site at `https://wander22lstr.github.io/minuet-of-forest/`, with `site: "https://wander22lstr.github.io"` and `base: "/minuet-of-forest"` in one config location (`site.config.mjs`); all links, assets, PDF URLs, sitemap and Open Graph URLs honor it.

## Pages
| Route | Notes |
|---|---|
| `/` | Short intro, three entry cards (Research, Projects, Resume), recent "now" snippet |
| `/about/` | Placeholder structure, Luca fills in |
| `/research/` | Structure for the GRB research position and astrophysics interests. No invented claims. `draft: true` until Luca approves (he checks with his PI first) |
| `/resume/` | Rendered from `src/data/resume.yaml`. **Download PDF** links to `/resume.pdf`. Minimal header. Print stylesheet |
| `/cv/` | Longer academic version from `src/data/cv.yaml`, same pattern, `/cv.pdf` |
| `/projects/` | Project blocks with a status tag (live / building). Temple of Time first, linking to the docs |
| `/docs/` | Starlight. Pages from the outline as `draft: true` stubs. **Luca writes the prose** |
| `/now/` | Markdown, "last updated" date, sections: reading/watching, playing, studying, building |
| `/contact/` | Email placeholder, GitHub link. No phone or address |
| `/404` | Friendly, on-theme text |

No cover-letter page.

## Resume and PDF
- Single source of truth: the YAML files; web page and PDF render from them.
- `/resume.pdf` and `/cv.pdf` generated in the build (headless Chromium). Selectable text, single column, ATS-friendly, live links, including a link back to the site.
- PDF white with forest-green accents. Web page has a print stylesheet.
- Content uses `TODO(Luca)` fields; nothing invented.

## Quality bar
- Accessibility: landmarks, skip link, keyboard navigation with visible focus, AA contrast, alt text, `lang`, `prefers-reduced-motion`, 360px with no horizontal scroll.
- Performance: no external requests at runtime, small bundle, system fonts.
- SEO: titles, descriptions, Open Graph, sitemap, favicon placeholder.
- Drafts excluded from build, nav and sitemap. `npm run todos` lists remaining `TODO(Luca)` and drafts.

## Hidden link to Nocturne of Shadow
- Small medallion icon in the footer (placeholder SVG). Not in main nav, not on resume/CV, never in PDFs.
- Keyboard-focusable, `aria-label="Nocturne of Shadow (friends only)"`, label revealed on hover and focus, no `display:none`.
- URL from one value, `NOCTURNE_URL`, pointing at Nocturne's login page. Empty: render nothing. `rel="noopener nofollow"`. Not in sitemap or Open Graph.
- Never describe Nocturne's contents on this site.

## Acceptance test
- `npm run build` succeeds locally and in the workflow.
- Under the base path every internal link, image, stylesheet and both PDFs resolve.
- Built output has no `TODO(Luca)` text and no draft pages.
- `resume.pdf` and `cv.pdf` exist, text selectable, links work.
- axe/Lighthouse: no serious violations on home, resume, projects, docs.
- Keyboard-only walkthrough of the nav works.
- Medallion: absent with empty `NOCTURNE_URL`; with a value, present, Tab-reachable, label on focus, absent from resume, CV and PDFs.
- Repo scan finds none of the never-publish identifiers.

## What Luca does himself
Create the repo, enable Pages (GitHub Actions source), set `NOCTURNE_URL` once Nocturne is deployed, write the real content, approve the public Temple of Time summary, decide which email to show, confirm research wording with his PI before un-drafting `/research/`.

## Next
Handoff 02: theming pass (Forest look, medallion logo, Ocarina of Time touches).
