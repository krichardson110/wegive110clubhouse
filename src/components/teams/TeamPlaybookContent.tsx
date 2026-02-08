import PlaybookJourneyCard from "@/components/PlaybookJourneyCard";
import { usePlaybook } from "@/hooks/usePlaybook";
import { BookOpen, Award, Target, TrendingUp, Loader2 } from "lucide-react";

const TeamPlaybookContent = () => {
  const { data: journeys = [], isLoading } = usePlaybook();
  
  const totalChapters = journeys.reduce((acc, j) => acc + j.chapters.length, 0);
  const totalReadings = journeys.reduce((acc, j) => 
    acc + j.chapters.reduce((chAcc, ch) => chAcc + ch.readings.length, 0), 0);
  const totalExercises = journeys.reduce((acc, j) => 
    acc + j.chapters.reduce((chAcc, ch) => chAcc + ch.exercises.length, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Leadership Playbook</h3>
            <p className="text-sm text-muted-foreground">Develop character and leadership skills</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-card/50 backdrop-blur rounded-lg px-3 py-2 border border-border text-center">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-primary" />
              <span className="font-semibold text-foreground text-sm">{totalChapters}</span>
              <span className="text-xs text-muted-foreground">Chapters</span>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg px-3 py-2 border border-border text-center">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-accent" />
              <span className="font-semibold text-foreground text-sm">{totalReadings}</span>
              <span className="text-xs text-muted-foreground">Readings</span>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-lg px-3 py-2 border border-border text-center">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="font-semibold text-foreground text-sm">{totalExercises}</span>
              <span className="text-xs text-muted-foreground">Exercises</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="bg-secondary/30 rounded-lg p-4 border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-foreground text-sm">Your Journey</p>
              <p className="text-xs text-muted-foreground">Complete all journeys to become a certified leader</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <span className="text-xs text-muted-foreground">0/{journeys.length} Complete</span>
          </div>
        </div>
      </div>

      {/* Journeys */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : journeys.length > 0 ? (
        <div className="space-y-4">
          {journeys.map((journey, index) => (
            <div
              key={journey.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PlaybookJourneyCard journey={journey} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Journeys Available</h3>
          <p className="text-sm text-muted-foreground">
            Check back soon for leadership development content.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamPlaybookContent;
