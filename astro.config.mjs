import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { readdirSync, readFileSync } from "node:fs";
import { SITE, BASE } from "./site.config.mjs";

const asset = (p) => `${BASE.replace(/\/$/, "")}${p}`;

// The capstone log page only exists once there is a published entry (see src/pages/research/capstone/[log].astro).
// Lens of Truth previews the site as published with LENS_DRAFTS=0 (see SHOW_DRAFTS in src/lib/site.ts).
const DEV = process.argv.includes("dev") && process.env.LENS_DRAFTS !== "0";
/** Whether a folder has at least one Markdown file that is published (or we're in dev). */
const hasPublished = (dir, match = /\.mdx?$/) => {
  try {
    return readdirSync(dir).some((f) => match.test(f) && (DEV || !/^draft:\s*true\s*$/m.test(readFileSync(`${dir}/${f}`, "utf8"))));
  } catch {
    return false;
  }
};
const hasLog = hasPublished("src/content/capstone-log", /^\d.*\.md$/);

// One sidebar group per documented project (Nocturne's docs stay on Nocturne).
const PROJECTS = [
  ["Temple of Time", "temple-of-time"],
  ["Prelude of Light", "prelude-of-light"],
  ["Saria's Song", "sarias-song"],
  ["Ice Cavern", "ice-cavern"],
  ["Minuet of Forest", "minuet-of-forest"],
];

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "always",
  // LaTeX: $inline$ and $$display$$ maths, rendered to HTML at build time.
  markdown: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] },
  integrations: [
    starlight({
      title: "Minuet of Forest",
      disable404Route: true,
      favicon: "/favicon.svg",
      head: [
        { tag: "link", attrs: { rel: "icon", href: asset("/favicon.ico"), sizes: "32x32 48x48" } },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: asset("/apple-touch-icon.png") } },
        { tag: "link", attrs: { rel: "manifest", href: asset("/site.webmanifest") } },
      ],
      pagefind: false,
      customCss: ["katex/dist/katex.min.css", "./src/styles/tokens.css", "./src/styles/starlight.css"],
      components: {
        ThemeSelect: "./src/components/starlight/Empty.astro",
        ThemeProvider: "./src/components/starlight/LightOnly.astro",
        SiteTitle: "./src/components/starlight/SiteTitle.astro",
        Footer: "./src/components/starlight/Footer.astro",
      },
      sidebar: [
        {
          label: "Research",
          items: [
            { autogenerate: { directory: "research" } },
            ...(hasLog ? [{ label: "Capstone progress log", link: "/research/capstone/log/" }] : []),
          ],
        },
        { label: "Docs home", link: "/docs/" },
        // A project's group appears once it has a published page.
        ...PROJECTS.filter(([, dir]) => hasPublished(`src/content/docs/docs/${dir}`))
          .map(([label, dir]) => ({ label, collapsed: true, items: [{ autogenerate: { directory: `docs/${dir}` } }] })),
      ],
    }),
  ],
});
