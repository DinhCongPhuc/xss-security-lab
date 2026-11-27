import { Router } from "express";
import {
  sendData,
  validateRead,
} from "../../../../packages/shared-config/src/http.ts";
import { getLabs } from "../controllers/labs.ts";
export const routes = Router();
routes.get("/health", validateRead, (_request, response) =>
  sendData(response, { status: "ok", service: "api" }),
);
routes.get("/labs", validateRead, getLabs);
