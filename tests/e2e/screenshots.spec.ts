import { expect, test } from "@playwright/test";

test("capture project 08 visual evidence when requested", async ({ page }) => {
  test.skip(
    process.env.CAPTURE_PROJECT_08 !== "1",
    "Opt-in screenshot capture",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  await page.screenshot({
    path: "screenshots/project-08-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Thu gọn thanh điều hướng" }).click();
  await page.screenshot({
    path: "screenshots/project-08-collapsed.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/attack-lab");
  await expect(
    page.getByRole("heading", { name: "Attack Lab", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "screenshots/project-08-tablet.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở điều hướng" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "screenshots/project-08-mobile.png" });
});
