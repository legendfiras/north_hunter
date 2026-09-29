"use client";

import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { useCart } from "@/components/CartProvider";

type AddToCartProps = {
  slug: string;
  name: string;
  price: number;
  image: string;
  locale: Locale;
};

export function AddToCart({ slug, name, price, image, locale }: AddToCartProps) {
  const { lines, add, setQuantity } = useCart();
  const copy = siteContent.cart;
  const quantity = lines.find((line) => line.slug === slug)?.quantity ?? 0;

  if (quantity > 0) {
    return (
      <div className="flex w-full flex-col gap-2">
        <p className="text-xs font-medium text-olive">{copy.inCart[locale]}</p>
        <div className="inline-flex w-full max-w-[11rem] items-center border border-line bg-ivory">
          <button
            type="button"
            className="h-11 w-11 text-lg text-charcoal"
            aria-label={copy.decrease[locale]}
            onClick={() => setQuantity(slug, quantity - 1)}
          >
            −
          </button>
          <span className="min-w-8 flex-1 text-center text-sm font-semibold text-charcoal" dir="ltr">
            {quantity}
          </span>
          <button
            type="button"
            className="h-11 w-11 text-lg text-charcoal"
            aria-label={copy.increase[locale]}
            onClick={() => setQuantity(slug, quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => add({ slug, name, price, image })}
      className="inline-flex min-h-11 w-full items-center justify-center bg-forest px-2 text-center text-sm font-semibold leading-tight text-cream transition-colors hover:bg-forest-deep"
    >
      {copy.add[locale]}
    </button>
  );
}
