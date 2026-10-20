import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  pages: defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      draft: z.boolean().default(false),
      updated: z.coerce.date().optional(),
    }),
  }),
  // Capstone progress log: one file per entry, YYYY-MM-DD-slug.md (README.md is skipped).
  capstoneLog: defineCollection({
    loader: glob({ pattern: "[0-9]*.md", base: "./src/content/capstone-log" }),
    schema: z.object({
      date: z.coerce.date(),
      title: z.string(),
      milestone: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
  }),
};
