/** Client-safe helpers for meal image URLs (no fs / R2 imports). */

export function mealImageSrc(
  mealId: string,
  imagePath: string | null | undefined,
) {
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `/api/meals/${mealId}/image`;
}
