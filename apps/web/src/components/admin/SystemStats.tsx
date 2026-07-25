import { Card, CardHeader, CardContent } from "@/components/common/Card";

interface SystemStat {
  label: string;
  value: number | string;
}

export function SystemStats({ stats }: { stats: SystemStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="text-center py-6">
            <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
