import { readPort } from "@xss-lab/shared-config/network";

export const e2ePorts = {
  WEB_PORT: readPort(process.env.E2E_WEB_PORT, 15173),
  API_PORT: readPort(process.env.E2E_API_PORT, 13000),
  VULNERABLE_LAB_PORT: readPort(process.env.E2E_VULNERABLE_LAB_PORT, 13001),
  SECURE_LAB_PORT: readPort(process.env.E2E_SECURE_LAB_PORT, 13002),
};
