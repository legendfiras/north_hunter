import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";

type DemoBadgeProps = {
  locale: Locale;
  className?: string;
};

export function DemoBadge({ locale, className = "" }: DemoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center border border-gold/40 px-1.5 py-0.5 text-[0.65rem] font-medium text-olive ${className}`}
    >
      {siteContent.catalog.demo[locale]}
    </span>
  );
}
