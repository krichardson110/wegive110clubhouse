import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTeam } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Upload, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TeamSettings = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { team, isLoading: teamLoading, isCoach, isMember } = useTeam(teamId);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    age_group: "",
    season: "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        description: team.description || "",
        age_group: team.age_group || "",
        season: team.season || "",
      });
      setLogoUrl(team.logo_url || null);
    }
  }, [team]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teamId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image must be less than 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      // Add cache-busting parameter
      const urlWithCacheBust = `${publicUrl}?v=${Date.now()}`;
      setLogoUrl(urlWithCacheBust);

      // Update team record
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: urlWithCacheBust })
        .eq('id', teamId);

      if (updateError) throw updateError;

      toast({ title: "Logo uploaded successfully!" });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({ title: "Failed to upload logo", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!teamId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: formData.name,
          description: formData.description,
          age_group: formData.age_group,
          season: formData.season,
        })
        .eq('id', teamId);

      if (error) throw error;

      toast({ title: "Team settings saved!" });
      navigate(`/teams/${teamId}`);
    } catch (error: any) {
      console.error("Error saving team:", error);
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId) return;

    setIsDeleting(true);
    try {
      // Delete team members first
      await supabase.from('team_members').delete().eq('team_id', teamId);
      
      // Delete team invitations
      await supabase.from('team_invitations').delete().eq('team_id', teamId);
      
      // Delete the team
      const { error } = await supabase.from('teams').delete().eq('id', teamId);

      if (error) throw error;

      toast({ title: "Team deleted successfully" });
      navigate('/teams');
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast({ title: "Failed to delete team", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (teamLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!team || !isMember || !isCoach) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to edit this team's settings.
            </p>
            <Link to="/teams">
              <Button>Back to My Teams</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          
          <div className="relative z-10 container mx-auto px-4 max-w-2xl">
            <Link 
              to={`/teams/${teamId}`} 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team
            </Link>
            
            <h1 className="font-display text-3xl text-foreground tracking-wide">
              Team Settings
            </h1>
          </div>
        </section>

        {/* Settings Form */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-2xl space-y-6">
            {/* Logo Section */}
            <Card>
              <CardHeader>
                <CardTitle>Team Logo</CardTitle>
                <CardDescription>
                  Upload a logo or profile picture for your team
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={logoUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {formData.name?.charAt(0) || <Trophy className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Team Details */}
            <Card>
              <CardHeader>
                <CardTitle>Team Details</CardTitle>
                <CardDescription>
                  Update your team's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 12U Lightning"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="A brief description of your team..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age_group">Age Group</Label>
                    <Input
                      id="age_group"
                      value={formData.age_group}
                      onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                      placeholder="e.g., 12U, 14U, Varsity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Season</Label>
                    <Input
                      id="season"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      placeholder="e.g., Spring 2025"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Team
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Team?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the team,
                      all members, invitations, and related data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTeam}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Team"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Link to={`/teams/${teamId}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button onClick={handleSave} disabled={isSaving || !formData.name}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TeamSettings;
