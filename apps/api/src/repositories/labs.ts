import type { DatabaseSync } from "node:sqlite";
import { catalog } from "../services/catalog.ts";
export function seedCatalog(db: DatabaseSync) {
  const insert = db.prepare(
    "INSERT INTO labs (id, slug, title) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, title = excluded.title",
  );
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const lab of catalog) insert.run(lab.id, lab.slug, lab.title);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
