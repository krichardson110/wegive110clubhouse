import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Target, ListTodo } from "lucide-react";
import Revive5DashboardTab from "./Revive5DashboardTab";
import Revive5GoalsTab from "./Revive5GoalsTab";
import Revive5DailyTasksView from "./Revive5DailyTasksView";

interface Revive5DashboardProps {
  teamId?: string;
}

const Revive5Dashboard = ({ teamId }: Revive5DashboardProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2">
            <Heart className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <Revive5DashboardTab teamId={teamId} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Revive5DailyTasksView teamId={teamId} />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Revive5GoalsTab teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Revive5Dashboard;
