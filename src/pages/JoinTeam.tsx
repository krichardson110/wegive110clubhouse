import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useAcceptInvitation } from "@/hooks/useTeamInvitations";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JoinTeam = () => {
  const { user, loading: authLoading, forcePasswordChange } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const acceptInvitation = useAcceptInvitation();
  
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [isJoining, setIsJoining] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const autoLoginAttempted = useRef(false);
  const joinAttempted = useRef(false);
  const wasAutoLogin = useRef(false);
  const [passwordCheckReady, setPasswordCheckReady] = useState(false);

  // Read credentials from URL once before they get cleaned
  const emailParam = useRef(searchParams.get("email"));
  const tpParam = useRef(searchParams.get("tp"));
  const tokenParam = useRef(searchParams.get("token") || "");

  // Auto-login if email and temp password are in URL (new account from invite)
  useEffect(() => {
    if (autoLoginAttempted.current) return;
    
    const email = emailParam.current;
    const tp = tpParam.current;
    
    if (email && tp && !user && !authLoading) {
      autoLoginAttempted.current = true;
      wasAutoLogin.current = true;
      setIsAutoLoggingIn(true);
      
      // Clean the URL to remove credentials (keep token)
      window.history.replaceState(null, '', `/teams/join?token=${tokenParam.current}`);
      
      supabase.auth.signInWithPassword({ email, password: tp })
        .then(({ error }) => {
          if (error) {
            console.error("Auto-login failed:", error);
            toast({
              title: "Auto-login failed",
              description: "Please sign in manually with the credentials from your email.",
              variant: "destructive",
            });
            setIsAutoLoggingIn(false);
          }
          // On success: keep isAutoLoggingIn true until forcePasswordChange is resolved
          // The effect below will handle the transition
        })
        .catch(() => {
          setIsAutoLoggingIn(false);
        });
    }
  }, [user, authLoading]);

  // After auto-login, wait for forcePasswordChange to be properly resolved before proceeding
  useEffect(() => {
    if (!wasAutoLogin.current || !isAutoLoggingIn || !user) return;
    
    // forcePasswordChange starts as false in useAuth, then gets set to true/false after the async check.
    // We need to wait for the profile check to complete.
    // If forcePasswordChange becomes true, the ForcePasswordWrapper will handle it.
    // Give it up to 3 seconds to resolve, then proceed.
    
    if (forcePasswordChange) {
      // Password change detected — ForcePasswordWrapper will take over
      setIsAutoLoggingIn(false);
      return;
    }
    
    // Set a timeout: if forcePasswordChange is still false after 2s, 
    // assume the check completed and it's genuinely false
    const timer = setTimeout(() => {
      setPasswordCheckReady(true);
      setIsAutoLoggingIn(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [user, isAutoLoggingIn, forcePasswordChange]);

  // Auto-join if token is in URL and user is logged in, not changing password, and not auto-logging in
  useEffect(() => {
    const urlToken = tokenParam.current || searchParams.get("token");
    if (urlToken && user && !isJoining && !isAutoLoggingIn && !forcePasswordChange && !joinAttempted.current) {
      joinAttempted.current = true;
      handleJoin(urlToken);
    }
  }, [user, isAutoLoggingIn, forcePasswordChange, searchParams]);

  const handleJoin = async (inviteToken?: string) => {
    const tokenToUse = inviteToken || token;
    if (!tokenToUse.trim()) return;
    
    setIsJoining(true);
    acceptInvitation.mutate(tokenToUse, {
      onSuccess: (result) => {
        navigate(`/teams/${result.team_id}`);
      },
      onError: () => {
        joinAttempted.current = false; // Allow retry on error
      },
      onSettled: () => {
        setIsJoining(false);
      },
    });
  };

  if (authLoading || isAutoLoggingIn || isJoining) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {isAutoLoggingIn ? "Signing you in..." : isJoining ? "Joining team..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // If user is logged in and force password change is active, don't show anything - 
  // ForcePasswordWrapper handles it
  if (user && forcePasswordChange) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="p-4 rounded-full bg-primary/20 w-fit mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Join a Team</CardTitle>
              <CardDescription>
                Enter your invitation code or use the link sent by your coach.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You need to sign in or create an account to join a team.
                  </p>
                  <Link to={`/auth?redirect=/teams/join${token ? `?token=${token}` : ""}`}>
                    <Button className="w-full">
                      Sign In to Continue
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="token">Invitation Code</Label>
                    <Input
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your invitation code"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      joinAttempted.current = false;
                      handleJoin();
                    }} 
                    className="w-full"
                    disabled={!token.trim() || isJoining}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Join Team
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <Link to="/teams" className="hover:text-foreground">
                      Back to My Teams
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JoinTeam;
