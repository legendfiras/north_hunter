import type { Locale } from "@/i18n";
import type { Product } from "@/content/products";
import { ProductCard } from "@/components/ProductCard";

type ProductGridProps = {
  products: readonly Product[];
  locale: Locale;
  priorityCount?: number;
};

export function ProductGrid({ products, locale, priorityCount = 0 }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} locale={locale} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
