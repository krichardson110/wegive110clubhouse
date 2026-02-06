import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ScheduleEventForm from "./ScheduleEventForm";
import { ScheduleEvent, EventType, eventTypeConfig } from "@/types/schedule";

const ScheduleManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  // Fetch all events (including unpublished for admin)
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-schedule-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_events")
        .select("*")
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });

      if (error) throw error;
      return data as ScheduleEvent[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (eventData: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("schedule_events").insert(eventData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule-events"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
      toast.success("Event created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: ScheduleEvent) => {
      const { error } = await supabase.from("schedule_events").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule-events"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
      toast.success("Event updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule-events"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
    if (editingEvent) {
      updateMutation.mutate({ ...editingEvent, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getEventTypeBadge = (type: EventType) => {
    const config = eventTypeConfig[type];
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Events
        </CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled yet.</p>
            <p className="text-sm">Click "Add Event" to create your first event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {format(new Date(event.event_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {event.event_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        {event.title}
                        {event.opponent && (
                          <span className="text-muted-foreground text-sm block">
                            vs. {event.opponent} {event.is_home ? "(Home)" : "(Away)"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getEventTypeBadge(event.event_type as EventType)}</TableCell>
                    <TableCell className="text-muted-foreground">{event.location || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={event.published ? "default" : "secondary"}>
                        {event.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            </DialogHeader>
            <ScheduleEventForm
              event={editingEvent}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ScheduleManager;
