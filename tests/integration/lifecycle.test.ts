import { once } from "node:events";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { createServer, type Server } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { launchDev } from "../dev-process.ts";

async function listen(server: Server, port: number, host: string) {
  server.listen(port, host);
  await once(server, "listening");
}
function close(server: Server) {
  return new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

test.each([false, true])(
  "dev releases listeners and SQLite files (startup failure: %s)",
  async (failStartup) => {
    const sockets = Array.from({ length: 4 }, () => createServer());
    await Promise.all(sockets.map((server) => listen(server, 0, "127.0.0.1")));
    const [web, api, vulnerable, secure] = sockets.map((server) => {
      const address = server.address();
      if (typeof address !== "object" || !address)
        throw new Error("Missing reserved port");
      return address.port;
    }) as [number, number, number, number];
    await Promise.all(sockets.map(close));
    const blocker = createServer();
    // Force failure on the final IPv6 Express listener, after all IPv4 services have started.
    if (failStartup) await listen(blocker, secure, "::1");
    const dir = await mkdtemp(join(tmpdir(), "xss-lab-lifecycle-"));
    const dev = launchDev(
      {
        WEB_PORT: web,
        API_PORT: api,
        VULNERABLE_LAB_PORT: vulnerable,
        SECURE_LAB_PORT: secure,
      },
      dir,
    );
    try {
      if (failStartup) {
        await expect(dev.ready).rejects.toThrow(/EADDRINUSE/);
        expect(await dev.exited).toBe(1);
        expect(blocker.listening).toBe(true);
      } else {
        await dev.ready;
        expect(
          (await fetch("http://[::1]:" + api + "/api/health")).status,
        ).toBe(200);
        expect(await dev.stop()).toBe(0);
      }
      expect(dev.child.exitCode).toBe(failStartup ? 1 : 0);
      expect((await readdir(dir)).sort()).toEqual([
        "management.db",
        "secure.db",
        "vulnerable.db",
      ]);
      for (const host of ["127.0.0.1", "::1"]) {
        for (const port of [web, api, vulnerable, secure]) {
          if (failStartup && host === "::1" && port === secure) continue;
          const probe = createServer();
          await listen(probe, port, host);
          await close(probe);
        }
      }
    } finally {
      await dev.stop();
      if (blocker.listening) await close(blocker);
      await rm(dir, { recursive: true, force: true });
    }
  },
  45_000,
);
