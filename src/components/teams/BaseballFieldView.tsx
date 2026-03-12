import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import type { DepthChartEntry } from "@/hooks/useDepthChart";

interface BaseballFieldViewProps {
  entries: DepthChartEntry[];
}

// Position coordinates on the field (percentage-based for responsiveness)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  P:  { x: 50, y: 60 },
  C:  { x: 50, y: 86 },
  "1B": { x: 64, y: 61 },
  "2B": { x: 59, y: 50 },
  "3B": { x: 36, y: 61 },
  SS: { x: 41, y: 50 },
  LF: { x: 24, y: 34 },
  CF: { x: 50, y: 20 },
  RF: { x: 76, y: 34 },
  DH: { x: 84, y: 90 },
};

const POSITION_LABELS: Record<string, string> = {
  P: "Pitcher",
  C: "Catcher",
  "1B": "First Base",
  "2B": "Second Base",
  "3B": "Third Base",
  SS: "Shortstop",
  LF: "Left Field",
  CF: "Center Field",
  RF: "Right Field",
  DH: "Designated Hitter",
};

const depthLabel = (order: number) => {
  if (order === 1) return "Starter";
  if (order === 2) return "Backup";
  return `#${order}`;
};

const BaseballFieldView = ({ entries }: BaseballFieldViewProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<DepthChartEntry | null>(null);

  const getEntriesForPosition = (posKey: string) =>
    entries.filter((e) => e.position === posKey).sort((a, b) => a.depth_order - b.depth_order);

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "90%" }}>
        {/* Field SVG background */}
        <svg
          viewBox="0 0 500 450"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grassStripes" patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(0)">
              <rect width="24" height="12" fill="#2d6b3f" />
              <rect y="12" width="24" height="12" fill="#327344" />
            </pattern>
            <radialGradient id="dirtGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#c4956a" />
              <stop offset="100%" stopColor="#a67c52" />
            </radialGradient>
            <radialGradient id="moundGradient" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#d4a574" />
              <stop offset="100%" stopColor="#a67c52" />
            </radialGradient>
            <radialGradient id="warningTrack" cx="50%" cy="65%">
              <stop offset="85%" stopColor="transparent" />
              <stop offset="88%" stopColor="#8B6F47" stopOpacity="0.5" />
              <stop offset="95%" stopColor="#8B6F47" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6B5635" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          <rect width="500" height="450" fill="#1a472a" />
          <ellipse cx="250" cy="290" rx="245" ry="230" fill="url(#grassStripes)" />
          <ellipse cx="250" cy="290" rx="245" ry="230" fill="url(#warningTrack)" />

          {/* Outfield wall */}
          <path d="M 5,141 Q 250,-10 495,141" fill="none" stroke="#1a3a1a" strokeWidth="6" />
          <path d="M 5,141 Q 250,-10 495,141" fill="none" stroke="#ffdd00" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Foul territory */}
          <polygon points="250,365 0,100 0,450 250,450" fill="#1a472a" fillOpacity="0.85" />
          <polygon points="250,365 500,100 500,450 250,450" fill="#1a472a" fillOpacity="0.85" />

          {/* Infield dirt */}
          <polygon points="250,195 345,285 250,375 155,285" fill="url(#dirtGradient)" />
          <circle cx="250" cy="285" r="52" fill="#327344" />
          <circle cx="250" cy="285" r="52" fill="url(#grassStripes)" fillOpacity="0.5" />

          {/* Pitcher's mound */}
          <circle cx="250" cy="272" r="11" fill="url(#moundGradient)" />
          <rect x="245" y="270" width="10" height="2.5" rx="0.5" fill="white" />

          {/* Base paths */}
          <line x1="250" y1="195" x2="345" y2="285" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="345" y1="285" x2="250" y2="375" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="250" y1="375" x2="155" y2="285" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="155" y1="285" x2="250" y2="195" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Foul lines through bases */}
          <line x1="250" y1="375" x2="5" y2="141" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="250" y1="375" x2="495" y2="141" stroke="white" strokeWidth="2" strokeOpacity="0.8" />

          {/* Bases */}
          <rect x="244" y="189" width="12" height="12" rx="1" transform="rotate(45 250 195)" fill="white" />
          <rect x="339" y="279" width="12" height="12" rx="1" transform="rotate(45 345 285)" fill="white" />
          <rect x="149" y="279" width="12" height="12" rx="1" transform="rotate(45 155 285)" fill="white" />

          {/* Home plate */}
          <polygon points="245,370 250,378 255,370 255,366 245,366" fill="white" />

          {/* Batter's boxes */}
          <rect x="230" y="363" width="12" height="20" rx="1" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
          <rect x="258" y="363" width="12" height="20" rx="1" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" />

          {/* Catcher's circle */}
          <circle cx="250" cy="386" r="10" fill="#a67c52" fillOpacity="0.6" />

          {/* On-deck circles */}
          <circle cx="210" cy="400" r="7" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
          <circle cx="290" cy="400" r="7" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />

          {/* Dugouts */}
          <rect x="180" y="415" width="55" height="15" rx="3" fill="#333" fillOpacity="0.5" />
          <rect x="265" y="415" width="55" height="15" rx="3" fill="#333" fillOpacity="0.5" />
          <text x="207" y="426" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="7" fontFamily="sans-serif">HOME</text>
          <text x="292" y="426" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="7" fontFamily="sans-serif">AWAY</text>
        </svg>

        {/* Player position cards overlaid on field */}
        {Object.entries(POSITION_COORDS).map(([posKey, coords]) => {
          const posEntries = getEntriesForPosition(posKey);
          return (
            <div
              key={posKey}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
            >
              <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
                {/* Position label */}
                <span className="text-[11px] sm:text-sm font-bold tracking-wider text-primary bg-primary/15 rounded-full px-2.5 py-0.5 border border-primary/30">
                  {posKey}
                </span>

                {/* Players at this position */}
                {posEntries.length === 0 ? (
                  <span className="text-[10px] sm:text-xs text-muted-foreground/60 italic">—</span>
                ) : (
                  posEntries.slice(0, 3).map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedPlayer(entry)}
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] sm:text-sm leading-tight whitespace-nowrap cursor-pointer transition-all hover:scale-105 hover:shadow-md ${
                        entry.depth_order === 1
                          ? "bg-background/95 border border-primary/40 font-semibold text-foreground shadow-sm"
                          : "bg-background/80 border border-border/50 text-muted-foreground"
                      }`}
                    >
                      <span className="truncate max-w-[70px] sm:max-w-[100px]">
                        {entry.player_number ? `#${entry.player_number} ` : ""}{entry.player_name}
                      </span>
                      <span className={`text-[9px] sm:text-[11px] ${
                        entry.depth_order === 1 ? "text-primary" : "text-muted-foreground/70"
                      }`}>
                        {depthLabel(entry.depth_order)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Preview Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Player Profile</DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {selectedPlayer.player_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">{selectedPlayer.player_name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="font-bold">
                    {selectedPlayer.position}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {POSITION_LABELS[selectedPlayer.position] || selectedPlayer.position}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-3 pt-2">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Depth Order</span>
                  <Badge variant={selectedPlayer.depth_order === 1 ? "default" : "secondary"}>
                    {depthLabel(selectedPlayer.depth_order)}
                  </Badge>
                </div>
                {selectedPlayer.notes && (
                  <div className="px-4 py-2.5 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm">{selectedPlayer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BaseballFieldView;
