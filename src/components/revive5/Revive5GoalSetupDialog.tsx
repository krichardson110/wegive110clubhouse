import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRevive5Goal, type Revive5Category, type Revive5Goal } from "@/hooks/useRevive5";

interface Revive5GoalSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Revive5Category[];
  existingGoals: Revive5Goal[];
  teamId?: string;
}

const Revive5GoalSetupDialog = ({ open, onOpenChange, categories, existingGoals, teamId }: Revive5GoalSetupDialogProps) => {
  const { user } = useAuth();
  const createGoal = useCreateRevive5Goal();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!user || !selectedCategory || !title.trim()) return;
    createGoal.mutate({
      user_id: user.id,
      team_id: teamId,
      category_id: selectedCategory,
      title: title.trim(),
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setSelectedCategory("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Revive 5 Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Goal Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Morning prayer daily" />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does success look like?" />
          </div>
          <Button onClick={handleSubmit} disabled={!selectedCategory || !title.trim() || createGoal.isPending} className="w-full">
            {createGoal.isPending ? "Creating..." : "Create Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Revive5GoalSetupDialog;
