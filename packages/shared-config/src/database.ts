import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function initializeDatabase(
  filename: string,
  migrations: readonly string[],
) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename, { enableForeignKeyConstraints: true });
  try {
    db.exec("PRAGMA busy_timeout = 5000; BEGIN IMMEDIATE;");
    const version = Number(
      db.prepare("PRAGMA user_version").get()?.user_version,
    );
    if (
      !Number.isSafeInteger(version) ||
      version < 0 ||
      version > migrations.length
    ) {
      throw new Error("Unsupported database schema version");
    }
    for (const migration of migrations.slice(version)) db.exec(migration);
    db.exec("PRAGMA user_version = " + migrations.length + "; COMMIT;");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export const commentMigrations = [
  `
  CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;
`,
];
