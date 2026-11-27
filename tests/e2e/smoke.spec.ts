import { expect, test } from "@playwright/test";

test("shell renders and navigation works without page errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
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
    const web = await request.get("http://" + host + ":5173/");
    expect(web.ok()).toBe(true);
    for (const [port, path, service] of [
      [3000, "/api/health", "api"],
      [3001, "/health", "vulnerable-lab"],
      [3002, "/health", "secure-lab"],
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
