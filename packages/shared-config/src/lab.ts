import {
  addErrorHandlers,
  createLocalApp,
  sendData,
  validateRead,
} from "./http.ts";
import type { LabMode } from "../../shared-types/src/index.ts";

export function createLabApp(mode: LabMode, port: number) {
  const title = mode === "vulnerable" ? "Vulnerable Lab" : "Secure Lab";
  const description =
    mode === "vulnerable"
      ? "Cảnh báo: Môi trường giáo dục dự kiến có cấu hình cố ý không an toàn. Chỉ sử dụng cục bộ với dữ liệu mẫu."
      : "Môi trường giáo dục dành cho các biện pháp phòng vệ XSS.";
  const app = createLocalApp(mode + "-lab", port);
  app.get("/", validateRead, (_request, response) => {
    response.type("html")
      .send(`<!doctype html><html lang="vi"><meta charset="utf-8">
      <title>${title} | XSS Security Lab</title><main><h1>${title}</h1><p>${description}</p></main></html>`);
  });
  app.get("/health", validateRead, (_request, response) =>
    sendData(response, { status: "ok", service: mode + "-lab", mode }),
  );
  addErrorHandlers(app);
  return app;
}
