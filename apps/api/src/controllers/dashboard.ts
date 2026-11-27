import type { RequestHandler } from "express";
import type { DashboardSummary } from "@xss-lab/shared-types";
import { sendData } from "@xss-lab/shared-config/http";

export function dashboardController(
  summary: () => Promise<DashboardSummary>,
): RequestHandler {
  return async (_request, response) => {
    sendData(response, await summary());
  };
}
