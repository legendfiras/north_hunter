import { denyUnlessSignedIn } from "@/lib/auth";
import { extensionFor, saveProductImage } from "@/lib/uploads";
import { readCatalog, removeUpload, toProducts, writeCatalog } from "@/lib/store";

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
  if (file instanceof File && file.size > 0) {
    if (!extensionFor(file)) return Response.json({ error: "type" }, { status: 400 });
    const saved = await saveProductImage(file, product.id);
    if ("error" in saved) return Response.json({ error: saved.error }, { status: 400 });
    for (const previous of product.images) {
      if (previous !== saved.path) await removeUpload(previous);
    }
    product.images = [saved.path];
  }

  product.name = { en: name, ar: name };
  product.price = Math.round(price);
  product.category = category;
  await writeCatalog(catalog);
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
  await writeCatalog(catalog);
  return Response.json({ products: toProducts(catalog) });
}
