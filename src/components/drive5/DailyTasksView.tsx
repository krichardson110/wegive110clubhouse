import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ListTodo } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useDrive5Categories } from "@/hooks/useDrive5";
import {
  useAllActiveGoalTasks,
  useTaskCompletions,
  useToggleTaskCompletion,
} from "@/hooks/useGoalTasks";

interface DailyTasksViewProps {
  teamId?: string;
}

const DailyTasksView = ({ teamId }: DailyTasksViewProps) => {
  const { user } = useAuth();
  const { data: categories = [] } = useDrive5Categories();
  const { data: tasks = [] } = useAllActiveGoalTasks(teamId);
  const { data: completions = [] } = useTaskCompletions();
  const toggleCompletion = useToggleTaskCompletion();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeGoal, setActiveGoal] = useState<string>("all");

  const today = new Date().toISOString().split("T")[0];

  const isTaskCompleted = (taskId: string) =>
    completions.some((c) => c.task_id === taskId && c.completed);

  const handleToggle = (taskId: string) => {
    if (!user) return;
    const completed = isTaskCompleted(taskId);
    toggleCompletion.mutate({
      task_id: taskId,
      user_id: user.id,
      completion_date: today,
      completed: !completed,
    });
  };

  // Group tasks by category
  const tasksByCategory = categories
    .map((cat) => ({
      category: cat,
      tasks: tasks.filter((t: any) => t.category_id === cat.id),
    }))
    .filter((group) => group.tasks.length > 0);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => isTaskCompleted(t.id)).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Unique goals from visible tasks
  const goalsInCategory = activeCategory === "all"
    ? tasks
    : tasks.filter((t: any) => t.category_id === activeCategory);
  const uniqueGoals = Array.from(
    new Map(goalsInCategory.map((t: any) => [t.goal?.id, t.goal])).values()
  ).filter(Boolean) as { id: string; title: string }[];

  // Filtered view
  const filteredTasks = tasks.filter((t: any) => {
    if (activeCategory !== "all" && t.category_id !== activeCategory) return false;
    if (activeGoal !== "all" && t.goal?.id !== activeGoal) return false;
    return true;
  });

  const visibleGroups = categories
    .map((cat) => ({
      category: cat,
      tasks: filteredTasks.filter((t: any) => t.category_id === cat.id),
    }))
    .filter((group) => group.tasks.length > 0);

  if (totalTasks === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <h3 className="font-sans font-semibold mb-1">No tasks yet</h3>
          <p className="text-sm">Add recurring tasks to your goals in the Goals tab to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sans font-bold flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              Today's Tasks
            </h3>
            <span className="text-sm font-sans font-semibold text-primary">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground font-sans">
            {progressPercent === 100
              ? "🎉 All tasks complete! Great work today."
              : `${progressPercent}% done — keep going!`}
          </p>
        </CardContent>
      </Card>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => { setActiveCategory("all"); setActiveGoal("all"); }}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
          }`}
        >
          All ({totalTasks})
        </button>
        {tasksByCategory.map(({ category, tasks: catTasks }) => {
          const catCompleted = catTasks.filter((t: any) => isTaskCompleted(t.id)).length;
          const allDone = catCompleted === catTasks.length;
          return (
            <button
              key={category.id}
              onClick={() => { setActiveCategory(category.id); setActiveGoal("all"); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : allDone
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
              <span className="text-[10px] opacity-75">
                {catCompleted}/{catTasks.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Goal filter pills */}
      {uniqueGoals.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setActiveGoal("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
              activeGoal === "all"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            All Goals
          </button>
          {uniqueGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setActiveGoal(goal.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors max-w-[180px] truncate ${
                activeGoal === goal.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {goal.title}
            </button>
          ))}
        </div>
      )}

      {/* Task cards by category */}
      {visibleGroups.map(({ category, tasks: catTasks }) => {
        const catCompleted = catTasks.filter((t: any) => isTaskCompleted(t.id)).length;
        const allDone = catCompleted === catTasks.length;

        return (
          <Card key={category.id} className={allDone ? "border-primary/30 bg-primary/5" : ""}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-sans font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  {allDone && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  {catCompleted}/{catTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0 space-y-1">
              {catTasks.map((task: any) => {
                const completed = isTaskCompleted(task.id);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      completed ? "opacity-60" : "hover:bg-secondary/50"
                    }`}
                    onClick={() => handleToggle(task.id)}
                  >
                    <Checkbox
                      checked={completed}
                      onCheckedChange={() => handleToggle(task.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-sans ${completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-sans">
                        {task.goal?.title}
                      </p>
                    </div>
                    {completed && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DailyTasksView;
