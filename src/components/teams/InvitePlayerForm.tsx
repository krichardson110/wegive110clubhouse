import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitePlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    email: string; 
    invite_type: 'player' | 'parent' | 'coach'; 
    player_name?: string;
  }) => void;
  isLoading?: boolean;
  inviteLink?: string;
  defaultInviteType?: 'player' | 'parent' | 'coach';
}

const InvitePlayerForm = ({ open, onOpenChange, onSubmit, isLoading, inviteLink, defaultInviteType = 'player' }: InvitePlayerFormProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    invite_type: defaultInviteType as 'player' | 'parent' | 'coach',
    player_name: "",
  });

  // Reset form when dialog opens with new default type
  useEffect(() => {
    if (open) {
      setFormData({ email: "", invite_type: defaultInviteType, player_name: "" });
      setCopied(false);
    }
  }, [open, defaultInviteType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: "", invite_type: "player", player_name: "" });
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
          <DialogTitle>
            {formData.invite_type === 'coach' ? 'Invite Coach' : formData.invite_type === 'parent' ? 'Invite Parent' : 'Invite Player'}
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to add a {formData.invite_type} to the team.
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


          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.email}>
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send Invitation"}
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
