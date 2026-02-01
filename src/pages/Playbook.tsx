import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PlaybookChapterCard from "@/components/PlaybookChapterCard";
import { playbookChapters } from "@/data/playbook";
import { BookOpen, Award, Target, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Playbook = () => {
  const { isSuperAdmin } = useAuth();
  const totalReadings = playbookChapters.reduce((acc, ch) => acc + ch.readings.length, 0);
  const totalExercises = playbookChapters.reduce((acc, ch) => acc + ch.exercises.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-start justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/20 text-primary">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Leadership Development
                  </span>
                </div>
                
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
                  LEADERSHIP <span className="gradient-text">PLAYBOOK</span>
                </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Develop the mindset and character traits that separate good players from great leaders. 
                Complete readings, exercises, and reflections to grow on and off the field.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-display text-2xl text-foreground">{playbookChapters.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Chapters</span>
                </div>
                <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-display text-2xl text-foreground">{totalReadings}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Readings</span>
                </div>
                <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="font-display text-2xl text-foreground">{totalExercises}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Exercises</span>
                </div>
              </div>
            </div>
            {isSuperAdmin && (
              <Link to="/playbook/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2 mt-4 sm:mt-0">
                  <Settings className="w-4 h-4" />
                  Manage Playbook
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
        
        {/* Progress Banner */}
        <section className="py-6 bg-secondary/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Your Journey</p>
                  <p className="text-sm text-muted-foreground">Complete all chapters to become a certified leader</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">0/{playbookChapters.length} Complete</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Chapters Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              {playbookChapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PlaybookChapterCard chapter={chapter} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4 tracking-wide">
              READY TO <span className="gradient-text">LEAD</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Leadership is a journey, not a destination. Start with Chapter 1 and commit to completing 
              one chapter per week. Your team needs you to lead.
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Learn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Grow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Develop
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Playbook;
