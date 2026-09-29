import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { siteUrl } from "@/lib/seo";
import { readCatalog } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await readCatalog();
  const paths = [
    "",
    "/products",
    "/about",
    ...catalog.categories.map((category) => `/categories/${category.id}`),
    ...catalog.products.map((product) => `/products/${product.slug}`),
  ];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/products/") ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries(locales.map((item) => [item, `${siteUrl}/${item}${path}`])),
      },
    })),
  );
}
