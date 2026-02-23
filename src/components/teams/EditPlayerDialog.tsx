import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import type { TeamMember, TeamMemberPlayer } from "@/types/team";

interface PlayerFormData {
  id?: string;
  player_name: string;
  player_number: string;
  position: string;
}

interface EditPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSave: (memberId: string, players: PlayerFormData[], legacyUpdate: { player_name: string | null; player_number: string | null; position: string | null }) => void;
  isSaving?: boolean;
}

const EditPlayerDialog = ({ open, onOpenChange, member, onSave, isSaving }: EditPlayerDialogProps) => {
  const [players, setPlayers] = useState<PlayerFormData[]>([]);

  useEffect(() => {
    if (member && open) {
      // Initialize from member's players or legacy fields
      if (member.players && member.players.length > 0) {
        setPlayers(member.players.map(p => ({
          id: p.id,
          player_name: p.player_name,
          player_number: p.player_number || "",
          position: p.position || "",
        })));
      } else if (member.player_name) {
        setPlayers([{
          player_name: member.player_name,
          player_number: member.player_number || "",
          position: member.position || "",
        }]);
      } else {
        setPlayers([{ player_name: "", player_number: "", position: "" }]);
      }
    }
  }, [member, open]);

  const updatePlayer = (index: number, field: keyof PlayerFormData, value: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPlayer = () => {
    setPlayers(prev => [...prev, { player_name: "", player_number: "", position: "" }]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!member) return;
    const validPlayers = players.filter(p => p.player_name.trim());
    if (validPlayers.length === 0) return;

    const firstPlayer = validPlayers[0];
    onSave(member.id, validPlayers, {
      player_name: firstPlayer.player_name,
      player_number: firstPlayer.player_number || null,
      position: firstPlayer.position || null,
    });
  };

  if (!member) return null;

  const accountName = member.profile?.display_name || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Player Details</DialogTitle>
          <p className="text-sm text-muted-foreground">Account: {accountName}</p>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
          {players.map((player, index) => (
            <div key={index} className="space-y-3">
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Player {players.length > 1 ? index + 1 : ""}
                </span>
                {players.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removePlayer(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={player.player_name}
                  onChange={(e) => updatePlayer(index, "player_name", e.target.value)}
                  placeholder="Player name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input
                    value={player.player_number}
                    onChange={(e) => updatePlayer(index, "player_number", e.target.value)}
                    placeholder="#"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={player.position}
                    onChange={(e) => updatePlayer(index, "position", e.target.value)}
                    placeholder="e.g., Forward"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {(member.role === "parent") && (
          <Button type="button" variant="outline" size="sm" onClick={addPlayer} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Player
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || players.every(p => !p.player_name.trim())}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlayerDialog;
