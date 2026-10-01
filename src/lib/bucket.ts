import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const CATALOG_KEY = "catalog.json";
const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

type R2Config = {
  bucket: string;
  publicBaseUrl: string;
  client: S3Client;
};

type MediaObject = {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
};

export type MediaBucket = {
  get(key: string): Promise<MediaObject | null>;
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | string,
    options?: { httpMetadata?: { contentType?: string }; cacheControl?: string },
  ): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  publicUrl(key: string): string;
};

function configuredR2(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) return null;
  return {
    bucket,
    publicBaseUrl,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    }),
  };
}

function isMissing(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return candidate.name === "NotFound" || candidate.name === "NoSuchKey" || candidate.$metadata?.httpStatusCode === 404;
}

function publicUrl(base: string, key: string) {
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function catalogKey() {
  return CATALOG_KEY;
}

export function legacyMediaObjectKey(filename: string) {
  return `files/${filename}`;
}

export function productMediaObjectKey(productId: string, extension: string) {
  if (!/^p-[a-zA-Z0-9-]+$/.test(productId) || !/^(jpg|png|webp)$/.test(extension)) {
    throw new Error("Invalid media object key");
  }
  return `products/${productId}/${crypto.randomUUID()}.${extension}`;
}

export async function r2Configured() {
  try {
    const { connection } = await import("next/server");
    await connection();
  } catch {
    // Build analysis has no request; the environment check below still applies.
  }
  return configuredR2() !== null;
}

export function getPublicFileUrl(key: string) {
  const config = configuredR2();
  if (!config) throw new Error("storage");
  return publicUrl(config.publicBaseUrl, key);
}

export function publicFileKey(value: string) {
  const config = configuredR2();
  if (!config) return null;
  try {
    const base = new URL(`${config.publicBaseUrl}/`);
    const candidate = new URL(value);
    if (candidate.origin !== base.origin || !candidate.pathname.startsWith(base.pathname)) return null;
    const encodedKey = candidate.pathname.slice(base.pathname.length);
    if (!encodedKey || candidate.search || candidate.hash) return null;
    const key = encodedKey.split("/").map(decodeURIComponent).join("/");
    if (key.split("/").some((part) => !part || part === "." || part === "..")) return null;
    return key;
  } catch {
    return null;
  }
}

export async function createPresignedUpload(key: string, contentType: string) {
  const config = configuredR2();
  if (!config) throw new Error("storage");
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
    CacheControl: MEDIA_CACHE_CONTROL,
  });
  return {
    uploadUrl: await getSignedUrl(config.client, command, { expiresIn: 10 * 60 }),
    headers: { "Content-Type": contentType, "Cache-Control": MEDIA_CACHE_CONTROL },
  };
}

export async function mediaBucket(): Promise<MediaBucket | null> {
  try {
    const { connection } = await import("next/server");
    await connection();
  } catch {
    // Build analysis has no request; the runtime configuration check still applies.
  }
  const config = configuredR2();
  if (!config) return null;
  return {
    async get(key) {
      try {
        const response = await config.client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
        if (!response.Body) return null;
        const bytes = await response.Body.transformToByteArray();
        const arrayBuffer = Uint8Array.from(bytes).buffer;
        return {
          httpMetadata: { contentType: response.ContentType },
          text: () => Promise.resolve(new TextDecoder().decode(bytes)),
          arrayBuffer: () => Promise.resolve(arrayBuffer),
        };
      } catch (error) {
        if (isMissing(error)) return null;
        throw error;
      }
    },
    async put(key, value, options) {
      const body = typeof value === "string" ? value : Buffer.from(value instanceof Uint8Array ? value : new Uint8Array(value));
      await config.client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: options?.httpMetadata?.contentType,
        CacheControl: options?.cacheControl,
      }));
    },
    async delete(key) {
      await config.client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    },
    async exists(key) {
      try {
        await config.client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
        return true;
      } catch (error) {
        if (isMissing(error)) return false;
        throw error;
      }
    },
    publicUrl(key) {
      return publicUrl(config.publicBaseUrl, key);
    },
  };
}
