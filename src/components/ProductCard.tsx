import Link from "next/link";
import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import type { Product } from "@/content/products";
import { formatPrice } from "@/lib/price";
import { productPath } from "@/lib/paths";
import { AddToCart } from "@/components/AddToCart";
import { ProductImage } from "@/components/ProductImage";

type ProductCardProps = {
  product: Product;
  locale: Locale;
  priority?: boolean;
};

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const image = product.images.find((src) => src.trim()) ?? "";

  return (
    <article className="flex h-full flex-col bg-paper">
      <Link href={productPath(locale, product.slug)} aria-label={product.name[locale]} className="block">
        <ProductImage
          product={product}
          unavailableLabel={siteContent.product.imageUnavailable[locale]}
          priority={priority}
          className="aspect-[4/5]"
        />
      </Link>
      <div className="flex flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
        <p className="text-xs text-olive">{product.categoryName[locale]}</p>
        <h3 className="mt-2 text-base font-semibold leading-snug text-charcoal">
          <Link href={productPath(locale, product.slug)} className="hover:text-forest">
            {product.name[locale]}
          </Link>
        </h3>
        <p className="mt-3 text-base font-semibold text-charcoal sm:text-lg" dir="ltr">
          {formatPrice(product.price)}
        </p>
        <div className="mt-3">
          <AddToCart
            slug={product.slug}
            name={product.name[locale]}
            price={product.price}
            image={image}
            locale={locale}
          />
        </div>
        <Link
          href={productPath(locale, product.slug)}
          className="mt-1 inline-flex min-h-11 items-center text-sm text-moss hover:text-charcoal"
        >
          {siteContent.catalog.viewDetails[locale]}
        </Link>
      </div>
    </article>
  );
}
