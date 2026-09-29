import { denyUnlessSignedIn } from "@/lib/auth";
import {
  canAddImage,
  extensionFor,
  saveProductImage,
} from "@/lib/uploads";
import { readCatalog, slugFromName, toProducts, writeCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const price = Number(form.get("price"));
  const category = String(form.get("category") ?? "").trim();
  const file = form.get("image");

  if (!name || !category || !(file instanceof File) || file.size === 0) {
    return Response.json({ error: "missing" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: "price" }, { status: 400 });
  }
  if (!extensionFor(file)) {
    return Response.json({ error: "type" }, { status: 400 });
  }

  const catalog = await readCatalog();
  if (!catalog.categories.some((item) => item.id === category)) {
    return Response.json({ error: "category" }, { status: 400 });
  }
  if (!canAddImage(catalog)) {
    return Response.json({ error: "limit" }, { status: 400 });
  }

  const id = `p-${Date.now().toString(36)}`;
  const saved = await saveProductImage(file, id);
  if ("error" in saved) return Response.json({ error: saved.error }, { status: 400 });

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
  await writeCatalog(catalog);
  return Response.json({ products: toProducts(catalog) });
}
