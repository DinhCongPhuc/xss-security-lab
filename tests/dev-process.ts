import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

export type DevPorts = Record<
  "WEB_PORT" | "API_PORT" | "VULNERABLE_LAB_PORT" | "SECURE_LAB_PORT",
  number
>;

export function launchDev(ports: DevPorts, dataDir: string) {
  const child = fork(
    fileURLToPath(new URL("../scripts/dev.mjs", import.meta.url)),
    [],
    {
      execArgv: [],
      env: {
        ...process.env,
        ...Object.fromEntries(
          Object.entries(ports).map(([key, value]) => [key, String(value)]),
        ),
        DATA_DIR: dataDir,
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    },
  );
  let diagnostics = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream?.on("data", (chunk) => {
      diagnostics = (diagnostics + chunk).slice(-8000);
    });
  }
  const exited = new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", resolve);
  });
  const ready = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Dev startup timed out: " + diagnostics)),
      30_000,
    );
    const onMessage = (message: unknown) => {
      if (
        typeof message === "object" &&
        message &&
        "event" in message &&
        message.event === "services_ready"
      ) {
        clearTimeout(timer);
        child.off("message", onMessage);
        resolve();
      }
    };
    child.on("message", onMessage);
    void exited.then(
      (code) => {
        clearTimeout(timer);
        reject(
          new Error(
            "Dev exited before readiness (" + code + "): " + diagnostics,
          ),
        );
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
  void ready.catch(() => {});
  async function stop() {
    if (child.connected) child.disconnect();
    const timer = setTimeout(() => child.kill(), 10_000);
    try {
      return await exited;
    } finally {
      clearTimeout(timer);
    }
  }
  return { child, ready, exited, stop };
}
