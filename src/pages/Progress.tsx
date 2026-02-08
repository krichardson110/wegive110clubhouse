import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PlayerProgressDashboard from "@/components/progress/PlayerProgressDashboard";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
              YOUR <span className="gradient-text">PROGRESS</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Track your training journey. Every workout, every chapter, every day counts toward your growth as a player and leader.
            </p>
          </div>
        </section>

        {/* Dashboard */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <PlayerProgressDashboard />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
