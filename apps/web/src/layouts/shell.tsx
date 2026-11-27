import {
  BookOpen,
  Code2,
  FileText,
  FlaskConical,
  LayoutDashboard,
  List,
  PanelLeft,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { Button } from "../components/ui/button.tsx";

const links = [
  ["/", "Tổng quan", LayoutDashboard],
  ["/knowledge", "Kiến thức", BookOpen],
  ["/attack-lab", "Attack Lab", FlaskConical],
  ["/defense-lab", "Defense Lab", ShieldCheck],
  ["/code-analysis", "Phân tích mã", Code2],
  ["/logs", "Nhật ký", List],
  ["/reports", "Báo cáo", FileText],
  ["/settings", "Cài đặt", Settings],
] as const;

export function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-background focus:p-3"
      >
        Đến nội dung chính
      </a>
      <aside
        className={
          "shrink-0 border-r border-border bg-sidebar " +
          (collapsed ? "w-[72px]" : "w-[72px] md:w-64")
        }
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Shield className="shrink-0 text-primary" aria-hidden="true" />
          {!collapsed && (
            <span className="hidden font-semibold whitespace-nowrap md:block">
              XSS Security Lab
            </span>
          )}
        </div>
        <nav aria-label="Điều hướng chính" className="grid gap-1 p-3">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-elevated " +
                (isActive
                  ? "bg-elevated text-primary"
                  : "text-secondary-foreground")
              }
            >
              <Icon size={20} className="shrink-0" aria-hidden="true" />
              {!collapsed && <span className="hidden md:inline">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-8">
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            aria-label="Thu gọn thanh điều hướng"
            aria-pressed={collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeft size={18} aria-hidden="true" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Môi trường cục bộ
          </span>
        </header>
        <main id="main" tabIndex={-1} className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
