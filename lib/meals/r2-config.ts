const OBJECT_PREFIX = "meals";

function env(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getR2Endpoint() {
  const direct = env("CLOUDFLARE_R2_ENDPOINT", "R2_ENDPOINT");
  if (direct) return direct.replace(/\/$/, "");

  const accountId = env("R2_ACCOUNT_ID");
  if (accountId) return `https://${accountId}.r2.cloudflarestorage.com`;

  return undefined;
}

export function getR2AccessKeyId() {
  return env("R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID");
}

export function getR2SecretAccessKey() {
  return env("R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_SECRET_ACCESS_KEY");
}

export function getR2BucketName() {
  return env("R2_BUCKET_NAME", "CLOUDFLARE_R2_BUCKET_NAME");
}

export function getR2PublicUrlBase() {
  return env("R2_PUBLIC_URL", "CLOUDFLARE_R2_PUBLIC_URL")?.replace(/\/$/, "");
}

export function isR2Configured() {
  return Boolean(
    getR2Endpoint() &&
      getR2AccessKeyId() &&
      getR2SecretAccessKey() &&
      getR2BucketName(),
  );
}

export function publicUrlForKey(key: string) {
  const base = getR2PublicUrlBase();
  if (!base) return null;
  return `${base}/${key}`;
}

export function mealImageKey(mealId: string, extension: string) {
  return `${OBJECT_PREFIX}/${mealId}${extension}`;
}

/** Parse R2 object key from a stored public URL or legacy path/key. */
export function objectKeyFromStored(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    const pathname = new URL(value).pathname.replace(/^\//, "");
    return pathname.startsWith(`${OBJECT_PREFIX}/`)
      ? pathname
      : `${OBJECT_PREFIX}/${pathname.split("/").pop() ?? pathname}`;
  }

  if (value.startsWith(`${OBJECT_PREFIX}/`)) {
    return value;
  }

  return `${OBJECT_PREFIX}/${value}`;
}

export function isPublicImageUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
