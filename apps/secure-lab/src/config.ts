import { resolve } from "node:path";
import { readPort } from "@xss-lab/shared-config/network";
export function secureConfig(env = process.env) {
  return {
    port: readPort(env.SECURE_LAB_PORT, 3002),
    filename: resolve(env.DATA_DIR ?? "data", "secure.db"),
  };
}
