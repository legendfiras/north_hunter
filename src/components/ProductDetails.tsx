import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import type { Product } from "@/content/products";
import { hasText } from "@/lib/text";
import { formatPrice } from "@/lib/price";
import { categoryPath, homePath, productsPath } from "@/lib/paths";
import { inquiryMessage } from "@/lib/inquiry";
import { AddToCart } from "@/components/AddToCart";
import { InstagramLink } from "@/components/InstagramLink";
import { PhoneLink } from "@/components/PhoneLink";
import { TikTokLink } from "@/components/TikTokLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";

type ProductDetailsProps = {
  locale: Locale;
  product: Product;
  related: Product[];
};

export function ProductDetails({ locale, product, related }: ProductDetailsProps) {
  const copy = siteContent.catalog;
  const image = product.images.find((src) => hasText(src)) ?? "";
  const crumbs = [
    { href: homePath(locale), label: siteContent.product.breadcrumbHome[locale] },
    { href: productsPath(locale), label: siteContent.product.breadcrumbProducts[locale] },
    {
      href: categoryPath(locale, product.category),
      label: product.categoryName[locale],
    },
    { label: product.name[locale] },
  ];

  return (
    <div className="py-8 md:py-12">
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery product={product} locale={locale} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-olive rtl:normal-case rtl:tracking-normal">
            {product.categoryName[locale]}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-charcoal md:text-4xl">{product.name[locale]}</h1>
          {hasText(product.description[locale]) ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-moss">{product.description[locale]}</p>
          ) : null}
          <p className="mt-6 text-2xl font-semibold text-charcoal" dir="ltr">
            {formatPrice(product.price)}
          </p>
          <p className="mt-2 max-w-xl text-sm text-moss">{copy.priceNote[locale]}</p>
          <div className="mt-5 flex max-w-xs flex-col gap-3">
            <AddToCart
              slug={product.slug}
              name={product.name[locale]}
              price={product.price}
              image={image}
              locale={locale}
            />
            <PhoneLink locale={locale} />
            <WhatsAppLink locale={locale} text={inquiryMessage(locale, product.name[locale])} />
            <InstagramLink locale={locale} />
            <TikTokLink locale={locale} />
          </div>
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold text-charcoal">{copy.related[locale]}</h2>
          <ProductGrid products={related} locale={locale} />
        </section>
      ) : null}
    </div>
  );
}
