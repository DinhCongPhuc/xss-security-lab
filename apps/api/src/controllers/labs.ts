import type { Request, Response } from "express";
import { sendData } from "../../../../packages/shared-config/src/http.ts";
import { catalog } from "../services/catalog.ts";
export function getLabs(_request: Request, response: Response) {
  sendData(response, catalog);
}
