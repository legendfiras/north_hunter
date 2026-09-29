import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  exists(key: string): Promise<boolean>;
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export function catalogKey() {
  return CATALOG_KEY;
}

export function mediaObjectKey(filename: string) {
  return `files/${filename}`;
}

async function r2Config(): Promise<R2Config | null> {
  try {
    const { connection } = await import("next/server");
    await connection();
  } catch {
    // Env is still read below. A request is not available during build analysis.
  }
  const env = process.env;
  const accountId = env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = env.R2_BUCKET_NAME?.trim() || "north-hunter-media";
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function clientFor(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function r2Configured() {
  return (await r2Config()) !== null;
}

export async function mediaBucket(): Promise<MediaBucket | null> {
  const config = await r2Config();
  if (!config) return null;
  const client = clientFor(config);
  const bucket = config.bucket;

  return {
    async get(key) {
      try {
        const output = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!output.Body) return null;
        const body = output.Body;
        return {
          httpMetadata: { contentType: output.ContentType },
          text: () => body.transformToString(),
          async arrayBuffer() {
            const bytes = await body.transformToByteArray();
            return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          },
        };
      } catch (error) {
        if (isMissing(error)) return null;
        throw error;
      }
    },
    async put(key, value, options) {
      const body = typeof value === "string" ? value : value instanceof Uint8Array ? value : new Uint8Array(value);
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: options?.httpMetadata?.contentType,
        }),
      );
    },
    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    async exists(key) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return true;
      } catch (error) {
        if (isMissing(error)) return false;
        throw error;
      }
    },
  };
}

export async function presignMediaUpload(filename: string, contentType: string, size: number) {
  const config = await r2Config();
  if (!config) return null;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: mediaObjectKey(filename),
    ContentType: contentType,
    ContentLength: size,
  });
  return getSignedUrl(clientFor(config), command, { expiresIn: 120 });
}

function isMissing(error: unknown) {
  if (!error || typeof error !== "object" || !("name" in error)) return false;
  const name = String(error.name);
  return name === "NotFound" || name === "NoSuchKey";
}
