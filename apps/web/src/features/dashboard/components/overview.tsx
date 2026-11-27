import {
  Activity,
  ArrowUpRight,
  FlaskConical,
  Layers3,
  Route,
} from "lucide-react";
import { Link } from "react-router";
import type {
  DashboardSummary,
  HealthObservation,
  HealthStatus,
  LabMetadata,
  ServiceId,
} from "@xss-lab/shared-types";
import {
  Card,
  Badge,
  Skeleton,
  type Tone,
} from "../../../components/ui/primitives.tsx";
import {
  EmptyState,
  SectionHeader,
  StatusIndicator,
} from "../../../components/common/page.tsx";
import { routeTrail } from "../../../config/navigation.ts";

const names: Record<ServiceId, string> = {
  api: "Management API",
  "vulnerable-lab": "Vulnerable Lab",
  "secure-lab": "Secure Lab",
};
const statuses: Record<HealthStatus, { label: string; tone: Tone }> = {
  healthy: { label: "Phản hồi hợp lệ", tone: "success" },
  unhealthy: { label: "Phản hồi không hợp lệ", tone: "danger" },
  unreachable: { label: "Không kết nối được", tone: "warning" },
  unknown: { label: "Chưa kiểm tra", tone: "neutral" },
};
const categories: Record<LabMetadata["slug"], string> = {
  reflected: "Reflected",
  stored: "Stored",
  dom: "DOM-based",
};

export function ObservationTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date(value))}
    </time>
  );
}

export function OverviewStats({
  data,
  pending,
}: {
  data: DashboardSummary | null;
  pending: boolean;
}) {
  const services = data?.services;
  const observed =
    services?.filter(({ status }) => status !== "unknown").length ?? 0;
  const healthy =
    services?.filter(({ status }) => status === "healthy").length ?? 0;
  const items = [
    { label: "Loại XSS", icon: Layers3, value: data?.statistics.categoryCount },
    {
      label: "Lab trong danh mục",
      icon: FlaskConical,
      value: data?.statistics.labCount,
    },
    {
      label: "Dịch vụ phản hồi hợp lệ",
      icon: Activity,
      value: observed ? healthy + "/" + services?.length : undefined,
    },
    { label: "Tiến độ thực hành", icon: Route, value: "Chưa hỗ trợ" },
  ];
  return (
    <section
      aria-label="Chỉ số tổng quan"
      className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4"
    >
      {items.map(({ label, icon: Icon, value }) => (
        <Card key={label} className="min-w-0 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Icon
              size={16}
              className="shrink-0 text-secondary"
              aria-hidden="true"
            />
            {label}
          </div>
          {value === undefined && pending ? (
            <Skeleton className="mt-3 h-7 w-14" />
          ) : (
            <p
              className={
                typeof value === "number" ||
                (label === "Dịch vụ phản hồi hợp lệ" && value)
                  ? "mt-2 font-mono text-2xl font-semibold"
                  : "mt-2 text-sm font-medium text-muted-foreground"
              }
            >
              {value ?? "Chưa có dữ liệu"}
            </p>
          )}
        </Card>
      ))}
    </section>
  );
}

export function LabOverviewSection({
  catalog,
  pending,
}: {
  catalog: DashboardSummary["catalog"] | undefined;
  pending: boolean;
}) {
  return (
    <section aria-label="Danh mục Lab">
      <SectionHeader
        title="Danh mục Lab"
        description="Chủ đề XSS theo danh mục Management API."
      />
      {catalog?.length ? (
        <ul className="space-y-2">
          {catalog.map((lab) => {
            const path = "/attack-lab/" + lab.slug;
            return (
              <li key={lab.id}>
                <Link to={path} className="group block rounded-xl">
                  <Card className="p-4 group-hover:border-control group-hover:bg-elevated">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-code px-2 py-1 font-mono text-xs text-primary">
                        {lab.id}
                      </span>
                      <Badge>{categories[lab.slug]}</Badge>
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="ml-auto text-muted-foreground group-hover:text-primary"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold">{lab.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {routeTrail(path).at(-1)?.description}
                    </p>
                    <p className="mt-2 text-xs text-secondary">
                      Trang giới thiệu · Chưa có thí nghiệm
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : pending && !catalog ? (
        <div className="space-y-2">
          {[0, 1, 2].map((slot) => (
            <Skeleton key={slot} className="h-39 sm:h-34" />
          ))}
        </div>
      ) : (
        <EmptyState
          title={catalog ? "Danh mục Lab trống" : "Chưa tải được danh mục"}
          description={
            catalog
              ? "Management API chưa ghi nhận Lab nào."
              : "Thử làm mới khi Management API phản hồi."
          }
        />
      )}
    </section>
  );
}

export function SystemHealthPanel({
  services,
  pending,
}: {
  services: readonly HealthObservation[] | undefined;
  pending: boolean;
}) {
  return (
    <section aria-label="Trạng thái dịch vụ">
      <SectionHeader
        title="Trạng thái dịch vụ"
        description="Kết quả kiểm tra endpoint health cục bộ."
      />
      <Card className="p-4">
        <ul className="divide-y divide-border">
          {(Object.keys(names) as ServiceId[]).map((id) => {
            const observation = services?.find(({ service }) => service === id);
            const status = statuses[observation?.status ?? "unknown"];
            return (
              <li key={id} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{names[id]}</span>
                  <StatusIndicator
                    label={
                      pending && !services ? "Đang kiểm tra" : status.label
                    }
                    tone={status.tone}
                  />
                </div>
                {observation?.observedAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Quan sát lúc{" "}
                    <ObservationTime value={observation.observedAt} />
                  </p>
                ) : pending && !services ? (
                  <Skeleton className="mt-2 h-4 w-36" />
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
          Phản hồi health hợp lệ chỉ xác nhận endpoint đang trả lời. Kiểm tra
          này không đánh giá độ an toàn hoặc khả năng chạy Lab.
        </p>
      </Card>
    </section>
  );
}
