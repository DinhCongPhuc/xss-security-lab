import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launchDev } from "./dev-process.ts";
import { e2ePorts } from "./e2e-ports.ts";

export default async function startE2E() {
  const dataDir = await mkdtemp(join(tmpdir(), "xss-lab-e2e-"));
  const dev = launchDev(e2ePorts, dataDir);
  try {
    await dev.ready;
  } catch (error) {
    await dev.stop();
    await rm(dataDir, { recursive: true, force: true });
    throw error;
  }
  return async () => {
    const code = await dev.stop();
    await rm(dataDir, { recursive: true, force: true });
    if (code !== 0)
      throw new Error("E2E services did not shut down cleanly: " + code);
  };
}
