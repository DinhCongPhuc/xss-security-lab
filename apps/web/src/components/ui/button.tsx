import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn.ts";

const button = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-(--motion-fast) disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-code hover:bg-primary-hover",
        outline:
          "border border-control bg-transparent text-foreground hover:bg-elevated",
        ghost: "text-muted-foreground hover:bg-elevated hover:text-foreground",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-4 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

type Native = ComponentProps<"button"> & VariantProps<typeof button>;
type ButtonProps =
  | (Native & { asChild?: false })
  | (Omit<Native, "type" | "disabled" | "ref"> & { asChild: true });
export function Button(props: ButtonProps) {
  const { asChild, className, variant, size, ...elementProps } = props;
  const styling = cn(button({ variant, size }), className);
  if (asChild) return <Slot {...elementProps} className={styling} />;
  return (
    <button
      {...elementProps}
      type={props.type ?? "button"}
      className={styling}
    />
  );
}

export function IconButton({
  label,
  ...props
}: Omit<Native, "size" | "aria-label"> & { label: string }) {
  return <Button variant="ghost" {...props} size="icon" aria-label={label} />;
}
