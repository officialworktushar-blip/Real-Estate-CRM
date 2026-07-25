import { Card, CardContent } from "@/components/common/Card";
import { BarChart3 } from "lucide-react";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Pipeline", "Performance", "Revenue"].map((report) => (
          <Card key={report}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <BarChart3 className="h-10 w-10 mb-3" />
              <p className="font-medium">{report}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
