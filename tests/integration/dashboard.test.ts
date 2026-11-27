import { createServer, type RequestListener, type Server } from "node:http";
import request from "supertest";
import { expect, onTestFinished, test, vi } from "vitest";
import { createApi } from "@xss-lab/api/app";
import { createSecureLab } from "@xss-lab/secure-lab/app";
import { createVulnerableLab } from "@xss-lab/vulnerable-lab/app";
import type { DashboardSummary } from "@xss-lab/shared-types";

async function localServer(handler?: RequestListener) {
  const server = createServer(handler);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  onTestFinished(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  );
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing test port");
  return { server, port: address.port };
}

function management(
  server: Server,
  port: number,
  vulnerable: number,
  secure: number,
) {
  server.on(
    "request",
    createApi(port, 5173, { host: "127.0.0.1", vulnerable, secure }),
  );
  return request(server);
}

const endpoint = "/api/dashboard/summary";

test("summary uses the actual catalog, three live health endpoints and explicit unavailable features", async () => {
  const api = await localServer();
  const vulnerable = await localServer();
  const secure = await localServer();
  vulnerable.server.on("request", createVulnerableLab(vulnerable.port));
  secure.server.on("request", createSecureLab(secure.port));
  const client = management(api.server, api.port, vulnerable.port, secure.port);
  const before = Date.now();
  const result = await client
    .get(endpoint)
    .expect(200)
    .expect("Cache-Control", "no-store");
  const catalogs = await client.get("/api/labs").expect(200);
  const data: DashboardSummary = result.body.data;
  expect(result.body.ok).toBe(true);
  expect(data.catalog).toEqual(catalogs.body.data);
  expect(data.statistics).toEqual({
    labCount: data.catalog.length,
    categoryCount: new Set(data.catalog.map(({ slug }) => slug)).size,
  });
  expect(data.services.map(({ service, status }) => [service, status])).toEqual(
    [
      ["api", "healthy"],
      ["vulnerable-lab", "healthy"],
      ["secure-lab", "healthy"],
    ],
  );
  for (const check of [data, ...data.services])
    expect(Date.parse(check.observedAt ?? "")).toBeGreaterThanOrEqual(before);
  expect(data.availability).toEqual({
    activity: "unavailable",
    progress: "unavailable",
  });
});

test.each([
  "redirect",
  "invalid identity",
  "invalid JSON",
  "oversized",
  "503",
] as const)(
  "summary reports a bad %s response without following it or leaking its body",
  async (kind) => {
    const api = await localServer();
    const secure = await localServer();
    let unexpectedCalls = 0;
    const sink = await localServer((_req, res) => {
      unexpectedCalls++;
      res.end();
    });
    secure.server.on("request", createSecureLab(secure.port));
    const vulnerable = await localServer((req, res) => {
      expect(req.headers.cookie).toBeUndefined();
      expect(req.headers.authorization).toBeUndefined();
      res.setHeader("content-type", "application/json");
      if (kind === "redirect")
        res.writeHead(302, {
          Location: "http://127.0.0.1:" + sink.port + "/unexpected",
        });
      if (kind === "503") res.statusCode = 503;
      res.end(
        kind === "invalid identity"
          ? JSON.stringify({
              ok: true,
              data: { service: "secure-lab", status: "ok", mode: "secure" },
            })
          : kind === "oversized"
            ? "x".repeat(5000)
            : "synthetic-malformed-upstream-body",
      );
    });
    const result = await management(
      api.server,
      api.port,
      vulnerable.port,
      secure.port,
    )
      .get(endpoint)
      .set("Cookie", "fixture=1")
      .set("Authorization", "Bearer fixture")
      .expect(200);
    expect(result.body.data.services).toEqual([
      { service: "api", status: "healthy", observedAt: expect.any(String) },
      {
        service: "vulnerable-lab",
        status: "unhealthy",
        observedAt: expect.any(String),
      },
      {
        service: "secure-lab",
        status: "healthy",
        observedAt: expect.any(String),
      },
    ]);
    expect(unexpectedCalls).toBe(0);
    expect(result.text).not.toContain("synthetic-malformed-upstream-body");
  },
);

test("bounded probes handle a connection failure and a body that never completes", async () => {
  const api = await localServer();
  const offline = createServer();
  await new Promise<void>((resolve) => offline.listen(0, "127.0.0.1", resolve));
  const address = offline.address();
  if (!address || typeof address === "string")
    throw new Error("Missing offline port");
  await new Promise<void>((resolve) => offline.close(() => resolve()));
  const closed = Promise.withResolvers<void>();
  const stalled = await localServer((_req, res) => {
    res.once("close", closed.resolve);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write('{"ok":');
  });
  const client = management(api.server, api.port, address.port, stalled.port);
  const result = await client.get(endpoint).timeout(2500).expect(200);
  expect(
    result.body.data.services.map(({ status }: { status: string }) => status),
  ).toEqual(["healthy", "unreachable", "unreachable"]);
  await closed.promise;
});

test("unconfigured health is unknown and request-supplied targets are rejected", async () => {
  const api = await localServer();
  api.server.on("request", createApi(api.port));
  const client = request(api.server);
  const result = await client.get(endpoint).expect(200);
  expect(result.body.data.services).toEqual([
    { service: "api", status: "unknown", observedAt: null },
    { service: "vulnerable-lab", status: "unknown", observedAt: null },
    { service: "secure-lab", status: "unknown", observedAt: null },
  ]);
  await client
    .get(endpoint + "?url=http%3A%2F%2Fexample.invalid")
    .expect(400)
    .expect(({ body }) =>
      expect(body).toMatchObject({
        ok: false,
        error: { code: "INVALID_REQUEST" },
      }),
    );
  await client.get(endpoint).send("unapproved target").expect(400);
  expect(() =>
    createApi(api.port, 5173, {
      host: "external.invalid" as "127.0.0.1",
      vulnerable: 3001,
      secure: 3002,
    }),
  ).toThrow(/loopback/);
});

test.each([200, 503])(
  "five overlapping summary requests share probes and a later request is fresh (first Lab HTTP %i)",
  async (firstStatus) => {
    const api = await localServer();
    const firstProbe = Promise.withResolvers<void>();
    const releaseProbe = Promise.withResolvers<void>();
    const allArrived = Promise.withResolvers<void>();
    const counts = { api: 0, vulnerable: 0, secure: 0 };
    let arrivals = 0;
    api.server.on("request", (req) => {
      if (req.url === "/api/health") counts.api++;
      if (req.url === endpoint && ++arrivals === 5) allArrived.resolve();
    });
    const vulnerable = await localServer();
    const serveVulnerable = createVulnerableLab(vulnerable.port);
    vulnerable.server.on("request", (req, res) => {
      if (++counts.vulnerable === 1) {
        firstProbe.resolve();
        void releaseProbe.promise.then(() => {
          if (firstStatus === 503) {
            res.writeHead(503).end();
          } else {
            serveVulnerable(req, res);
          }
        });
      } else {
        serveVulnerable(req, res);
      }
    });
    const secure = await localServer();
    const serveSecure = createSecureLab(secure.port);
    secure.server.on("request", (req, res) => {
      counts.secure++;
      serveSecure(req, res);
    });
    const client = management(
      api.server,
      api.port,
      vulnerable.port,
      secure.port,
    );
    const startSummary = () =>
      Promise.resolve(client.get(endpoint).expect(200));
    const first = startSummary();
    await firstProbe.promise;
    const callers = [first, ...Array.from({ length: 4 }, startSummary)];
    await allArrived.promise;
    releaseProbe.resolve();

    const results = await Promise.all(callers);
    expect(results).toHaveLength(5);
    expect(counts).toEqual({ api: 1, vulnerable: 1, secure: 1 });
    const shared = results[0]?.body.data as DashboardSummary;
    expect(shared.services.map(({ status }) => status)).toEqual([
      "healthy",
      firstStatus === 503 ? "unhealthy" : "healthy",
      "healthy",
    ]);
    for (const result of results)
      expect(result.body).toEqual({ ok: true, data: shared });

    const fresh = await startSummary();
    expect(counts).toEqual({ api: 2, vulnerable: 2, secure: 2 });
    expect(
      (fresh.body.data as DashboardSummary).services.every(
        ({ status }) => status === "healthy",
      ),
    ).toBe(true);
  },
);

test("separate Management API instances do not share an open flight", async () => {
  const firstApi = await localServer();
  const otherApi = await localServer();
  const firstProbe = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const delayed = await localServer();
  const delayedApp = createVulnerableLab(delayed.port);
  delayed.server.on("request", (req, res) => {
    firstProbe.resolve();
    void release.promise.then(() => {
      delayedApp(req, res);
    });
  });

  const failing = await localServer((_req, res) => {
    res.writeHead(503).end();
  });
  const secure = await localServer();
  secure.server.on("request", createSecureLab(secure.port));
  const firstClient = management(
    firstApi.server,
    firstApi.port,
    delayed.port,
    secure.port,
  );
  const otherClient = management(
    otherApi.server,
    otherApi.port,
    failing.port,
    secure.port,
  );

  const first = Promise.resolve(firstClient.get(endpoint).expect(200));
  await firstProbe.promise;
  let other;
  try {
    other = await otherClient.get(endpoint).expect(200);
  } finally {
    release.resolve();
  }
  const original = await first;
  expect(
    (other.body.data as DashboardSummary).services.map(({ status }) => status),
  ).toEqual(["healthy", "unhealthy", "healthy"]);
  expect(
    (original.body.data as DashboardSummary).services.map(
      ({ status }) => status,
    ),
  ).toEqual(["healthy", "healthy", "healthy"]);
});

test("an unexpected observation rejection clears the flight and the next request recovers", async () => {
  const api = await localServer();
  const vulnerable = await localServer();
  const secure = await localServer();
  vulnerable.server.on("request", createVulnerableLab(vulnerable.port));
  secure.server.on("request", createSecureLab(secure.port));
  const client = management(api.server, api.port, vulnerable.port, secure.port);
  const timeout = vi
    .spyOn(AbortSignal, "timeout")
    .mockImplementationOnce(() => {
      throw new Error("synthetic unexpected failure");
    });
  try {
    const rejected = await client.get(endpoint).expect(500);
    expect(rejected.body).toMatchObject({
      ok: false,
      error: { code: "INTERNAL_ERROR" },
    });
    expect(rejected.text).not.toContain("synthetic unexpected failure");
  } finally {
    timeout.mockRestore();
  }
  const recovered = await client.get(endpoint).expect(200);
  expect(
    (recovered.body.data as DashboardSummary).services.every(
      ({ status }) => status === "healthy",
    ),
  ).toBe(true);
});

test("disconnecting the first caller does not cancel the shared probe", async () => {
  const api = await localServer();
  const probeReached = Promise.withResolvers<void>();
  const secondArrived = Promise.withResolvers<void>();
  const firstClosed = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  let arrivals = 0;
  let probes = 0;
  api.server.on("request", (req, res) => {
    if (req.url !== endpoint) return;
    if (++arrivals === 1) res.once("close", firstClosed.resolve);
    else secondArrived.resolve();
  });
  const vulnerable = await localServer();
  const vulnerableApp = createVulnerableLab(vulnerable.port);
  vulnerable.server.on("request", (req, res) => {
    probes++;
    probeReached.resolve();
    void release.promise.then(() => {
      vulnerableApp(req, res);
    });
  });
  const secure = await localServer();
  secure.server.on("request", createSecureLab(secure.port));
  const client = management(api.server, api.port, vulnerable.port, secure.port);
  const controller = new AbortController();
  const first = fetch("http://127.0.0.1:" + api.port + endpoint, {
    signal: controller.signal,
  }).catch((error: Error) => error.name);
  await probeReached.promise;
  const second = Promise.resolve(client.get(endpoint).expect(200));
  await secondArrived.promise;
  controller.abort();
  await firstClosed.promise;
  release.resolve();
  expect(await first).toBe("AbortError");
  const remaining = await second;
  expect(probes).toBe(1);
  expect(
    (remaining.body.data as DashboardSummary).services.every(
      ({ status }) => status === "healthy",
    ),
  ).toBe(true);
});

test("chunked health bodies of exactly 4096 bytes pass and 4097 bytes fail", async () => {
  const api = await localServer();
  function chunked(
    service: string,
    mode: string,
    size: number,
  ): RequestListener {
    return (_req, res) => {
      const body = JSON.stringify({
        ok: true,
        data: { service, mode, status: "ok" },
      }).padEnd(size);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      });
      res.write(body.slice(0, 2048));
      setImmediate(() => {
        res.end(body.slice(2048));
      });
    };
  }
  const vulnerable = await localServer(
    chunked("vulnerable-lab", "vulnerable", 4097),
  );
  const secure = await localServer(chunked("secure-lab", "secure", 4096));
  const result = await management(
    api.server,
    api.port,
    vulnerable.port,
    secure.port,
  )
    .get(endpoint)
    .expect(200);
  expect(
    (result.body.data as DashboardSummary).services.map(({ status }) => status),
  ).toEqual(["healthy", "unhealthy", "healthy"]);
});
