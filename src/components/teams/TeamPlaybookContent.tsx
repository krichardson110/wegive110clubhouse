import PlaybookChapterCard from "@/components/PlaybookChapterCard";
import { playbookChapters } from "@/data/playbook";
import { BookOpen, Award, Target, TrendingUp } from "lucide-react";

const TeamPlaybookContent = () => {
  const totalReadings = playbookChapters.reduce((acc, ch) => acc + ch.readings.length, 0);
  const totalExercises = playbookChapters.reduce((acc, ch) => acc + ch.exercises.length, 0);

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
              <span className="font-semibold text-foreground text-sm">{playbookChapters.length}</span>
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
              <p className="text-xs text-muted-foreground">Complete all chapters to become a certified leader</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <span className="text-xs text-muted-foreground">0/{playbookChapters.length}</span>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {playbookChapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PlaybookChapterCard chapter={chapter} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPlaybookContent;
