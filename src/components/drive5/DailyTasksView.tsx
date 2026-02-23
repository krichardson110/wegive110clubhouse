import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ListTodo } from "lucide-react";
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

  if (totalTasks === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <h3 className="font-semibold mb-1">No tasks yet</h3>
          <p className="text-sm">Add recurring tasks to your goals in the Goals tab to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Today's Tasks
        </h3>
        <span className="text-sm font-medium text-muted-foreground">
          {completedTasks}/{totalTasks} complete
        </span>
      </div>

      {tasksByCategory.map(({ category, tasks: catTasks }) => {
        const catCompleted = catTasks.filter((t: any) => isTaskCompleted(t.id)).length;
        const allDone = catCompleted === catTasks.length;

        return (
          <Card key={category.id} className={allDone ? "border-primary/30 bg-primary/5" : ""}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
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
                      <p className={`text-sm ${completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
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
