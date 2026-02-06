import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VideoLibraryCard from "@/components/VideoLibraryCard";
import { Video, Search, Settings, Brain, Flame, Heart, Target, Dumbbell, Users, Trophy, Zap, Star, Award, Shield, Crosshair, Timer, Activity, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

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

// Icon map for dynamic icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, Flame, Dumbbell, Brain, Heart, Users, Video, Trophy, Zap, Star, Award, Shield, Crosshair, Timer, Activity,
};

const wellnessPillars = [
  { id: "mind", label: "Mind", icon: Brain, activeColor: "bg-blue-500 text-white shadow-lg shadow-blue-500/30", inactiveColor: "bg-card hover:bg-blue-500/20 text-blue-400 border-blue-500/30", badgeColor: "bg-blue-500/80 border-blue-400 text-white" },
  { id: "body", label: "Body", icon: Flame, activeColor: "bg-accent text-white shadow-lg shadow-accent/30", inactiveColor: "bg-card hover:bg-accent/20 text-accent border-accent/30", badgeColor: "bg-accent/80 border-accent text-white" },
  { id: "spirit", label: "Spirit", icon: Heart, activeColor: "bg-primary text-white shadow-lg shadow-primary/30", inactiveColor: "bg-card hover:bg-primary/20 text-primary border-primary/30", badgeColor: "bg-primary/80 border-primary text-white" },
];

const Videos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedWellness, setSelectedWellness] = useState<Set<string>>(new Set());
  const { isSuperAdmin } = useAuth();

  // Initialize filters from URL
  useEffect(() => {
    const cats = searchParams.get("categories");
    const wellness = searchParams.get("wellness");
    if (cats) setSelectedCategories(new Set(cats.split(",")));
    if (wellness) setSelectedWellness(new Set(wellness.split(",")));
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.size > 0) params.set("categories", Array.from(selectedCategories).join(","));
    if (selectedWellness.size > 0) params.set("wellness", Array.from(selectedWellness).join(","));
    setSearchParams(params, { replace: true });
  }, [selectedCategories, selectedWellness, setSearchParams]);

  // Fetch video categories from database
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

  // Fetch all videos from database
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

  // Fetch wellness videos from database
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

  // Toggle category filter
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Toggle wellness filter
  const toggleWellness = (pillarId: string) => {
    setSelectedWellness(prev => {
      const next = new Set(prev);
      if (next.has(pillarId)) {
        next.delete(pillarId);
      } else {
        next.add(pillarId);
      }
      return next;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedWellness(new Set());
    setSearchQuery("");
  };

  // Build category name lookup
  const categoryNameMap = new Map(categories?.map(c => [c.id, c.name]) || []);

  // Combine all videos
  const allVideos: CombinedVideo[] = [
    ...(videos?.map(v => ({ 
      ...v, 
      type: "library" as const,
      categoryName: categoryNameMap.get(v.category_id)
    })) || []),
    ...(wellnessVideos?.map(v => ({ ...v, type: "wellness" as const })) || []),
  ];

  // Filter videos
  const filteredVideos = allVideos.filter(video => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        video.title.toLowerCase().includes(query) ||
        (video.description?.toLowerCase().includes(query) ?? false);
      if (!matchesSearch) return false;
    }

    // If no filters selected, show all
    if (selectedCategories.size === 0 && selectedWellness.size === 0) {
      return true;
    }

    // Category/Wellness filter - use OR logic across both filter types
    if (video.type === "library") {
      // Show library video if its category is selected, OR if no categories selected but wellness is
      if (selectedCategories.size > 0) {
        return selectedCategories.has(video.category_id);
      }
      // If only wellness filters are active, hide library videos
      return false;
    } else {
      // Show wellness video if its pillar is selected, OR if no wellness selected but categories are
      if (selectedWellness.size > 0) {
        return selectedWellness.has(video.category);
      }
      // If only category filters are active, hide wellness videos
      return false;
    }
  });

  const totalVideos = allVideos.length;
  const isLoading = loadingCategories || loadingVideos || loadingWellness;
  const hasActiveFilters = selectedCategories.size > 0 || selectedWellness.size > 0 || searchQuery.length > 0;

  const getIcon = (iconName: string) => iconMap[iconName] || Video;

  const getWellnessBadgeColor = (category: string) => {
    return wellnessPillars.find(p => p.id === category)?.badgeColor || "bg-secondary";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/20 text-accent">
                    <Video className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium text-accent uppercase tracking-wider">
                    Training Videos
                  </span>
                </div>
                {isSuperAdmin && (
                  <Link to="/videos/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Videos
                    </Button>
                  </Link>
                )}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
                VIDEO <span className="gradient-text">LIBRARY</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {totalVideos} training videos covering drills, mechanics, mental game, and player development.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Filters Section */}
        <section className="py-8 border-b border-border/50 bg-gradient-to-b from-card/80 to-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6">
              {/* Category Filters */}
              {!isLoading && categories && categories.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wide">Training Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const Icon = getIcon(category.icon_name);
                      const isSelected = selectedCategories.has(category.id);
                      return (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className={`
                            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                            border transition-all duration-200 
                            ${isSelected 
                              ? "bg-accent text-white border-accent shadow-lg shadow-accent/25 scale-105" 
                              : "bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-foreground hover:bg-accent/10"
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {category.name}
                          {isSelected && (
                            <X className="w-3 h-3 ml-1 opacity-70" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Wellness Filters */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground uppercase tracking-wide">Develop Your Whole Self</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wellnessPillars.map((pillar) => {
                    const PillarIcon = pillar.icon;
                    const isSelected = selectedWellness.has(pillar.id);
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => toggleWellness(pillar.id)}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                          border transition-all duration-200 
                          ${isSelected 
                            ? pillar.activeColor + " border-transparent scale-105" 
                            : pillar.inactiveColor
                          }
                        `}
                      >
                        <PillarIcon className="w-4 h-4" />
                        {pillar.label}
                        {isSelected && (
                          <X className="w-3 h-3 ml-1 opacity-70" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active filters summary */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      matching your filters
                    </span>
                  </div>
                  <button 
                    onClick={clearFilters} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Skeleton key={i} className="aspect-video rounded-xl" />
                ))}
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                  >
                    <div className="relative">
                      {/* Badge for video type */}
                      <div className="absolute top-3 left-3 z-10">
                        {video.type === "wellness" ? (
                          <Badge 
                            variant="outline" 
                            className={`capitalize backdrop-blur-sm ${getWellnessBadgeColor(video.category)}`}
                          >
                            {video.category}
                          </Badge>
                        ) : video.categoryName ? (
                          <Badge variant="secondary" className="backdrop-blur-sm bg-secondary/80">
                            {video.categoryName}
                          </Badge>
                        ) : null}
                      </div>
                      <VideoLibraryCard video={video} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No videos found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No videos match "${searchQuery}"` 
                    : "Try adjusting your filters to see more videos"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
