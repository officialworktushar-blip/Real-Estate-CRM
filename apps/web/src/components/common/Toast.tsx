import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/stores/toastStore";
import { cn } from "@/utils/helpers";

const styles: Record<ToastType, { ring: string; icon: React.ReactNode }> = {
  success: {
    ring: "border-emerald-500/30",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
  },
  error: {
    ring: "border-red-500/30",
    icon: <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />,
  },
  info: {
    ring: "border-brand-500/30",
    icon: <Info className="h-5 w-5 text-brand-400 shrink-0" />,
  },
};

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border bg-dark-800/95 backdrop-blur px-4 py-3 shadow-xl shadow-black/30 animate-toast-in",
            styles[t.type].ring
          )}
        >
          {styles[t.type].icon}
          <p className="flex-1 text-sm text-dark-100 leading-snug pt-0.5">
            {t.message}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-dark-400 hover:text-dark-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
