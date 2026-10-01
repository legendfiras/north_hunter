// Initializes R2 from the four checked-in fallback products. Never reads Vercel Blob.
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const dryRun = process.argv.includes("--dry-run");
const confirm = process.argv.includes("--confirm");
const replaceExisting = process.argv.includes("--replace-existing-catalog");
if (dryRun === confirm) throw new Error("Pass exactly one of --dry-run or --confirm");

const required = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bucket = process.env.R2_BUCKET_NAME.trim();
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL.trim().replace(/\/+$/, "");
const markerKey = "migrations/fallback-seed-v1.json";
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function publicUrl(key) {
  return `${publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function contentTypeFor(filename) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  throw new Error(`Unsupported fallback image type: ${filename}`);
}

function isMissing(error) {
  return error?.name === "NotFound" || error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404;
}

async function getObject(key) {
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response.Body ? Buffer.from(await response.Body.transformToByteArray()) : null;
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

const sourceRaw = await fs.readFile(path.join(root, "data", "catalog.json"), "utf8");
const source = JSON.parse(sourceRaw);
if (!Array.isArray(source.products) || source.products.length !== 4 || !Array.isArray(source.categories)) {
  throw new Error("Expected exactly four checked-in fallback products; R2 was not changed");
}

const catalog = structuredClone(source);
const images = [];
for (const product of catalog.products) {
  if (!Array.isArray(product.images) || product.images.length === 0) {
    throw new Error(`Fallback product ${product.id} has no image`);
  }
  for (let index = 0; index < product.images.length; index += 1) {
    const reference = product.images[index];
    const match = typeof reference === "string" ? reference.match(/^\/uploads\/([^/]+)$/) : null;
    if (!match) throw new Error(`Fallback product ${product.id} has a non-local image reference`);
    const filename = match[1];
    const bytes = await fs.readFile(path.join(root, "public", "uploads", filename));
    const hash = sha256(bytes);
    const key = `products/${product.id}/${hash.slice(0, 12)}-${filename}`;
    images.push({ productId: product.id, filename, bytes, hash, key, contentType: contentTypeFor(filename) });
    product.images[index] = publicUrl(key);
  }
}

const catalogRaw = `${JSON.stringify(catalog, null, 2)}\n`;
const catalogHash = sha256(catalogRaw);
const existingCatalog = await getObject("catalog.json");
const markerBytes = await getObject(markerKey);
if (markerBytes && existingCatalog) {
  const marker = JSON.parse(markerBytes.toString("utf8"));
  if (sha256(existingCatalog) !== marker.catalogSha256) {
    throw new Error("R2 catalog changed after initialization; refusing to overwrite newer production data");
  }
}
if (existingCatalog && sha256(existingCatalog) !== catalogHash && !replaceExisting) {
  throw new Error("R2 catalog.json already differs; rerun with --confirm --replace-existing-catalog only after reviewing the dry run");
}

for (const image of images) {
  const existing = await getObject(image.key);
  const verified = existing !== null && sha256(existing) === image.hash;
  console.log(`${verified ? "Verified" : dryRun ? "Would upload" : "Uploading"}: ${image.key}`);
  if (!verified && confirm) {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: image.key,
      Body: image.bytes,
      ContentType: image.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }));
  }
  if (confirm) {
    const uploaded = await getObject(image.key);
    if (!uploaded || sha256(uploaded) !== image.hash) throw new Error(`Verification failed for ${image.key}`);
  }
}

if (confirm) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: "catalog.json",
    Body: catalogRaw,
    ContentType: "application/json",
    CacheControl: "no-store",
  }));
  const verifiedCatalog = await getObject("catalog.json");
  if (!verifiedCatalog || sha256(verifiedCatalog) !== catalogHash) throw new Error("catalog.json verification failed");
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: markerKey,
    Body: `${JSON.stringify({ catalogSha256: catalogHash, imageKeys: images.map((image) => image.key), initializedAt: new Date().toISOString() }, null, 2)}\n`,
    ContentType: "application/json",
    CacheControl: "no-store",
  }));
}

console.log(JSON.stringify({
  dryRun,
  products: catalog.products.map((product) => ({ id: product.id, name: product.name.en })),
  images: images.map((image) => ({ filename: image.filename, key: image.key })),
  catalogKey: "catalog.json",
  catalogSha256: catalogHash,
}, null, 2));
