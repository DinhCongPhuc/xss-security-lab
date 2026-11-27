import { addErrorHandlers, createLocalApp } from "@xss-lab/shared-config/http";
import { routes } from "./routes/index.ts";
import { webPort } from "@xss-lab/shared-config/network";
export function createApi(port: number, frontendPort = webPort) {
  const app = createLocalApp("api", port, frontendPort);
  app.use("/api", routes);
  addErrorHandlers(app);
  return app;
}
