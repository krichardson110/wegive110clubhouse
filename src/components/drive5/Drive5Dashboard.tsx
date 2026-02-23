import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Target } from "lucide-react";
import Drive5DashboardTab from "./Drive5DashboardTab";
import Drive5GoalsTab from "./Drive5GoalsTab";

interface Drive5DashboardProps {
  teamId?: string;
}

const Drive5Dashboard = ({ teamId }: Drive5DashboardProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <Flame className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="w-4 h-4" />
            My Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <Drive5DashboardTab teamId={teamId} />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Drive5GoalsTab teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Drive5Dashboard;
