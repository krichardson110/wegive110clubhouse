import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WorkoutCategory } from "@/data/workouts";
import WorkoutCard from "./WorkoutCard";

interface WorkoutCategoryCardProps {
  category: WorkoutCategory;
  defaultExpanded?: boolean;
}

const WorkoutCategoryCard = ({ category, defaultExpanded = false }: WorkoutCategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = category.icon;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden transition-all duration-300 hover:border-primary/30">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} border`}>
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h3 className="font-display text-xl text-foreground tracking-wide">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {category.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {category.workouts.length} workouts
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* Workouts Grid */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-border/50 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-5">
            {category.workouts.map((workout) => (
              <WorkoutCard 
                key={workout.id} 
                workout={workout} 
                categoryColor={category.color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCategoryCard;
