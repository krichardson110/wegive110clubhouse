import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCreateGoal, type Drive5Category, type PlayerGoal } from "@/hooks/useDrive5";

interface GoalSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Drive5Category[];
  existingGoals: PlayerGoal[];
  teamId?: string;
}

const GoalSetupDialog = ({ open, onOpenChange, categories, existingGoals, teamId }: GoalSetupDialogProps) => {
  const { user } = useAuth();
  const createGoal = useCreateGoal();
  const [goals, setGoals] = useState<Record<string, { title: string; description: string; target: number }>>({});

  const categoriesWithoutGoals = categories.filter(
    cat => !existingGoals.some(g => g.category_id === cat.id)
  );

  const updateGoal = (catId: string, field: string, value: string | number) => {
    setGoals(prev => ({
      ...prev,
      [catId]: { ...prev[catId], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    const promises = Object.entries(goals)
      .filter(([_, g]) => g?.title?.trim())
      .map(([catId, g]) =>
        createGoal.mutateAsync({
          user_id: user.id,
          team_id: teamId,
          category_id: catId,
          title: g.title,
          description: g.description || undefined,
          target_value: g.target || 90,
        })
      );

    await Promise.all(promises);
    setGoals({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Your 90-Day Goals</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Set a goal for each training category. What do you want to achieve in the next 90 days?
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categoriesWithoutGoals.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              You've already set goals for all categories! 🎯
            </p>
          ) : (
            categoriesWithoutGoals.map(cat => (
              <div key={cat.id} className="space-y-3 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h4 className="font-medium">{cat.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Input
                    placeholder={`e.g., Complete 90 ${cat.name.toLowerCase()} sessions`}
                    value={goals[cat.id]?.title || ""}
                    onChange={(e) => updateGoal(cat.id, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Details (optional)</Label>
                  <Textarea
                    placeholder="Describe your goal..."
                    value={goals[cat.id]?.description || ""}
                    onChange={(e) => updateGoal(cat.id, "description", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target (days)</Label>
                  <Input
                    type="number"
                    value={goals[cat.id]?.target || 90}
                    onChange={(e) => updateGoal(cat.id, "target", parseInt(e.target.value) || 90)}
                    min={1}
                    max={365}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={createGoal.isPending || !Object.values(goals).some(g => g?.title?.trim())}
          >
            {createGoal.isPending ? "Saving..." : "Save Goals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalSetupDialog;
