import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useGoalTasks,
  useCreateGoalTask,
  useDeleteGoalTask,
  useToggleTaskCompletion,
  useTaskCompletions,
} from "@/hooks/useGoalTasks";
import type { PlayerGoal } from "@/hooks/useDrive5";

interface GoalTasksListProps {
  goal: PlayerGoal;
}

const GoalTasksList = ({ goal }: GoalTasksListProps) => {
  const { user } = useAuth();
  const { data: tasks = [] } = useGoalTasks(goal.id);
  const { data: completions = [] } = useTaskCompletions();
  const createTask = useCreateGoalTask();
  const deleteTask = useDeleteGoalTask();
  const toggleCompletion = useToggleTaskCompletion();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [expanded, setExpanded] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const isTaskCompleted = (taskId: string) =>
    completions.some((c) => c.task_id === taskId && c.completed);

  const completedCount = tasks.filter((t) => isTaskCompleted(t.id)).length;

  const handleAddTask = () => {
    if (!user || !newTaskTitle.trim()) return;
    createTask.mutate({
      goal_id: goal.id,
      user_id: user.id,
      category_id: goal.category_id,
      title: newTaskTitle.trim(),
    });
    setNewTaskTitle("");
  };

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

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Daily Tasks ({completedCount}/{tasks.length})
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {tasks.map((task) => {
            const completed = isTaskCompleted(task.id);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                  completed ? "bg-primary/5" : "hover:bg-secondary/50"
                }`}
              >
                <Checkbox
                  checked={completed}
                  onCheckedChange={() => handleToggle(task.id)}
                />
                <span
                  className={`flex-1 text-sm ${completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTask.mutate(task.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}

          <div className="flex gap-2">
            <Input
              placeholder="Add a recurring task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || createTask.isPending}
              className="h-8 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTasksList;
