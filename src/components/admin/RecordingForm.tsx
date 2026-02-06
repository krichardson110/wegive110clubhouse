import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReturnReportRecording } from "@/types/returnReport";

interface RecordingFormProps {
  recording: ReturnReportRecording | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ReturnReportRecording>) => void;
  isLoading: boolean;
}

const RecordingForm = ({ recording, isOpen, onClose, onSave, isLoading }: RecordingFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [recordingDate, setRecordingDate] = useState("");
  const [duration, setDuration] = useState("");
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (recording) {
      setTitle(recording.title);
      setDescription(recording.description || "");
      setYoutubeId(recording.youtube_id || "");
      setExternalUrl(recording.external_url || "");
      setRecordingDate(recording.recording_date);
      setDuration(recording.duration || "");
      setPublished(recording.published);
    } else {
      setTitle("");
      setDescription("");
      setYoutubeId("");
      setExternalUrl("");
      setRecordingDate(new Date().toISOString().split("T")[0]);
      setDuration("");
      setPublished(true);
    }
  }, [recording, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || null,
      youtube_id: youtubeId || null,
      external_url: externalUrl || null,
      recording_date: recordingDate,
      duration: duration || null,
      published,
    });
  };

  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{recording ? "Edit Recording" : "Add Recording"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Team Call - Jan 15"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordingDate">Recording Date *</Label>
            <Input
              id="recordingDate"
              type="date"
              value={recordingDate}
              onChange={(e) => setRecordingDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeId">YouTube Video ID or URL</Label>
            <Input
              id="youtubeId"
              value={youtubeId}
              onChange={(e) => setYoutubeId(extractYoutubeId(e.target.value))}
              placeholder="dQw4w9WgXcQ or full YouTube URL"
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube URL or video ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalUrl">Or External URL</Label>
            <Input
              id="externalUrl"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Use if video is hosted elsewhere (Google Drive, Vimeo, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="45:00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Topics covered in this call..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title} className="flex-1">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingForm;
