import { useEffect, useState } from "react";
import type { DashboardSummary } from "@xss-lab/shared-types";
import { browserTimeoutMs, loadSummary } from "../services/summary.ts";

interface Snapshot {
  version: number;
  data: DashboardSummary | null;
  error: string | null;
}

export function useDashboard() {
  const [version, setVersion] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    version: -1,
    data: null,
    error: null,
  });
  const pending = snapshot.version !== version;

  useEffect(() => {
    const controller = new AbortController();
    const timeout = AbortSignal.timeout(browserTimeoutMs);
    const signal = AbortSignal.any([controller.signal, timeout]);
    // StrictMode replays setup in the same turn; do not send the cancelled request.
    queueMicrotask(async () => {
      if (controller.signal.aborted) return;
      try {
        const data = await loadSummary(signal);
        if (!controller.signal.aborted)
          setSnapshot({ version, data, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = timeout.aborted
          ? "Đã hết thời gian chờ Management API."
          : error instanceof Error
            ? error.message
            : "Không thể tải tổng quan.";
        setSnapshot((previous) => ({
          version,
          data: previous.data,
          error: message,
        }));
      }
    });
    return () => controller.abort();
  }, [version]);

  return {
    data: snapshot.data,
    error: pending ? null : snapshot.error,
    pending,
    refresh: () =>
      setVersion((current) =>
        current === snapshot.version ? current + 1 : current,
      ),
  };
}
