import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ListOrdered, ArrowRightLeft, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import {
  useBattingLineup,
  useUpsertBattingLineup,
  useDeleteBattingLineup,
  useClearBattingLineup,
  useSwapBattingOrder,
} from "@/hooks/useBattingLineup";
import { BASEBALL_POSITIONS } from "@/hooks/useDepthChart";
import type { DepthChartEntry } from "@/hooks/useDepthChart";
import type { TeamMember } from "@/types/team";
import LineupPdfGenerator from "./LineupPdfGenerator";

interface BattingLineupManagerProps {
  teamId: string;
  members: TeamMember[];
  isCoach: boolean;
  teamName?: string;
  depthChartEntries: DepthChartEntry[];
}

const BattingLineupManager = ({ teamId, members, isCoach, teamName, depthChartEntries }: BattingLineupManagerProps) => {
  const { data: lineup = [], isLoading } = useBattingLineup(teamId);
  const upsert = useUpsertBattingLineup();
  const deleteEntry = useDeleteBattingLineup();
  const clearLineup = useClearBattingLineup();
  const swapOrder = useSwapBattingOrder();

  const [addingStarter, setAddingStarter] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [subFor, setSubFor] = useState<string>("");
  const [subInning, setSubInning] = useState<string>("");

  const starters = lineup.filter((e) => !e.is_substitute).sort((a, b) => a.batting_order - b.batting_order);
  const substitutes = lineup.filter((e) => e.is_substitute).sort((a, b) => a.batting_order - b.batting_order);

  const rosterPlayers = members
    .filter((m) => m.role === "player" || m.role === "parent")
    .flatMap((m) => {
      if (m.players && m.players.length > 0) {
        return m.players.map((p) => ({
          memberId: m.id,
          name: p.player_name,
          number: p.player_number,
        }));
      }
      if (m.player_name) {
        return [{ memberId: m.id, name: m.player_name, number: m.player_number }];
      }
      return [];
    });

  // Build a lookup: player name -> uniform number from roster
  const uniformNumberLookup = new Map<string, string>();
  rosterPlayers.forEach((p) => {
    if (p.number) uniformNumberLookup.set(p.name, p.number);
  });

  const handleSelectPlayer = (value: string) => {
    const player = rosterPlayers.find((p) => p.memberId + "|" + p.name === value);
    if (player) {
      setNewName(player.name);
      setNewMemberId(player.memberId);
    }
  };

  const handleAddStarter = () => {
    if (!newName.trim() || !newPosition) return;
    const nextOrder = starters.length + 1;
    upsert.mutate({
      team_id: teamId,
      batting_order: nextOrder,
      player_name: newName.trim(),
      position: newPosition,
      team_member_id: newMemberId || null,
      is_substitute: false,
    });
    resetForm();
  };

  const handleAddSub = () => {
    if (!newName.trim() || !newPosition) return;
    const nextOrder = substitutes.length + 1;
    upsert.mutate({
      team_id: teamId,
      batting_order: nextOrder,
      player_name: newName.trim(),
      position: newPosition,
      team_member_id: newMemberId || null,
      is_substitute: true,
      substitutes_for: subFor ? parseInt(subFor) : null,
      inning_enter: subInning ? parseInt(subInning) : null,
    });
    resetForm();
    setAddingSub(false);
  };

  const handlePopulateFromDepthChart = () => {
    // Auto-populate starters from depth chart
    const posOrder = ["1B", "2B", "SS", "3B", "LF", "CF", "RF", "C", "P", "DH"];
    let order = 1;
    posOrder.forEach((pos) => {
      const starter = depthChartEntries
        .filter((e) => e.position === pos && e.depth_order === 1)
        .sort((a, b) => a.depth_order - b.depth_order)[0];
      if (starter) {
        upsert.mutate({
          team_id: teamId,
          batting_order: order,
          player_name: starter.player_name,
          position: pos,
          team_member_id: starter.team_member_id,
          is_substitute: false,
        });
        order++;
      }
    });
  };

  const resetForm = () => {
    setNewName("");
    setNewPosition("");
    setNewMemberId("");
    setSubFor("");
    setSubInning("");
    setAddingStarter(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">Loading lineup...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-primary" />
            Batting Lineup
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {isCoach && starters.length === 0 && depthChartEntries.length > 0 && (
              <Button variant="outline" size="sm" onClick={handlePopulateFromDepthChart} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Auto-fill from Depth Chart
              </Button>
            )}
            {isCoach && starters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearLineup.mutate(teamId)}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
            <LineupPdfGenerator
              battingLineup={lineup}
              depthChartEntries={depthChartEntries}
              teamName={teamName}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Starting Lineup */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Starting Lineup</h3>
            {isCoach && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => { setAddingStarter(true); setAddingSub(false); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Batter
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[40px_60px_1fr] sm:grid-cols-[40px_60px_1fr_120px] gap-2 px-4 py-2 bg-secondary/70 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <span className="text-center">#</span>
              <span className="text-center">Pos</span>
              <span>Player</span>
              <span className="hidden sm:block text-right">Actions</span>
            </div>

            {starters.length === 0 && !addingStarter ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground italic">
                No batting order set.{" "}
                {isCoach && depthChartEntries.length > 0
                  ? "Click 'Auto-fill from Depth Chart' to get started."
                  : isCoach
                  ? "Click 'Add Batter' to build your lineup."
                  : ""}
              </div>
            ) : (
              starters.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[40px_60px_1fr] sm:grid-cols-[40px_60px_1fr_auto] gap-2 px-4 py-2.5 border-t border-border items-center"
                >
                  <span className="text-center font-bold text-lg text-foreground">{uniformNumberLookup.get(entry.player_name) || "—"}</span>
                  <Badge variant="outline" className="justify-center font-bold text-xs">
                    {entry.position}
                  </Badge>
                  <span className="font-medium text-sm truncate">{entry.player_name}</span>
                  {isCoach && (
                    <div className="hidden sm:flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={entry.batting_order === 1 || swapOrder.isPending}
                        onClick={() => {
                          const idx = starters.findIndex((s) => s.id === entry.id);
                          if (idx > 0) swapOrder.mutate({ entryA: entry, entryB: starters[idx - 1] });
                        }}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={entry.batting_order === starters.length || swapOrder.isPending}
                        onClick={() => {
                          const idx = starters.findIndex((s) => s.id === entry.id);
                          if (idx < starters.length - 1) swapOrder.mutate({ entryA: entry, entryB: starters[idx + 1] });
                        }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive/70 hover:text-destructive"
                        onClick={() => deleteEntry.mutate(entry.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Add starter form */}
            {addingStarter && isCoach && (
              <div className="border-t border-border px-4 py-3 bg-muted/30 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select onValueChange={handleSelectPlayer}>
                    <SelectTrigger className="sm:w-[180px]">
                      <SelectValue placeholder="Pick from roster" />
                    </SelectTrigger>
                    <SelectContent>
                      {rosterPlayers.map((p) => (
                        <SelectItem key={`${p.memberId}|${p.name}`} value={p.memberId + "|" + p.name}>
                          {p.name}{p.number ? ` #${p.number}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Player name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="sm:flex-1"
                  />
                  <Select value={newPosition} onValueChange={setNewPosition}>
                    <SelectTrigger className="sm:w-[100px]">
                      <SelectValue placeholder="Pos" />
                    </SelectTrigger>
                    <SelectContent>
                      {BASEBALL_POSITIONS.map((pos) => (
                        <SelectItem key={pos.key} value={pos.key}>
                          {pos.key} - {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddStarter} disabled={!newName.trim() || !newPosition}>
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Add #{starters.length + 1}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Substitutions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-accent" />
              Substitutions
            </h3>
            {isCoach && starters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => { setAddingSub(true); setAddingStarter(false); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Sub
              </Button>
            )}
          </div>

          {substitutes.length === 0 && !addingSub ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-4 text-center text-sm text-muted-foreground italic">
              No substitutions planned.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
              {substitutes.map((sub) => {
                const replacingStarter = sub.substitutes_for
                  ? starters.find((s) => s.batting_order === sub.substitutes_for)
                  : null;
                return (
                  <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Badge variant="secondary" className="text-xs font-bold">
                      {sub.position}
                    </Badge>
                    <span className="font-medium text-sm flex-1">{sub.player_name}</span>
                    {replacingStarter && (
                      <span className="text-xs text-muted-foreground">
                        → replaces <span className="font-medium text-foreground">{replacingStarter.player_name}</span>
                      </span>
                    )}
                    {sub.inning_enter && (
                      <Badge variant="outline" className="text-xs">
                        Inn {sub.inning_enter}
                      </Badge>
                    )}
                    {isCoach && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive/70 hover:text-destructive"
                        onClick={() => deleteEntry.mutate(sub.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add substitution form */}
          {addingSub && isCoach && (
            <div className="mt-2 rounded-lg border border-border px-4 py-3 bg-muted/30 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select onValueChange={handleSelectPlayer}>
                  <SelectTrigger className="sm:w-[180px]">
                    <SelectValue placeholder="Pick from roster" />
                  </SelectTrigger>
                  <SelectContent>
                    {rosterPlayers.map((p) => (
                      <SelectItem key={`sub-${p.memberId}|${p.name}`} value={p.memberId + "|" + p.name}>
                        {p.name}{p.number ? ` #${p.number}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Player name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="sm:flex-1"
                />
                <Select value={newPosition} onValueChange={setNewPosition}>
                  <SelectTrigger className="sm:w-[100px]">
                    <SelectValue placeholder="Pos" />
                  </SelectTrigger>
                  <SelectContent>
                    {BASEBALL_POSITIONS.map((pos) => (
                      <SelectItem key={pos.key} value={pos.key}>
                        {pos.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={subFor} onValueChange={setSubFor}>
                  <SelectTrigger className="sm:w-[200px]">
                    <SelectValue placeholder="Replaces (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {starters.map((s) => (
                      <SelectItem key={s.batting_order} value={String(s.batting_order)}>
                        #{s.batting_order} {s.player_name} ({s.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={subInning} onValueChange={setSubInning}>
                  <SelectTrigger className="sm:w-[120px]">
                    <SelectValue placeholder="Inning" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <SelectItem key={i} value={String(i)}>
                        Inning {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSub} disabled={!newName.trim() || !newPosition}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Add Sub
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { resetForm(); setAddingSub(false); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BattingLineupManager;
