import type { Locale } from "@/i18n";
import { business, mapEmbedUrl } from "@/content/business";
import { siteContent } from "@/content/site";
import type { Product } from "@/content/products";
import { inquiryMessage } from "@/lib/inquiry";
import { hasText } from "@/lib/text";
import { Container } from "@/components/Container";
import { InstagramLink } from "@/components/InstagramLink";
import { PhoneLink } from "@/components/PhoneLink";
import { TikTokLink } from "@/components/TikTokLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";

type ContactBandProps = {
  locale: Locale;
  inquiry?: Product | null;
};

export function ContactBand({ locale, inquiry }: ContactBandProps) {
  const copy = siteContent.contact;
  const embed = mapEmbedUrl();

  return (
    <section id="contact" className="bg-forest text-cream">
      <Container className="grid gap-10 py-16 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold rtl:normal-case rtl:tracking-normal">
            {copy.eyebrow[locale]}
          </p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{copy.heading[locale]}</h2>
          {hasText(siteContent.location.ar) || embed ? (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold/80 rtl:normal-case rtl:tracking-normal">
                {copy.locationLabel[locale]}
              </p>
              {hasText(siteContent.location.ar) ? (
                <p className="mt-2 max-w-xl text-2xl font-semibold leading-snug">{siteContent.location.ar}</p>
              ) : null}
              {locale === "en" && hasText(siteContent.location.en) ? (
                <p className="mt-2 text-sm text-cream/70">{siteContent.location.en}</p>
              ) : null}
            </>
          ) : null}
          {hasText(business.hours) ? <p className="mt-4 text-sm text-cream/80">{business.hours}</p> : null}
        </div>
        <div className="border border-white/15 p-6">
          {inquiry && hasText(inquiry.name[locale]) ? (
            <p className="mb-4 text-sm text-cream/80">
              {copy.inquiryAbout[locale]}: {inquiry.name[locale]}
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-cream/75">{copy.reach[locale]}</p>
          <div className="mt-4 flex flex-col">
            <PhoneLink locale={locale} variant="light" />
            <WhatsAppLink
              locale={locale}
              variant="light"
              text={inquiry ? inquiryMessage(locale, inquiry.name[locale]) : undefined}
            />
            <InstagramLink locale={locale} variant="light" />
            <TikTokLink locale={locale} variant="light" />
          </div>
          {hasText(business.mapUrl) ? (
            <a
              href={business.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center text-sm text-gold hover:text-gold-bright"
            >
              {copy.mapLabel[locale]}
            </a>
          ) : null}
        </div>
      </Container>
      {embed ? (
        <Container className="pb-16">
          <iframe
            title={copy.mapLabel[locale]}
            src={embed}
            className="h-72 w-full border border-white/15 md:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Container>
      ) : null}
    </section>
  );
}
