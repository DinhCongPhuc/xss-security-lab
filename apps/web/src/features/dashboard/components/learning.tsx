import { ArrowRight, ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { EmptyState, SectionHeader } from "../../../components/common/page.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Card } from "../../../components/ui/primitives.tsx";
import { routePages } from "../../../config/navigation.ts";

export function DashboardHero() {
  return (
    <Card className="grid items-center gap-4 border-primary/20 bg-sidebar p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-7">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Khám phá bảo mật XSS
        </h2>
        <p className="mt-2 max-w-[62ch] text-sm leading-6 text-muted-foreground">
          Tìm hiểu Cross-Site Scripting và các biện pháp phòng chống trong môi
          trường học tập cục bộ.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/attack-lab">
              Khám phá Attack Lab <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/knowledge">
              <BookOpen size={16} aria-hidden="true" /> Kiến thức nền tảng
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Môi trường học tập cục bộ. Hiện có trang giới thiệu Lab, chưa có chức
          năng chạy thí nghiệm.
        </p>
      </div>
      <div
        aria-hidden="true"
        className="mr-3 hidden size-24 rotate-6 place-items-center rounded-2xl border border-primary/25 bg-active text-primary sm:grid xl:mr-10 xl:size-32"
      >
        <ShieldCheck className="-rotate-6" size={52} strokeWidth={1.3} />
      </div>
    </Card>
  );
}

const steps = [
  ["/knowledge", "Tìm hiểu kiến thức XSS"],
  ["/attack-lab", "Khám phá các loại XSS"],
  ["/defense-lab", "Tìm hiểu biện pháp phòng chống"],
  ["/code-analysis", "Phân tích mã nguồn"],
  ["/reports", "Tổng hợp kết quả thực hành"],
] as const;
const quickPaths = [
  "/knowledge",
  "/attack-lab",
  "/defense-lab",
  "/code-analysis",
  "/logs",
  "/reports",
];

export function LearningRoadmap() {
  return (
    <section aria-label="Lộ trình học">
      <SectionHeader
        title="Lộ trình học"
        description="Trình tự học được đề xuất."
      />
      <Card className="p-2">
        <ol className="divide-y divide-border">
          {steps.map(([path, title], index) => (
            <li key={path}>
              <Link
                to={path}
                className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-elevated"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-md bg-elevated font-mono text-xs text-secondary"
                >
                  {index + 1}
                </span>
                <span>{title}</span>
                <ArrowRight
                  className="ml-auto shrink-0 text-muted-foreground group-hover:text-primary"
                  size={15}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}

export function QuickActions() {
  return (
    <section aria-label="Truy cập nhanh">
      <SectionHeader title="Truy cập nhanh" />
      <ul className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        {routePages
          .filter(({ path }) => quickPaths.includes(path))
          .map(({ path, title, icon: Icon }) => (
            <li key={path} className="min-w-0">
              <Link
                to={path}
                className="group flex h-full min-h-17 items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-control hover:bg-elevated"
              >
                <Icon
                  size={17}
                  className="shrink-0 text-secondary"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {path === "/attack-lab"
                      ? "Danh mục chủ đề"
                      : "Trang giới thiệu"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
      </ul>
    </section>
  );
}

export function RecentActivity() {
  return (
    <section aria-label="Hoạt động gần đây">
      <SectionHeader title="Hoạt động gần đây" />
      <EmptyState
        title="Chưa có dữ liệu hoạt động"
        description="Nhật ký thực hành sẽ hiển thị khi chức năng ghi nhận hoạt động được triển khai."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/logs">Xem trang nhật ký bảo mật</Link>
          </Button>
        }
      />
    </section>
  );
}
