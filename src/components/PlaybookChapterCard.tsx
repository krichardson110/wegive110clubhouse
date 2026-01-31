import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, PenTool, MessageCircle, FileText, Clock, CheckCircle } from "lucide-react";
import { PlaybookChapter } from "@/data/playbook";
import { Button } from "@/components/ui/button";

interface PlaybookChapterCardProps {
  chapter: PlaybookChapter;
}

const exerciseTypeIcons = {
  reflection: PenTool,
  action: CheckCircle,
  discussion: MessageCircle,
  journaling: FileText,
};

const exerciseTypeLabels = {
  reflection: "Reflection",
  action: "Action Item",
  discussion: "Team Discussion",
  journaling: "Journaling",
};

const PlaybookChapterCard = ({ chapter }: PlaybookChapterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = chapter.icon;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden transition-all duration-300 hover:border-primary/30">
      {/* Chapter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-5">
          {/* Chapter Number */}
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="font-display text-2xl text-primary">{chapter.number}</span>
          </div>
          
          <div className={`p-3 rounded-lg bg-gradient-to-br ${chapter.color} border hidden sm:flex`}>
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          
          <div>
            <h3 className="font-display text-xl sm:text-2xl text-foreground tracking-wide">
              {chapter.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {chapter.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:block">
            {chapter.readings.length} readings • {chapter.exercises.length} exercises
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border animate-fade-in">
          {/* Description & Key Takeaways */}
          <div className="p-6 bg-secondary/20">
            <p className="text-muted-foreground mb-6">{chapter.description}</p>
            
            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Key Takeaways
              </h4>
              <ul className="space-y-2">
                {chapter.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Readings */}
          <div className="p-6 border-t border-border/50">
            <h4 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Reading Materials
            </h4>
            
            <div className="space-y-4">
              {chapter.readings.map((reading) => (
                <div key={reading.id} className="bg-secondary/30 rounded-lg p-5 border border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary uppercase">
                        {reading.type}
                      </span>
                      <h5 className="font-semibold text-foreground mt-2">{reading.title}</h5>
                      {reading.author && (
                        <p className="text-sm text-muted-foreground">by {reading.author}</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{reading.description}</p>
                  
                  <div className={`text-foreground leading-relaxed ${reading.type === 'quote' ? 'italic border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r' : ''}`}>
                    {reading.content}
                  </div>
                  
                  {reading.source && reading.type !== 'quote' && (
                    <p className="text-xs text-muted-foreground mt-3">— {reading.source}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Exercises */}
          <div className="p-6 border-t border-border/50 bg-secondary/10">
            <h4 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-accent" />
              Exercises & Activities
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapter.exercises.map((exercise) => {
                const ExerciseIcon = exerciseTypeIcons[exercise.type];
                return (
                  <div key={exercise.id} className="bg-card rounded-lg p-5 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ExerciseIcon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {exerciseTypeLabels[exercise.type]}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exercise.timeEstimate}
                      </span>
                    </div>
                    
                    <h5 className="font-semibold text-foreground mb-2">{exercise.title}</h5>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                    
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      Start Exercise
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookChapterCard;
