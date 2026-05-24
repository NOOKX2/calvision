import { isR2Configured } from "./r2-config";

async function loadR2() {
  return import("./r2");
}

/** Upload to Cloudflare R2 and return the public image URL. */
export async function saveMealImage(mealId: string, file: File) {
  if (!isR2Configured()) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_* or CLOUDFLARE_R2_* env vars (see .env.example).",
    );
  }

  const { uploadMealImageToR2 } = await loadR2();
  return uploadMealImageToR2(mealId, file);
}

export async function deleteMealImage(imageUrl: string | null | undefined) {
  if (!imageUrl || !isR2Configured()) return;

  try {
    const { deleteMealImageFromR2 } = await loadR2();
    await deleteMealImageFromR2(imageUrl);
  } catch {
    // object may already be missing
  }
}

export async function readMealImage(imageUrl: string) {
  const { readMealImageFromR2 } = await loadR2();
  return readMealImageFromR2(imageUrl);
}

export { contentTypeForKey as contentTypeForPath } from "./mime";
export { objectKeyFromStored } from "./r2-config";
