/** Client-safe helpers for meal image URLs (no fs / R2 imports). */

export function mealImageSrc(
  mealId: string,
  imageUrl: string | null | undefined,
) {
  if (!imageUrl) return null;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // legacy path/key before R2 URL migration
  return `/api/meals/${mealId}/image`;
}
