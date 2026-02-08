import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WorkoutCategoryCard from "@/components/WorkoutCategoryCard";
import WorkoutMetricsCard from "@/components/WorkoutMetricsCard";
import { Dumbbell, Search, Settings } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkoutCategory, Workout, getIconComponent } from "@/types/workout";
import { Skeleton } from "@/components/ui/skeleton";

const Workouts = () => {
  const { user, isSuperAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories with workouts
  const { data: categories, isLoading } = useQuery({
    queryKey: ["workout-categories-with-workouts"],
    queryFn: async () => {
      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from("workout_categories")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (catError) throw catError;

      // Fetch workouts
      const { data: workoutsData, error: workError } = await supabase
        .from("workouts")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (workError) throw workError;

      // Combine categories with their workouts
      const categoriesWithWorkouts = (categoriesData as WorkoutCategory[]).map(category => ({
        ...category,
        workouts: (workoutsData as Workout[]).filter(w => w.category_id === category.id),
      }));

      return categoriesWithWorkouts;
    },
  });

  // Filter categories based on search
  const filteredCategories = categories?.map(category => ({
    ...category,
    workouts: category.workouts?.filter(workout =>
      workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workout.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  })).filter(category => category.workouts.length > 0 || searchQuery === "") || [];

  const totalWorkouts = categories?.reduce((acc, cat) => acc + (cat.workouts?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/20 text-primary">
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Training Programs
                  </span>
                </div>
                {isSuperAdmin && (
                  <Link to="/workouts/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Workouts
                    </Button>
                  </Link>
                )}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
                WORKOUT <span className="gradient-text">LIBRARY</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {totalWorkouts} training programs designed to improve your strength, speed, and skills on the diamond. Select a category to get started.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                />
              </div>
            </div>
            
            {/* Metrics Card - only show for logged in users */}
            {user && (
              <div className="mt-8">
                <WorkoutMetricsCard />
              </div>
            )}
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
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
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Workouts;
