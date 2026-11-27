import type { Request, Response } from "express";
import { sendData } from "@xss-lab/shared-config/http";
import { catalog } from "../services/catalog.ts";
export function getLabs(_request: Request, response: Response) {
  sendData(response, catalog);
}
