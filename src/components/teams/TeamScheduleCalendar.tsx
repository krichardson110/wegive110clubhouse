import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ScheduleEvent, eventTypeConfig } from "@/types/schedule";
import { cn } from "@/lib/utils";

interface TeamScheduleCalendarProps {
  events: ScheduleEvent[];
  currentDate: Date;
  onEventClick: (event: ScheduleEvent) => void;
}

const TeamScheduleCalendar = ({ events, currentDate, onEventClick }: TeamScheduleCalendarProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of the week for the first day (0 = Sunday)
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date + "T00:00:00");
      return isSameDay(eventDate, date);
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "game":
        return "bg-accent text-accent-foreground";
      case "practice":
        return "bg-primary text-primary-foreground";
      case "workout":
        return "bg-emerald-500 text-white";
      case "team-meeting":
        return "bg-blue-500 text-white";
      case "off-day":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for days before month starts */}
        {paddingDays.map((_, idx) => (
          <div key={`pad-${idx}`} className="aspect-square" />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[80px] p-1 border border-border rounded-lg relative overflow-hidden",
                isCurrentDay && "border-primary bg-primary/5"
              )}
            >
              <div className={cn(
                "text-xs font-medium mb-1",
                isCurrentDay ? "text-primary" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </div>
              
              {dayEvents.length > 0 && (
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-[10px] truncate px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity",
                        getEventColor(event.event_type)
                      )}
                      onClick={() => onEventClick(event)}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamScheduleCalendar;
