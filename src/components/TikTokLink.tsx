import { isTikTokConfigured } from "@/content/business";
import { siteContent } from "@/content/site";
import type { Locale } from "@/i18n";

type TikTokLinkProps = {
  locale: Locale;
  variant?: "light" | "dark";
  compact?: boolean;
};

export function TikTokLink({ locale, variant = "dark", compact = false }: TikTokLinkProps) {
  if (!isTikTokConfigured()) return null;
  const light = variant === "light";
  const copy = siteContent.tiktok;

  return (
    <a
      href={copy.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? `inline-flex h-11 w-11 items-center justify-center transition-colors ${
              light ? "text-cream hover:text-gold" : "text-forest hover:text-gold"
            }`
          : `inline-flex min-h-11 items-center gap-3 py-1 text-sm transition-colors ${
              light ? "text-cream/85 hover:text-gold" : "text-charcoal hover:text-forest"
            }`
      }
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M14.2 3c.4 2.4 1.7 4.1 3.8 4.8v2.5c-1.3 0-2.5-.4-3.6-1.1v6.4c0 3.4-2.6 6.1-6.1 6.1S2.2 18.9 2.2 15.5c0-3.3 2.5-5.9 5.7-6.1v2.7c-1.6.2-2.8 1.5-2.8 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2V3h2.7Z" />
      </svg>
      {compact ? (
        <span className="sr-only">
          {copy.label[locale]} {copy.handle}
        </span>
      ) : (
        <span>
          {copy.label[locale]}{" "}
          <span dir="ltr" className="break-all">
            {copy.handle}
          </span>
        </span>
      )}
    </a>
  );
}
