import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { readCatalog, toProducts } from "@/lib/store";

export const dynamic = "force-dynamic";
import { homePath } from "@/lib/paths";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactBand } from "@/components/ContactBand";
import { Container } from "@/components/Container";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale: Locale = raw;
  return {
    title: siteContent.nav[locale].about,
    description: siteContent.aboutPage.paragraphs[locale][0],
    robots: { index: false, follow: false },
  };
}

export default async function AboutPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const page = siteContent.aboutPage;
  const query = await searchParams;
  const item = Array.isArray(query.item) ? query.item[0] : query.item;
  const inquiry = item ? toProducts(await readCatalog()).find((product) => product.slug === item) : undefined;

  return (
    <>
      <Container className="py-10 md:py-14">
        <Breadcrumbs
          items={[
            { href: homePath(locale), label: siteContent.product.breadcrumbHome[locale] },
            { label: siteContent.nav[locale].about },
          ]}
        />
        <div className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold rtl:normal-case rtl:tracking-normal">
            {page.eyebrow[locale]}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-charcoal md:text-5xl">{page.heading[locale]}</h1>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-moss">
            {page.paragraphs[locale].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
      <ContactBand locale={locale} inquiry={inquiry} />
    </>
  );
}
