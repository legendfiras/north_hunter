import { denyUnlessSignedIn } from "@/lib/auth";
import { blobConfigured } from "@/lib/bucket";
import { IMAGE_LIMIT, imageCount, readCatalog, toProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const catalog = await readCatalog();
  return Response.json({
    categories: catalog.categories,
    products: toProducts(catalog),
    imageCount: imageCount(catalog),
    imageLimit: IMAGE_LIMIT,
    directUpload: blobConfigured(),
  });
}
