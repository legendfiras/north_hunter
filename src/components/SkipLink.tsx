import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";

type SkipLinkProps = {
  locale: Locale;
};

export function SkipLink({ locale }: SkipLinkProps) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[70] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      {siteContent.skipToContent[locale]}
    </a>
  );
}
