import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, LayoutGrid, List } from "lucide-react";
import LineupPdfGenerator from "./LineupPdfGenerator";
import {
  useDepthChart,
  useUpsertDepthChart,
  useDeleteDepthChartEntry,
  BASEBALL_POSITIONS,
  type DepthChartEntry,
} from "@/hooks/useDepthChart";
import type { TeamMember } from "@/types/team";
import BaseballFieldView from "./BaseballFieldView";

interface DepthChartProps {
  teamId: string;
  members: TeamMember[];
  isCoach: boolean;
  teamName?: string;
}

const DepthChart = ({ teamId, members, isCoach, teamName }: DepthChartProps) => {
  const { data: entries = [], isLoading } = useDepthChart(teamId);
  const upsert = useUpsertDepthChart();
  const deleteEntry = useDeleteDepthChartEntry();
  const [addingPosition, setAddingPosition] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newMemberId, setNewMemberId] = useState<string>("");

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

  const getEntriesForPosition = (posKey: string) =>
    entries.filter((e) => e.position === posKey).sort((a, b) => a.depth_order - b.depth_order);

  const handleAdd = (posKey: string) => {
    if (!newPlayerName.trim()) return;
    const posEntries = getEntriesForPosition(posKey);
    const nextOrder = posEntries.length > 0 ? Math.max(...posEntries.map((e) => e.depth_order)) + 1 : 1;
    upsert.mutate({
      team_id: teamId,
      position: posKey,
      depth_order: nextOrder,
      player_name: newPlayerName.trim(),
      team_member_id: newMemberId || null,
    });
    setNewPlayerName("");
    setNewMemberId("");
    setAddingPosition(null);
  };

  const handleDelete = (id: string) => deleteEntry.mutate(id);

  const handleSelectRosterPlayer = (value: string) => {
    const player = rosterPlayers.find((p) => p.memberId + "|" + p.name === value);
    if (player) {
      setNewPlayerName(player.name);
      setNewMemberId(player.memberId);
    }
  };

  const depthLabel = (order: number) => {
    if (order === 1) return "Starter";
    if (order === 2) return "Backup";
    return `#${order}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">Loading depth chart...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Depth Chart
          </CardTitle>
          <LineupPdfGenerator entries={entries} teamName={teamName} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="field">
          <TabsList className="mb-4">
            <TabsTrigger value="field" className="gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              Field View
            </TabsTrigger>
            {isCoach && (
              <TabsTrigger value="manage" className="gap-1.5">
                <List className="w-4 h-4" />
                Manage
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="field" className="mt-0">
            <BaseballFieldView entries={entries} />
          </TabsContent>

          {isCoach && (
            <TabsContent value="manage" className="mt-0 space-y-4">
              {BASEBALL_POSITIONS.map((pos) => {
                const posEntries = getEntriesForPosition(pos.key);
                return (
                  <div key={pos.key} className="rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold text-xs">{pos.key}</Badge>
                        <span className="text-sm font-medium">{pos.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setAddingPosition(addingPosition === pos.key ? null : pos.key)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="divide-y divide-border">
                      {posEntries.length === 0 && addingPosition !== pos.key && (
                        <div className="px-4 py-3 text-sm text-muted-foreground italic">No players assigned</div>
                      )}
                      {posEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-xs font-medium text-muted-foreground w-14">
                            {depthLabel(entry.depth_order)}
                          </span>
                          <span className="flex-1 text-sm font-medium">{entry.player_name}</span>
                          {entry.notes && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">{entry.notes}</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive/70 hover:text-destructive"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}

                      {addingPosition === pos.key && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 py-3 bg-muted/30">
                          <Select onValueChange={handleSelectRosterPlayer}>
                            <SelectTrigger className="sm:w-[200px]">
                              <SelectValue placeholder="Pick from roster" />
                            </SelectTrigger>
                            <SelectContent>
                              {rosterPlayers.length === 0 ? (
                                <SelectItem value="no-roster-players" disabled>
                                  No roster players available
                                </SelectItem>
                              ) : (
                                rosterPlayers.map((p) => (
                                  <SelectItem key={`${p.memberId}|${p.name}`} value={p.memberId + "|" + p.name}>
                                    {p.name}{p.number ? ` #${p.number}` : ""}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground text-center">or</span>
                          <Input
                            placeholder="Type player name"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            className="sm:flex-1"
                            onKeyDown={(e) => e.key === "Enter" && handleAdd(pos.key)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAdd(pos.key)} disabled={!newPlayerName.trim()}>
                              <Save className="w-3.5 h-3.5 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAddingPosition(null);
                                setNewPlayerName("");
                                setNewMemberId("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DepthChart;
