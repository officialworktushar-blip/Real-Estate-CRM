import { ReactNode } from "react";
import { cn } from "@/utils/helpers";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon }: StatsCardProps) {
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-dark-100">{value}</p>
          {change && (
            <p className={cn("text-sm mt-1", {
              "text-emerald-400": changeType === "positive",
              "text-red-400": changeType === "negative",
              "text-dark-400": changeType === "neutral",
            })}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400">{icon}</div>
      </div>
    </div>
  );
}
