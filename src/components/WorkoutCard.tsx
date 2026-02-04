import { Clock, Dumbbell, ChevronRight, Play } from "lucide-react";
import { Workout } from "@/types/workout";

interface WorkoutCardProps {
  workout: Workout;
  categoryColor: string;
}

const difficultyColors = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const WorkoutCard = ({ workout, categoryColor }: WorkoutCardProps) => {
  const handleClick = () => {
    if (workout.youtube_id) {
      window.open(`https://www.youtube.com/watch?v=${workout.youtube_id}`, "_blank");
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {workout.title}
          </h4>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <Play className="w-4 h-4 text-primary fill-current ml-0.5" />
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {workout.description}
        </p>
        
        {/* Meta info */}
        <div className="flex items-center gap-3 mb-3">
          {workout.duration && (
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {workout.duration}
            </span>
          )}
          <span className="text-xs flex items-center gap-1 text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5" />
            {workout.exercises} exercises
          </span>
        </div>
        
        {/* Difficulty badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${difficultyColors[workout.difficulty]}`}>
            {workout.difficulty}
          </span>
          <span className="text-xs text-accent font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {workout.youtube_id ? "Watch Video" : "Start Workout"}
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
