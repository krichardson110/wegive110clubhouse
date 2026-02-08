import { useState } from "react";
import { Clock, Dumbbell, ChevronRight, Play, X, Star } from "lucide-react";
import { Workout } from "@/types/workout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWorkoutFavorites } from "@/hooks/useWorkoutFavorites";
import { useAuth } from "@/hooks/useAuth";

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
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useWorkoutFavorites();
  
  const starred = isFavorite(workout.id);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(workout.id);
  };

  return (
    <>
      <div 
        className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer"
        onClick={() => workout.youtube_id && setIsOpen(true)}
      >
        {/* Hover glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Star button - only show for logged in users */}
        {user && (
          <button
            onClick={handleStarClick}
            disabled={isToggling}
            className={`absolute top-3 right-3 z-20 p-1.5 rounded-full transition-all duration-200 ${
              starred 
                ? "text-yellow-400 bg-yellow-400/20" 
                : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 opacity-0 group-hover:opacity-100"
            }`}
            title={starred ? "Remove from starred" : "Star this workout"}
          >
            <Star className={`w-4 h-4 ${starred ? "fill-current" : ""}`} />
          </button>
        )}
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors pr-8">
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

      {/* Video Modal */}
      {workout.youtube_id && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl p-0 bg-card border-border overflow-hidden">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Video embed */}
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${workout.youtube_id}?autoplay=1`}
                  title={workout.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Video info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${difficultyColors[workout.difficulty]}`}>
                    {workout.difficulty}
                  </span>
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
                <h3 className="font-display text-2xl text-foreground mb-2">{workout.title}</h3>
                {workout.description && (
                  <p className="text-muted-foreground">{workout.description}</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default WorkoutCard;
