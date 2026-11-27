import { useState } from "react";

const key = "xss-lab:sidebar-collapsed";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  });
  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      /* The preference is optional. */
    }
  }
  return { collapsed, toggle };
}
