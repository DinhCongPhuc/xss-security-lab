import { defineConfig, devices } from "@playwright/test";
import { e2ePorts } from "./tests/e2e-ports.ts";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/start-e2e.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:" + e2ePorts.WEB_PORT,
  },
});
