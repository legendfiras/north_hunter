import { denyUnlessSignedIn } from "@/lib/auth";
import { acceptRemoteImage, extensionFor, saveProductImage } from "@/lib/uploads";
import { readCatalog, removeUpload, storageResponse, toProducts, writeCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const { id } = await context.params;
  const form = await request.formData();
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) return Response.json({ error: "missing" }, { status: 404 });

  const name = String(form.get("name") ?? "").trim();
  const price = Number(form.get("price"));
  const category = String(form.get("category") ?? "").trim();
  if (!name || !category) return Response.json({ error: "missing" }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) return Response.json({ error: "price" }, { status: 400 });
  if (!catalog.categories.some((item) => item.id === category)) {
    return Response.json({ error: "category" }, { status: 400 });
  }

  const file = form.get("image");
  const imagePath = String(form.get("imagePath") ?? "").trim();
  if (imagePath || (file instanceof File && file.size > 0)) {
    if (!imagePath && file instanceof File && !extensionFor(file)) {
      return Response.json({ error: "type" }, { status: 400 });
    }
    const saved = imagePath ? await acceptRemoteImage(imagePath, product.id) : await saveProductImage(file as File, product.id);
    if ("error" in saved) {
      const status = saved.error === "storage" ? 503 : 400;
      return Response.json({ error: saved.error }, { status });
    }
    for (const previous of product.images) {
      if (previous !== saved.path) await removeUpload(previous);
    }
    product.images = [saved.path];
  }

  product.name = { en: name, ar: name };
  product.price = Math.round(price);
  product.category = category;
  try {
    await writeCatalog(catalog);
  } catch (error) {
    const response = storageResponse(error);
    if (response) return response;
    throw error;
  }
  return Response.json({ products: toProducts(catalog) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const { id } = await context.params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) return Response.json({ error: "missing" }, { status: 404 });
  for (const image of product.images) await removeUpload(image);
  catalog.products = catalog.products.filter((item) => item.id !== id);
  try {
    await writeCatalog(catalog);
  } catch (error) {
    const response = storageResponse(error);
    if (response) return response;
    throw error;
  }
  return Response.json({ products: toProducts(catalog) });
}
