import type { Product } from "@/content/products";

export type CatalogQuery = {
  q?: string;
  category?: string;
};

export type CatalogResult = {
  items: Product[];
  query: {
    q: string;
    category: string;
  };
  activeCount: number;
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseCatalogQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogQuery {
  return {
    q: firstValue(searchParams.q).trim(),
    category: firstValue(searchParams.category).trim(),
  };
}

export function filterProducts(
  source: readonly Product[],
  query: CatalogQuery,
  categoryIds: readonly string[],
): CatalogResult {
  const q = (query.q ?? "").trim().toLowerCase();
  const categoryRaw = query.category ?? "";
  const category = categoryIds.includes(categoryRaw) ? categoryRaw : "";

  const items = source.filter((product) => {
    if (category && product.category !== category) return false;
    if (!q) return true;
    const haystack = [product.name.en, product.name.ar, product.categoryName.en, product.categoryName.ar, product.description.en, product.description.ar]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return {
    items,
    query: { q: query.q ?? "", category },
    activeCount: [q, category].filter(Boolean).length,
  };
}
