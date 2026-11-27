import { Router } from "express";
import { sendData, validateRead } from "@xss-lab/shared-config/http";
import { getLabs } from "../controllers/labs.ts";
import { dashboardController } from "../controllers/dashboard.ts";
import type { DashboardSummary } from "@xss-lab/shared-types";

export function createRoutes(summary: () => Promise<DashboardSummary>) {
  const routes = Router();
  routes.get("/health", validateRead, (_request, response) =>
    sendData(response, { status: "ok", service: "api" }),
  );
  routes.get("/labs", validateRead, getLabs);
  routes.get("/dashboard/summary", validateRead, dashboardController(summary));
  return routes;
}
