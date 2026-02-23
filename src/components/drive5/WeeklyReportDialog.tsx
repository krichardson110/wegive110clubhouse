import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Mail, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeeklyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaderboard: Array<{
    user_id: string;
    name: string;
    avatar_url?: string | null;
    weekly_checkins: number;
  }>;
  teamId?: string;
}

const WeeklyReportDialog = ({ open, onOpenChange, leaderboard, teamId }: WeeklyReportDialogProps) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"download" | "email">("download");

  const togglePlayer = (userId: string) => {
    setSelectedPlayers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPlayers.size === leaderboard.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(leaderboard.map(p => p.user_id)));
    }
  };

  const generateReport = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke("drive5-reports", {
      body: { action: "generate-report", userId, teamId },
    });
    if (error) throw error;
    return data;
  };

  const handleDownload = async () => {
    if (selectedPlayers.size === 0) {
      toast({ title: "Select at least one player", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const reports = [];
      for (const userId of selectedPlayers) {
        const report = await generateReport(userId);
        reports.push(report);
      }

      // Generate CSV
      const headers = ["Player", "Streak", "Weekly Check-ins", "Completion Rate", "Skills & Drills", "Cardio & Agility", "Rest & Refuel", "Strength & Power", "Mental & Strategy"];
      const rows = reports.map(r => [
        r.playerName,
        r.currentStreak,
        r.totalWeeklyCheckins,
        `${r.completionRate}%`,
        ...(r.categoryBreakdown || []).map((c: any) => `${c.weeklyCount}/7`),
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drive5-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Report downloaded!" });
    } catch (err: any) {
      toast({ title: "Failed to generate report", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (selectedPlayers.size === 0 || !email.trim()) {
      toast({ title: "Select players and enter an email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      for (const userId of selectedPlayers) {
        const reportData = await generateReport(userId);
        const player = leaderboard.find(p => p.user_id === userId);
        await supabase.functions.invoke("drive5-reports", {
          body: {
            action: "send-email-report",
            recipientEmail: email,
            reportData,
            playerName: player?.name || reportData.playerName,
          },
        });
      }
      toast({ title: "Reports sent!" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Failed to send report", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Weekly Progress Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            <Button
              variant={mode === "download" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("download")}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              Download CSV
            </Button>
            <Button
              variant={mode === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("email")}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email Report
            </Button>
          </div>

          {mode === "email" && (
            <div className="space-y-2">
              <Label>Recipient Email</Label>
              <Input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Player selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select Players</Label>
              <Button variant="ghost" size="sm" onClick={selectAll}>
                {selectedPlayers.size === leaderboard.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {leaderboard.map(player => (
                <label
                  key={player.user_id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPlayers.has(player.user_id)}
                    onCheckedChange={() => togglePlayer(player.user_id)}
                  />
                  <span className="text-sm">{player.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{player.weekly_checkins} check-ins</span>
                </label>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No players found</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={mode === "download" ? handleDownload : handleEmail}
            disabled={loading || selectedPlayers.size === 0}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "download" ? "Download" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyReportDialog;
