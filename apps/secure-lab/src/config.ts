import { resolve } from "node:path";
import { readPort } from "../../../packages/shared-config/src/network.ts";
export function secureConfig(env = process.env) {
  return {
    port: readPort(env.SECURE_LAB_PORT, 3002),
    filename: resolve(env.DATA_DIR ?? "data", "secure.db"),
  };
}
