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
};
