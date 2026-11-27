import type {
  ApiResponse,
  DashboardSummary,
  HealthObservation,
  LabMetadata,
} from "@xss-lab/shared-types";

declare const __MANAGEMENT_API_PORT__: number;
const localHosts = ["localhost", "127.0.0.1", "[::1]"];
const serviceIds = ["api", "vulnerable-lab", "secure-lab"];
const slugs = ["reflected", "stored", "dom"];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function timestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

function lab(value: unknown): value is LabMetadata {
  return (
    record(value) &&
    typeof value.id === "string" &&
    /^LAB-\d+$/.test(value.id) &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    value.title.length <= 120 &&
    typeof value.slug === "string" &&
    slugs.includes(value.slug)
  );
}

function observation(value: unknown): value is HealthObservation {
  if (
    !record(value) ||
    typeof value.service !== "string" ||
    !serviceIds.includes(value.service)
  )
    return false;
  if (value.status === "unknown") return value.observedAt === null;
  return (
    (value.status === "healthy" ||
      value.status === "unhealthy" ||
      value.status === "unreachable") &&
    timestamp(value.observedAt)
  );
}

export function isDashboardResponse(
  value: unknown,
): value is Extract<ApiResponse<DashboardSummary>, { ok: true }> {
  if (!record(value) || value.ok !== true || !record(value.data)) return false;
  const { catalog, statistics, services, availability, observedAt } =
    value.data;
  if (!Array.isArray(catalog) || !catalog.every(lab)) return false;
  const categoryCount = new Set(catalog.map(({ slug }) => slug)).size;
  return (
    new Set(catalog.map(({ id }) => id)).size === catalog.length &&
    categoryCount === catalog.length &&
    record(statistics) &&
    statistics.labCount === catalog.length &&
    statistics.categoryCount === categoryCount &&
    Array.isArray(services) &&
    services.length === serviceIds.length &&
    services.every(observation) &&
    new Set(services.map(({ service }) => service)).size ===
      serviceIds.length &&
    record(availability) &&
    availability.progress === "unavailable" &&
    availability.activity === "unavailable" &&
    timestamp(observedAt)
  );
}

export const browserTimeoutMs = 3500;
export async function loadSummary(
  signal: AbortSignal,
): Promise<DashboardSummary> {
  const { hostname, protocol } = window.location;
  if (protocol !== "http:" || !localHosts.includes(hostname)) {
    throw new Error("Dashboard chỉ kết nối Management API trên loopback HTTP.");
  }
  let response: Response;
  try {
    response = await fetch(
      "http://" +
        hostname +
        ":" +
        __MANAGEMENT_API_PORT__ +
        "/api/dashboard/summary",
      {
        signal,
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
      },
    );
  } catch {
    if (signal.aborted) throw signal.reason;
    throw new Error(
      "Không thể kết nối Management API. Hãy kiểm tra dịch vụ cục bộ.",
    );
  }
  if (!response.ok)
    throw new Error("Management API không thể trả kết quả lúc này.");
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    if (signal.aborted) throw signal.reason;
    throw new Error("Phản hồi Management API không hợp lệ.");
  }
  if (!isDashboardResponse(payload))
    throw new Error("Phản hồi Management API không hợp lệ.");
  return payload.data;
}
