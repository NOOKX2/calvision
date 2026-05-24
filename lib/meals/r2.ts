import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

let client: S3Client | undefined;

function getR2Client() {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured");
  }

  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return client;
}

function bucketName() {
  return requireEnv("R2_BUCKET_NAME");
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function readFromR2(key: string) {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: bucketName(),
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("Empty R2 object body");
  }

  return Buffer.from(await response.Body.transformToByteArray());
}

export async function deleteFromR2(key: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: bucketName(),
      Key: key,
    }),
  );
}

export function publicUrlForKey(key: string) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/${key}`;
}
