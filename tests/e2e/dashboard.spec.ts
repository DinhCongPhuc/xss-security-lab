import { expect, test, type Page } from "@playwright/test";
import { e2ePorts } from "../e2e-ports.ts";

const summaryPath = "**/api/dashboard/summary";
const headers = {
  "access-control-allow-origin": "http://localhost:" + e2ePorts.WEB_PORT,
};
const observedAt = "2026-11-27T12:00:00.000Z";
const fixture = {
  ok: true,
  data: {
    catalog: [{ id: "LAB-03", slug: "dom", title: "DOM-based XSS" }],
    statistics: { labCount: 1, categoryCount: 1 },
    services: [
      { service: "api", status: "healthy", observedAt },
      { service: "vulnerable-lab", status: "unreachable", observedAt },
      { service: "secure-lab", status: "unhealthy", observedAt },
    ],
    availability: { progress: "unavailable", activity: "unavailable" },
    observedAt,
  },
};
const catalog = (page: Page) =>
  page.getByRole("region", { name: "Danh mục Lab" });
const health = (page: Page) =>
  page.getByRole("region", { name: "Trạng thái dịch vụ" });

test("real Dashboard shows catalog and live health on both address families", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    await page.goto("http://" + host + ":" + e2ePorts.WEB_PORT + "/");
    const labs = catalog(page);
    await expect(labs.getByRole("link")).toHaveCount(3);
    for (const [id, title] of [
      ["LAB-01", "Reflected XSS"],
      ["LAB-02", "Stored XSS"],
      ["LAB-03", "DOM-based XSS"],
    ]) {
      await expect(labs.getByText(id!)).toBeVisible();
      await expect(labs.getByRole("heading", { name: title! })).toBeVisible();
    }
    await expect(
      health(page).getByText("Phản hồi hợp lệ", { exact: true }),
    ).toHaveCount(3);
    await expect(
      page.getByRole("region", { name: "Chỉ số tổng quan" }).getByText("3/3"),
    ).toBeVisible();
    await expect(page.getByText("Chưa hỗ trợ", { exact: true })).toBeVisible();
    await expect(page.getByText("Chưa có dữ liệu hoạt động")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("mocked initial loading sends one request and displays partial failures", async ({
  page,
}) => {
  const release = Promise.withResolvers<void>();
  let calls = 0;
  await page.route(summaryPath, async (route) => {
    calls++;
    await release.promise;
    await route.fulfill({ json: fixture, headers });
  });
  try {
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveText(
      /Đang tải dữ liệu tổng quan/,
    );
    await expect(page.getByRole("button", { name: "Làm mới" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(
      page.getByRole("link", { name: "Kiến thức nền tảng" }),
    ).toBeVisible();
  } finally {
    release.resolve();
  }
  await expect(catalog(page).getByText("LAB-03")).toBeVisible();
  expect(calls).toBe(1);
  await expect(
    health(page).getByText("Không kết nối được", { exact: true }),
  ).toBeVisible();
  await expect(
    health(page).getByText("Phản hồi không hợp lệ", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Một số dịch vụ", { exact: false }),
  ).toBeVisible();
});

test("mocked outage supports keyboard retry, stale refresh and recovery without reloading", async ({
  page,
}) => {
  let calls = 0;
  await page.route(summaryPath, async (route) => {
    calls++;
    if (calls === 1) await route.abort();
    else if (calls === 3) await route.fulfill({ status: 503, headers });
    else await route.fulfill({ json: fixture, headers });
  });
  let loads = 0;
  page.on("domcontentloaded", () => loads++);
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Không thể kết nối Management API",
  );
  await expect(
    page
      .getByRole("region", { name: "Truy cập nhanh" })
      .getByRole("link", { name: /Nhật ký bảo mật/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thử lại" }).focus();
  await page.keyboard.press("Enter");
  await expect(catalog(page).getByText("LAB-03")).toBeVisible();
  await expect(page.getByRole("button", { name: "Làm mới" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toContainText(
    "Không thể làm mới tổng quan",
  );
  await expect(page.getByRole("status")).toContainText("Dữ liệu cũ");
  await expect(catalog(page).getByText("LAB-03")).toBeVisible();
  await page.getByRole("button", { name: "Làm mới" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("status")).not.toContainText("Dữ liệu cũ");
  expect(calls).toBe(4);
  expect(loads).toBe(1);
});

test("mocked malformed data is rejected and an empty catalog displays zero", async ({
  page,
}) => {
  let calls = 0;
  await page.route(summaryPath, async (route) => {
    calls++;
    const json =
      calls === 1
        ? { ok: true, data: { catalog: "malformed" } }
        : {
            ...fixture,
            data: {
              ...fixture.data,
              catalog: [],
              statistics: { labCount: 0, categoryCount: 0 },
            },
          };
    await route.fulfill({ json, headers });
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Phản hồi Management API không hợp lệ",
  );
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(catalog(page).getByText("Danh mục Lab trống")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Chỉ số tổng quan" })
      .getByText("0", { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText("Chưa hỗ trợ", { exact: true })).toBeVisible();
});

test("duplicate Lab slugs follow the malformed-response path and allow retry", async ({
  page,
}) => {
  let calls = 0;
  await page.route(summaryPath, async (route) => {
    const json =
      ++calls === 1
        ? {
            ...fixture,
            data: {
              ...fixture.data,
              catalog: [
                ...fixture.data.catalog,
                { id: "LAB-99", slug: "dom", title: "Duplicate fixture" },
              ],
              statistics: { labCount: 2, categoryCount: 1 },
            },
          }
        : fixture;
    await route.fulfill({ json, headers });
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Phản hồi Management API không hợp lệ",
  );
  await expect(catalog(page).getByRole("link")).toHaveCount(0);
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(catalog(page).getByText("LAB-03")).toBeVisible();
  expect(calls).toBe(2);
});

test("mocked stalled request times out, and navigation cancels a pending request", async ({
  page,
}) => {
  const release = Promise.withResolvers<void>();
  await page.route(summaryPath, async (route) => {
    await release.promise;
    await route.abort().catch(() => {});
  });
  try {
    await page.goto("/");
    await expect(page.getByRole("alert")).toContainText(
      "Đã hết thời gian chờ",
      { timeout: 6500 },
    );
    const retryRequest = page.waitForRequest(summaryPath);
    await page.getByRole("button", { name: "Thử lại" }).click();
    const pending = await retryRequest;
    await expect(page.getByRole("status")).toContainText("Đang tải");
    const cancelled = page.waitForEvent("requestfailed", {
      predicate: (request) => request === pending,
      timeout: 2500,
    });
    await page.getByRole("link", { name: "Kiến thức nền tảng" }).click();
    expect((await cancelled).failure()).not.toBeNull();
    await expect(page).toHaveURL(/\/knowledge$/);
    await expect(page.getByRole("main")).toBeFocused();
  } finally {
    release.resolve();
  }
});

test("Dashboard fits the seven viewports and links target existing modules", async ({
  page,
}) => {
  await page.goto("/");
  await expect(catalog(page).getByRole("link")).toHaveCount(3);
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
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
  const quick = page.getByRole("region", { name: "Truy cập nhanh" });
  for (const path of [
    "/knowledge",
    "/attack-lab",
    "/defense-lab",
    "/code-analysis",
    "/logs",
    "/reports",
  ]) {
    await expect(quick.locator('a[href="' + path + '"]')).toBeVisible();
  }
  await catalog(page)
    .getByRole("link", { name: /Reflected XSS/ })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/attack-lab\/reflected$/);
  await expect(page.getByRole("main")).toBeFocused();
});
