import { Clock, Play, TrendingUp, Calendar } from "lucide-react";
import { useVideoWatchTime, formatWatchTime } from "@/hooks/useVideoWatchTime";
import { Skeleton } from "@/components/ui/skeleton";

const WorkoutMetricsCard = () => {
  const { metrics, isLoading } = useVideoWatchTime();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card/50 border border-border rounded-lg p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Watch Time",
      value: formatWatchTime(metrics.totalWatchTimeSeconds),
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Videos Watched",
      value: metrics.videosWatched.toString(),
      icon: Play,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "This Week",
      value: formatWatchTime(metrics.thisWeekSeconds),
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "This Month",
      value: formatWatchTime(metrics.thisMonthSeconds),
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 transition-all duration-300 hover:border-primary/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default WorkoutMetricsCard;
