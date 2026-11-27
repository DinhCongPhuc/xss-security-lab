import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { createApi } from "@xss-lab/api/app";
import { managementMigrations } from "@xss-lab/api/migrations";
import { seedCatalog } from "@xss-lab/api/repository";
import { initializeDatabase } from "@xss-lab/shared-config/database";
import { addErrorHandlers, createLocalApp } from "@xss-lab/shared-config/http";
import { createSecureLab } from "@xss-lab/secure-lab/app";
import { createVulnerableLab } from "@xss-lab/vulnerable-lab/app";
import { requestLocal } from "../request-local.ts";

test("a failed migration rolls back schema changes and preserves the previous version", () => {
  const folder = mkdtempSync(join(tmpdir(), "xss-lab-migration-"));
  const file = join(folder, "probe.db");
  const initial = "CREATE TABLE original (id INTEGER PRIMARY KEY)";
  try {
    initializeDatabase(file, [initial]).close();
    expect(() =>
      initializeDatabase(file, [
        initial,
        "CREATE TABLE staged (id INTEGER)",
        "SELECT * FROM missing",
      ]),
    ).toThrow(/missing/);
    using db = new DatabaseSync(file);
    expect(db.prepare("PRAGMA user_version").get()?.user_version).toBe(1);
    expect(
      db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table'").all(),
    ).toEqual([{ name: "original" }]);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test("a newer schema is rejected without changing its version", () => {
  const folder = mkdtempSync(join(tmpdir(), "xss-lab-schema-"));
  const file = join(folder, "probe.db");
  try {
    const db = new DatabaseSync(file);
    db.exec("PRAGMA user_version = 2");
    db.close();
    expect(() => initializeDatabase(file, managementMigrations)).toThrow(
      "Unsupported database schema version",
    );
    using reopened = new DatabaseSync(file);
    expect(reopened.prepare("PRAGMA user_version").get()?.user_version).toBe(2);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test("an experiment must reference a test case belonging to the same lab", () => {
  using db = initializeDatabase(":memory:", managementMigrations);
  seedCatalog(db);
  db.prepare("INSERT INTO test_cases (id, lab_id, label) VALUES (?, ?, ?)").run(
    "case",
    "LAB-01",
    "Synthetic",
  );
  const result = db.prepare(
    "INSERT INTO experiment_logs (lab_id, test_case_id, mode, state) VALUES (?, ?, ?, ?)",
  );
  expect(() => result.run("LAB-02", "case", "secure", "NORMAL")).toThrow(
    /FOREIGN KEY/,
  );
  expect(result.run("LAB-01", "case", "secure", "NORMAL").changes).toBe(1);
});

test.each([
  [3000, "/api/health", createApi],
  [3001, "/health", createVulnerableLab],
  [3002, "/health", createSecureLab],
] as const)(
  "port %i rejects foreign Host, Origin and read bodies",
  async (port, path, create) => {
    const request = await requestLocal(create(port));
    const host = "localhost:" + port;
    const deniedHost = await request
      .get(path)
      .set("Host", "example.invalid")
      .expect(403);
    expect(deniedHost.body).toMatchObject({
      ok: false,
      error: { code: "HOST_DENIED" },
    });
    const deniedOrigin = await request
      .get(path)
      .set("Host", host)
      .set("Origin", "https://example.invalid")
      .expect(403);
    expect(deniedOrigin.body).toMatchObject({
      ok: false,
      error: { code: "ORIGIN_DENIED" },
    });
    const body = await request
      .get(path)
      .set("Host", host)
      .send("synthetic body")
      .expect(400);
    expect(body.body).toMatchObject({
      ok: false,
      error: { code: "INVALID_REQUEST" },
    });
    await request
      .get("/missing")
      .set("Host", host)
      .expect(404, {
        ok: false,
        error: { code: "NOT_FOUND", message: "Endpoint not found" },
      });
  },
);

test("unexpected errors return a generic JSON envelope", async () => {
  const app = createLocalApp("test", 3000);
  app.get("/failure", () => {
    throw new Error("synthetic internal details");
  });
  addErrorHandlers(app);
  const request = await requestLocal(app);
  await request
    .get("/failure")
    .set("Host", "localhost:3000")
    .expect(500, {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
    });
});
