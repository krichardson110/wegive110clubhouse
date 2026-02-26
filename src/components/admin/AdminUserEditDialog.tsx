import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Users, UserCog, Save } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  profile: {
    display_name: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    posts_count?: number;
    comments_count?: number;
    likes_given_count?: number;
  } | null;
  team_memberships: Array<{
    team_id: string;
    role: string;
    status: string;
    teams: { name: string };
  }>;
}

interface TeamOption {
  id: string;
  name: string;
}

interface AdminUserEditDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const AdminUserEditDialog = ({ user, open, onOpenChange, onSaved }: AdminUserEditDialogProps) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [addTeamId, setAddTeamId] = useState("");
  const [addTeamRole, setAddTeamRole] = useState("player");
  const [addPlayerName, setAddPlayerName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  const [removingTeamId, setRemovingTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (user && open) {
      setDisplayName(user.profile?.display_name || "");
      setBio(user.profile?.bio || "");
      fetchTeams();
    }
  }, [user, open]);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const headers = await getAuthHeaders();
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const res = await fetch(`${baseUrl}/teams`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams?.map((t: any) => ({ id: t.id, name: t.name })) || []);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const res = await fetch(`${baseUrl}/users/${user.id}/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ display_name: displayName, bio }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
      toast({ title: "Profile updated" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddToTeam = async () => {
    if (!user || !addTeamId) return;
    setAddingTeam(true);
    try {
      const headers = await getAuthHeaders();
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const res = await fetch(`${baseUrl}/users/${user.id}/teams`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          team_id: addTeamId,
          role: addTeamRole,
          player_name: addPlayerName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add to team");
      toast({ title: "Added to team" });
      setAddTeamId("");
      setAddPlayerName("");
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingTeam(false);
    }
  };

  const handleRemoveFromTeam = async (teamId: string) => {
    if (!user) return;
    setRemovingTeamId(teamId);
    try {
      const headers = await getAuthHeaders();
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const res = await fetch(`${baseUrl}/users/${user.id}/teams/${teamId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove from team");
      }
      toast({ title: "Removed from team" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setRemovingTeamId(null);
    }
  };

  // Teams the user is NOT already on
  const availableTeams = teams.filter(
    (t) => !user?.team_memberships.some((m) => m.team_id === t.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Details */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Profile Details</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-display-name">Display Name</Label>
                <Input
                  id="edit-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter bio..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Profile
              </Button>
            </div>
          </div>

          {/* Current Teams */}
          <div className="space-y-3 border-t border-border pt-4">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Memberships
            </Label>
            {user?.team_memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No team associations</p>
            ) : (
              <div className="space-y-2">
                {user?.team_memberships.map((tm) => (
                  <div
                    key={tm.team_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{tm.teams?.name || "Unknown"}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {tm.role}
                      </Badge>
                      <Badge
                        variant={tm.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tm.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => handleRemoveFromTeam(tm.team_id)}
                      disabled={removingTeamId === tm.team_id}
                    >
                      {removingTeamId === tm.team_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add to Team */}
          <div className="space-y-3 border-t border-border pt-4">
            <Label className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add to Team
            </Label>
            {loadingTeams ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : availableTeams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {teams.length === 0 ? "No teams exist yet" : "User is already on all teams"}
              </p>
            ) : (
              <div className="space-y-3">
                <Select value={addTeamId} onValueChange={setAddTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={addTeamRole} onValueChange={setAddTeamRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                  </SelectContent>
                </Select>

                {(addTeamRole === "player" || addTeamRole === "parent") && (
                  <Input
                    value={addPlayerName}
                    onChange={(e) => setAddPlayerName(e.target.value)}
                    placeholder="Player name (optional)"
                  />
                )}

                <Button
                  onClick={handleAddToTeam}
                  disabled={!addTeamId || addingTeam}
                  className="w-full"
                >
                  {addingTeam ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add to Team
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserEditDialog;
