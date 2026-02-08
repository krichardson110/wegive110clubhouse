import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Target, TrendingUp } from "lucide-react";
import { Journey } from "@/hooks/usePlaybook";
import PlaybookChapterCard from "./PlaybookChapterCard";

interface PlaybookJourneyCardProps {
  journey: Journey;
}

const PlaybookJourneyCard = ({ journey }: PlaybookJourneyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = journey.icon;
  
  const totalReadings = journey.chapters.reduce((acc, ch) => acc + ch.readings.length, 0);
  const totalExercises = journey.chapters.reduce((acc, ch) => acc + ch.exercises.length, 0);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Journey Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-6 text-left transition-all duration-300 ${
          isExpanded ? "bg-secondary/50" : "hover:bg-secondary/30"
        }`}
      >
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${journey.color} border`}>
            <Icon className="w-8 h-8 text-foreground" />
          </div>
          
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">
              {journey.title}
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {journey.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>{journey.chapters.length} chapters</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>{totalReadings} readings</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{totalExercises} exercises</span>
            </div>
          </div>
          
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* Expanded Chapters */}
      {isExpanded && (
        <div className="border-t border-border bg-secondary/20 p-6 animate-fade-in">
          <div className="space-y-4">
            {journey.chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PlaybookChapterCard chapter={chapter} />
              </div>
            ))}
            
            {journey.chapters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No chapters available in this journey yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookJourneyCard;
