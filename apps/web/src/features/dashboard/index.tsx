import { RefreshCw } from "lucide-react";
import { Alert, Spinner } from "../../components/ui/primitives.tsx";
import { Button } from "../../components/ui/button.tsx";
import { ErrorState, PageHeader } from "../../components/common/page.tsx";
import {
  DashboardHero,
  LearningRoadmap,
  QuickActions,
  RecentActivity,
} from "./components/learning.tsx";
import {
  LabOverviewSection,
  ObservationTime,
  OverviewStats,
  SystemHealthPanel,
} from "./components/overview.tsx";
import { useDashboard } from "./hooks/use-dashboard.ts";

export function DashboardPage() {
  const { data, error, pending, refresh } = useDashboard();
  const partial = data?.services.some(({ status }) => status !== "healthy");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        description="Danh mục thực hành, trạng thái dịch vụ cục bộ và lộ trình học XSS."
      />
      <DashboardHero />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Dữ liệu cục bộ</h2>
          <p className="mt-1 text-xs text-muted-foreground" role="status">
            {pending ? (
              data ? (
                "Đang làm mới. Hiển thị dữ liệu lần trước."
              ) : (
                "Đang tải dữ liệu tổng quan…"
              )
            ) : data ? (
              <>
                {error ? "Dữ liệu cũ · " : ""}Lần tải thành công{" "}
                <ObservationTime value={data.observedAt} />
              </>
            ) : (
              "Chưa có lần tải thành công."
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-disabled={pending}
          onClick={() => {
            if (!pending) refresh();
          }}
        >
          {pending ? <Spinner /> : <RefreshCw size={15} aria-hidden="true" />}
          {error && !data ? "Thử lại" : "Làm mới"}
        </Button>
      </div>
      {error ? (
        <ErrorState
          title={
            data ? "Không thể làm mới tổng quan" : "Không thể tải tổng quan"
          }
          description={error}
        />
      ) : (
        partial &&
        !pending && (
          <Alert tone="warning">
            Một số dịch vụ chưa có phản hồi health hợp lệ. Xem trạng thái từng
            dịch vụ bên dưới.
          </Alert>
        )
      )}
      <OverviewStats data={data} pending={pending} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <LabOverviewSection catalog={data?.catalog} pending={pending} />
        <div className="min-w-0 space-y-6">
          <SystemHealthPanel services={data?.services} pending={pending} />
          <QuickActions />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <LearningRoadmap />
        <RecentActivity />
      </div>
    </div>
  );
}
