import {
  addErrorHandlers,
  createLocalApp,
} from "../../../packages/shared-config/src/http.ts";
import { routes } from "./routes/index.ts";
export function createApi(port: number) {
  const app = createLocalApp("api", port, true);
  app.use("/api", routes);
  addErrorHandlers(app);
  return app;
}
