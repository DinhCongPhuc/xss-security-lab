import {
  BookOpen,
  Code2,
  FileText,
  FlaskConical,
  LayoutDashboard,
  List,
  Settings,
  ShieldCheck,
  CornerDownRight,
  type LucideIcon,
} from "lucide-react";
import { matchPath } from "react-router";

export interface PageConfig {
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children?: readonly PageConfig[];
}

export const navigation: readonly {
  label: string;
  pages: readonly PageConfig[];
}[] = [
  {
    label: "Không gian học tập",
    pages: [
      {
        path: "/",
        title: "Tổng quan",
        icon: LayoutDashboard,
        description:
          "Chọn một chủ đề để tìm hiểu hoặc khám phá các phòng Lab XSS.",
      },
      {
        path: "/knowledge",
        title: "Kiến thức",
        icon: BookOpen,
        description: "Tài liệu nền tảng về Cross-Site Scripting.",
      },
    ],
  },
  {
    label: "Phòng thực hành",
    pages: [
      {
        path: "/attack-lab",
        title: "Attack Lab",
        icon: FlaskConical,
        description:
          "Ba chủ đề Cross-Site Scripting trong chương trình thực hành.",
        children: [
          {
            path: "/attack-lab/reflected",
            title: "Reflected XSS",
            icon: CornerDownRight,
            description:
              "Chủ đề về dữ liệu phản hồi trực tiếp trong HTTP response.",
          },
          {
            path: "/attack-lab/stored",
            title: "Stored XSS",
            icon: CornerDownRight,
            description: "Chủ đề về dữ liệu được lưu trữ và hiển thị lại.",
          },
          {
            path: "/attack-lab/dom",
            title: "DOM-based XSS",
            icon: CornerDownRight,
            description:
              "Chủ đề về cách dữ liệu được xử lý trong DOM phía trình duyệt.",
          },
        ],
      },
      {
        path: "/defense-lab",
        title: "Defense Lab",
        icon: ShieldCheck,
        description: "Biện pháp phòng vệ XSS và cách đánh giá hiệu quả.",
      },
      {
        path: "/code-analysis",
        title: "Phân tích mã",
        icon: Code2,
        description: "Không gian dành cho phân tích mã nguồn.",
      },
    ],
  },
  {
    label: "Quản lý",
    pages: [
      {
        path: "/logs",
        title: "Nhật ký bảo mật",
        icon: List,
        description: "Không gian dành cho nhật ký thí nghiệm.",
      },
      {
        path: "/reports",
        title: "Báo cáo",
        icon: FileText,
        description: "Không gian dành cho báo cáo học tập.",
      },
      {
        path: "/settings",
        title: "Cài đặt",
        icon: Settings,
        description: "Không gian dành cho cấu hình ứng dụng.",
      },
    ],
  },
];

export const routePages = navigation.flatMap(({ pages }) =>
  pages.flatMap((page) => [page, ...(page.children ?? [])]),
);
export function routeTrail(pathname: string) {
  for (const { pages } of navigation) {
    for (const page of pages) {
      if (matchPath(page.path, pathname)) return [page];
      const child = page.children?.find(({ path }) =>
        matchPath(path, pathname),
      );
      if (child) return [page, child];
    }
  }
  return [];
}
