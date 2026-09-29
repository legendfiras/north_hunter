import { del, head, list, put, BlobNotFoundError } from "@vercel/blob";

const CATALOG_KEY = "catalog.json";
// Every catalog save gets its own pathname. Public Blob URLs are cached by the
// CDN, and an overwritten file can keep serving its old content for up to 60
// seconds (a cache-busting query string did not reliably get past it), so
// deletions and edits showed up late on the storefront. A never-before-requested URL is always fresh.
const CATALOG_PREFIX = "catalog/";
const CATALOG_VERSIONS_KEPT = 10;

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
  getCatalog(): Promise<string | null>;
  putCatalog(json: string): Promise<void>;
  catalogExists(): Promise<boolean>;
};

async function catalogVersions() {
  const blobs: { pathname: string; url: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: CATALOG_PREFIX, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  // Pathnames start with a zero-padded timestamp, so newest sorts first.
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

async function fetchFresh(blobUrl: string) {
  const url = new URL(blobUrl);
  url.searchParams.set("v", `${Date.now()}-${crypto.randomUUID()}`);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Blob read failed with ${response.status}`);
  return response.arrayBuffer();
}

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
  const bucket: MediaBucket = {
    async get(key) {
      try {
        const blob = await head(key);
        const bytes = await fetchFresh(blob.url);
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
    async getCatalog() {
      const [latest] = await catalogVersions();
      if (latest) return new TextDecoder().decode(await fetchFresh(latest.url));
      // Stores that predate versioned saves still hold the single catalog.json.
      const legacy = await bucket.get(CATALOG_KEY);
      return legacy ? legacy.text() : null;
    },
    async putCatalog(json) {
      const stamp = Date.now().toString().padStart(15, "0");
      await put(`${CATALOG_PREFIX}${stamp}-${crypto.randomUUID()}.json`, json, {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      });
      // Keep a few recent versions so a reader that just listed one can still fetch it.
      const stale = (await catalogVersions()).slice(CATALOG_VERSIONS_KEPT);
      if (stale.length) await del(stale.map((blob) => blob.url)).catch(() => undefined);
    },
    async catalogExists() {
      if ((await catalogVersions()).length) return true;
      return bucket.exists(CATALOG_KEY);
    },
  };
  return bucket;
}
