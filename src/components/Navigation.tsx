import { Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, Calendar, Video, Users, BookOpen, Menu, X, Flame, Heart, LogIn, LogOut, MessageSquare, ChevronDown, Trophy, Shield, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import clubhouseLogo from "@/assets/clubhouse-logo.png";
import { useAuth } from "@/hooks/useAuth";
import CoachAdminDropdown from "./navigation/CoachAdminDropdown";
import MobileCoachTeams from "./navigation/MobileCoachTeams";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const mainNavItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Drive 5", href: "/drive5", icon: Flame },
  // { name: "Revive 5", href: "/revive5", icon: Heart }, // Temporarily disabled
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Clubhouse", href: "/community", icon: Users },
];

const trainingItems = [
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Videos", href: "/videos", icon: Video },
];

const resourceItems = [
  { name: "Playbook", href: "/playbook", icon: BookOpen },
  { name: "Return & Report", href: "/return-report", icon: MessageSquare },
];

const externalItems: { name: string; href: string; icon: React.ElementType; external?: boolean }[] = [];

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut, isSuperAdmin } = useAuth();

  const isActiveInGroup = (items: typeof trainingItems) => 
    items.some(item => location.pathname === item.href);

  const renderNavLink = (item: { name: string; href: string; icon: React.ElementType; external?: boolean }, onClick?: () => void) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    
    if (item.external) {
      return (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <Icon className="w-4 h-4" />
          {item.name}
        </a>
      );
    }
    
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        <Icon className="w-4 h-4" />
        {item.name}
      </Link>
    );
  };

  const renderDropdown = (label: string, items: typeof trainingItems, icon: React.ElementType) => {
    const Icon = icon;
    const isActive = isActiveInGroup(items);
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-background border border-border z-50">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = location.pathname === item.href;
            return (
              <DropdownMenuItem key={item.name} asChild>
                <Link
                  to={item.href}
                  className={`flex items-center gap-2 cursor-pointer ${
                    isItemActive ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <ItemIcon className="w-4 h-4" />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={clubhouseLogo} 
              alt="Clubhouse" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Main nav items */}
            {mainNavItems.map((item) => renderNavLink(item))}
            
            {/* Training dropdown */}
            {renderDropdown("Training", trainingItems, Dumbbell)}
            
            {/* Resources dropdown */}
            {renderDropdown("Resources", resourceItems, BookOpen)}
            
            {/* External links */}
            {externalItems.map((item) => renderNavLink(item))}
            
            {/* Coach Admin Dropdown - visible for coaches */}
            <CoachAdminDropdown />
            
            {/* Admin Portal Link - Super Admin Only */}
            {!loading && user && isSuperAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
            
            {/* Auth Button */}
            {!loading && (
              user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2 ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 ml-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {/* All items shown in mobile */}
            {mainNavItems.map((item) => renderNavLink(item, () => setMobileMenuOpen(false)))}
            
            {/* Training section */}
            <div className="pt-2 pb-1">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Training</span>
            </div>
            {trainingItems.map((item) => renderNavLink(item, () => setMobileMenuOpen(false)))}
            
            {/* Resources section */}
            <div className="pt-2 pb-1">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</span>
            </div>
            {resourceItems.map((item) => renderNavLink(item, () => setMobileMenuOpen(false)))}
            
            {/* External */}
            <div className="pt-2 pb-1">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">External</span>
            </div>
            {externalItems.map((item) => renderNavLink(item, () => setMobileMenuOpen(false)))}
            
            {/* Coach Admin Section - Mobile */}
            <MobileCoachTeams onItemClick={() => setMobileMenuOpen(false)} />
            
            {/* Admin Portal Link - Mobile */}
            {!loading && user && isSuperAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Shield className="w-5 h-5" />
                Admin Portal
              </Link>
            )}
            
            {/* Mobile Auth Button */}
            {!loading && (
              user ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full justify-start px-3 py-3"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
