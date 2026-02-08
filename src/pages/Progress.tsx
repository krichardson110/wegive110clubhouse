import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PlayerProgressDashboard from "@/components/progress/PlayerProgressDashboard";
import TeamProgressView from "@/components/progress/TeamProgressView";
import { useIsCoach } from "@/hooks/useTeamProgress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User, Users } from "lucide-react";

const Progress = () => {
  const { data: isCoach } = useIsCoach();
  const [myProgressOpen, setMyProgressOpen] = useState(true);
  const [teamProgressOpen, setTeamProgressOpen] = useState(true);

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
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Collapsible open={myProgressOpen} onOpenChange={setMyProgressOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-4 h-auto bg-card/50 hover:bg-card/80 rounded-lg mb-4"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-xl font-semibold text-foreground">My Progress</span>
                  </div>
                  {myProgressOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <PlayerProgressDashboard />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        {/* Team Progress (Coaches Only) */}
        {isCoach && (
          <section className="py-6 border-t border-border">
            <div className="container mx-auto px-4">
              <Collapsible open={teamProgressOpen} onOpenChange={setTeamProgressOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-between p-4 h-auto bg-card/50 hover:bg-card/80 rounded-lg mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-xl font-semibold text-foreground">Team Progress</span>
                    </div>
                    {teamProgressOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                  <TeamProgressView />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
