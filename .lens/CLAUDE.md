# Lens of Truth in this project

This folder adapts **Lens of Truth**, Luca's private desktop layout editor, to **Minuet of Forest** (Astro). "Nabooru" is Luca's name for Claude, so if Luca asks Nabooru to work on Lens here, that's you.

## What lives where
- **The Lens app is not in this repo** and must never be copied in. This repo may be public.
- **This `.lens/` folder belongs to the project.** It's how Lens fits this project, and it's expected to differ from other projects:

  | File | What it is |
  |---|---|
  | `lens.config.*` | Editable pages, layout file paths, breakpoints, and which design tokens the inspector offers |
  | `blocks.*` | This project's block types (widgets): props schema, defaults, allowed children |
  | `LensPage.*` | Renders layout JSON with this project's own components and styles |

- **Layout files** live at the paths in `lens.config`. They're content: edit them through Lens, or carefully by hand.

## How Lens fits Minuet
The full handoff is `docs/lens-of-truth-handoff.md`. Minuet's own `CLAUDE.md` wins wherever the two meet.

- **Pages:** only the homepage (`src/pages/index.astro`) is a Lens page. Its layout is `src/data/layouts/home.layout.json`. Every other page is hand-built and Lens leaves it alone.
- **Base path:** `base` in `lens.config.json` is `/minuet-of-forest` and must match `BASE` in `site.config.mjs`. If BASE changes (a custom domain), change it here too. Layouts store site paths without the base; the renderer adds it.
- **Images** that Luca adds through Lens go to `public/images/` (served at `/images/`). They are the site's content.
- **Tokens:** surfaces `base`, `sage`, `white` are `--bg`, `--sage`, `--white`. Text uses Minuet's own heading and body styles (`global.css`), and primary buttons are Minuet's `.button`. No new colours.
- **Spacing:** Minuet has no spacing tokens, and Luca chose not to add any for now. The names `none`, `xs`, `sm`, `md`, `lg`, `xl` are mapped to fixed `rem` sizes in `LensPage.astro` only. Don't add them to `tokens.css` or the design spec without Luca.
- **Sections** already sit in Minuet's `.wrap`. On the base background they only get space above and below; on `sage` or `white` they are padded all round. A section's label is for the structure tree only and isn't put on the page, so it is never text a visitor reads.
- **Minuet block types** keep the homepage's dynamic parts working:
  - `logo`: the site logo (`src/components/Logo.astro`).
  - `card`: like the old homepage cards. Its title links only once the linked page is published (`isPublished()` in `src/lib/site.ts`); until then it shows its note.
  - `currently`: the first section of the Currently page (`currentlySnippet()`), shown only while that page is published.
- **Links in text and buttons** aren't hidden when their page is a draft. If one points at a draft page, `npm run check` reports a broken link in the build, so point them at published pages.
- **Embeds:** Minuet loads nothing from other sites, so an embed must be a page on this site. `npm run check` refuses outside ones.

## Text on Lens pages
Luca writes all text a visitor reads. Text that isn't written yet is a `[placeholder]`, and new blocks start with one. `npm run todos` lists the placeholders in layout files with the rest. Nothing typed in Lens can be lost:
- Lens writes every edit to the layout file straight away, atomically, so a crash never leaves a half-written or unsaved layout.
- The layout files are in git, so committing (and pushing) is the backup. Commit after a Lens session.

## Lens must be adapted to this project
The template `lens init` produced is a starting point, not a finished fit. When you arrive:
1. Read this project's own `CLAUDE.md` and design rules (tokens, accessibility, breakpoints).
2. Check that `blocks.*` covers the components this project actually uses, and that `LensPage.*` renders them with the project's real components and tokens. Fix what doesn't match.
3. If the project's framework or structure differs from what the template assumed, adapt the renderer and config here. **Never patch the Lens app from here.** If Lens itself can't do something, tell Luca so it can be added to the Lens repo.

## Rules
- Spacing, colours and type in layouts **reference this project's design tokens by name**, never raw values.
- `data-lens-id` attributes are added **in dev only**. A production build must contain no Lens IDs and no bridge script, and **no Lens file may live in `public/`**, because it would be copied into the build. (Images that Lens adds to the asset folder set in `lens.config.json`, such as `public/images/`, are the site's own content, not Lens files.)
- The renderer must keep this project's accessibility rules: contrast, keyboard use, focus, reduced motion and small screens.
- Lens runs its own dev server from `dev.command` in `lens.config.json` and stops it on quit. For Astro, keep `--ignore-lock` in that command: without it, Astro 7 may hand off to a background server Lens can't manage (it does this when it detects an AI agent, or when another dev server holds its lock).
- **Base path:** if `astro.config` sets `base` (e.g. `/minuet-of-forest` on GitHub Pages), set the same `base` in `lens.config.json`, so Lens opens the right address. Layouts store site paths *without* the base (`/images/a.jpg`, `/about/`); the renderer adds `import.meta.env.BASE_URL` in front, so they keep working if the base changes.
- Layout files carry a format version (`"lens": 1`). Don't change the format here; format changes happen in the Lens repo, which migrates old files.
- Don't commit secrets, host names or private machine paths. This folder may be public.

## Checklist after adapting
- [ ] The project builds, and the output contains no `data-lens-id` and no Lens bridge script.
- [ ] Each block type renders correctly at 360px and at desktop width, in each colour mode the project has.
- [ ] Open the project in Lens: select, resize and edit one block of each type, then undo and save.
- [ ] The project's own `CLAUDE.md` has one line: "This project uses Lens of Truth; see `.lens/CLAUDE.md`."
