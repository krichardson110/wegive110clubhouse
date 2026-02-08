import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PlayerProgressDashboard from "@/components/progress/PlayerProgressDashboard";
import TeamProgressView from "@/components/progress/TeamProgressView";
import { useIsCoach } from "@/hooks/useTeamProgress";

const Progress = () => {
  const { data: isCoach } = useIsCoach();

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
              {isCoach ? 'TEAM ' : 'YOUR '}<span className="gradient-text">PROGRESS</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              {isCoach 
                ? "Track your team's training journey. Monitor player engagement, streaks, and completion rates."
                : "Track your training journey. Every workout, every chapter, every day counts toward your growth as a player and leader."
              }
            </p>
          </div>
        </section>

        {/* My Progress */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold text-foreground mb-6">My Progress</h2>
            <PlayerProgressDashboard />
          </div>
        </section>

        {/* Team Progress (Coaches Only) */}
        {isCoach && (
          <section className="py-8 border-t border-border">
            <div className="container mx-auto px-4">
              <TeamProgressView />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
