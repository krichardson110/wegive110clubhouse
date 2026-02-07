import { useState } from "react";
import { format, isToday } from "date-fns";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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

interface TeamScheduleProps {
  isCoach: boolean;
  teamId?: string;
}

const TeamSchedule = ({ isCoach, teamId }: TeamScheduleProps) => {
  const { upcomingEvents, isLoading, createEvent, updateEvent, deleteEvent, isCreating, isUpdating, isDeleting } = useTeamEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Filter events to show only team-specific or organization-wide events
  const teamEvents = upcomingEvents.filter(
    event => !event.team_id || event.team_id === teamId
  );

  const handleCreateEvent = (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
    createEvent(data, {
      onSuccess: () => {
        setShowEventForm(false);
      },
    });
  };

  const handleUpdateEvent = (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
    if (!editingEvent) return;
    updateEvent(
      { id: editingEvent.id, ...data },
      {
        onSuccess: () => {
          setEditingEvent(null);
        },
      }
    );
  };

  const handleDeleteEvent = () => {
    if (!deletingEventId) return;
    deleteEvent(deletingEventId, {
      onSuccess: () => {
        setDeletingEventId(null);
      },
    });
  };

  const handleEditClick = (event: ScheduleEvent) => {
    setEditingEvent(event);
  };

  const handleDeleteClick = (eventId: string) => {
    setDeletingEventId(eventId);
  };

  // Check if user can edit/delete this event (must be team-specific event, not org-wide)
  const canModifyEvent = (event: ScheduleEvent) => {
    return isCoach && event.team_id === teamId;
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          {isCoach && (
            <Button onClick={() => setShowEventForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
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
                            onClick={() => handleEditClick(event)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(event.id)}
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
              <p>No upcoming events scheduled.</p>
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
