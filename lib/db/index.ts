import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client =
    globalForDb.client ?? postgres(connectionString, { max: 10 });
  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.client = client;
    globalForDb.db = db;
  }

  return db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const instance = globalForDb.db ?? createDb();
    return Reflect.get(instance, prop, receiver);
  },
});
