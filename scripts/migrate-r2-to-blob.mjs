// Run once with R2 credentials and BLOB_READ_WRITE_TOKEN in the local environment.
// Reads source objects and creates destination objects; never deletes R2 data.
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { get, put } from "@vercel/blob";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, BLOB_READ_WRITE_TOKEN } = process.env;
if (![R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, BLOB_READ_WRITE_TOKEN].every(Boolean)) {
  throw new Error("Set the four R2 values and BLOB_READ_WRITE_TOKEN locally before migration");
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const existing = await get("catalog.json", { access: "public", useCache: false });
if (existing) throw new Error("Blob catalog.json already exists; refusing to overwrite it");

const response = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: "catalog.json" }));
const raw = await response.Body?.transformToString();
if (!raw) throw new Error("R2 catalog.json is empty or unreadable; no destination was changed");
const catalog = JSON.parse(raw);
if (!Array.isArray(catalog.products) || !Array.isArray(catalog.categories)) throw new Error("Invalid source catalog");

const mediaNames = [...new Set(catalog.products.flatMap((product) => product.images ?? [])
  .filter((path) => typeof path === "string" && /^\/media\/[a-zA-Z0-9][a-zA-Z0-9.-]*\.(jpg|jpeg|png|webp)$/.test(path))
  .map((path) => path.slice("/media/".length)))];

for (const name of mediaNames) {
  const pathname = `files/${name}`;
  if (await get(pathname, { access: "public", useCache: false })) continue;
  const image = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: pathname }));
  if (!image.Body) throw new Error(`Missing source image ${pathname}; catalog was not published`);
  await put(pathname, Buffer.from(await image.Body.transformToByteArray()), {
    access: "public", contentType: image.ContentType ?? "application/octet-stream", cacheControlMaxAge: 60,
  });
}

await put("catalog.json", raw, { access: "public", contentType: "application/json", cacheControlMaxAge: 60 });
const copy = await get("catalog.json", { access: "public", useCache: false });
if (!copy || copy.statusCode !== 200) throw new Error("Catalog write could not be verified");
const migrated = JSON.parse(await new Response(copy.stream).text());
if (migrated.products.length !== catalog.products.length || migrated.categories.length !== catalog.categories.length) {
  throw new Error("Destination catalog count does not match source");
}
console.log(`Migrated ${catalog.products.length} products, ${catalog.categories.length} categories, ${mediaNames.length} media objects.`);
