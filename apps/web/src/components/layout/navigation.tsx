import { ChevronRight, Shield, Terminal } from "lucide-react";
import { Link, NavLink } from "react-router";
import { navigation, type PageConfig } from "../../config/navigation.ts";
import { cn } from "../../utils/cn.ts";
import { Tooltip } from "../ui/primitives.tsx";

export function Sidebar({
  collapsed = false,
  trail,
  onNavigate,
}: {
  collapsed?: boolean;
  trail: readonly PageConfig[];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        aria-label="XSS Security Lab"
        onClick={onNavigate}
        className={cn(
          "flex min-h-20 items-center gap-3 border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-active text-primary">
          <Shield size={21} aria-hidden="true" />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              XSS Security Lab
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Phòng học bảo mật web
            </span>
          </span>
        )}
      </Link>
      <nav
        aria-label="Điều hướng chính"
        className={cn(
          "flex-1 space-y-5 px-3 py-5",
          collapsed && "space-y-4",
          onNavigate && "min-h-0 overflow-y-auto",
        )}
      >
        {navigation.map(({ label, pages }) => (
          <div key={label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                {label}
              </p>
            )}
            <ul className="space-y-1">
              {pages.map((page) => {
                const selected = trail[0]?.path === page.path;
                const item = (
                  <NavLink
                    end
                    to={page.path}
                    aria-label={page.title}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-(--motion-fast)",
                      collapsed && "justify-center px-0",
                      selected
                        ? "bg-active text-primary"
                        : "text-muted-foreground hover:bg-elevated hover:text-foreground",
                    )}
                  >
                    {selected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-primary"
                      />
                    )}
                    <page.icon size={19} aria-hidden="true" />
                    {!collapsed && page.title}
                  </NavLink>
                );
                return (
                  <li key={page.path}>
                    {collapsed ? (
                      <Tooltip label={page.title}>{item}</Tooltip>
                    ) : (
                      item
                    )}
                    {!collapsed && page.children && (
                      <ul className="mt-1 ml-5 space-y-1 border-l border-border pl-2">
                        {page.children.map((child) => (
                          <li key={child.path}>
                            <NavLink
                              end
                              to={child.path}
                              onClick={onNavigate}
                              className={({ isActive }) =>
                                cn(
                                  "flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs transition-colors duration-(--motion-fast)",
                                  isActive
                                    ? "bg-active font-medium text-primary"
                                    : "text-muted-foreground hover:bg-elevated hover:text-foreground",
                                )
                              }
                            >
                              <child.icon size={13} aria-hidden="true" />
                              {child.title}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div
        className={cn(
          "mt-auto shrink-0 border-t border-border p-3",
          collapsed && "text-center",
        )}
      >
        <div
          aria-label="Môi trường cục bộ"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg bg-background px-3",
            collapsed && "justify-center px-0",
          )}
        >
          <Terminal
            size={17}
            className="shrink-0 text-secondary"
            aria-hidden="true"
          />
          {!collapsed && (
            <span className="text-xs text-muted-foreground">
              Môi trường cục bộ
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Breadcrumb({ trail }: { trail: readonly PageConfig[] }) {
  const items = trail[0]?.path === "/" ? [] : trail;
  return (
    <nav aria-label="Đường dẫn" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-2 text-sm">
        <li
          className={cn(
            "shrink-0",
            trail[0]?.path !== "/" && "hidden sm:block",
          )}
        >
          {trail[0]?.path === "/" ? (
            <span aria-current="page">Tổng quan</span>
          ) : (
            <Link
              className="text-muted-foreground hover:text-foreground"
              to="/"
            >
              Tổng quan
            </Link>
          )}
        </li>
        {items.map((item, index) => (
          <li
            key={item.path}
            className={cn(
              "min-w-0 items-center gap-2",
              index === items.length - 1 ? "flex" : "hidden shrink-0 md:flex",
            )}
          >
            <ChevronRight
              size={14}
              aria-hidden="true"
              className="hidden shrink-0 text-muted-foreground md:block"
            />
            {index === items.length - 1 ? (
              <span className="truncate font-medium" aria-current="page">
                {item.title}
              </span>
            ) : (
              <Link
                className="text-muted-foreground hover:text-foreground"
                to={item.path}
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
        {!trail.length && (
          <li className="truncate" aria-current="page">
            Không tìm thấy trang
          </li>
        )}
      </ol>
    </nav>
  );
}
