import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useDrive5Categories,
  usePlayerGoals,
  useCreateGoal,
  type PlayerGoal,
} from "@/hooks/useDrive5";
import GoalSetupDialog from "./GoalSetupDialog";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from "date-fns";

interface Drive5GoalsTabProps {
  teamId?: string;
}

const Drive5GoalsTab = ({ teamId }: Drive5GoalsTabProps) => {
  const { user } = useAuth();
  const { data: categories = [] } = useDrive5Categories();
  const { data: goals = [] } = usePlayerGoals(teamId);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const activeGoals = goals.filter((g) => g.status === "active");
  const totalProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, g) => {
            const p = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
            return sum + Math.min(p, 100);
          }, 0) / activeGoals.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Target className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">{activeGoals.length}</p>
            <p className="text-sm text-muted-foreground">Active Goals</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">{totalProgress}%</p>
            <p className="text-sm text-muted-foreground">Avg Progress</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="w-8 h-8 mx-auto text-accent mb-2" />
            <p className="text-3xl font-bold">90</p>
            <p className="text-sm text-muted-foreground">Day Plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>My 90-Day Goals</span>
            </div>
            <Button size="sm" onClick={() => setGoalDialogOpen(true)}>
              {activeGoals.length === 0 ? "Set Goals" : "Add Goals"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No goals set yet</h3>
              <p className="text-sm mb-4">
                Set your 90-day goals to start tracking progress across all 5 categories.
              </p>
              <Button onClick={() => setGoalDialogOpen(true)}>Set Your Goals</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GoalSetupDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        categories={categories}
        existingGoals={goals}
        teamId={teamId}
      />
    </div>
  );
};

const GoalCard = ({ goal }: { goal: PlayerGoal }) => {
  const progress =
    goal.target_value > 0
      ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
      : 0;

  const daysRemaining = differenceInDays(new Date(goal.end_date), new Date());
  const daysElapsed = differenceInDays(new Date(), new Date(goal.start_date));
  const totalDays = differenceInDays(new Date(goal.end_date), new Date(goal.start_date));
  const timeProgress = totalDays > 0 ? Math.min(Math.round((daysElapsed / totalDays) * 100), 100) : 0;

  return (
    <div className="p-4 rounded-lg border border-border space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.category?.icon || "🎯"}</span>
          <div>
            <h4 className="font-semibold">{goal.title}</h4>
            <p className="text-xs text-muted-foreground">
              {goal.category?.name || "Category"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${daysRemaining <= 7 ? "text-destructive" : daysRemaining <= 30 ? "text-accent" : "text-muted-foreground"}`}>
            {daysRemaining > 0 ? `${daysRemaining}d left` : "Expired"}
          </span>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-muted-foreground">{goal.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {goal.current_value} / {goal.target_value} days
          </span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Started {format(new Date(goal.start_date), "MMM d")}</span>
        <span>Ends {format(new Date(goal.end_date), "MMM d")}</span>
      </div>
    </div>
  );
};

export default Drive5GoalsTab;
