/**
 * One-off: add meal_logs.image_path if missing.
 * Usage: bun run scripts/ensure-image-path.ts
 */
import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

await sql.unsafe(
  'ALTER TABLE "meal_logs" ADD COLUMN IF NOT EXISTS "image_path" text',
);

const cols = await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'meal_logs' AND column_name = 'image_path'
`;

console.log(
  cols.length > 0
    ? "OK: meal_logs.image_path exists"
    : "Failed: column still missing",
);

await sql.end();
