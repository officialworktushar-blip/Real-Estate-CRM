import { Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Calendar } from "lucide-react";

export function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Event</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Calendar className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">No events scheduled</p>
          <p className="text-sm mt-1">Create your first event to get started</p>
        </CardContent>
      </Card>
    </div>
  );
}
