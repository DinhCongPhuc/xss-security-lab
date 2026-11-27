import { expect, test } from "@playwright/test";

test("desktop navigation collapses, exposes a keyboard tooltip and restores the preference", async ({
  page,
}) => {
  await page.goto("/attack-lab/reflected");
  const sidebar = page.getByRole("complementary", { name: "Thanh bên" });
  const toggle = page.getByRole("button", { name: "Thu gọn thanh điều hướng" });
  await expect(
    sidebar.getByRole("link", { name: "Reflected XSS" }),
  ).toHaveAttribute("aria-current", "page");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Mở rộng thanh điều hướng" }),
  ).toHaveAttribute("aria-expanded", "false");
  await sidebar.getByRole("link", { name: "Kiến thức" }).focus();
  await expect(sidebar.getByText("Kiến thức", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Mở rộng thanh điều hướng" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mở rộng thanh điều hướng" }).click();
  await expect(
    sidebar.getByRole("link", { name: "Reflected XSS" }),
  ).toHaveAttribute("aria-current", "page");
});

test("skip link, nested navigation, breadcrumbs and history update route context", async ({
  page,
}) => {
  await page.goto("/attack-lab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Đến nội dung chính" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
  await nav.getByRole("link", { name: "Stored XSS" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveTitle("Stored XSS · XSS Security Lab");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(nav.getByRole("link", { name: "Stored XSS" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const breadcrumb = page.getByRole("navigation", { name: "Đường dẫn" });
  await expect(
    breadcrumb.getByRole("link", { name: "Attack Lab" }),
  ).toHaveAttribute("href", "/attack-lab");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Stored XSS",
  );
  await page.goBack();
  await expect(page).toHaveTitle("Attack Lab · XSS Security Lab");
  await page.goForward();
  await expect(page).toHaveTitle("Stored XSS · XSS Security Lab");
});

test("mobile drawer traps focus, restores it on Escape and closes on navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Mở điều hướng" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Điều hướng" });
  await expect(drawer.getByRole("button", { name: "Đóng" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(drawer.getByRole("link", { name: "Cài đặt" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("button", { name: "Đóng" })).toBeFocused();
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press("Tab");
    expect(
      await drawer.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer.getByRole("link", { name: "DOM-based XSS" }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page).toHaveTitle("DOM-based XSS · XSS Security Lab");
});

test("seven representative viewports fit and reflect reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1280, 720],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [360, 800],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Tổng quan" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if (width < 1024) {
      await page.getByRole("button", { name: "Mở điều hướng" }).click();
      const drawer = page.getByRole("dialog");
      await expect(drawer).toBeVisible();
      const bounds = await drawer.boundingBox();
      expect(bounds?.width).toBeLessThanOrEqual(width);
      expect(bounds?.height).toBeLessThanOrEqual(height);
      expect(
        await drawer.evaluate(
          (element) => getComputedStyle(element).animationDuration,
        ),
      ).toBe("0s");
      await page.keyboard.press("Escape");
    } else {
      await expect(
        page.getByRole("button", { name: "Thu gọn thanh điều hướng" }),
      ).toBeVisible();
    }
  }
});

test("representative contrast pairs meet AA thresholds", async ({ page }) => {
  await page.goto("/");
  const ratios = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    function luminance(token: string) {
      const hex = styles
        .getPropertyValue("--color-" + token)
        .trim()
        .slice(1);
      const channels = [0, 2, 4].map((offset) => {
        const c = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      const [r = 0, g = 0, b = 0] = channels;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    return [
      ["foreground", "background"],
      ["muted-foreground", "surface"],
      ["muted-foreground", "sidebar"],
      ["code", "primary"],
      ["primary", "active"],
      ["focus", "sidebar"],
      ["control", "code"],
    ].map(([a, b]) => {
      const values = [luminance(a!), luminance(b!)].sort((x, y) => y - x);
      return (values[0]! + 0.05) / (values[1]! + 0.05);
    });
  });
  for (const ratio of ratios.slice(0, 5))
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  for (const ratio of ratios.slice(5)) expect(ratio).toBeGreaterThanOrEqual(3);
});

test("drawer hands focus to the desktop toggle only when the breakpoint closes it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Mở điều hướng" });
  const sheet = page.getByRole("dialog", { name: "Điều hướng" });
  await trigger.click();
  await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(sheet).toBeHidden();
  await expect(page.locator("html")).not.toHaveCSS("overflow-y", "hidden");
  const desktop = page.getByRole("button", {
    name: "Thu gọn thanh điều hướng",
  });
  await expect(desktop).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Mở rộng thanh điều hướng" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();

  const main = page.getByRole("main");
  await main.focus();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(main).toBeFocused();
});

test("Sheet wraps around the current visible focus targets after DOM changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Mở điều hướng" });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Điều hướng" });
  const close = sheet.getByRole("button", { name: "Đóng" });
  const settings = sheet.getByRole("link", { name: "Cài đặt" });
  await settings.evaluate((element) => {
    element.style.visibility = "hidden";
  });
  await page.keyboard.press("Shift+Tab");
  await expect(sheet.getByRole("link", { name: "Báo cáo" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await sheet.getByRole("navigation").evaluate((nav) => {
    const disabled = document.createElement("button");
    disabled.disabled = true;
    disabled.textContent = "Disabled fixture";
    nav.append(disabled);
    const inert = document.createElement("div");
    inert.inert = true;
    const hidden = document.createElement("button");
    hidden.textContent = "Inert fixture";
    inert.append(hidden);
    nav.append(inert);
    const hiddenAncestor = document.createElement("div");
    hiddenAncestor.hidden = true;
    hiddenAncestor.append(document.createElement("button"));
    nav.append(hiddenAncestor);
    const updated = document.createElement("button");
    updated.textContent = "Updated fixture";
    nav.append(updated);
  });
  await page.keyboard.press("Shift+Tab");
  await expect(
    sheet.getByRole("button", { name: "Updated fixture" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("390x400 drawer scrolls independently and retains the footer and background position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 400 });
  await page.goto("/");
  const initialY = await page.evaluate(() => {
    window.scrollTo(0, 200);
    return window.scrollY;
  });
  expect(initialY).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Mở điều hướng" }).click();
  const sheet = page.getByRole("dialog");
  const footer = sheet.getByText("Môi trường cục bộ", { exact: true });
  await expect(footer).toBeInViewport({ ratio: 1 });
  await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");
  const nav = sheet.getByRole("navigation");
  await nav.hover();
  await page.mouse.wheel(0, 500);
  await expect
    .poll(() => nav.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await expect(footer).toBeInViewport({ ratio: 1 });
  await page.mouse.move(380, 220);
  await page.mouse.wheel(0, 300);
  await page.evaluate(
    () =>
      new Promise<void>((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done())),
      ),
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(initialY);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(page.locator("html")).not.toHaveCSS("overflow-y", "hidden");
  expect(await page.evaluate(() => window.scrollY)).toBe(initialY);
});

test("Escape dismisses pointer and keyboard tooltips without moving focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Thu gọn thanh điều hướng" }).click();
  const toggle = page.getByRole("button", { name: "Mở rộng thanh điều hướng" });
  await toggle.focus();
  const sidebar = page.getByRole("complementary");
  const link = sidebar.getByRole("link", { name: "Kiến thức" });
  const tooltip = sidebar.getByText("Kiến thức", { exact: true });
  await link.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(toggle).toBeFocused();
  await link.focus();
  // The pointer is still over the same trigger.
  await expect(tooltip).toBeHidden();
  await page.mouse.move(600, 300);
  await expect(tooltip).toBeHidden();
  await toggle.focus();
  await link.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(link).toBeFocused();
});
