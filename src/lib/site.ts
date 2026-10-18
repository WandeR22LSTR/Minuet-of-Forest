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

/** Show drafts while developing, hide them from production builds. */
export const SHOW_DRAFTS = import.meta.env.DEV;

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

/** Main navigation. Pages backed by a draft entry disappear in production. */
export async function navItems() {
  const live = new Set((await publishedPages()).map((p) => p.id));
  const items = [
    { href: "/about/", label: "About", entry: "about" },
    { href: "/research/", label: "Research", entry: "research" },
    { href: "/projects/", label: "Projects" },
    { href: "/docs/", label: "Docs" },
    { href: "/resume/", label: "Resume" },
    { href: "/now/", label: "Now", entry: "now" },
    { href: "/contact/", label: "Contact" },
  ];
  return items.filter((i) => !i.entry || live.has(i.entry));
}
