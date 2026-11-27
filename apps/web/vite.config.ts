import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import {
  localAuthorities,
  readPort,
  webPort,
} from "@xss-lab/shared-config/network";

const root = fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);
const fontDirectories = ["inter", "jetbrains-mono"].map((font) =>
  dirname(require.resolve("@fontsource-variable/" + font + "/index.css")),
);

function localRequests(): Plugin {
  return {
    name: "local-requests",
    configureServer(server) {
      const hosts = localAuthorities(server.config.server.port);
      server.middlewares.use((request, response, next) => {
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
  publicDir: false,
  define: {
    __MANAGEMENT_API_PORT__: JSON.stringify(
      readPort(process.env.API_PORT, 3000),
    ),
  },
  resolve: { alias: { "@": resolve(root, "src") } },
  server: {
    host: "127.0.0.1",
    port: readPort(process.env.WEB_PORT, webPort),
    strictPort: true,
    cors: false,
    fs: {
      strict: true,
      allow: [
        resolve(root, "index.html"),
        resolve(root, "src"),
        ...fontDirectories,
      ],
      // Vite replaces its defaults when deny is supplied. Keep all four defaults.
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem}",
        "**/.git/**",
        "**/*.{db,sqlite,sqlite3}{,-*}",
        "**/{data,runtime,private,test-results,playwright-report}/**",
      ],
    },
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    },
  },
});
