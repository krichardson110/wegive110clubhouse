import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface WellnessVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  category: string;
  display_order: number;
}

const MotivationalSection = () => {
  const [activeTab, setActiveTab] = useState("mind");

  const { data: videos, isLoading } = useQuery({
    queryKey: ["wellness-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wellness_videos")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as WellnessVideo[];
    },
  });

  const groupedVideos = {
    mind: videos?.filter(v => v.category === "mind") || [],
    body: videos?.filter(v => v.category === "body") || [],
    spirit: videos?.filter(v => v.category === "spirit") || [],
  };

  const categoryColors = {
    mind: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    body: "from-accent/20 to-clubhouse-orange-light/20 border-accent/30",
    spirit: "from-primary/20 to-clubhouse-purple-light/20 border-primary/30",
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
            DEVELOP YOUR <span className="gradient-text">WHOLE SELF</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Excellence isn't just physical. Strengthen your mind, body, and spirit to become the complete athlete.
          </p>
          <Link to="/videos?category=wellness">
            <Button variant="outline" size="sm">
              View All Videos
            </Button>
          </Link>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="mind" className="gap-2">
              <Brain className="w-4 h-4" />
              Mind
            </TabsTrigger>
            <TabsTrigger value="body" className="gap-2">
              <Flame className="w-4 h-4" />
              Body
            </TabsTrigger>
            <TabsTrigger value="spirit" className="gap-2">
              <Heart className="w-4 h-4" />
              Spirit
            </TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            Object.entries(groupedVideos).map(([category, categoryVideos]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryVideos.slice(0, 6).map((video, index) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-secondary overflow-hidden">
                          <img 
                            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <svg className="w-6 h-6 text-accent-foreground fill-current ml-1" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Duration badge */}
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-xs text-white flex items-center gap-1">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                              </svg>
                              {video.duration}
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} border mb-2 capitalize`}>
                            {category}
                          </span>
                          <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
                            {video.title}
                          </h4>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                {categoryVideos.length > 6 && (
                  <div className="text-center mt-6">
                    <Link to={`/videos?category=wellness&pillar=${category}`}>
                      <Button variant="outline">
                        View All {category.charAt(0).toUpperCase() + category.slice(1)} Videos
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            ))
          )}
        </Tabs>
      </div>
    </section>
  );
};

export default MotivationalSection;
