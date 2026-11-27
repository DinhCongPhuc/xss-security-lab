import { requestLocal } from "../request-local.ts";
import { expect, test } from "vitest";
import { createApi } from "../../apps/api/src/app.ts";
import { createSecureLab } from "../../apps/secure-lab/src/app.ts";

test("API only grants CORS to configured web origins without credentials", async () => {
  const api = await requestLocal(createApi(3000));
  const allowed = await api
    .get("/api/health")
    .set("Host", "localhost:3000")
    .set("Origin", "http://[::1]:5173")
    .expect(200);
  expect(allowed.headers["access-control-allow-origin"]).toBe(
    "http://[::1]:5173",
  );
  expect(allowed.headers["access-control-allow-credentials"]).toBeUndefined();
  expect(allowed.headers["set-cookie"]).toBeUndefined();
  for (const origin of [
    "null",
    "https://example.invalid",
    "http://127.0.0.1:3001",
  ]) {
    const denied = await api
      .get("/api/health")
      .set("Host", "localhost:3000")
      .set("Origin", origin)
      .expect(403);
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  }
});

test("lab requires a local Host and denies cross-origin requests and framing", async () => {
  const lab = await requestLocal(createSecureLab(3002));
  await lab.get("/health").set("Host", "example.invalid:3002").expect(403);
  await lab
    .get("/health")
    .set("Host", "localhost:3002")
    .set("Origin", "http://localhost:5173")
    .expect(403);
  await lab
    .get("/health")
    .set("Host", "localhost:3002")
    .expect("Content-Security-Policy", /frame-ancestors 'none'/)
    .expect(200);
});
