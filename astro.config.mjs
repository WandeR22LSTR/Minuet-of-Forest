import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { SITE, BASE } from "./site.config.mjs";

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Minuet of Forest",
      disable404Route: true,
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
