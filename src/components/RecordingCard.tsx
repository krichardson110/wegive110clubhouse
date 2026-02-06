import { Play, ExternalLink, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReturnReportRecording } from "@/types/returnReport";

interface RecordingCardProps {
  recording: ReturnReportRecording;
}

const RecordingCard = ({ recording }: RecordingCardProps) => {
  const thumbnailUrl = recording.youtube_id
    ? `https://img.youtube.com/vi/${recording.youtube_id}/mqdefault.jpg`
    : null;

  const watchUrl = recording.youtube_id
    ? `https://youtube.com/watch?v=${recording.youtube_id}`
    : recording.external_url;

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-video bg-secondary/50">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={recording.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {watchUrl && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button asChild variant="secondary">
              <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4 mr-2" />
                Watch
              </a>
            </Button>
          </div>
        )}
        {recording.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recording.duration}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-foreground mb-2 line-clamp-2">{recording.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(recording.recording_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        {recording.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {recording.description}
          </p>
        )}
        {watchUrl && (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Open Recording
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordingCard;
