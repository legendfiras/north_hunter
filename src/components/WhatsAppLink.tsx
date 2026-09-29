import { isWhatsAppConfigured } from "@/content/business";
import { whatsappHref, whatsappLabel } from "@/lib/inquiry";
import type { Locale } from "@/i18n";

type WhatsAppLinkProps = {
  locale: Locale;
  variant?: "light" | "dark";
  compact?: boolean;
  text?: string;
};

export function WhatsAppLink({ locale, variant = "dark", compact = false, text }: WhatsAppLinkProps) {
  if (!isWhatsAppConfigured()) return null;
  const href = whatsappHref(text);
  if (!href) return null;

  const light = variant === "light";
  const copy = whatsappLabel(locale);

  return (
    <a
      href={href}
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
        <path d="M12.04 2C6.5 2 2 6.37 2 11.76c0 1.72.46 3.4 1.34 4.88L2 22l5.52-1.44a10.2 10.2 0 0 0 4.52 1.08h.04c5.54 0 10.04-4.37 10.04-9.76C22.12 6.37 17.58 2 12.04 2zm5.84 13.98c-.24.68-1.2 1.24-1.96 1.4-.52.12-1.2.2-3.48-.76-2.92-1.2-4.8-4.16-4.96-4.36-.14-.2-1.18-1.56-1.18-2.98 0-1.4.74-2.1 1-2.38.24-.26.54-.34.72-.34h.52c.16 0 .4-.06.62.48.24.56.8 1.96.88 2.1.08.14.12.3.02.48-.1.2-.14.32-.28.5-.14.16-.3.36-.42.48-.14.14-.28.3-.12.58.16.28.7 1.16 1.5 1.88 1.04.92 1.9 1.2 2.18 1.34.28.14.44.12.6-.06.18-.2.74-.86.94-1.16.2-.28.4-.24.66-.14.28.1 1.74.82 2.04.96.3.16.5.22.58.34.08.14.08.76-.16 1.44z" />
      </svg>
      {compact ? (
        <span className="sr-only">
          {copy.name} {copy.display}
        </span>
      ) : (
        <span>
          {copy.name} {copy.display ? <span dir="ltr">{copy.display}</span> : null}
        </span>
      )}
    </a>
  );
}
