import { format } from "date-fns";
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Users, Target } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Practice, seasonConfig, phaseConfig } from "@/types/practice";
import { cn } from "@/lib/utils";
import PracticeDrillList from "./PracticeDrillList";

interface PracticeCardProps {
  practice: Practice;
  isCoach?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PracticeCard = ({ practice, isCoach, onEdit, onDelete }: PracticeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const practiceDate = new Date(practice.practice_date + "T00:00:00");
  const season = seasonConfig[practice.season];
  const phase = phaseConfig[practice.phase];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn("text-xs", season.bgColor, season.color)}>
                  {season.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", phase.bgColor, phase.color)}>
                  {phase.label}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground">{practice.title}</h3>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(practiceDate, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatTime(practice.start_time)}
                  {practice.end_time && ` - ${formatTime(practice.end_time)}`}
                  {practice.duration_minutes && ` (${practice.duration_minutes} min)`}
                </div>
                {practice.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {practice.location}
                  </div>
                )}
              </div>
              
              {practice.focus_areas && practice.focus_areas.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {practice.focus_areas.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isCoach && (
                <>
                  <Button variant="ghost" size="sm" onClick={onEdit}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
                    Delete
                  </Button>
                </>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {practice.description && (
              <p className="text-muted-foreground mb-4">{practice.description}</p>
            )}
            
            {practice.equipment_needed && practice.equipment_needed.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Equipment Needed:</h4>
                <div className="flex flex-wrap gap-1">
                  {practice.equipment_needed.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {practice.notes && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Notes:</h4>
                <p className="text-sm text-muted-foreground">{practice.notes}</p>
              </div>
            )}
            
            {practice.drills && practice.drills.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-3">Practice Plan ({practice.drills.length} drills)</h4>
                <PracticeDrillList drills={practice.drills} />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PracticeCard;
