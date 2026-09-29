import type { Locale } from "@/i18n";
import { business } from "@/content/business";
import { siteContent } from "@/content/site";
import { Container } from "@/components/Container";
import { InstagramLink } from "@/components/InstagramLink";
import { TikTokLink } from "@/components/TikTokLink";
import { Logo } from "@/components/Logo";

type BrandStoryProps = {
  locale: Locale;
};

export function BrandStory({ locale }: BrandStoryProps) {
  const identity = siteContent.identity;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold rtl:normal-case rtl:tracking-normal">
              {identity.eyebrow[locale]}
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-snug text-charcoal md:text-4xl">
              {identity.heading[locale]}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-moss">
              {identity.paragraphs[locale].map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6">
              <InstagramLink locale={locale} />
              <TikTokLink locale={locale} />
            </div>
          </div>
          <div className="flex items-center justify-center bg-[#0c0c0c] p-8 sm:p-12">
            <Logo
              locale={locale}
              presentation="panel"
              variant="light"
              showName={!business.images.logo.trim()}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
