import { resolve } from "node:path";
import { readPort } from "@xss-lab/shared-config/network";
export function vulnerableConfig(env = process.env) {
  return {
    port: readPort(env.VULNERABLE_LAB_PORT, 3001),
    filename: resolve(env.DATA_DIR ?? "data", "vulnerable.db"),
  };
}
