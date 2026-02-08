import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScheduleManager from "@/components/admin/ScheduleManager";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScheduleAdmin = () => {
  const { user, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && !isSuperAdmin) {
      navigate("/schedule");
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
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/schedule")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Schedule
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Calendar className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
              SCHEDULE <span className="gradient-text">MANAGEMENT</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create, edit, and manage team events including games, practices, workouts, and meetings.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <ScheduleManager />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ScheduleAdmin;
