import { denyUnlessSignedIn } from "@/lib/auth";
import { presignMediaUpload, r2Configured } from "@/lib/bucket";
import { canAddImage, extensionForType, MAX_IMAGE_BYTES } from "@/lib/uploads";
import { readCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  if (!(await r2Configured())) return Response.json({ error: "storage" }, { status: 503 });

  const body = (await request.json()) as { contentType?: string; size?: number; productId?: string };
  const contentType = body.contentType?.trim() ?? "";
  const size = Number(body.size);
  const ext = extensionForType(contentType);
  if (!ext) return Response.json({ error: "type" }, { status: 400 });
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "size" }, { status: 400 });
  }

  const catalog = await readCatalog();
  const requestedId = body.productId?.trim() ?? "";
  let id = requestedId;
  if (id) {
    if (!catalog.products.some((item) => item.id === id)) {
      return Response.json({ error: "missing" }, { status: 404 });
    }
  } else {
    if (!canAddImage(catalog)) return Response.json({ error: "limit" }, { status: 400 });
    id = `p-${Date.now().toString(36)}`;
  }

  const filename = `${id}.${ext}`;
  const uploadUrl = await presignMediaUpload(filename, contentType, size);
  if (!uploadUrl) return Response.json({ error: "storage" }, { status: 503 });
  return Response.json({ uploadUrl, path: `/media/${filename}`, id });
}
