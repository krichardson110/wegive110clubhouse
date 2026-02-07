import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { ScheduleEvent } from "@/types/schedule";

export function useTeamEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["schedule-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_events")
        .select("*")
        .eq("published", true)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as ScheduleEvent[];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("schedule_events")
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Event created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduleEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from("schedule_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Event updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("schedule_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  // Get upcoming events (next 14 days)
  const getUpcomingEvents = () => {
    if (!eventsQuery.data) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return eventsQuery.data
      .filter(event => {
        const eventDate = new Date(event.event_date + "T00:00:00");
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 14;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  };

  return {
    events: eventsQuery.data || [],
    upcomingEvents: getUpcomingEvents(),
    isLoading: eventsQuery.isLoading,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
}
