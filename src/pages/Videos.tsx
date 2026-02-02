import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VideoLibraryCard from "@/components/VideoLibraryCard";
import { videoCategories } from "@/data/videos";
import { Video, Search, Filter, Settings, Brain, Flame, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface WellnessVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  category: string;
  display_order: number;
}

const Videos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [wellnessPillar, setWellnessPillar] = useState(searchParams.get("pillar") || "all");
  const { isSuperAdmin } = useAuth();

  // Fetch wellness videos from database
  const { data: wellnessVideos } = useQuery({
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

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeCategory === "wellness" && wellnessPillar !== "all") params.set("pillar", wellnessPillar);
    setSearchParams(params, { replace: true });
  }, [activeCategory, wellnessPillar, setSearchParams]);

  // Get all videos flat from static data
  const allStaticVideos = videoCategories.flatMap(cat => cat.videos);

  // Filter static videos based on search and category
  const filteredStaticVideos = (activeCategory === "all" || activeCategory === "wellness" ? allStaticVideos : 
    videoCategories.find(cat => cat.id === activeCategory)?.videos || []
  ).filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter wellness videos
  const filteredWellnessVideos = (wellnessVideos || []).filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesPillar = wellnessPillar === "all" || video.category === wellnessPillar;
    return matchesSearch && matchesPillar;
  });

  const totalVideos = allStaticVideos.length + (wellnessVideos?.length || 0);

  const wellnessPillars = [
    { id: "mind", label: "Mind", icon: Brain, color: "text-blue-500" },
    { id: "body", label: "Body", icon: Flame, color: "text-accent" },
    { id: "spirit", label: "Spirit", icon: Heart, color: "text-primary" },
  ];

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
                {totalVideos} training videos covering drills, mechanics, mental game, and team recordings. Watch, learn, and improve.
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
              </div>
            </div>
          </div>
        </section>
        
        {/* Videos Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={(val) => { setActiveCategory(val); setWellnessPillar("all"); }} className="w-full">
              <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
                <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <TabsList className="bg-secondary/30 p-1 flex-wrap h-auto gap-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary">
                    All Videos
                  </TabsTrigger>
                  {videoCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="data-[state=active]:bg-primary"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger value="wellness" className="data-[state=active]:bg-primary">
                    Develop Your Whole Self
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* All Videos Tab */}
              <TabsContent value="all" className="mt-0">
                {filteredStaticVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStaticVideos.map((video, index) => {
                      const category = videoCategories.find(cat => cat.id === video.category);
                      return (
                        <div
                          key={video.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <VideoLibraryCard 
                            video={video} 
                            categoryColor={category?.color || ""} 
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No videos found matching "{searchQuery}"</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Static Category Tabs */}
              {videoCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-card border border-border">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} border`}>
                      <category.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl text-foreground tracking-wide">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {category.videos.filter(v => 
                        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        v.description.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length} videos
                    </span>
                  </div>
                  
                  {/* Videos Grid */}
                  {category.videos.filter(v => 
                    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {category.videos
                        .filter(video => 
                          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          video.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((video, index) => (
                          <div
                            key={video.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <VideoLibraryCard 
                              video={video} 
                              categoryColor={category.color} 
                            />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No videos found matching "{searchQuery}"</p>
                    </div>
                  )}
                </TabsContent>
              ))}

              {/* Wellness Tab */}
              <TabsContent value="wellness" className="mt-0">
                {/* Wellness Header */}
                <div className="flex flex-col gap-4 mb-6 p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/40">
                      <Brain className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl text-foreground tracking-wide">
                        Develop Your Whole Self
                      </h2>
                      <p className="text-sm text-muted-foreground">Mind, Body & Spirit videos for complete athlete development</p>
                    </div>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {filteredWellnessVideos.length} videos
                    </span>
                  </div>
                  
                  {/* Pillar Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                    <Button
                      variant={wellnessPillar === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWellnessPillar("all")}
                    >
                      All
                    </Button>
                    {wellnessPillars.map(pillar => {
                      const Icon = pillar.icon;
                      return (
                        <Button
                          key={pillar.id}
                          variant={wellnessPillar === pillar.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setWellnessPillar(pillar.id)}
                          className="gap-2"
                        >
                          <Icon className={`w-4 h-4 ${wellnessPillar !== pillar.id ? pillar.color : ""}`} />
                          {pillar.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Wellness Videos Grid */}
                {filteredWellnessVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWellnessVideos.map((video, index) => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer h-full flex flex-col">
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
                          <div className="p-4 flex-1 flex flex-col">
                            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full border mb-2 w-fit capitalize ${
                              video.category === "mind" 
                                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                                : video.category === "body"
                                ? "bg-accent/20 border-accent/40 text-accent"
                                : "bg-primary/20 border-primary/40 text-primary"
                            }`}>
                              {video.category}
                            </span>
                            <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 flex-1">
                              {video.title}
                            </h4>
                            {video.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {video.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? `No videos found matching "${searchQuery}"` : "No videos available in this category"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
