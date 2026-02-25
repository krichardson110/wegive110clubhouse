import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ListTodo } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useRevive5GoalTasks,
  useCreateRevive5Task,
  useDeleteRevive5Task,
} from "@/hooks/useRevive5GoalTasks";
import type { Revive5Goal } from "@/hooks/useRevive5";

interface Revive5GoalTasksListProps {
  goal: Revive5Goal;
}

const Revive5GoalTasksList = ({ goal }: Revive5GoalTasksListProps) => {
  const { user } = useAuth();
  const { data: tasks = [] } = useRevive5GoalTasks(goal.id);
  const createTask = useCreateRevive5Task();
  const deleteTask = useDeleteRevive5Task();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  const handleAddTask = () => {
    if (!user || !newTaskTitle.trim()) return;
    createTask.mutate({
      goal_id: goal.id,
      user_id: user.id,
      category_id: goal.category_id,
      title: newTaskTitle.trim(),
    }, {
      onSuccess: () => {
        setNewTaskTitle("");
        setShowAddTask(false);
      },
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <ListTodo className="w-3 h-3" />
          Daily Tasks ({tasks.length})
        </h4>
        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowAddTask(!showAddTask)}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {showAddTask && (
        <div className="flex gap-2 mb-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task name..."
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          <Button size="sm" className="h-8" onClick={handleAddTask} disabled={createTask.isPending}>
            Add
          </Button>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-1">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-secondary/30">
              <span>{task.title}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteTask.mutate(task.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Revive5GoalTasksList;
