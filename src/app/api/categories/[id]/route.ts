import { denyUnlessSignedIn } from "@/lib/auth";
import { readCatalog, storageResponse, writeCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const { id } = await context.params;
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() ?? "";
  if (!name) return Response.json({ error: "missing" }, { status: 400 });
  const catalog = await readCatalog();
  const category = catalog.categories.find((item) => item.id === id);
  if (!category) return Response.json({ error: "missing" }, { status: 404 });
  category.name = { en: name, ar: name };
  try {
    await writeCatalog(catalog);
  } catch (error) {
    const response = storageResponse(error);
    if (response) return response;
    throw error;
  }
  return Response.json({ categories: catalog.categories });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const { id } = await context.params;
  const catalog = await readCatalog();
  if (catalog.products.some((item) => item.category === id)) {
    return Response.json({ error: "used" }, { status: 400 });
  }
  const next = catalog.categories.filter((item) => item.id !== id);
  if (next.length === catalog.categories.length) return Response.json({ error: "missing" }, { status: 404 });
  catalog.categories = next;
  try {
    await writeCatalog(catalog);
  } catch (error) {
    const response = storageResponse(error);
    if (response) return response;
    throw error;
  }
  return Response.json({ categories: catalog.categories });
}
