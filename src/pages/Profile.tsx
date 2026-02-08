import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Award, MessageSquare, Heart, MessageCircle, Save, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BadgeDisplay from "@/components/community/BadgeDisplay";
import NotificationSettings from "@/components/notifications/NotificationSettings";
import { useToast } from "@/hooks/use-toast";
import type { Badge, UserBadge } from "@/types/community";

const Profile = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Sync form with profile data
  useState(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id);
      
      if (badgesError) throw badgesError;
      if (badgesData.length === 0) return [];
      
      const badgeIds = badgesData.map((ub) => ub.badge_id);
      const { data: badges, error: detailsError } = await supabase
        .from("badges")
        .select("*")
        .in("id", badgeIds)
        .order("display_order");
      
      if (detailsError) throw detailsError;
      
      const badgeMap = new Map((badges || []).map((b) => [b.id, b]));
      
      return badgesData
        .map((ub) => ({
          ...ub,
          badge: badgeMap.get(ub.badge_id) as Badge | undefined,
        }))
        .filter((ub) => ub.badge) as UserBadge[];
    },
    enabled: !!user?.id,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Badge[];
    },
  });

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName || null,
        bio: bio || null,
      });
      setIsEditing(false);
      toast({ title: "Profile updated!" });
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const profileDisplayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = profileDisplayName.slice(0, 2).toUpperCase();
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/community">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display text-3xl text-foreground">My Profile</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell your team about yourself..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={updateProfile.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-display text-foreground">
                          {profileDisplayName}
                        </h2>
                        <Button variant="outline" size="sm" onClick={() => {
                          setDisplayName(profile?.display_name || "");
                          setBio(profile?.bio || "");
                          setIsEditing(true);
                        }}>
                          Edit Profile
                        </Button>
                      </div>
                      {profile?.bio && (
                        <p className="text-muted-foreground mb-4">{profile.bio}</p>
                      )}
                      
                      {/* Stats */}
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="font-medium">{profile?.posts_count || 0}</span>
                          <span className="text-muted-foreground">posts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-medium">{profile?.likes_given_count || 0}</span>
                          <span className="text-muted-foreground">likes given</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{profile?.comments_count || 0}</span>
                          <span className="text-muted-foreground">comments</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <NotificationSettings />

          {/* Earned Badges */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                My Badges ({userBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userBadges.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No badges earned yet. Start posting and engaging!
                </p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {userBadges.map((ub) => (
                    <div key={ub.id} className="flex flex-col items-center gap-1">
                      <BadgeDisplay badge={ub.badge!} size="lg" />
                      <span className="text-xs text-foreground font-medium">{ub.badge!.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Badges */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>All Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isEarned ? "bg-primary/10" : "bg-secondary/30 opacity-50"
                      }`}
                    >
                      <BadgeDisplay badge={badge} size="md" showTooltip={false} />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <span className={`text-xs ${isEarned ? "text-green-500" : "text-muted-foreground"}`}>
                          {isEarned ? "✓ Earned" : badge.badge_type === "manual" ? "Coach awarded" : "Keep going!"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
