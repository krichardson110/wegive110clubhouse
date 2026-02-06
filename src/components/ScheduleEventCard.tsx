import { Clock, MapPin, Users, ChevronRight } from "lucide-react";
import { ScheduleEvent, EventType, eventTypeConfig } from "@/types/schedule";

interface ScheduleEventCardProps {
  event: ScheduleEvent;
}

const ScheduleEventCard = ({ event }: ScheduleEventCardProps) => {
  const config = eventTypeConfig[event.event_type as EventType];

  return (
    <div className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${config.bgColor}`}>
      {/* Event type indicator */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${config.bgColor} ${config.color}`}>
          {config.label}
          {event.is_home !== undefined && event.is_home !== null && (
            <span className="ml-1">
              {event.is_home ? "(Home)" : "(Away)"}
            </span>
          )}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {event.title}
      </h4>

      {/* Opponent */}
      {event.opponent && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Users className="w-4 h-4" />
          <span>vs. {event.opponent}</span>
        </div>
      )}

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Clock className="w-4 h-4" />
        <span>
          {event.event_time}
          {event.end_time && ` - ${event.end_time}`}
        </span>
      </div>

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          {event.notes}
        </p>
      )}
    </div>
  );
};

export default ScheduleEventCard;
