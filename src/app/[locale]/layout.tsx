import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { business } from "@/content/business";
import { dirFor, isLocale, locales, type Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { indexRobots, localeAlternates } from "@/lib/seo";
import { logoAlt } from "@/components/Logo";
import { SiteChrome } from "@/components/SiteChrome";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale: Locale = raw;
  const meta = siteContent.meta[locale];

  return {
    title: {
      default: meta.title,
      template: `%s | ${siteContent.storeName[locale]}`,
    },
    description: meta.description,
    robots: indexRobots,
    alternates: localeAlternates(locale, ""),
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === "ar" ? "ar_LB" : "en_US",
      type: "website",
      siteName: siteContent.storeName.en,
      images: business.images.hero.trim()
        ? [
            {
              url: business.images.hero,
              width: 1024,
              height: 576,
              alt: logoAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: business.images.hero.trim() ? "summary_large_image" : "summary",
      title: meta.title,
      description: meta.description,
      images: business.images.hero.trim() ? [business.images.hero] : undefined,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div lang={locale} dir={dirFor(locale)}>
      <SiteChrome locale={locale}>{children}</SiteChrome>
    </div>
  );
}
