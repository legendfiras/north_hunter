import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { parseCatalogQuery } from "@/lib/catalog";
import { categoryPath, homePath } from "@/lib/paths";
import { localeAlternates } from "@/lib/seo";
import { readCatalog, toProducts } from "@/lib/store";
import { CatalogView } from "@/components/CatalogView";
import { Container } from "@/components/Container";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, category } = await params;
  if (!isLocale(raw)) return {};
  const locale: Locale = raw;
  const match = (await readCatalog()).categories.find((item) => item.id === category);
  if (!match) return {};
  return {
    title: match.name[locale],
    alternates: localeAlternates(locale, `/categories/${match.id}`),
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale: raw, category } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const catalog = await readCatalog();
  const match = catalog.categories.find((item) => item.id === category);
  if (!match) notFound();
  const query = parseCatalogQuery(await searchParams);

  return (
    <Container>
      <CatalogView
        locale={locale}
        title={match.name[locale]}
        intro=""
        source={toProducts(catalog).filter((item) => item.category === category)}
        categories={catalog.categories}
        query={{ ...query, category: undefined }}
        basePath={categoryPath(locale, category)}
        hideCategory
        crumbs={[
          { href: homePath(locale), label: siteContent.product.breadcrumbHome[locale] },
          { label: match.name[locale] },
        ]}
      />
    </Container>
  );
}
