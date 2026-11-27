import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { resolve } from "node:path";
import { createApi } from "../apps/api/src/app.ts";
import { apiConfig } from "../apps/api/src/config/index.ts";
import { managementMigrations } from "../apps/api/src/database/migrations.ts";
import { seedCatalog } from "../apps/api/src/repositories/labs.ts";
import { createSecureLab } from "../apps/secure-lab/src/app.ts";
import { secureConfig } from "../apps/secure-lab/src/config.ts";
import { createVulnerableLab } from "../apps/vulnerable-lab/src/app.ts";
import { vulnerableConfig } from "../apps/vulnerable-lab/src/config.ts";
import {
  commentMigrations,
  initializeDatabase,
} from "../packages/shared-config/src/database.ts";
import { loopbacks, webPort } from "../packages/shared-config/src/network.ts";

const databases = [];
const servers = [];
let stopping = false;

async function stop() {
  if (stopping) return;
  stopping = true;
  const closing = servers.map((server) => {
    if ("httpServer" in server) return server.close();
    return new Promise((resolveClose) => {
      server.close(resolveClose);
      server.closeAllConnections();
    });
  });
  await Promise.allSettled(closing);
  for (const database of databases) database.close();
}

const api = apiConfig();
const vulnerable = vulnerableConfig();
const secure = secureConfig();

try {
  if (new Set([webPort, api.port, vulnerable.port, secure.port]).size !== 4) {
    throw new Error("Each service requires a distinct port");
  }
  const management = initializeDatabase(api.filename, managementMigrations);
  databases.push(management);
  seedCatalog(management);
  for (const config of [vulnerable, secure]) {
    databases.push(initializeDatabase(config.filename, commentMigrations));
  }
  for (const host of loopbacks) {
    for (const [config, createApp] of [
      [api, createApi],
      [vulnerable, createVulnerableLab],
      [secure, createSecureLab],
    ]) {
      const server = createHttpServer(createApp(config.port));
      servers.push(server);
      await new Promise((resolveListen, reject) => {
        server.once("error", reject);
        server.listen(config.port, host, resolveListen);
      });
    }
    const vite = await createViteServer({
      root: resolve("apps/web"),
      server: { host },
    });
    servers.push(vite);
    await vite.listen();
  }
  console.info(
    JSON.stringify({
      event: "services_ready",
      webPort,
      apiPort: api.port,
      vulnerablePort: vulnerable.port,
      securePort: secure.port,
      hosts: loopbacks,
    }),
  );
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
  await stop();
}
