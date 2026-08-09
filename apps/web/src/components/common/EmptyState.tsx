import type { ReactNode } from "react";
import { cn } from "@/utils/helpers";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dark-700/60 border border-dark-600 text-dark-400">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-dark-100">{title}</h3>
        {description && <p className="text-sm text-dark-400 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
