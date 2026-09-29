import { del, get, head, put, BlobNotFoundError } from "@vercel/blob";

const CATALOG_KEY = "catalog.json";

type MediaObject = {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
};

export type MediaBucket = {
  get(key: string): Promise<MediaObject | null>;
  put(key: string, value: ArrayBuffer | Uint8Array | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
};

export function catalogKey() { return CATALOG_KEY; }
export function mediaObjectKey(filename: string) { return `files/${filename}`; }

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}

export async function mediaBucket(): Promise<MediaBucket | null> {
  try {
    const { connection } = await import("next/server");
    await connection();
  } catch {
    // Build analysis has no request; the runtime check below still applies.
  }
  if (!blobConfigured()) return null;
  return {
    async get(key) {
      const result = await get(key, { access: "public", useCache: false });
      if (!result || result.statusCode !== 200) return null;
      const bytes = await new Response(result.stream).arrayBuffer();
      return {
        httpMetadata: { contentType: result.blob.contentType },
        text: () => Promise.resolve(new TextDecoder().decode(bytes)),
        arrayBuffer: () => Promise.resolve(bytes),
      };
    },
    async put(key, value, options) {
      const body = typeof value === "string" ? value : Buffer.from(value instanceof Uint8Array ? value : new Uint8Array(value));
      return put(key, body, { access: "public", allowOverwrite: true, cacheControlMaxAge: 60,
        contentType: options?.httpMetadata?.contentType });
    },
    async delete(key) { await del(key); },
    async exists(key) {
      try { await head(key); return true; }
      catch (error) {
        if (error instanceof BlobNotFoundError) return false;
        throw error;
      }
    },
  };
}
