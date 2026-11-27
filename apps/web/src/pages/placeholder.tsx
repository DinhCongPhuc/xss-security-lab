import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
} from "../components/common/page.tsx";
import { Button } from "../components/ui/button.tsx";
import { Badge, Card } from "../components/ui/primitives.tsx";
import { routePages, type PageConfig } from "../config/navigation.ts";

function ModuleLinks({ pages }: { pages: readonly PageConfig[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {pages.map(({ path, title, description, icon: Icon }) => (
        <li key={path} className="min-w-0">
          <Link to={path} className="group block h-full rounded-xl">
            <Card className="h-full p-5 transition-colors duration-(--motion-fast) group-hover:border-control group-hover:bg-elevated">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-lg border border-border bg-background text-primary">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const entryPages = routePages.filter(({ path }) =>
  ["/knowledge", "/attack-lab", "/defense-lab"].includes(path),
);

export function Overview({ page }: { page: PageConfig }) {
  return (
    <div className="space-y-7">
      <PageHeader title={page.title} description={page.description} />
      <Card className="grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="p-5 sm:p-8">
          <Badge tone="info">Phòng học XSS</Badge>
          <h2 className="mt-4 max-w-[22ch] text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            Học Cross-Site Scripting theo từng chủ đề
          </h2>
          <p className="mt-3 max-w-[53ch] text-sm leading-6 text-muted-foreground">
            Bắt đầu với kiến thức nền tảng, xem các chủ đề Attack Lab và tìm
            hiểu cách phòng vệ.
          </p>
          <Button asChild className="mt-5">
            <Link to="/attack-lab">
              Khám phá Attack Lab <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="border-t border-border bg-sidebar p-5 sm:p-7 lg:border-t-0 lg:border-l">
          <h3 className="text-sm font-semibold">Lộ trình học</h3>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <BookOpen
                className="shrink-0 text-secondary"
                size={17}
                aria-hidden="true"
              />
              Kiến thức nền tảng
            </li>
            <li className="flex items-center gap-3">
              <FlaskConical
                className="shrink-0 text-secondary"
                size={17}
                aria-hidden="true"
              />
              Các dạng XSS
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck
                className="shrink-0 text-secondary"
                size={17}
                aria-hidden="true"
              />
              Biện pháp phòng vệ
            </li>
          </ul>
        </div>
      </Card>
      <section aria-label="Mô-đun học tập">
        <SectionHeader title="Mô-đun học tập" />
        <ModuleLinks pages={entryPages} />
      </section>
    </div>
  );
}

export function Placeholder({ page }: { page: PageConfig }) {
  return (
    <div className="space-y-7">
      <PageHeader title={page.title} description={page.description} />
      {page.children ? (
        <section aria-label="Chủ đề thực hành">
          <SectionHeader
            title="Chủ đề thực hành"
            description="Các trang hiện giới thiệu chủ đề. Nội dung thực hành đang được chuẩn bị."
          />
          <ModuleLinks pages={page.children} />
        </section>
      ) : (
        <EmptyState
          icon={page.icon}
          title="Nội dung đang được chuẩn bị"
          description="Mô-đun này hiện có trang giới thiệu."
        />
      )}
    </div>
  );
}

export function NotFound() {
  return (
    <div className="space-y-7">
      <PageHeader
        title="404 · Không tìm thấy trang"
        description="Đường dẫn này không có trong XSS Security Lab."
      />
      <EmptyState
        title="Chọn một trang để tiếp tục"
        description="Bạn có thể sử dụng điều hướng chính hoặc quay lại tổng quan."
        action={
          <Button asChild>
            <Link to="/">
              <ArrowLeft size={16} aria-hidden="true" />
              Về tổng quan
            </Link>
          </Button>
        }
      />
    </div>
  );
}
