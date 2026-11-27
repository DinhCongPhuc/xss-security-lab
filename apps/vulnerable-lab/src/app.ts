import { createLabApp } from "../../../packages/shared-config/src/lab.ts";
export function createVulnerableLab(port: number) {
  return createLabApp("vulnerable", port);
}
