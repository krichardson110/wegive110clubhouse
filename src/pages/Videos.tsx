import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VideoLibraryCard from "@/components/VideoLibraryCard";
import { videoCategories } from "@/data/videos";
import { Video, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Get all videos flat
  const allVideos = videoCategories.flatMap(cat => cat.videos);

  // Filter videos based on search and category
  const filteredVideos = (activeCategory === "all" ? allVideos : 
    videoCategories.find(cat => cat.id === activeCategory)?.videos || []
  ).filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVideos = allVideos.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-accent/20 text-accent">
                  <Video className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-accent uppercase tracking-wider">
                  Training Videos
                </span>
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
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
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
                </TabsList>
              </div>
              
              {/* All Videos Tab */}
              <TabsContent value="all" className="mt-0">
                {filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video, index) => {
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
              
              {/* Category Tabs */}
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
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
