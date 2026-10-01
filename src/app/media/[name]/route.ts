import fs from "node:fs";
import { legacyMediaObjectKey, mediaBucket } from "@/lib/bucket";
import { publicUploadPath, safeUploadName } from "@/lib/store";

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
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  const type = types[ext] || "application/octet-stream";
  const bucket = await mediaBucket();
  if (bucket) {
    const object = await bucket.get(legacyMediaObjectKey(name));
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(await object.arrayBuffer(), {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
  const file = publicUploadPath(name);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400" },
  });
}
