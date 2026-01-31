import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Flame } from "lucide-react";
import VideoCard from "./VideoCard";

const videos = {
  mind: [
    { title: "Mental Toughness: Overcoming Pressure at the Plate", duration: "12:34", category: "mind" as const },
    { title: "Visualization Techniques for Peak Performance", duration: "8:45", category: "mind" as const },
    { title: "Building Confidence After a Slump", duration: "15:20", category: "mind" as const },
  ],
  body: [
    { title: "Pre-Game Dynamic Warm-Up Routine", duration: "10:15", category: "body" as const },
    { title: "Rotator Cuff Strengthening for Pitchers", duration: "18:30", category: "body" as const },
    { title: "Speed & Agility: Base Running Drills", duration: "14:22", category: "body" as const },
  ],
  spirit: [
    { title: "Leadership: Being a Great Teammate", duration: "11:45", category: "spirit" as const },
    { title: "Finding Your Why: Purpose-Driven Play", duration: "9:30", category: "spirit" as const },
    { title: "Handling Success and Failure with Grace", duration: "13:18", category: "spirit" as const },
  ],
};

const MotivationalSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
            DEVELOP YOUR <span className="gradient-text">WHOLE SELF</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Excellence isn't just physical. Strengthen your mind, body, and spirit to become the complete athlete.
          </p>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="mind" className="max-w-5xl mx-auto">
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
          
          {Object.entries(videos).map(([category, categoryVideos]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryVideos.map((video, index) => (
                  <div
                    key={video.title}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <VideoCard {...video} />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default MotivationalSection;
