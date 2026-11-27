import {
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn.ts";
import { IconButton } from "./button.tsx";

interface DialogProps {
  dialogRef?: RefObject<HTMLDialogElement | null>;
  id?: string;
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  placement?: "center" | "start";
}

// Native modal focus handles ordinary Tab movement and makes the page inert.
// Wrap only at the boundaries so Tab stays in the modal at the browser UI edge.
function tabbableChildren(dialog: HTMLDialogElement) {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(
      "a[href], area[href], button, input, textarea, select, summary, iframe, audio[controls], video[controls], [contenteditable], [tabindex]",
    ),
  )
    .filter(
      (element) =>
        (element.tabIndex >= 0 ||
          (element.isContentEditable &&
            !element.hasAttribute("tabindex") &&
            !element.parentElement?.isContentEditable)) &&
        !element.matches(":disabled") &&
        !element.closest("[inert], [hidden]") &&
        element.checkVisibility({ visibilityProperty: true }) &&
        element.getClientRects().length > 0,
    )
    .sort(
      (first, second) =>
        (first.tabIndex > 0 ? first.tabIndex : Infinity) -
        (second.tabIndex > 0 ? second.tabIndex : Infinity),
    );
}

export function Dialog({
  dialogRef,
  id,
  open,
  onClose,
  title,
  children,
  placement = "center",
}: DialogProps) {
  const titleId = useId();
  const localDialog = useRef<HTMLDialogElement>(null);
  const dialog = dialogRef ?? localDialog;
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [dialog, open]);
  const sheet = placement === "start";
  return (
    <dialog
      ref={dialog}
      id={id}
      aria-labelledby={titleId}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const modal = event.currentTarget;
        const focusable = tabbableChildren(modal);
        const active = modal.ownerDocument.activeElement;
        const atBoundary =
          active === (event.shiftKey ? focusable[0] : focusable.at(-1));
        if (!atBoundary && focusable.some((element) => element === active))
          return;
        event.preventDefault();
        const ordered = event.shiftKey ? focusable.reverse() : focusable;
        for (const element of ordered) {
          element.focus();
          if (modal.ownerDocument.activeElement === element) return;
        }
        modal.focus();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          event.currentTarget.close();
      }}
      className={cn(
        "fixed overflow-y-auto border border-border bg-sidebar text-foreground shadow-dialog",
        sheet
          ? "sheet inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[min(320px,calc(100vw-36px))] max-w-none flex-col overflow-hidden open:flex"
          : "modal inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(480px,calc(100vw-32px))] max-w-none rounded-2xl",
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-2">
        <h2 id={titleId} className="text-sm font-semibold">
          {title}
        </h2>
        <IconButton label="Đóng" onClick={() => dialog.current?.close()}>
          <X size={18} aria-hidden="true" />
        </IconButton>
      </div>
      {sheet ? <div className="min-h-0 flex-1">{children}</div> : children}
    </dialog>
  );
}

export function Sheet(props: Omit<DialogProps, "placement">) {
  return <Dialog {...props} placement="start" />;
}
