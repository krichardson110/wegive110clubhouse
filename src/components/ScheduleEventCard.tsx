import { Clock, MapPin, Users, ChevronRight, Paperclip, FileText, Image, File } from "lucide-react";
import { ScheduleEvent, EventType, eventTypeConfig, EventAttachment } from "@/types/schedule";

interface ScheduleEventCardProps {
  event: ScheduleEvent;
}

const ScheduleEventCard = ({ event }: ScheduleEventCardProps) => {
  const config = eventTypeConfig[event.event_type as EventType];
  const attachments = event.attachments || [];

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-3 h-3" />;
    if (type.includes("pdf")) return <FileText className="w-3 h-3" />;
    return <File className="w-3 h-3" />;
  };

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

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Paperclip className="w-3 h-3" />
            <span>{attachments.length} attachment{attachments.length > 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment: EventAttachment, index: number) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/50 hover:bg-background text-xs text-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {getFileIcon(attachment.type)}
                <span className="truncate max-w-[120px]">{attachment.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleEventCard;
