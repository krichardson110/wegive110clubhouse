import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScheduleEvent, EventType, eventTypes, eventTypeConfig } from "@/types/schedule";

interface ScheduleEventFormProps {
  event?: ScheduleEvent | null;
  onSubmit: (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ScheduleEventForm = ({ event, onSubmit, onCancel, isLoading }: ScheduleEventFormProps) => {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    event_date: event?.event_date || new Date().toISOString().split("T")[0],
    event_time: event?.event_time || "3:00 PM",
    end_time: event?.end_time || "",
    event_type: (event?.event_type || "practice") as EventType,
    location: event?.location || "",
    opponent: event?.opponent || "",
    notes: event?.notes || "",
    is_home: event?.is_home ?? true,
    published: event?.published ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      end_time: formData.end_time || null,
      location: formData.location || null,
      opponent: formData.opponent || null,
      notes: formData.notes || null,
      is_home: formData.event_type === "game" ? formData.is_home : null,
    });
  };

  const showOpponentField = formData.event_type === "game";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Team Practice"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_type">Event Type *</Label>
          <Select
            value={formData.event_type}
            onValueChange={(value: EventType) => setFormData({ ...formData, event_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {eventTypeConfig[type].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_date">Date *</Label>
          <Input
            id="event_date"
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_time">Start Time *</Label>
          <Input
            id="event_time"
            value={formData.event_time}
            onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
            placeholder="e.g., 3:30 PM"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            placeholder="e.g., 5:30 PM"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Main Field"
          />
        </div>

        {showOpponentField && (
          <>
            <div className="space-y-2">
              <Label htmlFor="opponent">Opponent</Label>
              <Input
                id="opponent"
                value={formData.opponent}
                onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                placeholder="e.g., Eastside Eagles"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is_home"
                checked={formData.is_home}
                onCheckedChange={(checked) => setFormData({ ...formData, is_home: checked })}
              />
              <Label htmlFor="is_home">Home Game</Label>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional details..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
        />
        <Label htmlFor="published">Published (visible to team members)</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleEventForm;
