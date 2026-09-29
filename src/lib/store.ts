import fs from "node:fs";
import path from "node:path";
import type { Category, Product } from "@/content/products";
import seedFile from "../../data/catalog.json";
import { catalogKey, mediaBucket, mediaObjectKey } from "@/lib/bucket";

export const IMAGE_LIMIT = 30;

export type StoredProduct = Omit<Product, "categoryName">;

export type CatalogData = {
  categories: Category[];
  products: StoredProduct[];
};

const dataFile = path.join(process.cwd(), "data", "catalog.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const uploadName = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.(jpg|jpeg|png|webp)$/;

const starter: CatalogData = {
  categories: [
    { id: "shotguns", name: { en: "Hunting shotguns", ar: "بنادق صيد" } },
    { id: "cartridges", name: { en: "Cartridges", ar: "خراطيش" } },
    { id: "clothing", name: { en: "Hunting clothing", ar: "ملابس الصيد" } },
    { id: "optics", name: { en: "Optics", ar: "بصريات" } },
    { id: "camping", name: { en: "Camping", ar: "التخييم" } },
  ],
  products: [],
};

function emptyCopy(): CatalogData {
  return {
    categories: starter.categories.map((item) => ({ ...item, name: { ...item.name } })),
    products: [],
  };
}

function bundledSeed(): CatalogData {
  const parsed = seedFile as CatalogData;
  if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.products)) return emptyCopy();
  return parsed;
}

function readLocalCatalog(): CatalogData {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    const parsed = JSON.parse(raw) as CatalogData;
    if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.products)) return emptyCopy();
    return parsed;
  } catch {
    return bundledSeed();
  }
}

export async function readCatalog(): Promise<CatalogData> {
  const bucket = await mediaBucket();
  if (!bucket) return readLocalCatalog();
  const object = await bucket.get(catalogKey());
  if (!object) {
    const seed = bundledSeed();
    await writeCatalog(seed);
    return seed;
  }
  try {
    const parsed = JSON.parse(await object.text()) as CatalogData;
    if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.products)) return emptyCopy();
    return parsed;
  } catch {
    return emptyCopy();
  }
}

export async function writeCatalog(data: CatalogData) {
  const bucket = await mediaBucket();
  if (bucket) {
    await bucket.put(catalogKey(), JSON.stringify(data), {
      httpMetadata: { contentType: "application/json" },
    });
    return;
  }
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function imageCount(data: CatalogData) {
  return data.products.reduce((sum, product) => sum + product.images.filter((src) => src.trim()).length, 0);
}

export function toProducts(data: CatalogData): Product[] {
  return data.products.map((product) => ({
    ...product,
    categoryName:
      data.categories.find((item) => item.id === product.category)?.name ?? {
        en: product.category,
        ar: product.category,
      },
  }));
}

export function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export function publicUploadPath(filename: string) {
  return path.join(uploadsDir, path.basename(filename));
}

export function safeUploadName(publicPath: string) {
  const name = path.basename(publicPath);
  return uploadName.test(name) ? name : null;
}

export async function removeUpload(publicPath: string) {
  const name = safeUploadName(publicPath);
  if (!name) return;
  if (publicPath.startsWith("/media/")) {
    const bucket = await mediaBucket();
    if (bucket) await bucket.delete(mediaObjectKey(name));
    return;
  }
  if (!publicPath.startsWith("/uploads/")) return;
  const file = publicUploadPath(name);
  if (file.startsWith(uploadsDir) && fs.existsSync(file)) fs.unlinkSync(file);
}

export function slugFromName(name: string, taken: readonly string[]) {
  const latin = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const base = latin || `item-${Date.now().toString(36)}`;
  let slug = base;
  let n = 2;
  while (taken.includes(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function categoryIdFromName(name: string, taken: readonly string[]) {
  return slugFromName(name, taken);
}
