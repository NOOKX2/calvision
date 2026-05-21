import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import postgres from "postgres";

type Journal = {
  entries: Array<{ tag: string; idx: number }>;
};

function hashMigration(sql: string) {
  return createHash("sha256").update(sql).digest("hex");
}

function loadJournal(migrationsFolder: string) {
  const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
  return JSON.parse(readFileSync(journalPath, "utf-8")) as Journal;
}

export async function tablesExist(client: postgres.Sql) {
  const [row] = await client<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
    ) AS exists
  `;
  return row?.exists ?? false;
}

export async function getAppliedMigrationHashes(client: postgres.Sql) {
  await client`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await client`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const rows = await client<{ hash: string }[]>`
    SELECT hash FROM drizzle.__drizzle_migrations
  `;
  return new Set(rows.map((r) => r.hash));
}

export async function baselineMigrations(
  client: postgres.Sql,
  migrationsFolder: string,
) {
  const journal = loadJournal(migrationsFolder);
  const applied = await getAppliedMigrationHashes(client);

  const sqlFiles = readdirSync(migrationsFolder).filter((f) =>
    f.endsWith(".sql"),
  );

  for (const entry of journal.entries) {
    const file = sqlFiles.find((f) => f.startsWith(`${entry.tag}`));
    if (!file) continue;

    const sql = readFileSync(path.join(migrationsFolder, file), "utf-8");
    const hash = hashMigration(sql);

    if (applied.has(hash)) continue;

    await client`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${hash}, ${Date.now()})
    `;
    applied.add(hash);
    console.log(`Baselined migration: ${entry.tag}`);
  }
}
