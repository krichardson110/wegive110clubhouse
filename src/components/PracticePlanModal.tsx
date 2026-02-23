import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, ClipboardList } from "lucide-react";
import PracticeDrillList from "@/components/practices/PracticeDrillList";
import { PracticeDrill, seasonConfig, phaseConfig } from "@/types/practice";
import { format } from "date-fns";

interface PracticePlanModalProps {
  practiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PracticePlanModal = ({ practiceId, open, onOpenChange }: PracticePlanModalProps) => {
  const { data: practice, isLoading } = useQuery({
    queryKey: ["practice-detail", practiceId],
    queryFn: async () => {
      if (!practiceId) return null;
      const { data, error } = await supabase
        .from("practices")
        .select("*, practice_drills(*)")
        .eq("id", practiceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!practiceId && open,
  });

  const drills: PracticeDrill[] = (practice?.practice_drills || [])
    .sort((a: any, b: any) => a.drill_order - b.drill_order);

  const totalMinutes = drills.reduce((sum, d) => sum + (d.duration_minutes || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Practice Plan
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : practice ? (
          <div className="space-y-4">
            {/* Practice Header */}
            <div>
              <h3 className="text-lg font-semibold">{practice.title}</h3>
              {practice.description && (
                <p className="text-sm text-muted-foreground mt-1">{practice.description}</p>
              )}
            </div>

            {/* Practice Meta */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={seasonConfig[practice.season as keyof typeof seasonConfig]?.bgColor}>
                {seasonConfig[practice.season as keyof typeof seasonConfig]?.label || practice.season}
              </Badge>
              <Badge variant="outline" className={phaseConfig[practice.phase as keyof typeof phaseConfig]?.bgColor}>
                {phaseConfig[practice.phase as keyof typeof phaseConfig]?.label || practice.phase}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(practice.practice_date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {practice.start_time}{practice.end_time ? ` - ${practice.end_time}` : ""}
              </div>
              {practice.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {practice.location}
                </div>
              )}
            </div>

            {/* Focus Areas */}
            {practice.focus_areas && practice.focus_areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {practice.focus_areas.map((area: string) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            )}

            {/* Drill Summary */}
            <div className="text-sm text-muted-foreground border-t pt-3">
              {drills.length} drill{drills.length !== 1 ? "s" : ""} • ~{totalMinutes} min total
            </div>

            {/* Drill List */}
            {drills.length > 0 ? (
              <PracticeDrillList drills={drills} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No drills added to this practice plan yet.
              </p>
            )}

            {/* Notes */}
            {practice.notes && (
              <div className="border-t pt-3">
                <span className="text-xs font-medium text-muted-foreground">Notes:</span>
                <p className="text-sm mt-1">{practice.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Practice plan not found.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PracticePlanModal;
