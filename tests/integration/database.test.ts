import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { managementMigrations } from "../../apps/api/src/database/migrations.ts";
import { seedCatalog } from "../../apps/api/src/repositories/labs.ts";
import {
  commentMigrations,
  initializeDatabase,
} from "../../packages/shared-config/src/database.ts";

test("management migrations and catalog seed are repeatable with foreign keys enforced", () => {
  const folder = mkdtempSync(join(tmpdir(), "xss-lab-"));
  const path = join(folder, "management.db");
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      using db = initializeDatabase(path, managementMigrations);
      seedCatalog(db);
      expect(
        db.prepare("SELECT COUNT(*) AS total FROM labs").get()?.total,
      ).toBe(3);
      expect(db.prepare("PRAGMA user_version").get()?.user_version).toBe(1);
      expect(() =>
        db
          .prepare("INSERT INTO test_cases VALUES (?, ?, ?)")
          .run("sample", "missing", "Fixture"),
      ).toThrow(/FOREIGN KEY/);
      expect(
        db.prepare("SELECT COUNT(*) AS total FROM experiment_logs").get()
          ?.total,
      ).toBe(0);
    }
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test("lab databases have independent comment storage", () => {
  const folder = mkdtempSync(join(tmpdir(), "xss-lab-"));
  try {
    using vulnerable = initializeDatabase(
      join(folder, "vulnerable.db"),
      commentMigrations,
    );
    using secure = initializeDatabase(
      join(folder, "secure.db"),
      commentMigrations,
    );
    vulnerable
      .prepare("INSERT INTO comments(body) VALUES (?)")
      .run("Bình luận mẫu");
    expect(vulnerable.prepare("SELECT body FROM comments").get()?.body).toBe(
      "Bình luận mẫu",
    );
    expect(secure.prepare("SELECT body FROM comments").all()).toEqual([]);
    expect(() =>
      secure.prepare("INSERT INTO comments(body) VALUES (?)").run(""),
    ).toThrow(/CHECK/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
