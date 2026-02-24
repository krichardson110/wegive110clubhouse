import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Practice, PracticeDrill } from "@/types/practice";
import PracticeCalendarView from "@/components/practices/PracticeCalendarView";
import PracticeListView from "@/components/practices/PracticeListView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamPracticesContentProps {
  teamId: string;
  isCoach?: boolean;
}

const TeamPracticesContent = ({ teamId, isCoach }: TeamPracticesContentProps) => {
  const [view, setView] = useState<"calendar" | "list">("list");

  const { data: practices = [], isLoading } = useQuery({
    queryKey: ["team-practices", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practices")
        .select("*, practice_drills(*)")
        .or(`team_id.eq.${teamId},team_id.is.null`)
        .eq("published", true)
        .order("practice_date", { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        drills: (p.practice_drills || [])
          .sort((a: any, b: any) => a.drill_order - b.drill_order) as PracticeDrill[],
      })) as Practice[];
    },
    enabled: !!teamId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (practices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No practice plans available yet.</p>
      </div>
    );
  }

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
      <TabsList className="mb-4">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="w-4 h-4" />
          List
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Calendar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <PracticeListView practices={practices} isCoach={isCoach} />
      </TabsContent>

      <TabsContent value="calendar">
        <PracticeCalendarView practices={practices} isCoach={isCoach} />
      </TabsContent>
    </Tabs>
  );
};

export default TeamPracticesContent;
