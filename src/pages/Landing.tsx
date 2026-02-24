import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Dumbbell, Video, BookOpen, ArrowRight, Shield, Trophy, Star } from "lucide-react";
import clubhouseLogo from "@/assets/clubhouse-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={clubhouseLogo} alt="Clubhouse" className="h-12 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl animate-pulse-glow" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <img 
                src={clubhouseLogo} 
                alt="Clubhouse - Learn. Grow. Develop." 
                className="h-48 sm:h-56 md:h-64 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              The complete athlete development portal for youth baseball players. Access workouts, training videos, schedules, and the leadership playbook.
            </p>
            
            <p className="text-base text-primary font-semibold mb-10 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              Mind. Body. Spirit.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="gap-2">
                  <Users className="w-5 h-5" />
                  Join Your Team
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  Already a Member? Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Everything Your Athlete Needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete resource hub designed specifically for youth baseball development
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Dumbbell}
              title="Training Workouts"
              description="Age-appropriate strength, agility, and conditioning programs"
              gradient="from-primary to-primary/60"
            />
            <FeatureCard 
              icon={Video}
              title="Video Library"
              description="Mind, Body & Spirit wellness videos curated for young athletes"
              gradient="from-accent to-accent/60"
            />
            <FeatureCard 
              icon={BookOpen}
              title="Leadership Playbook"
              description="Character development and mental toughness training"
              gradient="from-primary to-accent"
            />
            <FeatureCard 
              icon={Trophy}
              title="Team Schedules"
              description="Stay updated with games, practices, and team events"
              gradient="from-accent to-primary"
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Safe & Secure for Families
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Password-protected access ensures only registered team members can access the portal. 
              Parents and athletes use the same login credentials as Drive 5 for seamless integration.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                <span>Family-Friendly Content</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                <span>Drive 5 Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Create your account or sign in to access all the resources your athlete needs to succeed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="gap-2">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/drive5">
              <Button variant="outline" size="lg">
                Learn About Drive 5
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Clubhouse by We Give 110%. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = ({ icon: Icon, title, description, gradient }: FeatureCardProps) => (
  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 group">
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Landing;
