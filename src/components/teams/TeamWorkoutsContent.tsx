import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkoutCategoryCard from "@/components/WorkoutCategoryCard";
import { Search, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WorkoutCategory, Workout } from "@/types/workout";
import { Skeleton } from "@/components/ui/skeleton";

const TeamWorkoutsContent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["workout-categories-with-workouts"],
    queryFn: async () => {
      const { data: categoriesData, error: catError } = await supabase
        .from("workout_categories")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (catError) throw catError;

      const { data: workoutsData, error: workError } = await supabase
        .from("workouts")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (workError) throw workError;

      const categoriesWithWorkouts = (categoriesData as WorkoutCategory[]).map(category => ({
        ...category,
        workouts: (workoutsData as Workout[]).filter(w => w.category_id === category.id),
      }));

      return categoriesWithWorkouts;
    },
  });

  const filteredCategories = categories?.map(category => ({
    ...category,
    workouts: category.workouts?.filter(workout =>
      workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workout.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  })).filter(category => category.workouts.length > 0 || searchQuery === "") || [];

  const totalWorkouts = categories?.reduce((acc, cat) => acc + (cat.workouts?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Team Workouts</h3>
            <p className="text-sm text-muted-foreground">{totalWorkouts} training programs</p>
          </div>
        </div>
        
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border h-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <WorkoutCategoryCard 
                category={category} 
                defaultExpanded={index === 0}
              />
            </div>
          ))}
          
          {filteredCategories.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No workouts found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamWorkoutsContent;
