import type { LabMetadata } from "../../../../packages/shared-types/src/index.ts";
export const catalog = [
  { id: "LAB-01", slug: "reflected", title: "Reflected XSS" },
  { id: "LAB-02", slug: "stored", title: "Stored XSS" },
  { id: "LAB-03", slug: "dom", title: "DOM-based XSS" },
] as const satisfies readonly LabMetadata[];
