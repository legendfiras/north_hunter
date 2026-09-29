import { mediaBucket, mediaObjectKey } from "@/lib/bucket";
import { safeUploadName } from "@/lib/store";

export const dynamic = "force-dynamic";

const types: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  if (!safeUploadName(name)) return new Response("Not found", { status: 404 });
  const bucket = await mediaBucket();
  if (!bucket) return new Response("Not found", { status: 404 });
  const object = await bucket.get(mediaObjectKey(name));
  if (!object) return new Response("Not found", { status: 404 });
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return new Response(await object.arrayBuffer(), {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || types[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
