import { business, phoneHref } from "@/content/business";
import { siteContent } from "@/content/site";
import { whatsappHref } from "@/lib/inquiry";
import type { Locale } from "@/i18n";

type PhoneLinkProps = {
  locale: Locale;
  variant?: "light" | "dark";
  compact?: boolean;
};

export function PhoneLink({ locale, variant = "dark", compact = false }: PhoneLinkProps) {
  const href = whatsappHref() ?? phoneHref();
  const display = business.phoneDisplay.trim();
  if (!href || !display) return null;
  const external = href.startsWith("http");
  const light = variant === "light";
  const label = siteContent.contact.phoneLabel[locale];

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
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
        <path d="M7.2 3.4c.4-.4 1-.5 1.5-.2l2.1 1.2c.5.3.7.8.6 1.3l-.6 2.2a1.2 1.2 0 0 1-.7.8l-1.2.5a10.4 10.4 0 0 0 4.9 4.9l.5-1.2c.2-.4.5-.6.8-.7l2.2-.6c.5-.1 1 .1 1.3.6l1.2 2.1c.3.5.2 1.1-.2 1.5l-1.3 1.3c-.4.4-1 .6-1.6.5C10.6 17.8 6.2 13.4 5.4 7.3c-.1-.6.1-1.2.5-1.6l1.3-1.3z" />
      </svg>
      {compact ? (
        <span className="sr-only">
          {label} {display}
        </span>
      ) : (
        <span>
          {label}{" "}
          <span dir="ltr" className="break-all">
            {display}
          </span>
        </span>
      )}
    </a>
  );
}
