# Site plan

Status: **site map revised 2026-10-31** (four sections, every page reachable from one top bar).
- **Built:** the four sections below; research and capstone in the docs layout with LaTeX; capstone progress log; a docs section per project with overview and changelog stubs. Home, About, CV and Garden are Lens of Truth pages (see `.lens/CLAUDE.md`).
- **Waiting:** the project registry, until the Ice Cavern session's format arrives. Diagrams and notebooks will be set up when the first ones arrive. Garden's Obsidian notes, screenshots and demos come later.

## Readers
1. Research advisor; graduate school and internship reviewers, reached through the link on the resume. The CV page, the home page's Research button and the resume serve them first.
2. Friends: welcome, but not a priority. The Garden is theirs.

Ocarina of Time names appear in the project sections. The professional pages (home, CV, research, resume) use plain names.

## Sections
The top bar is the main way around the site: **Docs · CV · Garden · About**, on every page, docs and research included. The home page introduces each section in a band of short previews.

| Section | Route | What |
|---|---|---|
| Home | `/` | Short intro, a Research button (shown once research is published), and a preview of each section |
| **Docs** | `/docs/` | Research, every project's docs, and dev docs. The landing page lists the projects (from `src/data/projects.yaml`) |
| | `/research/` | GRB summer fellowship: one long page. LaTeX maths, figures, data, notebooks, code. Grouped in the Docs sidebar; the address stays because the resume links to it |
| | `/research/capstone/` | Capstone: overview, **dated progress log** (newest first) and **milestone pages** for its layers |
| | `/docs/<project>/` | Each project's documentation; `/docs/<project>/changelog/` its changelog |
| **CV** | `/cv/` | The professional page, for sterile contexts: a research highlight, selected projects, the resume and PDF, contact details. It overlaps the other sections on purpose |
| | `/resume/` + `/resume.pdf` | Resume, unchanged, linked from CV |
| **Garden** | `/garden/` | Digital garden: Currently now; a published slice of the Obsidian vault, project screenshots and demos later |
| | `/garden/currently/` | Currently: what Luca is reading, watching, playing and listening to, with a "last updated" date |
| **About** | `/about/` | About this portfolio, the site's statement of purpose, and contact details |

Old addresses forward: `/projects/` to `/docs/`, `/contact/` to `/about/`, `/currently/` to `/garden/currently/` (to `/garden/` while Currently is a draft).

## Projects documented here
Every personal project except Nocturne of Shadow, whose docs stay on Nocturne itself: they would include sensitive material, and this repo is public.

| Project | Docs section |
|---|---|
| Temple of Time | `/docs/temple-of-time/` (outline already drafted) |
| Prelude of Light | `/docs/prelude-of-light/` |
| Saria's Song | `/docs/sarias-song/` |
| Ice Cavern | `/docs/ice-cavern/` |
| Minuet of Forest | `/docs/minuet-of-forest/` (also serves as "about this site") |

Each project section has:
- **Overview page:** what it is, status, current version, timeline (start, milestones), links.
- **Documentation pages:** the focus.
- **Changelog page.**

Its shape is shared across projects so they read consistently, but each project can add pages freely.

## Content model (sources of truth)
- **Project registry:** one file, `src/data/projects.yaml`. Each entry has a slug, name, one-line summary, status, version, timeline, links and theme colour. It feeds the project index, each overview's header and the home page. Its schema should match the Ice Cavern hub's `projects.json` so one registry can feed both, or an editing tool can write both.
- **Docs and research:** Markdown/MDX in `src/content/docs/`, with frontmatter (`title`, `description`, `draft`).
- **Changelogs:** one Markdown file per project.
- **Site copy:** `src/data/copy.yaml`.
- **Resume:** `src/data/resume.yaml`.

## Technical needs
- **Maths:** LaTeX through remark-math and KaTeX, rendered at build time. KaTeX's CSS and fonts are self-hosted, with no CDN.
- **Figures:** images in the content folders, optimised by Astro.
- **Diagrams:** written as text (Mermaid) and rendered to SVG at build time with the Chromium we already use for the PDF. No diagram JavaScript in the browser.
- **Notebooks and data:** downloadable files (`.ipynb`, `.csv`), plus a rendered read-only view of each notebook made at build or authoring time. The exact method will be decided when the first notebook arrives.
- **Code:** syntax-highlighted code blocks; Starlight already handles these.
- **Research in Starlight:** research pages use the same reading layout as the docs (contents sidebar, maths, figures) but sit under `/research/`, with their own sidebar group.

## Editing-tool readiness (prep only)
- **Content model doc:** write down every content type above, its fields and file location.
- **Schema checks:** validate every content type's schema at build time, so a tool (or a hand edit) that writes a bad file fails the build with a clear message.
- **Changes from the Ice Cavern session:** adopt whatever conventions its handoff asks for.
