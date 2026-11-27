import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
} from "../components/common/page.tsx";
import { Button } from "../components/ui/button.tsx";
import { Card } from "../components/ui/primitives.tsx";
import type { PageConfig } from "../config/navigation.ts";

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
