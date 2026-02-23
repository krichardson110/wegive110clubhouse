import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import { useWeeklyCheckinHistory } from "@/hooks/useDrive5";

interface WeeklyProgressChartProps {
  teamId?: string;
}

const WeeklyProgressChart = ({ teamId }: WeeklyProgressChartProps) => {
  const { data: weeklyData = [], isLoading } = useWeeklyCheckinHistory(teamId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 h-[280px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  const maxCheckins = 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <span>Weekly Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weeklyData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No check-in history yet. Start checking in daily!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, maxCheckins]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 13,
                }}
                formatter={(value: number) => [`${value} / ${maxCheckins}`, "Check-ins"]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.count === maxCheckins
                        ? "hsl(var(--accent))"
                        : entry.count >= 3
                        ? "hsl(var(--primary))"
                        : entry.count > 0
                        ? "hsl(var(--clubhouse-purple-light) / 0.5)"
                        : "hsl(var(--muted) / 0.3)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyProgressChart;
