import { createLabApp } from "../../../packages/shared-config/src/lab.ts";
export function createSecureLab(port: number) {
  return createLabApp("secure", port);
}
