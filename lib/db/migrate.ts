import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { baselineMigrations, tablesExist } from "./baseline";

function isRelationExistsError(error: unknown) {
  const parts: string[] = [];
  let current: unknown = error;

  while (current && typeof current === "object") {
    if ("code" in current) parts.push(String(current.code));
    if ("message" in current && typeof current.message === "string") {
      parts.push(current.message);
    }
    if ("cause" in current) {
      current = current.cause;
    } else {
      break;
    }
  }

  const text = parts.join(" ");
  return text.includes("42P07") || text.includes("already exists");
}

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  const migrationsFolder = path.join(process.cwd(), "drizzle");

  console.log(`Running migrations from ${migrationsFolder}...`);

  try {
    await migrate(db, { migrationsFolder });
    console.log("Migrations complete.");
  } catch (error) {
    if (isRelationExistsError(error) && (await tablesExist(client))) {
      console.log(
        "Tables already exist (likely from db:push). Syncing migration journal...",
      );
      await baselineMigrations(client, migrationsFolder);
      await migrate(db, { migrationsFolder });
      console.log("Migrations complete (baselined existing schema).");
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
