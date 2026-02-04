import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WorkoutManager from "@/components/admin/WorkoutManager";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkoutsAdmin = () => {
  const { user, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) {
      navigate("/workouts");
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
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/workouts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Workouts
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Dumbbell className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Admin
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
              MANAGE <span className="gradient-text">WORKOUTS</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Add, edit, and organize workout categories and training programs.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <WorkoutManager />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorkoutsAdmin;
