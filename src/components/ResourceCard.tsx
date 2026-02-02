import { Dumbbell, Calendar, Video, Users, ChevronRight } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  icon: "workouts" | "schedule" | "videos" | "zoom";
  count?: number;
}

const iconMap = {
  workouts: Dumbbell,
  schedule: Calendar,
  videos: Video,
  zoom: Users,
};

const ResourceCard = ({ title, description, icon, count }: ResourceCardProps) => {
  const Icon = iconMap[icon];

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--clubhouse-purple)/0.2)] cursor-pointer h-full flex flex-col">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          {count && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/20 text-accent">
              {count} items
            </span>
          )}
        </div>
        
        <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
          {description}
        </p>
        
        <div className="flex items-center text-accent text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
          Explore
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
