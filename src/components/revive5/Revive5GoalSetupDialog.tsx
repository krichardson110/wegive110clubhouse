import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRevive5Goal, type Revive5Category, type Revive5Goal } from "@/hooks/useRevive5";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Revive5GoalSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Revive5Category[];
  existingGoals: Revive5Goal[];
  teamId?: string;
}

interface CategoryGoalInput {
  title: string;
  description: string;
}

const Revive5GoalSetupDialog = ({ open, onOpenChange, categories, existingGoals, teamId }: Revive5GoalSetupDialogProps) => {
  const { user } = useAuth();
  const createGoal = useCreateRevive5Goal();
  const [goalInputs, setGoalInputs] = useState<Record<string, CategoryGoalInput>>({});
  const [saving, setSaving] = useState(false);

  const activeGoalCategoryIds = existingGoals
    .filter((g) => g.status === "active")
    .map((g) => g.category_id);

  const updateInput = (categoryId: string, field: keyof CategoryGoalInput, value: string) => {
    setGoalInputs((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const goalsToCreate = categories
      .filter((cat) => {
        const input = goalInputs[cat.id];
        return input?.title?.trim() && !activeGoalCategoryIds.includes(cat.id);
      })
      .map((cat) => ({
        user_id: user.id,
        team_id: teamId,
        category_id: cat.id,
        title: goalInputs[cat.id].title.trim(),
        description: goalInputs[cat.id].description?.trim() || undefined,
      }));

    if (goalsToCreate.length === 0) return;

    setSaving(true);
    try {
      for (const goal of goalsToCreate) {
        await createGoal.mutateAsync(goal);
      }
      setGoalInputs({});
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const filledCount = categories.filter((cat) => {
    const input = goalInputs[cat.id];
    return input?.title?.trim() && !activeGoalCategoryIds.includes(cat.id);
  }).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-sans">Set Your Revive 5 Goals</DialogTitle>
          <p className="text-sm text-muted-foreground">Set a 90-day goal for each category. Fill in the ones you'd like to track.</p>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-5">
            {categories.map((cat) => {
              const hasExisting = activeGoalCategoryIds.includes(cat.id);
              const existingGoal = existingGoals.find(
                (g) => g.category_id === cat.id && g.status === "active"
              );

              return (
                <div key={cat.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-sans font-bold text-sm">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  {hasExisting ? (
                    <div className="bg-muted/50 rounded-md p-3">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        Active goal: <span className="font-medium text-foreground">{existingGoal?.title}</span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="text-xs">Goal Title</Label>
                        <Input
                          value={goalInputs[cat.id]?.title || ""}
                          onChange={(e) => updateInput(cat.id, "title", e.target.value)}
                          placeholder={`e.g., ${cat.name} daily practice`}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Description (optional)</Label>
                        <Textarea
                          value={goalInputs[cat.id]?.description || ""}
                          onChange={(e) => updateInput(cat.id, "description", e.target.value)}
                          placeholder="What does success look like?"
                          className="mt-1 min-h-[60px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <Button
          onClick={handleSubmit}
          disabled={filledCount === 0 || saving}
          className="w-full"
        >
          {saving ? "Saving..." : `Create ${filledCount} Goal${filledCount !== 1 ? "s" : ""}`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Revive5GoalSetupDialog;
