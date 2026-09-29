import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { denyUnlessSignedIn } from "@/lib/auth";
import { blobConfigured, mediaObjectKey } from "@/lib/bucket";
import { canAddImage, extensionForType, MAX_IMAGE_BYTES } from "@/lib/uploads";
import { readCatalog, safeUploadName } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!blobConfigured()) return Response.json({ error: "storage" }, { status: 503 });
  const body = await request.json();

  // Vercel Blob calls this route again after a completed browser upload.
  if (body?.type?.startsWith("blob.")) {
    try {
      const result = await handleUpload({
        request,
        body: body as HandleUploadBody,
        onBeforeGenerateToken: async (pathname) => {
          const denied = await denyUnlessSignedIn();
          if (denied) throw new Error("Unauthorized upload");
          if (!pathname.startsWith("files/") || !safeUploadName(pathname.slice(6))) {
            throw new Error("Invalid image path");
          }
          return { allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
            maximumSizeInBytes: MAX_IMAGE_BYTES, allowOverwrite: true, cacheControlMaxAge: 60 };
        },
      });
      return Response.json(result);
    } catch {
      return Response.json({ error: "upload" }, { status: 400 });
    }
  }

  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const contentType = String(body?.contentType ?? "").trim();
  const size = Number(body?.size);
  const ext = extensionForType(contentType);
  if (!ext) return Response.json({ error: "type" }, { status: 400 });
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "size" }, { status: 400 });
  }
  const catalog = await readCatalog();
  const requestedId = String(body?.productId ?? "").trim();
  let id = requestedId;
  if (id) {
    if (!catalog.products.some((item) => item.id === id)) return Response.json({ error: "missing" }, { status: 404 });
  } else {
    if (!canAddImage(catalog)) return Response.json({ error: "limit" }, { status: 400 });
    id = `p-${Date.now().toString(36)}`;
  }
  const filename = `${id}.${ext}`;
  if (!safeUploadName(filename)) return Response.json({ error: "missing" }, { status: 400 });
  return Response.json({ pathname: mediaObjectKey(filename), path: `/media/${filename}`, id });
}
