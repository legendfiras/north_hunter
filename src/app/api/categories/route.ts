import { denyUnlessSignedIn } from "@/lib/auth";
import { categoryIdFromName, readCatalog, writeCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await denyUnlessSignedIn();
  if (denied) return denied;
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() ?? "";
  if (!name) return Response.json({ error: "missing" }, { status: 400 });
  const catalog = await readCatalog();
  const id = categoryIdFromName(
    name,
    catalog.categories.map((item) => item.id),
  );
  catalog.categories.push({ id, name: { en: name, ar: name } });
  await writeCatalog(catalog);
  return Response.json({ categories: catalog.categories });
}
