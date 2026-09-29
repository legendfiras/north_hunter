import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n";
import { localeAlternates } from "@/lib/seo";
import { readCatalog, toProducts } from "@/lib/store";
import { Container } from "@/components/Container";
import { ProductDetails } from "@/components/ProductDetails";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale: Locale = raw;
  const product = toProducts(await readCatalog()).find((item) => item.slug === slug);
  if (!product) return {};
  return {
    title: product.name[locale],
    description: product.description[locale] || product.name[locale],
    alternates: localeAlternates(locale, `/products/${product.slug}`),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const products = toProducts(await readCatalog());
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <Container>
      <ProductDetails locale={locale} product={product} related={related} />
    </Container>
  );
}
