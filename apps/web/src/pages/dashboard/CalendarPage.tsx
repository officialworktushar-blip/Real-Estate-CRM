import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { useCalendar } from "@/hooks/useCalendar";
import { EventFormModal } from "@/components/dashboard/forms/EventFormModal";

type EventType = "viewing" | "meeting" | "open_house" | "closing" | "follow_up" | "inspection";

const eventTypeConfig: Record<EventType, { label: string; color: string; bgColor: string; textColor: string }> = {
  viewing: { label: "Viewing", color: "border-l-brand-500", bgColor: "bg-brand-500/10", textColor: "text-brand-400" },
  meeting: { label: "Meeting", color: "border-l-gold-500", bgColor: "bg-gold-500/10", textColor: "text-gold-400" },
  open_house: { label: "Open House", color: "border-l-emerald-500", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400" },
  closing: { label: "Closing", color: "border-l-purple-500", bgColor: "bg-purple-500/10", textColor: "text-purple-400" },
  follow_up: { label: "Follow Up", color: "border-l-amber-500", bgColor: "bg-amber-500/10", textColor: "text-amber-400" },
  inspection: { label: "Inspection", color: "border-l-red-500", bgColor: "bg-red-500/10", textColor: "text-red-400" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  const startDate = formatDateStr(currentYear, currentMonth, 1);
  const endDate = formatDateStr(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));
  const { events, isLoading, createEvent, isSubmitting, submitError } = useCalendar(startDate, endDate);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const days = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  const eventsForDate = (dateStr: string) =>
    events.filter((e) => {
      const eventDate = new Date(e.start_time).toISOString().split("T")[0];
      const matchDate = eventDate === dateStr;
      const matchType = typeFilter === "all" || e.event_type === typeFilter;
      return matchDate && matchType;
    });

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const totalEventsForDay = (day: number) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    return events.filter((e) => {
      const eventDate = new Date(e.start_time).toISOString().split("T")[0];
      return eventDate === dateStr;
    }).length;
  };

  const upcomingThisWeek = events.filter((e) => {
    const d = new Date(e.start_time);
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return d >= now && d <= weekEnd;
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Calendar</h1>
          <p className="text-sm text-dark-400 mt-1">Schedule and manage your appointments</p>
        </div>
        <Button onClick={() => setIsEventModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EventType | "all")}
          className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
        >
          <option value="all">All Events</option>
          {Object.entries(eventTypeConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 text-xs text-dark-500">
          {Object.entries(eventTypeConfig).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 px-2 py-1">
              <div className={`h-2 w-2 rounded-full ${v.bgColor}`} />
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-dark-100 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-dark-100 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-t border-dark-700">
                {DAYS.map((d) => (
                  <div key={d} className="text-center py-2 text-xs font-medium text-dark-400 border-b border-dark-700">
                    {d}
                  </div>
                ))}
                {days.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="border-b border-r border-dark-700/50 min-h-[80px]" />;
                  const dateStr = formatDateStr(currentYear, currentMonth, day);
                  const dayEvents = eventsForDate(dateStr);
                  const selected = selectedDate === dateStr;
                  const count = totalEventsForDay(day);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`border-b border-r border-dark-700/50 min-h-[80px] p-1 cursor-pointer transition-colors ${
                        selected ? "bg-dark-700/50" : "hover:bg-dark-800/50"
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday(day) ? "bg-gold-500 text-dark-900" : "text-dark-300"
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((evt) => {
                          const config = eventTypeConfig[evt.event_type as EventType] || eventTypeConfig.meeting;
                          return (
                            <div key={evt.id} className={`text-[9px] leading-tight px-1 py-0.5 rounded truncate ${config.bgColor} ${config.textColor}`}>
                              {evt.title.split(" - ")[0]}
                            </div>
                          );
                        })}
                        {count > 3 && (
                          <div className="text-[9px] text-dark-400 px-1">+{count - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">
                {selectedDate
                  ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                  : "Select a date"}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center text-dark-500 text-sm py-8">Loading events...</div>
              ) : selectedEvents.length === 0 ? (
                <p className="text-sm text-dark-500 text-center py-8">No events scheduled</p>
              ) : (
                selectedEvents.map((evt) => {
                  const config = eventTypeConfig[evt.event_type as EventType] || eventTypeConfig.meeting;
                  const startTime = new Date(evt.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  const endTime = new Date(evt.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  return (
                    <div key={evt.id} className={`border-l-2 ${config.color} rounded-r-lg ${config.bgColor} p-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-dark-100">{evt.title}</h4>
                        <Badge variant="default">{config.label}</Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-dark-500" />
                          <span className="text-xs text-dark-300">
                            {startTime === endTime ? startTime : `${startTime} - ${endTime}`}
                          </span>
                        </div>
                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-dark-500" />
                            <span className="text-xs text-dark-300">{evt.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Upcoming This Week</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingThisWeek.length === 0 ? (
                <p className="text-sm text-dark-500 text-center py-4">No upcoming events</p>
              ) : (
                upcomingThisWeek.map((evt) => {
                  const config = eventTypeConfig[evt.event_type as EventType] || eventTypeConfig.meeting;
                  return (
                    <div key={evt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700/30 transition-colors">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${config.bgColor.replace("/10", "")}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-dark-200 truncate">{evt.title}</p>
                        <p className="text-[10px] text-dark-500">
                          {new Date(evt.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                          {new Date(evt.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={createEvent}
        isSubmitting={isSubmitting}
        submitError={submitError}
        initialDate={selectedDate ?? undefined}
      />
    </div>
  );
}
