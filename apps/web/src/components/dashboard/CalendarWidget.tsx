import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Calendar } from "lucide-react";

export function CalendarWidget() {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Upcoming Events</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Calendar className="h-12 w-12 mb-2" />
          <p className="text-sm">No upcoming events</p>
        </div>
      </CardContent>
    </Card>
  );
}
