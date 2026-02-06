import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, ExternalLink } from "lucide-react";
import type { ReturnReportSettings } from "@/types/returnReport";

interface ReturnReportSettingsFormProps {
  settings: ReturnReportSettings | null;
  onSave: (data: Partial<ReturnReportSettings>) => void;
  isLoading: boolean;
}

const ReturnReportSettingsForm = ({ settings, onSave, isLoading }: ReturnReportSettingsFormProps) => {
  const [meetUrl, setMeetUrl] = useState(settings?.google_meet_url || "");
  const [meetTitle, setMeetTitle] = useState(settings?.meet_title || "Weekly Team Meeting");
  const [meetDescription, setMeetDescription] = useState(settings?.meet_description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      google_meet_url: meetUrl || null,
      meet_title: meetTitle,
      meet_description: meetDescription || null,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Pinned Google Meet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meetTitle">Meeting Title</Label>
            <Input
              id="meetTitle"
              value={meetTitle}
              onChange={(e) => setMeetTitle(e.target.value)}
              placeholder="Weekly Team Meeting"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetUrl">Google Meet URL</Label>
            <div className="flex gap-2">
              <Input
                id="meetUrl"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="flex-1"
              />
              {meetUrl && (
                <Button type="button" variant="outline" size="icon" asChild>
                  <a href={meetUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetDescription">Description</Label>
            <Textarea
              id="meetDescription"
              value={meetDescription}
              onChange={(e) => setMeetDescription(e.target.value)}
              placeholder="Join us for our regular team check-in..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Meeting Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReturnReportSettingsForm;
