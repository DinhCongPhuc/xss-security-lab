import { expect, test } from "@playwright/test";

test("capture PROJECT-09 Dashboard visual evidence", async ({ page }) => {
  test.skip(
    process.env.CAPTURE_PROJECT_09 !== "1",
    "Opt-in Dashboard screenshot capture",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Danh mục Lab" }).getByRole("link"),
  ).toHaveCount(3);
  await expect(
    page
      .getByRole("region", { name: "Trạng thái dịch vụ" })
      .getByText("Phản hồi hợp lệ", { exact: true }),
  ).toHaveCount(3);
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.screenshot({
      path: "screenshots/project-09-" + name + ".png",
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const release = Promise.withResolvers<void>();
  await page.route("**/api/dashboard/summary", async (route) => {
    await release.promise;
    await route.abort();
  });
  try {
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveText(
      /Đang tải dữ liệu tổng quan/,
    );
    await page.screenshot({
      path: "screenshots/project-09-loading.png",
      fullPage: true,
    });
  } finally {
    release.resolve();
  }
  await expect(page.getByRole("alert")).toContainText(
    "Không thể kết nối Management API",
  );
  await page.screenshot({
    path: "screenshots/project-09-error.png",
    fullPage: true,
  });
});
