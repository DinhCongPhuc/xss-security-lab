import { resolve } from "node:path";
import { readPort } from "../../../../packages/shared-config/src/network.ts";
export function apiConfig(env = process.env) {
  return {
    port: readPort(env.API_PORT, 3000),
    filename: resolve(env.DATA_DIR ?? "data", "management.db"),
  };
}
