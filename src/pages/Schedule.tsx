import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScheduleEventCard from "@/components/ScheduleEventCard";
import ScheduleEventForm from "@/components/admin/ScheduleEventForm";
import { supabase } from "@/integrations/supabase/client";
import { generateRecurringDates, RecurrenceConfig } from "@/components/RecurrencePicker";
import { ScheduleEvent, EventType, eventTypeConfig, mapDbToScheduleEvent } from "@/types/schedule";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Schedule = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isSuperAdmin } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch events from database
  const { data: scheduleEvents = [], isLoading } = useQuery({
    queryKey: ["schedule-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_events")
        .select("*, practices(id, title)")
        .eq("published", true)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...mapDbToScheduleEvent(row),
        linked_practice_name: row.practices?.title || null,
      }));
    },
  });

  const handleCreateEvent = async (data: Omit<ScheduleEvent, "id" | "created_at" | "updated_at"> & { recurrence?: RecurrenceConfig }) => {
    setIsCreating(true);
    try {
      const { recurrence, ...eventData } = data;

      // Generate dates from recurrence
      const dates =
        recurrence && recurrence.pattern !== "none"
          ? generateRecurringDates(eventData.event_date, recurrence.pattern, recurrence.endDate)
          : [eventData.event_date];

      const rows = dates.map((date) => ({
        title: eventData.title,
        event_date: date,
        event_time: eventData.event_time,
        end_time: eventData.end_time || null,
        event_type: eventData.event_type,
        location: eventData.location || null,
        opponent: eventData.opponent || null,
        is_home: eventData.is_home ?? null,
        notes: eventData.notes || null,
        published: true,
        team_id: eventData.team_id || null,
        attachments: (eventData.attachments || []) as unknown as null,
      }));

      const { error } = await supabase
        .from("schedule_events")
        .insert(rows);

      if (error) throw error;
      
      const count = rows.length;
      toast.success(count > 1 ? `${count} events created!` : "Event created successfully");
      queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
      setShowAddEventDialog(false);
    } catch (error: any) {
      toast.error("Failed to create event");
    } finally {
      setIsCreating(false);
    }
  };

  // Get all days to display in the calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific date
  const getEventsForDate = (date: Date): ScheduleEvent[] => {
    return scheduleEvents.filter(event => {
      const eventDate = new Date(event.event_date + "T00:00:00");
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  // Get upcoming events (next 7 days)
  const today = new Date();
  const upcomingEvents = scheduleEvents
    .filter(event => {
      const eventDate = new Date(event.event_date + "T00:00:00");
      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  // Check if a date has events
  const getEventsForDay = (date: Date) => {
    return scheduleEvents.filter(event => isSameDay(new Date(event.event_date + "T00:00:00"), date));
  };

  // Get the primary event type for a day (for coloring)
  const getPrimaryEventType = (date: Date): EventType | null => {
    const events = getEventsForDay(date);
    if (events.length === 0) return null;
    // Prioritize games
    const game = events.find(e => e.event_type === "game");
    if (game) return "game";
    return events[0].event_type as EventType;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(direction === "prev" ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20 text-primary">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  Team Calendar
                </span>
              </div>
              
              {isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAddEventDialog(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/schedule/admin")}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Schedule
                  </Button>
                </div>
              )}
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
              GAME & PRACTICE <span className="gradient-text">SCHEDULE</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay updated with upcoming games, practices, and team events. Never miss a beat.
            </p>
          </div>
        </section>

        {/* Calendar and Events Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border border-border p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-foreground">
                      {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      const isSelected = isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);
                      const eventType = getPrimaryEventType(day);
                      const dayEvents = getEventsForDay(day);

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "relative aspect-square p-1 rounded-lg transition-all duration-200 hover:bg-secondary",
                            !isCurrentMonth && "opacity-30",
                            isSelected && "ring-2 ring-primary bg-primary/10",
                            isTodayDate && !isSelected && "bg-secondary"
                          )}
                        >
                          <span className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-foreground",
                            isTodayDate && "text-accent"
                          )}>
                            {format(day, "d")}
                          </span>
                          
                          {/* Event indicators */}
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayEvents.slice(0, 3).map((event, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    event.event_type === "game" && "bg-accent",
                                    event.event_type === "practice" && "bg-primary",
                                    event.event_type === "workout" && "bg-emerald-500",
                                    event.event_type === "team-meeting" && "bg-blue-500",
                                    event.event_type === "off-day" && "bg-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
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
                </div>

                {/* Selected Date Events */}
                <div className="mt-6">
                  <h3 className="font-display text-xl text-foreground mb-4">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h3>
                  
                  {selectedDateEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedDateEvents.map(event => (
                        <ScheduleEventCard key={event.id} event={event} linkedPracticeName={(event as any).linked_practice_name} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No events scheduled for this day</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Events Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                  <h3 className="font-display text-xl text-foreground mb-4">
                    Upcoming Events
                  </h3>
                  
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.map(event => {
                        const config = eventTypeConfig[event.event_type as EventType];
                        const eventDate = new Date(event.event_date + "T00:00:00");
                        const isEventToday = isToday(eventDate);

                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedDate(eventDate)}
                            className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("w-2 h-2 rounded-full", 
                                event.event_type === "game" && "bg-accent",
                                event.event_type === "practice" && "bg-primary",
                                event.event_type === "workout" && "bg-emerald-500",
                                event.event_type === "team-meeting" && "bg-blue-500",
                                event.event_type === "off-day" && "bg-muted-foreground"
                              )} />
                              <span className="text-xs text-muted-foreground">
                                {isEventToday ? "Today" : format(eventDate, "EEE, MMM d")}
                              </span>
                            </div>
                            <p className="font-medium text-foreground text-sm truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.event_time}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No upcoming events</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Add Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <ScheduleEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowAddEventDialog(false)}
            isLoading={isCreating}
            showTeamSelector={false}
            showAttachments={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
