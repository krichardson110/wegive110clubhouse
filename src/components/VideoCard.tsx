import { Play, Clock, Sparkles } from "lucide-react";

interface VideoCardProps {
  title: string;
  duration: string;
  category: "mind" | "body" | "spirit";
  thumbnail?: string;
}

const categoryColors = {
  mind: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  body: "from-primary/20 to-impact-amber/20 border-primary/30",
  spirit: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
};

const categoryLabels = {
  mind: "Mind",
  body: "Body",
  spirit: "Spirit",
};

const VideoCard = ({ title, duration, category, thumbnail }: VideoCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer">
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${categoryColors[category]}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-muted-foreground/30" />
            </div>
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-xs text-white flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {duration}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${categoryColors[category]} border mb-2`}>
          {categoryLabels[category]}
        </span>
        <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h4>
      </div>
    </div>
  );
};

export default VideoCard;
