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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={cn("text-sm mt-1", {
              "text-green-600": changeType === "positive",
              "text-red-600": changeType === "negative",
              "text-gray-500": changeType === "neutral",
            })}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-brand-50 rounded-lg text-brand-600">{icon}</div>
      </div>
    </div>
  );
}
