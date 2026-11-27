import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../utils/cn.ts";

const tones = {
  neutral: "border-border text-muted-foreground",
  info: "border-primary/30 text-primary",
  success: "border-success/30 text-success",
  warning: "border-warning/30 text-warning",
  danger: "border-danger/30 text-danger",
};
export type Tone = keyof typeof tones;
export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    />
  );
}
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("rounded-xl border border-border bg-surface", className)}
    />
  );
}
export function Separator(props: ComponentProps<"hr">) {
  return <hr {...props} className={cn("border-border", props.className)} />;
}
const field =
  "block w-full min-h-11 rounded-lg border border-control bg-code px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 aria-invalid:border-danger";
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(field, className)} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(field, "min-h-24 resize-y", className)}
    />
  );
}
export function Alert({
  tone = "info",
  announce = false,
  role,
  className,
  ...props
}: ComponentProps<"div"> & { tone?: Tone; announce?: boolean }) {
  return (
    <div
      {...props}
      role={role ?? (announce ? "alert" : undefined)}
      className={cn(
        "rounded-lg border bg-surface p-4 text-sm",
        tones[tone],
        className,
      )}
    />
  );
}
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-lg bg-elevated", className)}
    />
  );
}
export function Spinner() {
  return (
    <LoaderCircle
      size={18}
      aria-hidden="true"
      className="shrink-0 motion-safe:animate-spin"
    />
  );
}
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = !dismissed && (hovered || focused);

  useEffect(() => {
    if (!visible) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true);
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [visible]);
  return (
    <span
      className="relative block"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        if (!focused) setDismissed(false);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setFocused(false);
        if (!hovered) setDismissed(false);
      }}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-full z-(--layer-tooltip) -translate-y-1/2 pl-2 transition-opacity duration-(--motion-fast)",
          visible ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <span className="block rounded-lg border border-border bg-elevated px-3 py-2 text-xs whitespace-nowrap text-foreground">
          {label}
        </span>
      </span>
    </span>
  );
}
