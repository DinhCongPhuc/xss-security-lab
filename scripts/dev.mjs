import { createServer as createHttpServer } from "node:http";
import { mkdirSync, realpathSync } from "node:fs";
import { createServer as createViteServer } from "vite";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { createApi } from "@xss-lab/api/app";
import { apiConfig } from "@xss-lab/api/config";
import { managementMigrations } from "@xss-lab/api/migrations";
import { seedCatalog } from "@xss-lab/api/repository";
import { createSecureLab } from "@xss-lab/secure-lab/app";
import { secureConfig } from "@xss-lab/secure-lab/config";
import { createVulnerableLab } from "@xss-lab/vulnerable-lab/app";
import { vulnerableConfig } from "@xss-lab/vulnerable-lab/config";
import {
  commentMigrations,
  initializeDatabase,
} from "@xss-lab/shared-config/database";
import { loopbacks, readPort, webPort } from "@xss-lab/shared-config/network";

const databases = [];
const servers = [];
const shutdown = Promise.withResolvers();
let stopping = false;
function stop() {
  stopping = true;
  shutdown.resolve();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
if (typeof process.send === "function") {
  if (process.connected) process.once("disconnect", stop);
  else stop();
}

async function start() {
  if (stopping) return;
  const frontendPort = readPort(process.env.WEB_PORT, webPort);
  const api = apiConfig();
  const vulnerable = vulnerableConfig();
  const secure = secureConfig();
  if (
    new Set([frontendPort, api.port, vulnerable.port, secure.port]).size !== 4
  ) {
    throw new Error("Each service requires a distinct port");
  }
  const dataDirectory = resolve(process.env.DATA_DIR ?? "data");
  const servedRoots = ["apps/web", "node_modules"].map((path) =>
    realpathSync(path),
  );
  function assertPrivateDirectory(directory) {
    for (const root of servedRoots) {
      const path = relative(root, directory);
      if (
        path === "" ||
        (!isAbsolute(path) && path !== ".." && !path.startsWith(".." + sep))
      ) {
        throw new Error(
          "DATA_DIR must be outside the frontend and its dependencies",
        );
      }
    }
  }
  assertPrivateDirectory(dataDirectory);
  mkdirSync(dataDirectory, { recursive: true });
  assertPrivateDirectory(realpathSync(dataDirectory));

  const management = initializeDatabase(api.filename, managementMigrations);
  databases.push(management);
  seedCatalog(management);
  for (const config of [vulnerable, secure]) {
    databases.push(initializeDatabase(config.filename, commentMigrations));
  }

  for (const [index, host] of loopbacks.entries()) {
    for (const [config, createApp] of [
      [api, (port) => createApi(port, frontendPort)],
      [vulnerable, createVulnerableLab],
      [secure, createSecureLab],
    ]) {
      if (stopping) return;
      const server = createHttpServer(createApp(config.port));
      servers.push(
        () =>
          new Promise((done) => {
            server.close(done);
            server.closeAllConnections();
          }),
      );
      await new Promise((ready, fail) => {
        server.once("error", fail);
        server.listen(config.port, host, ready);
      });
    }
    if (stopping) return;
    const vite = await createViteServer({
      root: resolve("apps/web"),
      cacheDir: resolve(
        "node_modules/.vite",
        "web-" + frontendPort + "-" + index,
      ),
      server: { host, port: frontendPort },
    });
    servers.push(() => vite.close());
    if (stopping) return;
    await vite.listen();
  }
  if (!stopping) {
    const ready = {
      event: "services_ready",
      webPort: frontendPort,
      apiPort: api.port,
      vulnerablePort: vulnerable.port,
      securePort: secure.port,
      hosts: loopbacks,
    };
    console.info(JSON.stringify(ready));
    if (process.connected) process.send(ready);
  }
}

try {
  await start();
  await shutdown.promise;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  const closed = await Promise.allSettled(
    servers.map(async (close) => close()),
  );
  for (const result of closed) {
    if (result.status === "rejected") {
      console.error(result.reason);
      process.exitCode = 1;
    }
  }
  for (const database of databases) database.close();
  if (process.connected) process.disconnect();
}
