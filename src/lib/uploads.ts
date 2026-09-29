import { mediaBucket, mediaObjectKey } from "@/lib/bucket";
import { IMAGE_LIMIT, ensureUploadsDir, imageCount, publicUploadPath, type CatalogData } from "@/lib/store";

const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extensionFor(file: File) {
  return types[file.type] ?? null;
}

export async function saveProductImage(file: File, id: string) {
  const ext = extensionFor(file);
  if (!ext) return { error: "type" as const };
  if (file.size > 8 * 1024 * 1024) return { error: "size" as const };
  const filename = `${id}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const bucket = await mediaBucket();
  if (bucket) {
    await bucket.put(mediaObjectKey(filename), bytes, {
      httpMetadata: { contentType: file.type },
    });
    return { path: `/media/${filename}` };
  }
  ensureUploadsDir();
  await import("node:fs").then((fs) => fs.writeFileSync(publicUploadPath(filename), bytes));
  return { path: `/uploads/${filename}` };
}

export function canAddImage(catalog: CatalogData) {
  return imageCount(catalog) < IMAGE_LIMIT;
}
