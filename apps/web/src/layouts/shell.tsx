import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { StatusIndicator } from "../components/common/page.tsx";
import { Breadcrumb, Sidebar } from "../components/layout/navigation.tsx";
import { IconButton } from "../components/ui/button.tsx";
import { Sheet } from "../components/ui/dialog.tsx";
import { routeTrail } from "../config/navigation.ts";
import { useSidebar } from "../hooks/use-sidebar.ts";
import { cn } from "../utils/cn.ts";

export function Shell() {
  const { pathname } = useLocation();
  const trail = routeTrail(pathname);
  const title = trail.at(-1)?.title ?? "Không tìm thấy trang";
  const previousPath = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const desktopToggle = useRef<HTMLButtonElement>(null);
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const restoreDesktopFocus = useRef(false);
  const { collapsed, toggle } = useSidebar();
  const [drawer, setDrawer] = useState(false);

  useLayoutEffect(() => {
    document.title = title + " · XSS Security Lab";
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      window.scrollTo(0, 0);
      main.current?.focus();
    }
  }, [pathname, title]);

  useEffect(() => {
    if (!drawer) return;
    const desktop = matchMedia("(min-width: 64rem)");
    const closeAtDesktop = () => {
      if (!desktop.matches || !mobileDialog.current?.open) return;
      restoreDesktopFocus.current = true;
      setDrawer(false);
    };
    desktop.addEventListener("change", closeAtDesktop);
    closeAtDesktop();
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, [drawer]);

  function closeDrawer() {
    setDrawer(false);
    if (restoreDesktopFocus.current) {
      restoreDesktopFocus.current = false;
      const toggle = matchMedia("(min-width: 64rem)").matches
        ? desktopToggle
        : mobileToggle;
      toggle.current?.focus({ preventScroll: true });
    }
  }

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--layer-skip) focus:rounded-lg focus:bg-background focus:px-4 focus:py-3"
      >
        Đến nội dung chính
      </a>
      <aside
        id="desktop-navigation"
        aria-label="Thanh bên"
        className={cn(
          "relative z-(--layer-tooltip) hidden shrink-0 border-r border-border bg-sidebar transition-[width] duration-(--motion-panel) lg:block",
          collapsed ? "w-(--sidebar-collapsed)" : "w-(--sidebar-expanded)",
        )}
      >
        <Sidebar collapsed={collapsed} trail={trail} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-(--layer-header) flex h-16 items-center gap-3 border-b border-border bg-background px-3 sm:gap-4 sm:px-6">
          <IconButton
            ref={mobileToggle}
            className="lg:hidden"
            label="Mở điều hướng"
            aria-haspopup="dialog"
            aria-controls="mobile-navigation"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </IconButton>
          <IconButton
            ref={desktopToggle}
            className="hidden lg:inline-flex"
            label={
              collapsed
                ? "Mở rộng thanh điều hướng"
                : "Thu gọn thanh điều hướng"
            }
            aria-controls="desktop-navigation"
            aria-expanded={!collapsed}
            onClick={toggle}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={19} aria-hidden="true" />
            )}
          </IconButton>
          <span
            aria-hidden="true"
            className="hidden h-5 w-px shrink-0 bg-border sm:block"
          />
          <Breadcrumb trail={trail} />
          <div className="ml-auto shrink-0">
            <StatusIndicator label="Lab cục bộ" />
          </div>
        </header>
        <main
          ref={main}
          id="main-content"
          tabIndex={-1}
          aria-label={title}
          className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-4 py-7 sm:px-8 sm:py-10 xl:px-10"
        >
          <Outlet />
        </main>
      </div>
      <Sheet
        dialogRef={mobileDialog}
        id="mobile-navigation"
        open={drawer}
        onClose={closeDrawer}
        title="Điều hướng"
      >
        <Sidebar trail={trail} onNavigate={() => setDrawer(false)} />
      </Sheet>
    </div>
  );
}
