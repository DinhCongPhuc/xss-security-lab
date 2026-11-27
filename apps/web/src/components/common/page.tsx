import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CircleAlert, Inbox, Terminal } from "lucide-react";
import {
  Alert,
  Badge,
  Card,
  Skeleton,
  Spinner,
  type Tone,
} from "../ui/primitives.tsx";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="border-b border-border pb-6 sm:pb-8">
      <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-[64ch] text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>
    </header>
  );
}
export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
export function StatusIndicator({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <Badge tone={tone}>
      <Terminal size={14} aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}
interface StateProps {
  title: string;
  description: string;
  action?: ReactNode;
}
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: StateProps & { icon?: LucideIcon }) {
  return (
    <Card className="px-5 py-8 text-center sm:px-8 sm:py-12">
      <span className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-elevated text-secondary">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-[48ch] text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
export function ErrorState({ title, description, action }: StateProps) {
  return (
    <Alert tone="danger" announce>
      <h2 className="flex items-center gap-2 font-semibold">
        <CircleAlert size={18} aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-2 text-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Alert>
  );
}
export function LoadingState({ label = "Đang tải" }: { label?: string }) {
  return (
    <Card className="space-y-4 p-5">
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Spinner />
        {label}
      </p>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </Card>
  );
}
