import { resolve } from "node:path";
import { readPort } from "@xss-lab/shared-config/network";
export function apiConfig(env = process.env) {
  return {
    port: readPort(env.API_PORT, 3000),
    filename: resolve(env.DATA_DIR ?? "data", "management.db"),
  };
}
