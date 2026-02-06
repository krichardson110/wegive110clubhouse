import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useAcceptInvitation } from "@/hooks/useTeamInvitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, UserPlus, Loader2 } from "lucide-react";

const JoinTeam = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const acceptInvitation = useAcceptInvitation();
  
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [isJoining, setIsJoining] = useState(false);

  // Auto-join if token is in URL and user is logged in
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken && user && !isJoining) {
      handleJoin(urlToken);
    }
  }, [searchParams, user]);

  const handleJoin = async (inviteToken?: string) => {
    const tokenToUse = inviteToken || token;
    if (!tokenToUse.trim()) return;
    
    setIsJoining(true);
    acceptInvitation.mutate(tokenToUse, {
      onSuccess: (invitation) => {
        navigate(`/teams/${invitation.team_id}`);
      },
      onSettled: () => {
        setIsJoining(false);
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
                    onClick={() => handleJoin()} 
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
