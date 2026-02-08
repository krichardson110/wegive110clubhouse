import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Practice, seasonConfig, phaseConfig } from "@/types/practice";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PracticeCard from "./PracticeCard";

interface PracticeCalendarViewProps {
  practices: Practice[];
  isCoach?: boolean;
  onEdit?: (practice: Practice) => void;
  onDelete?: (practiceId: string) => void;
}

const PracticeCalendarView = ({ practices, isCoach, onEdit, onDelete }: PracticeCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of the week for the first day (0 = Sunday)
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const getPracticesForDay = (date: Date) => {
    return practices.filter(practice => {
      const practiceDate = new Date(practice.practice_date + "T00:00:00");
      return isSameDay(practiceDate, date);
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl">{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding for days before month starts */}
            {paddingDays.map((_, idx) => (
              <div key={`pad-${idx}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {days.map((day) => {
              const dayPractices = getPracticesForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "aspect-square p-1 border border-border rounded-lg relative overflow-hidden",
                    isCurrentDay && "border-primary bg-primary/5",
                    dayPractices.length > 0 && "cursor-pointer hover:border-primary/50"
                  )}
                  onClick={() => {
                    if (dayPractices.length === 1) {
                      setSelectedPractice(dayPractices[0]);
                    }
                  }}
                >
                  <div className={cn(
                    "text-xs font-medium",
                    isCurrentDay ? "text-primary" : "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </div>
                  
                  {dayPractices.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayPractices.slice(0, 2).map((practice) => (
                        <div
                          key={practice.id}
                          className={cn(
                            "text-xs truncate px-1 py-0.5 rounded cursor-pointer",
                            phaseConfig[practice.phase].bgColor
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPractice(practice);
                          }}
                        >
                          {practice.title}
                        </div>
                      ))}
                      {dayPractices.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayPractices.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Practice detail modal */}
      <Dialog open={!!selectedPractice} onOpenChange={(open) => !open && setSelectedPractice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Practice Details</DialogTitle>
          </DialogHeader>
          {selectedPractice && (
            <PracticeCard
              practice={selectedPractice}
              isCoach={isCoach}
              onEdit={() => {
                onEdit?.(selectedPractice);
                setSelectedPractice(null);
              }}
              onDelete={() => {
                onDelete?.(selectedPractice.id);
                setSelectedPractice(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PracticeCalendarView;
