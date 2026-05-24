import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import {
  deleteFromR2,
  isR2Configured,
  publicUrlForKey,
  readFromR2,
  uploadToR2,
} from "./r2";

const MEAL_IMAGES_DIR =
  process.env.MEAL_IMAGES_DIR ?? path.join(process.cwd(), "data", "meal-images");

const OBJECT_PREFIX = "meals";

export function extensionForFile(file: File) {
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/jpeg") return ".jpg";
  return ".jpg";
}

export function contentTypeForPath(imagePath: string) {
  const value = objectKeyFromStored(imagePath);
  if (value.endsWith(".png")) return "image/png";
  if (value.endsWith(".webp")) return "image/webp";
  if (value.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

/** Stored value in DB: public URL, object key, or legacy local filename. */
export function objectKeyFromStored(imagePath: string) {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    const pathname = new URL(imagePath).pathname.replace(/^\//, "");
    return pathname.startsWith(`${OBJECT_PREFIX}/`)
      ? pathname
      : `${OBJECT_PREFIX}/${pathname.split("/").pop() ?? pathname}`;
  }

  if (imagePath.startsWith(`${OBJECT_PREFIX}/`)) {
    return imagePath;
  }

  return `${OBJECT_PREFIX}/${imagePath}`;
}

function resolveLocalPath(imagePath: string) {
  const filename = objectKeyFromStored(imagePath).split("/").pop() ?? imagePath;
  return path.join(MEAL_IMAGES_DIR, filename);
}

async function ensureLocalDir() {
  await mkdir(MEAL_IMAGES_DIR, { recursive: true });
}

function storedValueForKey(key: string) {
  return publicUrlForKey(key) ?? key;
}

export async function saveMealImage(mealId: string, file: File) {
  const key = `${OBJECT_PREFIX}/${mealId}${extensionForFile(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = contentTypeForPath(key);

  if (isR2Configured()) {
    await uploadToR2(key, buffer, contentType);
    return storedValueForKey(key);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
  }

  await ensureLocalDir();
  const filename = key.split("/").pop() ?? key;
  await writeFile(path.join(MEAL_IMAGES_DIR, filename), buffer);
  return storedValueForKey(key);
}

export async function readMealImage(imagePath: string) {
  const key = objectKeyFromStored(imagePath);

  if (isR2Configured()) {
    return readFromR2(key);
  }

  return readFile(resolveLocalPath(imagePath));
}

export async function deleteMealImage(imagePath: string | null | undefined) {
  if (!imagePath) return;

  const key = objectKeyFromStored(imagePath);

  try {
    if (isR2Configured()) {
      await deleteFromR2(key);
      return;
    }

    await unlink(resolveLocalPath(imagePath));
  } catch {
    // object or file may already be missing
  }
}
