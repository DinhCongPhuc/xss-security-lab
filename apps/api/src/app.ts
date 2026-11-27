import { addErrorHandlers, createLocalApp } from "@xss-lab/shared-config/http";
import { createRoutes } from "./routes/index.ts";
import { webPort } from "@xss-lab/shared-config/network";
import {
  createDashboardSummary,
  type HealthConfig,
} from "./services/dashboard.ts";
export function createApi(
  port: number,
  frontendPort = webPort,
  health?: Omit<HealthConfig, "api">,
) {
  const app = createLocalApp("api", port, frontendPort);
  app.use(
    "/api",
    createRoutes(createDashboardSummary(health && { ...health, api: port })),
  );
  addErrorHandlers(app);
  return app;
}
