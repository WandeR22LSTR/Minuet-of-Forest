import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { SITE, BASE } from "./site.config.mjs";

const asset = (p) => `${BASE.replace(/\/$/, "")}${p}`;

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "always",
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
      customCss: ["./src/styles/tokens.css", "./src/styles/starlight.css"],
      components: {
        ThemeSelect: "./src/components/starlight/Empty.astro",
        ThemeProvider: "./src/components/starlight/LightOnly.astro",
        SiteTitle: "./src/components/starlight/SiteTitle.astro",
        Footer: "./src/components/starlight/Footer.astro",
      },
      sidebar: [
        { label: "Docs home", link: "/docs/" },
        { label: "Temple of Time", items: [{ autogenerate: { directory: "docs/temple-of-time" } }] },
      ],
    }),
  ],
});
