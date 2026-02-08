import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, X, Mail, UserCheck, Loader2, Copy, Check, Send } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TeamInvitation } from "@/types/team";

interface PendingInvitationsProps {
  invitations: TeamInvitation[];
  onCancel: (id: string) => void;
  onResend?: (invitation: TeamInvitation) => void;
  isResending?: boolean;
  onApproved?: () => void;
}

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const PendingInvitations = ({ invitations, onCancel, onResend, isResending, onApproved }: PendingInvitationsProps) => {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<TeamInvitation | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  if (invitations.length === 0) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "coach":
        return <Badge className="bg-accent">Coach</Badge>;
      case "parent":
        return <Badge variant="secondary">Parent</Badge>;
      default:
        return <Badge variant="outline">Player</Badge>;
    }
  };

  const handleOpenApprove = (invitation: TeamInvitation) => {
    setSelectedInvitation(invitation);
    setTempPassword(generateTempPassword());
    setCopied(false);
    setApproveDialogOpen(true);
  };

  const handleResend = (invitation: TeamInvitation) => {
    setResendingId(invitation.id);
    onResend?.(invitation);
    // Reset resending state after a delay
    setTimeout(() => setResendingId(null), 2000);
  };

  const handleCopyCredentials = () => {
    if (!selectedInvitation) return;
    const text = `Email: ${selectedInvitation.email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleApprove = async () => {
    if (!selectedInvitation || !tempPassword) return;

    setIsApproving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/teams-api/invitations/${selectedInvitation.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ temporary_password: tempPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to approve invitation');
      }

      toast.success(`${selectedInvitation.player_name || selectedInvitation.email} has been added to the team!`);
      setApproveDialogOpen(false);
      setSelectedInvitation(null);
      onApproved?.();
    } catch (error: any) {
      console.error('Error approving invitation:', error);
      toast.error(error.message || 'Failed to approve invitation');
    } finally {
      setIsApproving(false);
    }
  };

  // Separate pending and accepted invitations
  const pendingInvitations = invitations.filter(inv => !inv.accepted_at);
  const acceptedInvitations = invitations.filter(inv => inv.accepted_at);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="w-4 h-4" />
            Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Pending invitations */}
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{invitation.email}</span>
                    {getTypeBadge(invitation.invite_type)}
                    <Badge variant="secondary">
                      Pending
                    </Badge>
                  </div>
                  {invitation.player_name && (
                    <p className="text-sm text-muted-foreground">
                      Player: {invitation.player_name}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResend(invitation)}
                    disabled={isResending || resendingId === invitation.id}
                    title="Resend invitation email"
                    className="gap-1"
                  >
                    {resendingId === invitation.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Resend</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenApprove(invitation)}
                    title="Approve & add to team"
                    className="gap-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Approve</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCancel(invitation.id)}
                    title="Cancel invitation"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Accepted invitations */}
            {acceptedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{invitation.email}</span>
                    {getTypeBadge(invitation.invite_type)}
                    <Badge className="bg-primary hover:bg-primary text-primary-foreground">
                      <Check className="w-3 h-3 mr-1" />
                      Accepted
                    </Badge>
                  </div>
                  {invitation.player_name && (
                    <p className="text-sm text-muted-foreground">
                      Player: {invitation.player_name}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <UserCheck className="w-3 h-3" />
                    Joined {format(new Date(invitation.accepted_at!), "MMM d, yyyy")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCancel(invitation.id)}
                  title="Remove from list"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Invitation</DialogTitle>
            <DialogDescription>
              Create a temporary login for {selectedInvitation?.player_name || selectedInvitation?.email}. 
              They will be required to change their password on first login.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={selectedInvitation?.email || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temp-password">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  id="temp-password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Enter temporary password"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTempPassword(generateTempPassword())}
                  title="Generate new password"
                >
                  🔄
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. Share this securely with the user.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Login Credentials</p>
              <div className="text-sm font-mono bg-background p-2 rounded border">
                <p>Email: {selectedInvitation?.email}</p>
                <p>Password: {tempPassword}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isApproving || tempPassword.length < 6}
            >
              {isApproving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Approve & Add to Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingInvitations;
