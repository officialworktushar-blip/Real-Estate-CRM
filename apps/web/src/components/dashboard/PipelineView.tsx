import { ReactNode } from "react";

interface PipelineStageProps {
  stage: string;
  count: number;
  value: number;
  color: string;
}

export function PipelineView({ stages }: { stages: PipelineStageProps[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
      {stages.map((stage) => (
        <div key={stage.stage} className="text-center">
          <div className="text-xs font-medium text-gray-500 uppercase mb-2 truncate">{stage.stage.replace("_", " ")}</div>
          <div className="text-xl font-bold">{stage.count}</div>
          <div className="text-xs text-gray-400">${(stage.value / 1000).toFixed(0)}k</div>
        </div>
      ))}
    </div>
  );
}
