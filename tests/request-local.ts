import { once } from "node:events";
import { createServer, type RequestListener } from "node:http";
import request from "supertest";
import { onTestFinished } from "vitest";

export async function requestLocal(app: RequestListener) {
  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  onTestFinished(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );
  return request(server);
}
