import { Card, CardContent } from "@/components/ui/card";
import { useRevive5WeeklyHistory } from "@/hooks/useRevive5";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Revive5WeeklyChartProps {
  teamId?: string;
}

const Revive5WeeklyChart = ({ teamId }: Revive5WeeklyChartProps) => {
  const { data: history = [] } = useRevive5WeeklyHistory(teamId);

  if (!history.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No check-in data yet. Start tracking to see your progress!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={history}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} domain={[0, 5]} />
            <Tooltip
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ""}
              formatter={(value: number) => [`${value} check-ins`, "Completed"]}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Revive5WeeklyChart;
