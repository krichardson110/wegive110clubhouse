import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useActivityTracker } from "./hooks/useActivityTracker";
import ProtectedRoute from "./components/ProtectedRoute";
import ForcePasswordChange from "./components/auth/ForcePasswordChange";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Workouts from "./pages/Workouts";
import WorkoutsAdmin from "./pages/WorkoutsAdmin";
import Videos from "./pages/Videos";
import VideosAdmin from "./pages/VideosAdmin";
import Playbook from "./pages/Playbook";
import PlaybookAdmin from "./pages/PlaybookAdmin";
import Schedule from "./pages/Schedule";
import ScheduleAdmin from "./pages/ScheduleAdmin";
import ReturnReport from "./pages/ReturnReport";
import ReturnReportAdmin from "./pages/ReturnReportAdmin";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import BadgesAdmin from "./pages/BadgesAdmin";
import MyTeams from "./pages/MyTeams";
import TeamPage from "./pages/TeamPage";
import TeamSettings from "./pages/TeamSettings";
import JoinTeam from "./pages/JoinTeam";
import Practices from "./pages/Practices";
import PracticesAdmin from "./pages/PracticesAdmin";
import Progress from "./pages/Progress";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Activity tracker wrapper - must be inside BrowserRouter
const ActivityTracker = ({ children }: { children: React.ReactNode }) => {
  useActivityTracker();
  return <>{children}</>;
};

// Force password change wrapper
const ForcePasswordWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, forcePasswordChange, clearForcePasswordChange, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // If user is logged in and needs to change password, show the password change screen
  if (user && forcePasswordChange) {
    return <ForcePasswordChange onComplete={clearForcePasswordChange} />;
  }
  
  return <>{children}</>;
};

// Root route handler - redirects based on auth state
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return user ? <Index /> : <Navigate to="/landing" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ForcePasswordWrapper>
            <ActivityTracker>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
                <Route path="/workouts/admin" element={<ProtectedRoute><WorkoutsAdmin /></ProtectedRoute>} />
                <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
                <Route path="/videos/admin" element={<ProtectedRoute><VideosAdmin /></ProtectedRoute>} />
                <Route path="/playbook" element={<ProtectedRoute><Playbook /></ProtectedRoute>} />
                <Route path="/playbook/admin" element={<ProtectedRoute><PlaybookAdmin /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
                <Route path="/schedule/admin" element={<ProtectedRoute><ScheduleAdmin /></ProtectedRoute>} />
                <Route path="/practices" element={<ProtectedRoute><Practices /></ProtectedRoute>} />
                <Route path="/practices/admin" element={<ProtectedRoute><PracticesAdmin /></ProtectedRoute>} />
                <Route path="/return-report" element={<ProtectedRoute><ReturnReport /></ProtectedRoute>} />
                <Route path="/return-report/admin" element={<ProtectedRoute><ReturnReportAdmin /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/community/badges" element={<ProtectedRoute><BadgesAdmin /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute><MyTeams /></ProtectedRoute>} />
                <Route path="/teams/join" element={<JoinTeam />} />
                <Route path="/teams/:teamId" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
                <Route path="/teams/:teamId/settings" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ActivityTracker>
          </ForcePasswordWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

