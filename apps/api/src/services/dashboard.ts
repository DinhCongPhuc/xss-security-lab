import { get } from "node:http";
import { loopbacks, readPort } from "@xss-lab/shared-config/network";
import type {
  DashboardSummary,
  HealthObservation,
  HealthStatus,
  ServiceId,
} from "@xss-lab/shared-types";
import { catalog } from "./catalog.ts";

export interface HealthConfig {
  host: (typeof loopbacks)[number];
  api: number;
  vulnerable: number;
  secure: number;
}

const services = [
  { id: "api", key: "api", path: "/api/health", mode: undefined },
  {
    id: "vulnerable-lab",
    key: "vulnerable",
    path: "/health",
    mode: "vulnerable",
  },
  { id: "secure-lab", key: "secure", path: "/health", mode: "secure" },
] as const;

function observe(
  host: HealthConfig["host"],
  port: number,
  service: (typeof services)[number],
): Promise<HealthObservation> {
  return new Promise((resolve) => {
    const finish = (status: HealthStatus) =>
      resolve({
        service: service.id,
        status,
        observedAt: new Date().toISOString(),
      });
    const request = get(
      {
        hostname: host,
        port,
        path: service.path,
        agent: false,
        signal: AbortSignal.timeout(800),
        headers: { Accept: "application/json" },
      },
      (response) => {
        // node:http does not follow redirects. Reject unexpected metadata before reading the body.
        if (
          response.statusCode !== 200 ||
          !/^application\/json(?:;|$)/i.test(
            response.headers["content-type"] ?? "",
          )
        ) {
          finish("unhealthy");
          response.destroy();
          return;
        }
        let bytes = 0;
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > 4096) {
            finish("unhealthy");
            response.destroy();
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            const valid =
              body?.ok === true &&
              body.data?.status === "ok" &&
              body.data.service === service.id &&
              body.data.mode === service.mode;
            finish(valid ? "healthy" : "unhealthy");
          } catch {
            finish("unhealthy");
          }
        });
        response.on("error", () => finish("unreachable"));
        response.on("aborted", () => finish("unreachable"));
      },
    );
    request.on("error", () => finish("unreachable"));
  });
}

export function createDashboardSummary(config?: HealthConfig) {
  // Capture configuration once, independently of all request data.
  const targets = config && {
    host: config.host,
    api: readPort(String(config.api), 3000),
    vulnerable: readPort(String(config.vulnerable), 3001),
    secure: readPort(String(config.secure), 3002),
  };
  if (targets && !loopbacks.includes(targets.host))
    throw new Error("Health targets must use a configured loopback address");

  async function collect(): Promise<DashboardSummary> {
    const observations = await Promise.all(
      services.map((service) =>
        targets
          ? observe(targets.host, targets[service.key], service)
          : {
              service: service.id satisfies ServiceId,
              status: "unknown" as const,
              observedAt: null,
            },
      ),
    );
    return {
      catalog,
      statistics: {
        labCount: catalog.length,
        categoryCount: new Set(catalog.map(({ slug }) => slug)).size,
      },
      services: observations,
      availability: { progress: "unavailable", activity: "unavailable" },
      observedAt: new Date().toISOString(),
    };
  }

  let inFlight: Promise<DashboardSummary> | undefined;
  return () => {
    if (inFlight) return inFlight;

    // Publish the flight before starting any probes. Caller lifetimes are independent.
    const flight = Promise.resolve()
      .then(collect)
      .finally(() => {
        if (inFlight === flight) inFlight = undefined;
      });
    inFlight = flight;
    return flight;
  };
}
