import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn.ts";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-background hover:brightness-110",
        ghost: "text-muted-foreground hover:bg-elevated hover:text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export function Button({
  className,
  variant,
  asChild,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
