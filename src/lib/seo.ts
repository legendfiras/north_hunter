import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://north-hunter-taleb.roytech.solutions").replace(/\/+$/, "");

// Preview deployments stay out of search results; production and local builds are indexable.
export const indexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export const indexRobots: Metadata["robots"] = indexable ? { index: true, follow: true } : { index: false, follow: false };

// `path` is the part after the locale, e.g. "/products/some-slug" or "" for home.
export function localeAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((item) => [item, `/${item}${path}`])),
      "x-default": `/en${path}`,
    },
  };
}
