import { expect, test } from "@playwright/test";
import { mkdir, mkdtemp, rm, rmdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

test("Vite serves frontend source and denies runtime and sensitive fixtures", async ({
  request,
}) => {
  const source = await mkdtemp(resolve("apps/web/src/review-"));
  const outside = await mkdtemp(resolve("review-"));
  const publicRoot = resolve("apps/web/public");
  const createdPublic = await mkdir(publicRoot, { recursive: true });
  const publicFixture = await mkdtemp(resolve(publicRoot, "review-"));
  const marker = "synthetic fixture";
  try {
    const denied = [
      ".env.sample",
      "synthetic.pem",
      "fixture.db",
      "fixture.db-wal",
      "fixture.sqlite3-shm",
      "private/note.txt",
    ];
    await mkdir(resolve(source, "private"));
    await Promise.all(
      [...denied, "visible.txt"].map((file) =>
        writeFile(resolve(source, file), marker),
      ),
    );
    await writeFile(resolve(outside, "note.txt"), marker);
    await writeFile(resolve(publicFixture, "note.txt"), marker);

    const prefix = "/src/" + basename(source) + "/";
    const allowed = await request.get(prefix + "visible.txt");
    expect(allowed.status()).toBe(200);
    expect(await allowed.text()).toBe(marker);

    for (const path of [
      ...denied.map((file) => prefix + file),
      "/@fs/" + resolve(outside, "note.txt").replaceAll("\\", "/"),
      "/public/" + basename(publicFixture) + "/note.txt",
      "/" + basename(publicFixture) + "/note.txt",
    ]) {
      const deniedResponse = await request.get(path, {
        headers: { Accept: "text/plain" },
      });
      expect([403, 404], path).toContain(deniedResponse.status());
      expect(await deniedResponse.text()).not.toContain(marker);
    }

    const rejectedHeaders: Record<string, string>[] = [
      { Host: "example.invalid" },
      { Origin: "https://example.invalid" },
    ];
    for (const headers of rejectedHeaders) {
      expect((await request.get("/", { headers })).status()).toBe(403);
    }
  } finally {
    for (const path of [source, outside, publicFixture])
      await rm(path, { recursive: true, force: true });
    if (createdPublic) await rmdir(publicRoot);
  }
});
