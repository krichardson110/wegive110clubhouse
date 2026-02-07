import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideoLibraryCard from "@/components/VideoLibraryCard";
import { Video, Search, Brain, Flame, Heart, Target, Dumbbell, Users, Trophy, Zap, Star, Award, Shield, Crosshair, Timer, Activity, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VideoCategory {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  color_gradient: string;
  display_order: number;
}

interface VideoItem {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  display_order: number;
  type: "library";
  categoryName?: string;
}

interface WellnessVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  category: string;
  display_order: number;
  type: "wellness";
}

type CombinedVideo = VideoItem | WellnessVideo;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, Flame, Dumbbell, Brain, Heart, Users, Video, Trophy, Zap, Star, Award, Shield, Crosshair, Timer, Activity,
};

const wellnessPillars = [
  { id: "mind", label: "Mind", icon: Brain, badgeColor: "bg-blue-500/80 border-blue-400 text-white" },
  { id: "body", label: "Body", icon: Flame, badgeColor: "bg-accent/80 border-accent text-white" },
  { id: "spirit", label: "Spirit", icon: Heart, badgeColor: "bg-primary/80 border-primary text-white" },
];

const TeamVideosContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedWellness, setSelectedWellness] = useState<Set<string>>(new Set());

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["video-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_categories")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as VideoCategory[];
    },
  });

  const { data: videos, isLoading: loadingVideos } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as Omit<VideoItem, "type" | "categoryName">[];
    },
  });

  const { data: wellnessVideos, isLoading: loadingWellness } = useQuery({
    queryKey: ["wellness-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wellness_videos")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as Omit<WellnessVideo, "type">[];
    },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const toggleWellness = (pillarId: string) => {
    setSelectedWellness(prev => {
      const next = new Set(prev);
      if (next.has(pillarId)) next.delete(pillarId);
      else next.add(pillarId);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedWellness(new Set());
    setSearchQuery("");
  };

  const categoryNameMap = new Map(categories?.map(c => [c.id, c.name]) || []);

  const allVideos: CombinedVideo[] = [
    ...(videos?.map(v => ({ ...v, type: "library" as const, categoryName: categoryNameMap.get(v.category_id) })) || []),
    ...(wellnessVideos?.map(v => ({ ...v, type: "wellness" as const })) || []),
  ];

  const filteredVideos = allVideos.filter(video => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = video.title.toLowerCase().includes(query) || (video.description?.toLowerCase().includes(query) ?? false);
      if (!matchesSearch) return false;
    }
    if (selectedCategories.size === 0 && selectedWellness.size === 0) return true;
    if (video.type === "library") {
      if (selectedCategories.size > 0) return selectedCategories.has(video.category_id);
      return false;
    } else {
      if (selectedWellness.size > 0) return selectedWellness.has(video.category);
      return false;
    }
  });

  const isLoading = loadingCategories || loadingVideos || loadingWellness;
  const hasActiveFilters = selectedCategories.size > 0 || selectedWellness.size > 0 || searchQuery.length > 0;
  const getIcon = (iconName: string) => iconMap[iconName] || Video;
  const getWellnessBadgeColor = (category: string) => wellnessPillars.find(p => p.id === category)?.badgeColor || "bg-secondary";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20 text-accent">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Team Videos</h3>
            <p className="text-sm text-muted-foreground">{allVideos.length} training videos</p>
          </div>
        </div>
        
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border h-9"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => {
          const Icon = getIcon(category.icon_name);
          const isSelected = selectedCategories.has(category.id);
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSelected 
                  ? "bg-accent text-white border-accent" 
                  : "bg-card text-muted-foreground border-border hover:border-accent/50"
              }`}
            >
              <Icon className="w-3 h-3" />
              {category.name}
            </button>
          );
        })}
        {wellnessPillars.map((pillar) => {
          const PillarIcon = pillar.icon;
          const isSelected = selectedWellness.has(pillar.id);
          return (
            <button
              key={pillar.id}
              onClick={() => toggleWellness(pillar.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSelected 
                  ? "bg-primary text-white border-primary" 
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              <PillarIcon className="w-3 h-3" />
              {pillar.label}
            </button>
          );
        })}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-full">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-video rounded-xl" />)}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video, index) => (
            <div key={video.id} className="animate-fade-in relative" style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}>
              <div className="absolute top-3 left-3 z-10">
                {video.type === "wellness" ? (
                  <Badge variant="outline" className={`capitalize backdrop-blur-sm text-xs ${getWellnessBadgeColor(video.category)}`}>
                    {video.category}
                  </Badge>
                ) : video.categoryName ? (
                  <Badge variant="secondary" className="backdrop-blur-sm bg-secondary/80 text-xs">
                    {video.categoryName}
                  </Badge>
                ) : null}
              </div>
              <VideoLibraryCard video={video} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No videos found</p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3">
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamVideosContent;
