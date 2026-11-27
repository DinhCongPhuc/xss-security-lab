import { requestLocal } from "../request-local.ts";
import { expect, test } from "vitest";
import { createApi } from "@xss-lab/api/app";
import { createSecureLab } from "@xss-lab/secure-lab/app";
import { createVulnerableLab } from "@xss-lab/vulnerable-lab/app";

const createRequest = () => requestLocal(createApi(3000));

test("management health uses the shared envelope", async () => {
  const api = await createRequest();
  await api
    .get("/api/health")
    .set("Host", "localhost:3000")
    .expect(200, { ok: true, data: { status: "ok", service: "api" } });
});

test("catalog exposes the three planned labs with no experiment data", async () => {
  const api = await createRequest();
  const response = await api
    .get("/api/labs")
    .set("Host", "[::1]:3000")
    .expect(200);
  expect(response.body).toEqual({
    ok: true,
    data: [
      { id: "LAB-01", slug: "reflected", title: "Reflected XSS" },
      { id: "LAB-02", slug: "stored", title: "Stored XSS" },
      { id: "LAB-03", slug: "dom", title: "DOM-based XSS" },
    ],
  });
});

test.each([
  ["secure", 3002, createSecureLab],
  ["vulnerable", 3001, createVulnerableLab],
] as const)("%s lab identifies itself", async (mode, port, create) => {
  const lab = await requestLocal(create(port));
  const host = "127.0.0.1:" + port;
  await lab
    .get("/health")
    .set("Host", host)
    .expect(200, {
      ok: true,
      data: { mode, status: "ok", service: mode + "-lab" },
    });
  const landing = await lab
    .get("/")
    .set("Host", host)
    .expect(200)
    .expect("Content-Type", /html/);
  expect(landing.text).toContain(
    mode === "vulnerable" ? "Cảnh báo" : "Secure Lab",
  );
});

test("invalid query and missing route return structured errors", async () => {
  const api = await createRequest();
  await api
    .get("/api/labs?unexpected=1")
    .set("Host", "localhost:3000")
    .expect(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST",
        message: "This endpoint accepts no query or body",
      },
    });
  await api.get("/api/missing").set("Host", "localhost:3000").expect(404);
});
