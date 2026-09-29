import { denyUnlessSignedIn } from "@/lib/auth";
import { acceptRemoteImage, canAddImage, extensionFor, saveProductImage } from "@/lib/uploads";
import { readCatalog, removeUpload, slugFromName, storageResponse, toProducts, writeCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const price = Number(form.get("price"));
  const category = String(form.get("category") ?? "").trim();
  const file = form.get("image");
  const imagePath = String(form.get("imagePath") ?? "").trim();
  const requestedId = String(form.get("id") ?? "").trim();
  const hasFile = file instanceof File && file.size > 0;

  if (!name || !category || (!hasFile && !imagePath)) {
    return Response.json({ error: "missing" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: "price" }, { status: 400 });
  }
  if (hasFile && !extensionFor(file)) {
    return Response.json({ error: "type" }, { status: 400 });
  }

  const catalog = await readCatalog();
  if (!catalog.categories.some((item) => item.id === category)) {
    return Response.json({ error: "category" }, { status: 400 });
  }
  if (!canAddImage(catalog)) {
    return Response.json({ error: "limit" }, { status: 400 });
  }

  const id = imagePath ? requestedId : `p-${Date.now().toString(36)}`;
  if (!id || catalog.products.some((item) => item.id === id)) {
    return Response.json({ error: "missing" }, { status: 400 });
  }
  const saved = imagePath ? await acceptRemoteImage(imagePath, id) : await saveProductImage(file as File, id);
  if ("error" in saved) {
    const status = saved.error === "storage" ? 503 : 400;
    return Response.json({ error: saved.error }, { status });
  }

  catalog.products.unshift({
    id,
    slug: slugFromName(name, catalog.products.map((item) => item.slug)),
    name: { en: name, ar: name },
    category,
    images: [saved.path],
    description: { en: "", ar: "" },
    price: Math.round(price),
    featured: false,
  });
  try {
    await writeCatalog(catalog);
  } catch (error) {
    await removeUpload(saved.path).catch(() => undefined);
    const response = storageResponse(error);
    if (response) return response;
    throw error;
  }
  return Response.json({ products: toProducts(catalog) });
}
