// Single place for deployment settings. For a custom domain later,
// change SITE to the domain and BASE to "" (or "/").
export const SITE = "https://wander22lstr.github.io";
export const BASE = "/minuet-of-forest";

export const SITE_TITLE = "Minuet of Forest";
export const GITHUB_URL = "https://github.com/WandeR22LSTR";

// Login page of Nocturne of Shadow. Leave empty until it is deployed:
// when empty, the hidden footer medallion is not rendered at all.
// An environment variable of the same name overrides this at build time.
export const NOCTURNE_URL = process.env.NOCTURNE_URL ?? "";
