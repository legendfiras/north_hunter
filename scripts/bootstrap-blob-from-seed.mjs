// Use only after confirming the checked-in four products are the complete catalog.
import fs from "node:fs/promises";
import { get, put } from "@vercel/blob";

if (process.argv[2] !== "--confirm-seed" || !process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("Set BLOB_READ_WRITE_TOKEN locally and pass --confirm-seed after verifying the catalog");
}
if (await get("catalog.json", { access: "public", useCache: false })) {
  throw new Error("Blob catalog.json exists; refusing to overwrite it");
}
const raw = await fs.readFile(new URL("../data/catalog.json", import.meta.url), "utf8");
const catalog = JSON.parse(raw);
if (!Array.isArray(catalog.products) || !Array.isArray(catalog.categories)) throw new Error("Invalid seed");
await put("catalog.json", raw, { access: "public", contentType: "application/json", cacheControlMaxAge: 60 });
console.log(`Initialized Blob with ${catalog.products.length} bundled products and ${catalog.categories.length} categories.`);
