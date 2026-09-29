import type { Locale } from "@/i18n";

export type PlaceholderKind =
  | "jacket"
  | "outfit"
  | "fleece"
  | "vest"
  | "flashlight"
  | "chair"
  | "optics"
  | "shotgun"
  | "cartridge";

export type Category = {
  id: string;
  name: Record<Locale, string>;
};

export type Product = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  category: string;
  categoryName: Record<Locale, string>;
  images: string[];
  description: Record<Locale, string>;
  price: number;
  featured: boolean;
};

export function categoryName(categories: readonly Category[], id: string, locale: Locale) {
  return categories.find((item) => item.id === id)?.name[locale] ?? id;
}
