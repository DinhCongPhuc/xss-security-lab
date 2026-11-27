import { expect, test } from "vitest";
import { isDashboardResponse } from "../../apps/web/src/features/dashboard/services/summary.ts";

const observedAt = "2026-11-27T12:00:00.000Z";
const valid = {
  ok: true,
  data: {
    catalog: [{ id: "LAB-1", slug: "dom", title: "DOM fixture" }],
    statistics: { labCount: 1, categoryCount: 1 },
    services: ["api", "vulnerable-lab", "secure-lab"].map((service) => ({
      service,
      status: "unknown",
      observedAt: null,
    })),
    availability: { progress: "unavailable", activity: "unavailable" },
    observedAt,
  },
};

test("summary parser accepts actual counts and an empty catalog as zero", () => {
  expect(isDashboardResponse(valid)).toBe(true);
  expect(
    isDashboardResponse({
      ...valid,
      data: {
        ...valid.data,
        catalog: [],
        statistics: { labCount: 0, categoryCount: 0 },
      },
    }),
  ).toBe(true);
});

test("summary parser rejects inconsistent counts, unsafe slugs and invalid health evidence", () => {
  for (const data of [
    { ...valid.data, statistics: { labCount: 999, categoryCount: 1 } },
    {
      ...valid.data,
      catalog: [{ ...valid.data.catalog[0], slug: "//external.invalid" }],
    },
    { ...valid.data, services: Array(3).fill(valid.data.services[0]) },
    {
      ...valid.data,
      services: valid.data.services.map((service) => ({
        ...service,
        status: "healthy",
      })),
    },
    { ...valid.data, observedAt: "not a timestamp" },
    { ...valid.data, availability: { progress: 0, activity: "unavailable" } },
  ])
    expect(isDashboardResponse({ ok: true, data })).toBe(false);
  expect(
    isDashboardResponse({ ok: false, error: { code: "INTERNAL_ERROR" } }),
  ).toBe(false);
});

test("summary parser rejects two distinct lab IDs sharing an otherwise valid slug", () => {
  expect(
    isDashboardResponse({
      ...valid,
      data: {
        ...valid.data,
        catalog: [
          { id: "LAB-01", slug: "reflected", title: "First" },
          { id: "LAB-02", slug: "reflected", title: "Second" },
        ],
        statistics: { labCount: 2, categoryCount: 1 },
      },
    }),
  ).toBe(false);
});
