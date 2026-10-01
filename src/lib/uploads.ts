import { mediaBucket, productMediaObjectKey, publicFileKey } from "@/lib/bucket";
import {
  IMAGE_LIMIT,
  ensureUploadsDir,
  imageCount,
  publicUploadPath,
  type CatalogData,
} from "@/lib/store";

const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function extensionForType(contentType: string) {
  return types[contentType] ?? null;
}

export function extensionFor(file: File) {
  return extensionForType(file.type);
}

export async function saveProductImage(file: File, id: string) {
  const ext = extensionFor(file);
  if (!ext) return { error: "type" as const };
  if (file.size > MAX_IMAGE_BYTES) return { error: "size" as const };
  const filename = `${id}-${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const bucket = await mediaBucket();
  if (bucket) {
    const key = productMediaObjectKey(id, ext);
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: file.type },
      cacheControl: "public, max-age=31536000, immutable",
    });
    return { path: bucket.publicUrl(key) };
  }
  if (process.env.VERCEL) return { error: "storage" as const };
  ensureUploadsDir();
  await import("node:fs").then((fs) => fs.writeFileSync(publicUploadPath(filename), bytes));
  return { path: `/media/${filename}` };
}

export function canAddImage(catalog: CatalogData) {
  return imageCount(catalog) < IMAGE_LIMIT;
}

export async function acceptRemoteImage(publicPath: string, id: string) {
  const key = publicFileKey(publicPath);
  if (!key || !key.startsWith(`products/${id}/`)) return { error: "missing" as const };
  const bucket = await mediaBucket();
  if (!bucket) return { error: "storage" as const };
  if (!(await bucket.exists(key))) return { error: "missing" as const };
  return { path: bucket.publicUrl(key) };
}
