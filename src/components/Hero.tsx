import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n";
import { business } from "@/content/business";
import { siteContent } from "@/content/site";
import { Container } from "@/components/Container";
import { homePath, productsPath } from "@/lib/paths";

type HeroProps = {
  locale: Locale;
};

const HERO_WIDTH = 1024;
const HERO_HEIGHT = 576;

export function Hero({ locale }: HeroProps) {
  const banner = siteContent.banner;

  const heroSrc = business.images.hero.trim();

  return (
    <section className="bg-ivory">
      {heroSrc ? (
        <Image
          src={heroSrc}
          alt={banner.imageAlt[locale]}
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          priority
          unoptimized
          sizes="100vw"
          className="block h-auto w-full object-contain"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      ) : null}
      <Container className="flex flex-col gap-5 py-8 md:flex-row md:items-end md:justify-between md:py-10">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold rtl:normal-case rtl:tracking-normal">
            <span lang="en" dir="ltr">
              {siteContent.tagline}
            </span>
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-charcoal md:text-4xl">
            {banner.heading[locale]}
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-moss">{banner.text[locale]}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={productsPath(locale)}
            className="inline-flex min-h-12 items-center bg-gold px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-bright"
          >
            {banner.exploreProducts[locale]}
          </Link>
          <Link
            href={`${homePath(locale)}#contact`}
            className="inline-flex min-h-12 items-center border border-forest px-6 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream"
          >
            {banner.contact[locale]}
          </Link>
        </div>
      </Container>
    </section>
  );
}
