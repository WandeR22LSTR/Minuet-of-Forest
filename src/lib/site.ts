import { getCollection } from "astro:content";
import { parse } from "yaml";
import copyRaw from "../data/copy.yaml?raw";

/** Site copy (src/data/copy.yaml). Placeholders in [brackets] until Luca writes them. */
export const copy = parse(copyRaw);

/** Prefix an internal path with the configured base. Always use this for internal links. */
export function url(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : `/${path}`);
}

/**
 * Show drafts while developing, hide them from production builds. Lens of Truth
 * previews the site as published by starting dev with LENS_DRAFTS=0 (its Drafts
 * switch sets 1).
 */
export const SHOW_DRAFTS = import.meta.env.DEV && process.env.LENS_DRAFTS !== "0";

/** A value still waiting for Luca. Such values are never rendered. */
export function isTodo(value: unknown): boolean {
  return typeof value === "string" && value.includes("TODO(Luca)");
}

/** Strip TODO placeholders out of YAML data, recursively. Empty objects/arrays are dropped. */
export function clean<T>(value: T): T | undefined {
  if (isTodo(value)) return undefined;
  if (Array.isArray(value)) {
    const out = value.map(clean).filter((v) => v !== undefined);
    return (out.length ? out : undefined) as T | undefined;
  }
  if (value && typeof value === "object") {
    const out = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, clean(v)]).filter(([, v]) => v !== undefined),
    );
    return (Object.keys(out).length ? out : undefined) as T | undefined;
  }
  return value;
}

export async function publishedPages() {
  return getCollection("pages", ({ data }) => SHOW_DRAFTS || !data.draft);
}

/** Whether the research page (in the docs collection) is published. */
export async function researchPublished() {
  return (await getCollection("docs", ({ id, data }) => id === "research" && (SHOW_DRAFTS || !data.draft))).length > 0;
}

/** Main navigation: the site's four sections. */
const NAV = [
  { href: "/docs/", label: "Docs" },
  { href: "/cv/", label: "CV" },
  { href: "/garden/", label: "Garden" },
  { href: "/about/", label: "About" },
];

/** Pages that exist only once their entry is published (drafts are hidden in production). */
const GATED = [
  { href: "/research/", entry: "research" },
  { href: "/garden/currently/", entry: "currently" },
];

/** IDs of published entries: the pages collection, plus "research" once it is published. */
async function liveEntries() {
  const live = new Set((await publishedPages()).map((p) => p.id));
  if (await researchPublished()) live.add("research");
  return live;
}

/** Main navigation. */
export async function navItems() {
  return NAV;
}

/** Whether a site path can be linked: false for a page whose entry is still a draft in production. */
export async function isPublished(href: string) {
  const entry = GATED.find((i) => i.href === href)?.entry;
  return !entry || (await liveEntries()).has(entry);
}

/** The first section of the Currently page (its heading, then its lines), if the page is published. */
export async function currentlySnippet() {
  const now = (await publishedPages()).find((p) => p.id === "currently");
  const lines = now?.body?.split(/^## /m)[1]?.split("\n").filter(Boolean);
  return lines ? { heading: lines[0], text: lines.slice(1).join(" ") } : undefined;
}
