import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";

type SiteChromeProps = {
  locale: Locale;
  children: ReactNode;
};

export function SiteChrome({ locale, children }: SiteChromeProps) {
  return (
    <CartProvider locale={locale}>
      <div className="flex min-h-full flex-col">
        <SkipLink locale={locale} />
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
      </div>
    </CartProvider>
  );
}
