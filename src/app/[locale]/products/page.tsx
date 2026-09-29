import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { parseCatalogQuery } from "@/lib/catalog";
import { homePath, productsPath } from "@/lib/paths";
import { localeAlternates } from "@/lib/seo";
import { readCatalog, toProducts } from "@/lib/store";
import { CatalogView } from "@/components/CatalogView";
import { Container } from "@/components/Container";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale: Locale = raw;
  return {
    title: siteContent.catalog.allHeading[locale],
    description: siteContent.catalog.allIntro[locale],
    alternates: localeAlternates(locale, "/products"),
  };
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const query = parseCatalogQuery(await searchParams);
  const catalog = await readCatalog();

  return (
    <Container>
      <CatalogView
        locale={locale}
        title={siteContent.catalog.allHeading[locale]}
        intro={siteContent.catalog.allIntro[locale]}
        source={toProducts(catalog)}
        categories={catalog.categories}
        query={query}
        basePath={productsPath(locale)}
        crumbs={[
          { href: homePath(locale), label: siteContent.product.breadcrumbHome[locale] },
          { label: siteContent.catalog.allHeading[locale] },
        ]}
      />
    </Container>
  );
}
