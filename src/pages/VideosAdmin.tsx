import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WellnessVideoManager from "@/components/admin/WellnessVideoManager";
import VideoManager from "@/components/admin/VideoManager";
import { useAuth } from "@/hooks/useAuth";
import { Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VideosAdmin = () => {
  const { user, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("library");

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) {
      navigate("/videos");
    }
  }, [user, isSuperAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/videos">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Videos
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-accent/20 text-accent">
                <Video className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                Admin
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
              MANAGE <span className="gradient-text">VIDEOS</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage all video content including training drills, wellness videos, and team meetings.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="library">Video Library</TabsTrigger>
                <TabsTrigger value="wellness">Wellness Videos</TabsTrigger>
              </TabsList>

              <TabsContent value="library">
                <VideoManager />
              </TabsContent>

              <TabsContent value="wellness">
                <WellnessVideoManager />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VideosAdmin;
