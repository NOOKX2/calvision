import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const MEAL_IMAGES_DIR =
  process.env.MEAL_IMAGES_DIR ?? path.join(process.cwd(), "data", "meal-images");

function resolvePath(imagePath: string) {
  return path.join(MEAL_IMAGES_DIR, imagePath);
}

export function extensionForFile(file: File) {
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/jpeg") return ".jpg";
  return ".jpg";
}

export function contentTypeForPath(imagePath: string) {
  if (imagePath.endsWith(".png")) return "image/png";
  if (imagePath.endsWith(".webp")) return "image/webp";
  if (imagePath.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

async function ensureDir() {
  await mkdir(MEAL_IMAGES_DIR, { recursive: true });
}

export async function saveMealImage(mealId: string, file: File) {
  await ensureDir();
  const imagePath = `${mealId}${extensionForFile(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(resolvePath(imagePath), buffer);
  return imagePath;
}

export async function readMealImage(imagePath: string) {
  return readFile(resolvePath(imagePath));
}

export async function deleteMealImage(imagePath: string | null | undefined) {
  if (!imagePath) return;
  try {
    await unlink(resolvePath(imagePath));
  } catch {
    // file may already be missing
  }
}
