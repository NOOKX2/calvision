import {
  getR2AccessKeyId,
  getR2BucketName,
  getR2Endpoint,
  getR2SecretAccessKey,
  isR2Configured,
  mealImageKey,
  objectKeyFromStored,
  publicUrlForKey,
} from "./r2-config";
import { extensionForFile, contentTypeForKey } from "./mime";

type S3Module = typeof import("@aws-sdk/client-s3");

let client: InstanceType<S3Module["S3Client"]> | undefined;
let s3Module: S3Module | undefined;

async function loadS3(): Promise<S3Module> {
  s3Module ??= await import("@aws-sdk/client-s3");
  return s3Module;
}

async function getR2Client() {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured");
  }

  if (client) return client;

  const endpoint = getR2Endpoint();
  const accessKeyId = getR2AccessKeyId();
  const secretAccessKey = getR2SecretAccessKey();

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 is not configured");
  }

  const { S3Client } = await loadS3();
  client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
}

function bucketName() {
  const name = getR2BucketName();
  if (!name) {
    throw new Error("R2 bucket name is not set");
  }
  return name;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
) {
  const { PutObjectCommand } = await loadS3();
  await (await getR2Client()).send(
    new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function readFromR2(key: string) {
  const { GetObjectCommand } = await loadS3();
  const response = await (await getR2Client()).send(
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
  const { DeleteObjectCommand } = await loadS3();
  await (await getR2Client()).send(
    new DeleteObjectCommand({
      Bucket: bucketName(),
      Key: key,
    }),
  );
}

/** Upload meal image to R2 and return its public URL for DB storage. */
export async function uploadMealImageToR2(mealId: string, file: File) {
  const key = mealImageKey(mealId, extensionForFile(file));
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadToR2(key, buffer, contentTypeForKey(key));

  const url = publicUrlForKey(key);
  if (!url) {
    throw new Error(
      "R2_PUBLIC_URL (or CLOUDFLARE_R2_PUBLIC_URL) is not set — required to store meal image URLs",
    );
  }

  return url;
}

export async function deleteMealImageFromR2(stored: string) {
  await deleteFromR2(objectKeyFromStored(stored));
}

export async function readMealImageFromR2(stored: string) {
  return readFromR2(objectKeyFromStored(stored));
}
