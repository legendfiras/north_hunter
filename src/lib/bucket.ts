const CATALOG_KEY = "catalog.json";

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
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
};

export function catalogKey() {
  return CATALOG_KEY;
}

export function mediaObjectKey(filename: string) {
  return `files/${filename}`;
}

export async function mediaBucket(): Promise<MediaBucket | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as { MEDIA?: MediaBucket }).MEDIA;
    return bucket ?? null;
  } catch {
    return null;
  }
}
