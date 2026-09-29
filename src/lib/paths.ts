import type { Locale } from "@/i18n";

export function homePath(locale: Locale) {
  return `/${locale}`;
}

export function productsPath(locale: Locale, query?: Record<string, string | undefined>) {
  const base = `/${locale}/products`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function productPath(locale: Locale, slug: string) {
  return `/${locale}/products/${slug}`;
}

export function categoryPath(locale: Locale, category: string) {
  return `/${locale}/categories/${category}`;
}

export function aboutPath(locale: Locale) {
  return `/${locale}/about`;
}

export function contactPath(locale: Locale) {
  return `${aboutPath(locale)}#contact`;
}
