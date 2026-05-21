import path from "node:path";

import postgres from "postgres";

import { baselineMigrations } from "../lib/db/baseline";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const migrationsFolder = path.join(process.cwd(), "drizzle");

  console.log("Baselining migrations (mark as applied without running SQL)...");
  await baselineMigrations(client, migrationsFolder);
  console.log("Done.");

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
