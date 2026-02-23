import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ResourcesSection from "@/components/ResourcesSection";
import MotivationalSection from "@/components/MotivationalSection";

import Footer from "@/components/Footer";
import PlayerProgressDashboard from "@/components/progress/PlayerProgressDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <HeroSection />
        
        {/* Progress Section */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-3 tracking-wide">
                YOUR <span className="gradient-text">PROGRESS</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Track your training journey and build your streak.
              </p>
            </div>
            <PlayerProgressDashboard />
          </div>
        </section>
        
        <ResourcesSection />
        <MotivationalSection />
        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
