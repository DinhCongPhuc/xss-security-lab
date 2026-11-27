export type LabMode = "vulnerable" | "secure";
export interface LabMetadata {
  id: string;
  slug: "reflected" | "stored" | "dom";
  title: string;
}
export interface ExperimentMetadata {
  labId: string;
  testCaseId: string;
  mode: LabMode;
}
export const resultStates = [
  "EXECUTED",
  "PREVENTED",
  "NORMAL",
  "INCONCLUSIVE",
  "ERROR",
] as const;
export type ResultState = (typeof resultStates)[number];
export interface ExperimentResult {
  state: ResultState;
  evidence?: string;
}
export function isResultState(value: unknown): value is ResultState {
  return resultStates.some((state) => state === value);
}
export interface ApiError {
  code: string;
  message: string;
}
export type ApiResponse<T> =
  { ok: true; data: T } | { ok: false; error: ApiError };

export type ServiceId = "api" | "vulnerable-lab" | "secure-lab";
export type HealthStatus = "healthy" | "unhealthy" | "unreachable" | "unknown";
export interface HealthObservation {
  service: ServiceId;
  status: HealthStatus;
  observedAt: string | null;
}
export interface DashboardSummary {
  catalog: readonly LabMetadata[];
  statistics: { labCount: number; categoryCount: number };
  services: readonly HealthObservation[];
  availability: { progress: "unavailable"; activity: "unavailable" };
  observedAt: string;
}
