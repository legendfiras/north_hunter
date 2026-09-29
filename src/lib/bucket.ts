import { del, head, put, BlobNotFoundError } from "@vercel/blob";

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
      try {
        const blob = await head(key);
        const url = new URL(blob.url);
        // Public Blob overwrites can remain cached for up to 60 seconds. A
        // unique URL forces a fresh read after catalog and image updates.
        url.searchParams.set("v", `${Date.now()}-${crypto.randomUUID()}`);
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`Blob read failed with ${response.status}`);
        const bytes = await response.arrayBuffer();
        return {
          httpMetadata: { contentType: blob.contentType },
          text: () => Promise.resolve(new TextDecoder().decode(bytes)),
          arrayBuffer: () => Promise.resolve(bytes),
        };
      } catch (error) {
        if (error instanceof BlobNotFoundError) return null;
        throw error;
      }
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
