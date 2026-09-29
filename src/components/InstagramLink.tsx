import { isInstagramConfigured } from "@/content/business";
import { siteContent } from "@/content/site";
import type { Locale } from "@/i18n";

type InstagramLinkProps = {
  locale: Locale;
  variant?: "light" | "dark";
  compact?: boolean;
};

export function InstagramLink({ locale, variant = "dark", compact = false }: InstagramLinkProps) {
  if (!isInstagramConfigured()) return null;
  const light = variant === "light";
  const copy = siteContent.instagram;

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
        <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm8 1.8H8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8a3.2 3.2 0 0 0 3.2-3.2V8A3.2 3.2 0 0 0 16 4.8zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zM17.35 6.4a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9z" />
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
