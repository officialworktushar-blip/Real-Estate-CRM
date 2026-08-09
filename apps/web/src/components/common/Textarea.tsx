import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/helpers";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-dark-200">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "block w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-100 shadow-sm",
            "placeholder:text-dark-400",
            "focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
