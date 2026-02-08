import { useState } from "react";
import { format, isToday, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isWithinInterval } from "date-fns";
import { Calendar, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ScheduleEventCard from "@/components/ScheduleEventCard";
import ScheduleEventForm from "@/components/admin/ScheduleEventForm";
import { useTeamEvents } from "@/hooks/useTeamEvents";
import { ScheduleEvent, eventTypeConfig } from "@/types/schedule";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "week" | "month";

interface TeamScheduleProps {
  isCoach: boolean;
  teamId?: string;
}

const TeamSchedule = ({ isCoach, teamId }: TeamScheduleProps) => {
  const { upcomingEvents, isLoading, createEvent, updateEvent, deleteEvent, isCreating, isUpdating, isDeleting } = useTeamEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get date range based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case "day":
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
      case "week":
        return { start: startOfWeek(currentDate, { weekStartsOn: 0 }), end: endOfWeek(currentDate, { weekStartsOn: 0 }) };
      case "month":
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  };

  const dateRange = getDateRange();

  // Filter events to show only team-specific or organization-wide events within date range
  const teamEvents = upcomingEvents.filter(event => {
    if (event.team_id && event.team_id !== teamId) return false;
    const eventDate = new Date(event.event_date + "T00:00:00");
    return isWithinInterval(eventDate, { start: dateRange.start, end: dateRange.end });
  });

  // Navigation handlers
  const goToPrevious = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
        break;
      case "week":
        setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case "month":
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
        break;
      case "week":
        setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
        break;
      case "month":
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Format the date range label
  const getDateRangeLabel = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        return `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  };

  const handleCreateEvent = (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
    createEvent(data, {
      onSuccess: () => setShowEventForm(false),
    });
  };

  const handleUpdateEvent = (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
    if (!editingEvent) return;
    updateEvent(
      { id: editingEvent.id, ...data },
      { onSuccess: () => setEditingEvent(null) }
    );
  };

  const handleDeleteEvent = () => {
    if (!deletingEventId) return;
    deleteEvent(deletingEventId, {
      onSuccess: () => setDeletingEventId(null),
    });
  };

  const canModifyEvent = (event: ScheduleEvent) => isCoach && event.team_id === teamId;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Schedule</CardTitle>
            {isCoach && (
              <Button onClick={() => setShowEventForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            )}
          </div>
          
          {/* View Mode Toggle & Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && setViewMode(v as ViewMode)}
              className="justify-start"
            >
              <ToggleGroupItem value="day" aria-label="Day view" className="text-xs px-3">
                Day
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Week view" className="text-xs px-3">
                Week
              </ToggleGroupItem>
              <ToggleGroupItem value="month" aria-label="Month view" className="text-xs px-3">
                Month
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            {getDateRangeLabel()}
          </div>
        </CardHeader>

        <CardContent>
          {teamEvents.length > 0 ? (
            <div className="space-y-4">
              {teamEvents.map((event) => {
                const eventDate = new Date(event.event_date + "T00:00:00");
                const isEventToday = isToday(eventDate);
                const canModify = canModifyEvent(event);
                
                return (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">
                        {isEventToday ? "Today" : format(eventDate, "EEEE, MMMM d")}
                      </div>
                      {canModify && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditingEvent(event)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeletingEventId(event.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <ScheduleEventCard event={event} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No events for this {viewMode}.</p>
              {isCoach && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowEventForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Legend */}
      <Card className="mt-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  type === "game" && "bg-accent",
                  type === "practice" && "bg-primary",
                  type === "workout" && "bg-emerald-500",
                  type === "team-meeting" && "bg-blue-500",
                  type === "off-day" && "bg-muted-foreground"
                )} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Event Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <ScheduleEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowEventForm(false)}
            isLoading={isCreating}
            defaultTeamId={teamId}
            showTeamSelector={true}
            showAttachments={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <ScheduleEventForm
            event={editingEvent}
            onSubmit={handleUpdateEvent}
            onCancel={() => setEditingEvent(null)}
            isLoading={isUpdating}
            defaultTeamId={teamId}
            showTeamSelector={true}
            showAttachments={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEventId} onOpenChange={(open) => !open && setDeletingEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamSchedule;
