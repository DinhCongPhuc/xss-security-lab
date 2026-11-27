import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import {
  localAuthorities,
  webPort,
} from "../../packages/shared-config/src/network.ts";

function localRequests(): Plugin {
  return {
    name: "local-requests",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const hosts = localAuthorities(webPort);
        const host = request.headers.host?.toLowerCase();
        const origin = request.headers.origin;
        if (
          !host ||
          !hosts.includes(host) ||
          (origin && origin !== "http://" + host)
        ) {
          response.statusCode = 403;
          response.end("Local requests only");
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [localRequests(), react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    host: "127.0.0.1",
    port: webPort,
    strictPort: true,
    cors: false,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    },
  },
});
