import { ReactNode } from "react";
import { cn } from "@/utils/helpers";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "info" | "success" | "warning" | "danger";
}

const variants = {
  default: "bg-dark-700 text-dark-200 border border-dark-600",
  info: "bg-brand-500/10 text-brand-400 border border-brand-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
