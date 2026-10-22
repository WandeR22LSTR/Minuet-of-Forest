# Handoff: adopt Lens of Truth in Minuet of Forest

**Written:** 2026-10-22, from the Lens of Truth session
**For:** the Claude Code session working on Minuet of Forest. It sets Minuet up so Luca can arrange and edit chosen pages visually in Lens of Truth.
**Put this file at:** `docs/lens-of-truth-handoff.md`

## 0. Before you start
- Read Minuet's `CLAUDE.md` first. Its hard rules win wherever they meet this handoff: the repo is public; Luca writes all prose; every internal link and asset respects `base`; no third-party loads.
- Luca's answers to the open questions are in section 3. Nothing else needs asking before you start.
- Lens needs to be **0.0.5 or later** (base path support). That's in the Lens repo, not here.

## 1. What Lens of Truth is
Luca's private desktop app (separate repo, never part of this one). It starts this site's own dev server, shows a page live, and lets Luca select blocks, resize them on a 12-column grid, and edit their content. Edits are written to **layout JSON files** in this repo, and Astro renders them. Lens only edits pages that are rendered from a layout file; Minuet's other pages stay exactly as they are.

This repo gets:
- **`.lens/`**: the project's adapter. It contains `lens.config.json`, `blocks.json`, the renderer (`LensPage.astro`, `LensBlock.astro`, `markdown.ts`) and a `CLAUDE.md`. Starting files are in `files/lens-template/`. It's public-safe: config and rendering only.
- **Layout files**: one per Lens page, e.g. `src/data/layouts/home.layout.json`.
- **Pages that render them**: `<LensPage layout={layout} />` inside Minuet's `Base` layout.

Nothing of the Lens app goes in here. In dev, the renderer adds `data-lens-id` attributes, and Lens injects its own bridge into its preview. A production build contains neither.

## 2. Already tested (2026-10-22, scratch copy, nothing pushed)
On a copy of Minuet at `7fdfe8e` (v0.7.0, Astro 7.4.0):
- `lens init` created `.lens/` and a sample layout. Setting `"base": "/minuet-of-forest"` in `lens.config.json` and adding a trial page that renders the layout inside `Base` worked:
  - **Live in Lens** at `/minuet-of-forest/lens-trial/`. Selecting, the grid overlay, resize handles and the image picker all work on Minuet's real styles.
  - **`npm run build`** (including the resume PDF), then **`npm run check`: "dist OK"**. The trial page's links and images carried `/minuet-of-forest/`.
  - **`npm run scan`: no private identifiers**. The `127.0.0.1` in the dev command is excluded by the scanner on purpose.
  - **No `data-lens` attributes** in the built page.
- Astro 7.4.0 has the `--ignore-lock` option the dev command needs (checked in the 7.4.0 package).
- What didn't fit, and is your job (section 4):
  - **Tokens:** Minuet's tokens (`--bg --sage --forest --link --text --muted --white`, `--font-sans`, `--font-display`) aren't the template's, and Minuet has **no spacing scale**. So the trial had no gaps and an unstyled button.
  - **Layouts folder:** Minuet keeps data in `src/data/`, not `src/content/`.
  - **Dev toolbar:** Astro's toolbar showed in the preview. Lens 0.0.5 hides it itself, so no change is needed here.

## 3. Luca's answers (2026-10-22)
These are decided; don't ask again.
1. **Which page: the homepage** (`src/pages/index.astro`). Luca is fine with it changing live: he'll edit it in Lens after the merge. It doesn't need to look identical after conversion, but:
   - **Keep the dynamic parts working:**
     - the Research card only links once research is published;
     - the "Currently" snippet comes from the Currently page;
     - the logo.
   - **How:** keep them as hand-built pieces around the Lens part, or add small Minuet block types for them. Say which in the PR.
   - **Text:** keep the existing wording where it is, and don't invent any. Text that moves into the layout file moves unchanged; anything new is a `[placeholder]`.
   - **Checks:** `npm run check` and `npm run a11y` pass. Include screenshots at 360px and 1280px in the PR.
2. **Text:** placeholders (`[placeholder]`) in the layout file, filled in by Luca through Lens, are fine, **as long as nothing can be lost**. That's covered as follows; say so in `.lens/CLAUDE.md`:
   - Lens writes every edit to the file straight away, atomically, so a crash never leaves a half-written or unsaved layout.
   - The layout files are in git, so committing (and pushing) is the backup. Remind Luca in the PR to commit after a Lens session.
   - Make sure `npm run todos` lists the placeholders.
3. **Spacing:** not now. Keep spacing names inside `.lens` only: map them to fixed `rem` values in the renderer. Don't change `tokens.css` or the design spec.
4. **Block types:** not decided. Start with the template's set (heading, text, image, button, spacer, group, embed), styled with Minuet's tokens. Minuet-specific blocks come later.

## 3b. The original questions, for reference
1. **Which page or pages should Lens edit to start with?** One is plenty. Options:
   - a new page;
   - the home page;
   - one section inside an existing page, with the rest staying hand-built.

   Pages Lens manages are built from blocks rather than custom Astro markup, so converting an existing page changes how it's built. (Answered: the homepage.)
2. **Where does the text of Lens pages live?** Minuet keeps visitor-facing copy in `src/data/copy.yaml`. Text on Lens pages lives in the layout JSON, because that's what Lens edits.
   - Propose: Lens pages keep their text in their layout file. Placeholders are written as `[placeholder]` until Luca fills them in, through Lens or by hand. Confirm that `npm run todos` should list them.
   - Never invent text, and don't move existing copy without Luca's go-ahead.
3. **Spacing:** Minuet has no spacing tokens. Should you add a small scale (`--space-xs` to `--space-xl`) to `src/styles/tokens.css` and `docs/design-spec.md`? Or keep the spacing names inside `.lens` only? Check `docs/design-spec.md` first; ask if it doesn't say.
4. **Which block types** Luca wants on Minuet pages. The template has heading, text, image, button, spacer, group (columns) and embed. Minuet-specific ones (e.g. its project cards) can be added to `blocks.json` with matching rendering in `LensBlock.astro`.

## 4. Steps
1. **Commit this handoff** at `docs/lens-of-truth-handoff.md`.
2. **Create `.lens/`.** Copy everything in `files/lens-template/` except `home.layout.json` into `.lens/`. In `.lens/CLAUDE.md`, replace `<PROJECT>` with `Minuet of Forest` and `<FRAMEWORK>` with `Astro`, and delete the `<!-- Template… -->` line. (If Luca has Lens open on this repo, **File → Set Up Lens in a Project…** does the same, and you then adapt it.)
3. **`.lens/lens.config.json`:**
   - `"base": "/minuet-of-forest"`. It must match `BASE` in `site.config.mjs`. Add a line to `.lens/CLAUDE.md` saying so: if BASE changes for a custom domain, change it here too.
   - `"dev"`: keep the template's command, `npm run dev -- --port {port} --host 127.0.0.1 --ignore-lock`.
   - `"assets": { "dir": "public/images", "url": "/images/" }`. That's where Lens puts images Luca adds. The URL is stored **without** the base, and the renderer adds it.
   - `"pages"`: the pages from question 1. Each has a layout path under `src/data/layouts/` and a route **without the base**, with a trailing slash (`trailingSlash: "always"`), e.g. `"/"` or `"/about/"`.
   - `"breakpoints"`: Minuet has no width breakpoints of its own (its layout is fluid). Keep the template's `md` (1024) and `sm` (640) unless the design spec says otherwise. `npm run a11y` checks 360px.
   - `"tokens"`: the names the inspector offers, matching what you map in step 4.
   - `"colorModes"`: leave it out. Minuet has a single light theme.
4. **Map tokens and styles** in `.lens/LensPage.astro` and `.lens/LensBlock.astro`, using Minuet's `tokens.css` and `global.css`. Don't add new colours:
   - **Surfaces** use `--bg`, `--sage` and `--white`, with token names like `base`, `sage` and `white`.
   - **Text** uses `--text` and `--muted`, and links `--link`.
   - **Headings** follow Minuet's heading styles (`--font-display` for the page title).
   - **Buttons** look like Minuet's existing links and buttons.
   - **Spacing** follows Luca's answer to question 3.
   - **Contrast** stays at 4.5:1 or better.
5. **Links and images:** the template already adds `import.meta.env.BASE_URL` in front of site paths (`/images/a.jpg`, `/about/`). Minuet's own helper is `url()` in `src/lib/site.ts`. Use either, but be consistent, and keep layouts storing paths without the base.
6. **Pages:** render each layout inside Minuet's layout, e.g.
   ```astro
   ---
   import Base from "../layouts/Base.astro";
   import LensPage from "../../.lens/LensPage.astro";
   import layout from "../data/layouts/home.layout.json";
   ---
   <Base title="…"><LensPage layout={layout} /></Base>
   ```
   Start each layout with placeholder text only (`[placeholder]`), per question 2.
7. **Docs and version:**
   - Add one line to Minuet's `CLAUDE.md`: "This project uses Lens of Truth; see `.lens/CLAUDE.md`."
   - Add `.lens/` and `src/data/layouts/` to its Layout section.
   - Bump the version and add a `CHANGELOG.md` entry.
8. **Branch and PR.** Commit in small steps and open a pull request. List anything you couldn't verify under "Needs local check".

## 5. Acceptance test
- [ ] `npm run build`, then `npm run check` prints "dist OK".
- [ ] `npm run scan` finds no private identifiers. Nothing in `.lens/` is private.
- [ ] `npm run a11y` passes, including no horizontal overflow at 360px on Lens pages.
- [ ] The built HTML contains no `data-lens-id`, `data-lens-grid` or `data-lens-type`, and no file with "lens" in its name is in `dist/`.
- [ ] Every link and image on Lens pages starts with `/minuet-of-forest/` in the build.
- [ ] `npm run todos` lists the Lens pages' placeholders (if Luca agreed to question 2's proposal).
- [ ] **Needs local check:** Luca opens the repo in Lens, and the page loads. Selecting, resizing, editing text, adding an image, undo, and checking 360 and 1280 widths all work.

## 6. Don't
- Don't put any part of the Lens app in this repo, or anything Lens-related in `public/` except images Luca adds through Lens (`public/images/`).
- Don't change GitHub settings or deploy. Luca does that (`DEPLOY.md`).
- Don't write visitor-facing text, and don't add anything about Nocturne of Shadow.
- If Lens itself can't do something Minuet needs (a field type, a layout feature), don't work around it in the app's place. Describe it under "Needs a Lens change" in the PR, and Luca will bring it to the Lens session.
