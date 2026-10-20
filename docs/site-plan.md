# Site plan (Phase 1 proposal)

Status: **site map approved 2026-10-20.**
- **Built:** CV and About removed; Currently page; research and capstone in the docs layout with LaTeX; capstone progress log; a docs section per project with overview and changelog stubs.
- **Waiting:** the project registry, until the Ice Cavern session's format arrives. Diagrams and notebooks will be set up when the first ones arrive.

## Readers
1. Research advisor; graduate school and internship reviewers, reached through the link on the resume. The home page and resume serve them first.
2. Friends: welcome, but not a priority.

Ocarina of Time names appear in the project sections. The professional pages (home, research, resume) use plain names.

## Site map
| Route | What | Notes |
|---|---|---|
| `/` | Home | Short intro, entry points to Research, Projects and Resume |
| `/research/` | GRB summer fellowship | One long page: the whole fellowship. LaTeX maths, figures, data, notebooks, code |
| `/research/capstone/` | Capstone | Continues the GRB work. An overview, a **dated progress log** (short entries, newest first) and **milestone pages** for its layers (code automation, agent-based repository work, physical relations) as each reaches a milestone |
| `/projects/` | Project index | Every personal project: name, one line, status, current version, timeline. Each links to its docs |
| `/docs/<project>/` | Project documentation | The main content of each project. One section per project (below) |
| `/docs/<project>/changelog/` | Changelog | Per project, from its changelog file |
| `/resume/` + `/resume.pdf` | Resume | Unchanged |
| `/contact/` | Contact | Stays |
| `/currently/` | Currently | A media-flavoured "now" page: what Luca is reading, watching, playing and listening to, with a "last updated" date. Name of the route open |
| `/garden/` | Digital garden | Published slice of the Obsidian vault. **Stretch goal for 1.0**, scoped separately |

Removed:
- `/cv/` and `cv.pdf`: CVs are tailored per application.
- `/about/`: the Minuet of Forest docs section covers it.


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
