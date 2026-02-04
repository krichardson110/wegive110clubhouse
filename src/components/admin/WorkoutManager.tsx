import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FolderPlus, GripVertical } from "lucide-react";
import { WorkoutCategory, Workout, getIconComponent } from "@/types/workout";
import WorkoutCategoryForm from "./WorkoutCategoryForm";
import WorkoutForm from "./WorkoutForm";

const WorkoutManager = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  
  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WorkoutCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<WorkoutCategory | null>(null);
  
  // Workout state
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-workout-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as WorkoutCategory[];
    },
  });

  // Fetch workouts
  const { data: workouts, isLoading: loadingWorkouts } = useQuery({
    queryKey: ["admin-workouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Workout[];
    },
  });

  // Category mutations
  const createCategory = useMutation({
    mutationFn: async (data: Partial<WorkoutCategory>) => {
      const maxOrder = categories?.length ? Math.max(...categories.map((c) => c.display_order)) : 0;
      const { error } = await supabase.from("workout_categories").insert({
        name: data.name || "",
        description: data.description,
        icon_name: data.icon_name || "Dumbbell",
        color_gradient: data.color_gradient || "from-primary/20 to-accent/20 border-primary/40",
        published: data.published ?? true,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workout-categories"] });
      setCategoryDialogOpen(false);
      toast.success("Category created successfully");
    },
    onError: (error) => toast.error(`Failed to create category: ${error.message}`),
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutCategory> }) => {
      const { error } = await supabase.from("workout_categories").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workout-categories"] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
    onError: (error) => toast.error(`Failed to update category: ${error.message}`),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workout_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workout-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-workouts"] });
      setDeletingCategory(null);
      toast.success("Category deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete category: ${error.message}`),
  });

  // Workout mutations
  const createWorkout = useMutation({
    mutationFn: async (data: Partial<Workout>) => {
      const categoryWorkouts = workouts?.filter((w) => w.category_id === data.category_id) || [];
      const maxOrder = categoryWorkouts.length ? Math.max(...categoryWorkouts.map((w) => w.display_order)) : 0;
      const { error } = await supabase.from("workouts").insert({
        category_id: data.category_id || "",
        title: data.title || "",
        description: data.description,
        duration: data.duration,
        difficulty: data.difficulty || "Beginner",
        exercises: data.exercises || 0,
        youtube_id: data.youtube_id,
        published: data.published ?? true,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workouts"] });
      setWorkoutDialogOpen(false);
      toast.success("Workout created successfully");
    },
    onError: (error) => toast.error(`Failed to create workout: ${error.message}`),
  });

  const updateWorkout = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Workout> }) => {
      const { error } = await supabase.from("workouts").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workouts"] });
      setWorkoutDialogOpen(false);
      setEditingWorkout(null);
      toast.success("Workout updated successfully");
    },
    onError: (error) => toast.error(`Failed to update workout: ${error.message}`),
  });

  const deleteWorkout = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workouts"] });
      setDeletingWorkout(null);
      toast.success("Workout deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete workout: ${error.message}`),
  });

  const handleCategorySubmit = (data: Partial<WorkoutCategory>) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data });
    } else {
      createCategory.mutate(data);
    }
  };

  const handleWorkoutSubmit = (data: Partial<Workout>) => {
    if (editingWorkout) {
      updateWorkout.mutate({ id: editingWorkout.id, data });
    } else {
      createWorkout.mutate(data);
    }
  };

  const getWorkoutsForCategory = (categoryId: string) => {
    return workouts?.filter((w) => w.category_id === categoryId) || [];
  };

  const difficultyColors = {
    Beginner: "bg-emerald-500/20 text-emerald-400",
    Intermediate: "bg-yellow-500/20 text-yellow-400",
    Advanced: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="workouts">All Workouts</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingCategory(null);
                setCategoryDialogOpen(true);
              }}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {loadingCategories ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              {categories?.map((category) => {
                const Icon = getIconComponent(category.icon_name);
                const categoryWorkouts = getWorkoutsForCategory(category.id);
                
                return (
                  <Card key={category.id} className={!category.published ? "opacity-60" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color_gradient} border`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {category.name}
                              {!category.published && (
                                <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCategoryId(category.id);
                              setEditingWorkout(null);
                              setWorkoutDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Workout
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCategory(category)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {categoryWorkouts.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No workouts in this category yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {categoryWorkouts.map((workout) => (
                            <div
                              key={workout.id}
                              className={`flex items-center justify-between p-3 rounded-lg bg-secondary/50 ${
                                !workout.published ? "opacity-60" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                <div>
                                  <p className="font-medium text-sm flex items-center gap-2">
                                    {workout.title}
                                    {!workout.published && (
                                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {workout.duration} • {workout.exercises} exercises
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[workout.difficulty]}`}>
                                  {workout.difficulty}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingWorkout(workout);
                                    setSelectedCategoryId(workout.category_id);
                                    setWorkoutDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingWorkout(workout)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingWorkout(null);
                setSelectedCategoryId(null);
                setWorkoutDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </div>

          {loadingWorkouts ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2">
              {workouts?.map((workout) => {
                const category = categories?.find((c) => c.id === workout.category_id);
                return (
                  <div
                    key={workout.id}
                    className={`flex items-center justify-between p-4 rounded-lg bg-card border ${
                      !workout.published ? "opacity-60" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {workout.title}
                        {!workout.published && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {category?.name} • {workout.duration} • {workout.exercises} exercises
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[workout.difficulty]}`}>
                        {workout.difficulty}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingWorkout(workout);
                          setSelectedCategoryId(workout.category_id);
                          setWorkoutDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingWorkout(workout)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <WorkoutCategoryForm
            category={editingCategory}
            onSubmit={handleCategorySubmit}
            onCancel={() => {
              setCategoryDialogOpen(false);
              setEditingCategory(null);
            }}
            isLoading={createCategory.isPending || updateCategory.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Workout Dialog */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkout ? "Edit Workout" : "Add Workout"}
            </DialogTitle>
          </DialogHeader>
          <WorkoutForm
            workout={editingWorkout}
            categories={categories || []}
            defaultCategoryId={selectedCategoryId || undefined}
            onSubmit={handleWorkoutSubmit}
            onCancel={() => {
              setWorkoutDialogOpen(false);
              setEditingWorkout(null);
            }}
            isLoading={createWorkout.isPending || updateWorkout.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This will also delete all workouts in this category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCategory && deleteCategory.mutate(deletingCategory.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Workout Confirmation */}
      <AlertDialog open={!!deletingWorkout} onOpenChange={() => setDeletingWorkout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingWorkout?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingWorkout && deleteWorkout.mutate(deletingWorkout.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutManager;
