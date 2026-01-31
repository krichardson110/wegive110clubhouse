import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ResourcesSection from "@/components/ResourcesSection";
import MotivationalSection from "@/components/MotivationalSection";
import RecentUpdates from "@/components/RecentUpdates";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <HeroSection />
        <ResourcesSection />
        <MotivationalSection />
        <RecentUpdates />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
