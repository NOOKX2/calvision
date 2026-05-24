import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

function usesSsl(connectionString: string) {
  if (process.env.DATABASE_SSL === "false") return false;
  if (process.env.DATABASE_SSL === "true") return true;
  if (/sslmode=require/i.test(connectionString)) return true;

  const isLocal =
    /@(localhost|127\.0\.0\.1|db)(:\d+)?\//.test(connectionString) ||
    connectionString.includes("@db:");

  return process.env.NODE_ENV === "production" && !isLocal;
}

function isNeon(connectionString: string) {
  return connectionString.includes("neon.tech");
}

function postgresOptions(connectionString: string) {
  const neon = isNeon(connectionString);
  const serverless = process.env.NODE_ENV === "production" || neon;

  return {
    max: serverless ? 1 : 10,
    idle_timeout: serverless ? 20 : undefined,
    connect_timeout: 15,
    ...(usesSsl(connectionString) ? { ssl: "require" as const } : {}),
    // Neon pooler + Vercel serverless ต้องปิด prepared statements
    ...(neon ? { prepare: false as const } : {}),
  };
}

function getDb() {
  if (globalForDb.db && globalForDb.client) {
    return globalForDb.db;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, postgresOptions(connectionString));
  const db = drizzle(client, { schema });

  globalForDb.client = client;
  globalForDb.db = db;

  return db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
