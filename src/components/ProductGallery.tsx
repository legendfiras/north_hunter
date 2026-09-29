"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/i18n";
import type { Product } from "@/content/products";
import { siteContent } from "@/content/site";
import { hasText } from "@/lib/text";
import { ImageUnavailable } from "@/components/ProductImage";

type ProductGalleryProps = {
  product: Product;
  locale: Locale;
};

export function ProductGallery({ product, locale }: ProductGalleryProps) {
  const images = product.images.filter((src) => hasText(src));
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        {current ? (
          <Image
            src={current}
            alt={product.name[locale]}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            unoptimized
            className="object-contain"
          />
        ) : (
          <ImageUnavailable label={siteContent.product.imageUnavailable[locale]} />
        )}
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active}
                aria-label={`${product.name[locale]} ${index + 1}`}
                className={`relative aspect-[4/5] w-full overflow-hidden bg-[#0c0c0c] ${
                  index === active ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory" : ""
                }`}
              >
                <Image src={src} alt="" fill sizes="120px" unoptimized className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
