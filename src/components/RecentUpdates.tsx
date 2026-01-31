import { Clock, ArrowRight } from "lucide-react";

const updates = [
  {
    title: "New Hitting Mechanics Video Added",
    type: "Video",
    time: "2 hours ago",
    color: "bg-primary",
  },
  {
    title: "Practice Schedule Updated for Next Week",
    type: "Schedule",
    time: "5 hours ago",
    color: "bg-impact-field",
  },
  {
    title: "Coach's Corner: Zoom Recording Available",
    type: "Zoom",
    time: "1 day ago",
    color: "bg-blue-500",
  },
  {
    title: "New Strength Training Program Released",
    type: "Workout",
    time: "2 days ago",
    color: "bg-purple-500",
  },
];

const RecentUpdates = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
              RECENT UPDATES
            </h2>
            <a href="#" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          {/* Updates list */}
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div
                key={update.title}
                className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-2 h-2 rounded-full ${update.color}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {update.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      {update.type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {update.time}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentUpdates;
