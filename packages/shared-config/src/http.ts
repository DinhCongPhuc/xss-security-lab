import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { localAuthorities, webPort } from "./network.ts";
import type { ApiResponse } from "../../shared-types/src/index.ts";

export function sendData<T>(response: Response, data: T) {
  response.json({ ok: true, data } satisfies ApiResponse<T>);
}

function sendError(
  response: Response,
  status: number,
  code: string,
  message: string,
) {
  response
    .status(status)
    .json({ ok: false, error: { code, message } } satisfies ApiResponse<never>);
}

export function createLocalApp(
  service: string,
  port: number,
  allowWeb = false,
) {
  const app = express();
  app.disable("x-powered-by");
  const hosts = localAuthorities(port);
  const webOrigins = localAuthorities(webPort).map((host) => "http://" + host);
  app.use((request, response, next) => {
    response.once("finish", () => {
      console.info(
        JSON.stringify({
          service,
          method: request.method,
          status: response.statusCode,
        }),
      );
    });
    response.set({
      "Content-Security-Policy":
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
    });
    const host = request.get("host")?.toLowerCase();
    if (!host || !hosts.includes(host)) {
      return sendError(
        response,
        403,
        "HOST_DENIED",
        "Host is outside the local allowlist",
      );
    }
    const origin = request.get("origin");
    if (allowWeb) response.vary("Origin");
    if (origin && origin !== "http://" + host) {
      if (!allowWeb || !webOrigins.includes(origin)) {
        return sendError(
          response,
          403,
          "ORIGIN_DENIED",
          "Origin is outside the local allowlist",
        );
      }
      response.set("Access-Control-Allow-Origin", origin);
    }
    next();
  });
  return app;
}

export function validateRead(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (
    Object.keys(request.query).length ||
    request.get("transfer-encoding") ||
    (request.get("content-length") && request.get("content-length") !== "0")
  ) {
    return sendError(
      response,
      400,
      "INVALID_REQUEST",
      "This endpoint accepts no query or body",
    );
  }
  next();
}

export function addErrorHandlers(app: ReturnType<typeof createLocalApp>) {
  app.use((_request, response) =>
    sendError(response, 404, "NOT_FOUND", "Endpoint not found"),
  );
  const handleError: ErrorRequestHandler = (
    error,
    _request,
    response,
    next,
  ) => {
    if (response.headersSent) return next(error);
    console.error(
      JSON.stringify({
        event: "request_error",
        name: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    sendError(response, 500, "INTERNAL_ERROR", "Unexpected server error");
  };
  app.use(handleError);
}
