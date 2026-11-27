import { createLabApp } from "@xss-lab/shared-config/lab";
export function createVulnerableLab(port: number) {
  return createLabApp("vulnerable", port);
}
