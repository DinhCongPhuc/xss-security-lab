import { createLabApp } from "@xss-lab/shared-config/lab";
export function createSecureLab(port: number) {
  return createLabApp("secure", port);
}
