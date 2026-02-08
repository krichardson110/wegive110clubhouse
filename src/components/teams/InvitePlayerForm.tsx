import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Mail, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitePlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    email: string; 
    invite_type: 'player' | 'parent' | 'coach'; 
    player_name?: string;
    create_account?: boolean;
  }) => void;
  isLoading?: boolean;
  inviteLink?: string;
}

const InvitePlayerForm = ({ open, onOpenChange, onSubmit, isLoading, inviteLink }: InvitePlayerFormProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    invite_type: "player" as 'player' | 'parent' | 'coach',
    player_name: "",
    create_account: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: "", invite_type: "player", player_name: "", create_account: false });
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Team</DialogTitle>
          <DialogDescription>
            Send an invitation email or share the invite link directly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Who are you inviting?</Label>
            <Select
              value={formData.invite_type}
              onValueChange={(value: 'player' | 'parent' | 'coach') => 
                setFormData({ ...formData, invite_type: value })
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
            {(formData.invite_type === "player" || formData.invite_type === "parent") && (
              <p className="text-xs text-muted-foreground">
                {formData.invite_type === "parent" 
                  ? "Parent/Guardian will manage this player's account and can add additional players later."
                  : "The athlete will manage their own account."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={formData.invite_type === "parent" ? "parent@example.com" : "player@example.com"}
              required
            />
          </div>

          {(formData.invite_type === "player" || formData.invite_type === "parent") && (
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

          {/* Auto-create Drive 5 account toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <Label htmlFor="create-account" className="font-medium cursor-pointer">
                  Create Drive 5 Account
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-create login credentials and send via email
              </p>
            </div>
            <Switch
              id="create-account"
              checked={formData.create_account}
              onCheckedChange={(checked) => setFormData({ ...formData, create_account: checked })}
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.email}>
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? "Creating..." : formData.create_account ? "Create & Invite" : "Create Invitation"}
            </Button>
          </DialogFooter>
        </form>

        {inviteLink && (
          <div className="mt-4 p-3 bg-secondary rounded-lg">
            <Label className="text-xs text-muted-foreground">Invite Link (share manually)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                value={inviteLink} 
                readOnly 
                className="text-xs h-8"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvitePlayerForm;
