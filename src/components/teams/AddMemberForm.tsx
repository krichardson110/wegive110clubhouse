import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  defaultRole?: 'player' | 'parent' | 'coach';
  onMemberAdded?: () => void;
}

const AddMemberForm = ({ open, onOpenChange, teamId, defaultRole = 'player', onMemberAdded }: AddMemberFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string; role: string; playerName?: string } | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: defaultRole as 'player' | 'parent' | 'coach',
    player_name: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({ email: "", role: defaultRole, player_name: "" });
      setCopied(false);
      setCredentials(null);
    }
  }, [open, defaultRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: response, error } = await supabase.functions.invoke('create-team-member', {
        body: {
          team_id: teamId,
          email: formData.email,
          role: formData.role,
          player_name: formData.player_name || undefined,
        },
      });

      if (error) throw error;

      if (response?.error) {
        toast({ title: response.error, variant: "destructive" });
        return;
      }

      if (response?.account_created && response?.temporary_password) {
        setCredentials({
          email: response.email,
          password: response.temporary_password,
          role: formData.role,
          playerName: formData.player_name || undefined,
        });
        toast({ title: `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created and added to team!` });
      } else {
        toast({ title: "Existing user added to team!" });
        onMemberAdded?.();
        onOpenChange(false);
      }

      onMemberAdded?.();
    } catch (err: any) {
      console.error("Error creating team member:", err);
      toast({ title: "Failed to add team member", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!credentials) return;
    const text = `Login Credentials for ${credentials.playerName || credentials.email}\n\nEmail: ${credentials.email}\nTemporary Password: ${credentials.password}\n\nPlease log in and change your password immediately.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Credentials copied to clipboard!" });
    setTimeout(() => setCopied(false), 3000);
  };

  const roleLabel = formData.role === 'coach' ? 'Coach' : formData.role === 'parent' ? 'Parent' : 'Player';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {credentials ? `${roleLabel} Account Created` : `Add ${roleLabel}`}
          </DialogTitle>
          <DialogDescription>
            {credentials
              ? "Share these login credentials with the user. They will be required to change their password on first login."
              : `Create an account and add a ${formData.role} to the team.`
            }
          </DialogDescription>
        </DialogHeader>

        {credentials ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <p className="text-sm font-medium">Login Credentials</p>
              {credentials.playerName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">{credentials.playerName}</span>
                </div>
              )}
              <div className="font-mono text-sm bg-background p-3 rounded border space-y-1">
                <p><span className="text-muted-foreground">Email:</span> {credentials.email}</p>
                <p><span className="text-muted-foreground">Password:</span> {credentials.password}</p>
              </div>
              <Button
                variant="secondary"
                onClick={handleCopyCredentials}
                className="w-full gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary">
                ⚠️ The user will be required to change their password when they first log in.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'player' | 'parent' | 'coach') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player (athlete manages own account)</SelectItem>
                  <SelectItem value="parent">Parent/Guardian (manages player)</SelectItem>
                  <SelectItem value="coach">Assistant Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={formData.role === "parent" ? "parent@example.com" : formData.role === "coach" ? "coach@example.com" : "player@example.com"}
                required
              />
            </div>

            {(formData.role === "player" || formData.role === "parent") && (
              <div className="space-y-2">
                <Label htmlFor="player_name">Player Name *</Label>
                <Input
                  id="player_name"
                  value={formData.player_name}
                  onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
            )}

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.email}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                {isLoading ? "Creating..." : "Create Account & Add"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberForm;
