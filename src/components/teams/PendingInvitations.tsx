import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, X, Mail } from "lucide-react";
import { format } from "date-fns";
import type { TeamInvitation } from "@/types/team";

interface PendingInvitationsProps {
  invitations: TeamInvitation[];
  onCancel: (id: string) => void;
}

const PendingInvitations = ({ invitations, onCancel }: PendingInvitationsProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="w-4 h-4" />
          Pending Invitations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{invitation.email}</span>
                  {getTypeBadge(invitation.invite_type)}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCancel(invitation.id)}
                title="Cancel invitation"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitations;
