import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  useRevive5Categories,
  useRevive5Goals,
  useCreateRevive5Goal,
  type Revive5Goal,
} from "@/hooks/useRevive5";
import Revive5GoalSetupDialog from "./Revive5GoalSetupDialog";
import Revive5GoalTasksList from "./Revive5GoalTasksList";
import CollapsibleSection from "@/components/drive5/CollapsibleSection";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from "date-fns";

interface Revive5GoalsTabProps {
  teamId?: string;
}

const Revive5GoalsTab = ({ teamId }: Revive5GoalsTabProps) => {
  const { user } = useAuth();
  const { data: categories = [] } = useRevive5Categories();
  const { data: goals = [] } = useRevive5Goals(teamId);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [goalFilter, setGoalFilter] = useState<string>("all");

  const activeGoals = goals.filter((g) => g.status === "active");

  const filteredGoals = activeGoals.filter((g) => {
    if (categoryFilter !== "all" && g.category_id !== categoryFilter) return false;
    if (goalFilter !== "all" && g.id !== goalFilter) return false;
    return true;
  });

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
      <CollapsibleSection title="Goal Stats" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-sans font-bold">{activeGoals.length}</p>
              <p className="text-sm font-sans text-muted-foreground">Active Goals</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-sans font-bold">{totalProgress}%</p>
              <p className="text-sm font-sans text-muted-foreground">Avg Progress</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 mx-auto text-accent mb-2" />
              <p className="text-3xl font-sans font-bold">90</p>
              <p className="text-sm font-sans text-muted-foreground">Day Plan</p>
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="My 90-Day Goals" icon={<Target className="w-4 h-4" />}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-sans">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="font-bold">My 90-Day Goals</span>
              </div>
              <Button size="sm" onClick={() => setGoalDialogOpen(true)}>
                {activeGoals.length === 0 ? "Set Goals" : "Add Goals"}
              </Button>
            </CardTitle>

            {activeGoals.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setGoalFilter("all"); }}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-background">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Categories</SelectItem>
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

                <Select value={goalFilter} onValueChange={setGoalFilter}>
                  <SelectTrigger className="w-full sm:w-[220px] bg-background">
                    <SelectValue placeholder="All Goals" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Goals</SelectItem>
                    {(categoryFilter !== "all"
                      ? activeGoals.filter((g) => g.category_id === categoryFilter)
                      : activeGoals
                    ).map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-sans font-semibold mb-2">No goals set yet</h3>
                <p className="text-sm mb-4">Set your 90-day goals to start tracking progress across all 5 categories.</p>
                <Button onClick={() => setGoalDialogOpen(true)}>Set Your Goals</Button>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm font-sans">No goals match the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleSection>

      <Revive5GoalSetupDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        categories={categories}
        existingGoals={goals}
        teamId={teamId}
      />
    </div>
  );
};

const GoalCard = ({ goal }: { goal: Revive5Goal }) => {
  const progress = goal.target_value > 0 ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100) : 0;
  const daysRemaining = differenceInDays(new Date(goal.end_date), new Date());

  return (
    <div className="p-4 rounded-lg border border-border space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.category?.icon || "🎯"}</span>
          <div>
            <h3 className="text-lg font-sans font-bold tracking-normal">{goal.category?.name || "Category"}</h3>
            <p className="text-sm font-sans text-muted-foreground">{goal.title}</p>
          </div>
        </div>
        <span className={`text-sm font-bold ${daysRemaining <= 7 ? "text-destructive" : daysRemaining <= 30 ? "text-accent" : "text-muted-foreground"}`}>
          {daysRemaining > 0 ? `${daysRemaining}d left` : "Expired"}
        </span>
      </div>

      {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-sans">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{goal.current_value} / {goal.target_value} days</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Started {format(new Date(goal.start_date), "MMM d")}</span>
        <span>Ends {format(new Date(goal.end_date), "MMM d")}</span>
      </div>

      <Revive5GoalTasksList goal={goal} />
    </div>
  );
};

export default Revive5GoalsTab;
