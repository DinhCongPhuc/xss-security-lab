import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173" },
  webServer: {
    command: "npm run dev",
    wait: { stdout: /services_ready/ },
    env: {
      DATA_DIR: "test-results/databases",
      API_PORT: "3000",
      VULNERABLE_LAB_PORT: "3001",
      SECURE_LAB_PORT: "3002",
    },
    timeout: 45_000,
  },
});
