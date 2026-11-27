import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Alert } from "../../apps/web/src/components/ui/primitives.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../apps/web/src/components/common/page.tsx";
import {
  routePages,
  routeTrail,
} from "../../apps/web/src/config/navigation.ts";

test("Alert is silent by default, announces on request and preserves explicit roles", () => {
  const render = (props: Parameters<typeof Alert>[0]) =>
    renderToStaticMarkup(createElement(Alert, props, "Thông báo mẫu"));
  expect(render({})).not.toContain("role=");
  expect(render({ announce: true })).toContain('role="alert"');
  expect(render({ role: "status" })).toContain('role="status"');
  const explicit = render({ role: "status", announce: true });
  expect(explicit).toContain('role="status"');
  expect(explicit).not.toContain('role="alert"');
});

test("routes are unique and only real Attack Lab children resolve to a parent trail", () => {
  expect(new Set(routePages.map(({ path }) => path)).size).toBe(
    routePages.length,
  );
  expect(routeTrail("/attack-lab/dom/").map(({ title }) => title)).toEqual([
    "Attack Lab",
    "DOM-based XSS",
  ]);
  expect(routeTrail("/attack-lab/missing")).toEqual([]);
  expect(routeTrail("/").map(({ title }) => title)).toEqual(["Tổng quan"]);
});

test("shared UI states preserve their status, alert and recovery semantics", () => {
  const loading = renderToStaticMarkup(
    createElement(LoadingState, { label: "Đang tải mẫu" }),
  );
  expect(loading).toContain('role="status"');
  expect(loading).toContain("Đang tải mẫu");
  const props = {
    title: "Trạng thái mẫu",
    description: "Dữ liệu tổng hợp",
    action: createElement("button", {}, "Thử lại"),
  };
  const error = renderToStaticMarkup(createElement(ErrorState, props));
  expect(error).toContain('role="alert"');
  expect(error).toContain("Thử lại");
  const empty = renderToStaticMarkup(createElement(EmptyState, props));
  expect(empty).toContain("Dữ liệu tổng hợp");
  expect(empty).toContain("Thử lại");
  expect(empty).not.toContain('role="alert"');
});
