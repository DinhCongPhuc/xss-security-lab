import { expect, test } from "@playwright/test";
import { e2ePorts } from "../e2e-ports.ts";

test("shell renders and navigation works without page errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const hmr = page.waitForEvent("websocket", {
    predicate: (socket) =>
      socket.url().startsWith("ws://localhost:" + e2ePorts.WEB_PORT + "/"),
  });
  await page.goto("/");
  expect((await hmr).isClosed()).toBe(false);
  expect(
    await page.evaluate(async () => {
      const fonts = await Promise.all([
        document.fonts.load('16px "Inter Variable"', "Tổng quan"),
        document.fonts.load('16px "JetBrains Mono Variable"', "Mã"),
      ]);
      return fonts.every(
        (faces) =>
          faces.length > 0 && faces.every((face) => face.status === "loaded"),
      );
    }),
  ).toBe(true);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  for (const label of [
    "Kiến thức",
    "Defense Lab",
    "Phân tích mã",
    "Nhật ký",
    "Báo cáo",
    "Cài đặt",
    "Attack Lab",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: label, exact: true }),
    ).toBeVisible();
  }
  for (const label of ["Reflected XSS", "Stored XSS", "DOM-based XSS"]) {
    await page.getByRole("link", { name: label }).click();
    await expect(page.getByRole("heading", { name: label })).toBeVisible();
    await page.getByRole("link", { name: "Attack Lab" }).click();
  }
  expect(errors).toEqual([]);
});

test("unknown route can return to overview", async ({ page }) => {
  await page.goto("/unknown");
  await expect(page.getByRole("heading", { name: /404/ })).toBeVisible();
  await page.getByRole("link", { name: "Về tổng quan" }).click();
  await expect(page).toHaveURL("/");
});

test("all services respond over both loopback address families", async ({
  request,
}) => {
  for (const host of ["127.0.0.1", "[::1]", "localhost"]) {
    const web = await request.get(
      "http://" + host + ":" + e2ePorts.WEB_PORT + "/",
    );
    expect(web.ok()).toBe(true);
    for (const [port, path, service] of [
      [e2ePorts.API_PORT, "/api/health", "api"],
      [e2ePorts.VULNERABLE_LAB_PORT, "/health", "vulnerable-lab"],
      [e2ePorts.SECURE_LAB_PORT, "/health", "secure-lab"],
    ] as const) {
      const response = await request.get("http://" + host + ":" + port + path);
      expect(response.ok()).toBe(true);
      expect(await response.json()).toMatchObject({
        ok: true,
        data: { status: "ok", service },
      });
    }
  }
});
