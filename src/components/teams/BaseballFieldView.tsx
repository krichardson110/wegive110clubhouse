import { Badge } from "@/components/ui/badge";
import type { DepthChartEntry } from "@/hooks/useDepthChart";

interface BaseballFieldViewProps {
  entries: DepthChartEntry[];
}

// Position coordinates on the field (percentage-based for responsiveness)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  P:  { x: 50, y: 60 },
  C:  { x: 50, y: 82 },
  "1B": { x: 72, y: 58 },
  "2B": { x: 62, y: 42 },
  "3B": { x: 28, y: 58 },
  SS: { x: 38, y: 42 },
  LF: { x: 18, y: 22 },
  CF: { x: 50, y: 10 },
  RF: { x: 82, y: 22 },
  DH: { x: 88, y: 82 },
};

const depthLabel = (order: number) => {
  if (order === 1) return "Starter";
  if (order === 2) return "Backup";
  return `#${order}`;
};

const BaseballFieldView = ({ entries }: BaseballFieldViewProps) => {
  const getEntriesForPosition = (posKey: string) =>
    entries.filter((e) => e.position === posKey).sort((a, b) => a.depth_order - b.depth_order);

  return (
    <div className="relative w-full" style={{ paddingBottom: "90%" }}>
      {/* Field SVG background */}
      <svg
        viewBox="0 0 500 450"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outfield grass */}
        <ellipse cx="250" cy="280" rx="240" ry="220" className="fill-emerald-800/30" />
        
        {/* Infield dirt */}
        <polygon
          points="250,200 340,280 250,360 160,280"
          className="fill-amber-800/25"
          strokeWidth="2"
          stroke="hsl(var(--border))"
          strokeOpacity="0.4"
        />

        {/* Pitcher's mound */}
        <circle cx="250" cy="270" r="10" className="fill-amber-700/30" />

        {/* Base paths */}
        <line x1="250" y1="200" x2="340" y2="280" stroke="hsl(var(--border))" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="340" y1="280" x2="250" y2="360" stroke="hsl(var(--border))" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="250" y1="360" x2="160" y2="280" stroke="hsl(var(--border))" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="160" y1="280" x2="250" y2="200" stroke="hsl(var(--border))" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* Bases */}
        <rect x="244" y="194" width="12" height="12" transform="rotate(45 250 200)" className="fill-white/80" />
        <rect x="334" y="274" width="12" height="12" transform="rotate(45 340 280)" className="fill-white/80" />
        <rect x="154" y="274" width="12" height="12" transform="rotate(45 160 280)" className="fill-white/80" />

        {/* Home plate */}
        <polygon points="246,358 250,365 254,358 254,355 246,355" className="fill-white/80" />

        {/* Foul lines */}
        <line x1="250" y1="360" x2="10" y2="100" stroke="hsl(var(--border))" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="250" y1="360" x2="490" y2="100" stroke="hsl(var(--border))" strokeWidth="1" strokeOpacity="0.3" />

        {/* Outfield arc */}
        <path
          d="M 30,140 Q 250,20 470,140"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="6,4"
        />
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
            <div className="flex flex-col items-center gap-0.5 min-w-[70px]">
              {/* Position label */}
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-primary bg-primary/15 rounded-full px-2 py-0.5 border border-primary/30">
                {posKey}
              </span>

              {/* Players at this position */}
              {posEntries.length === 0 ? (
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 italic">—</span>
              ) : (
                posEntries.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] sm:text-[11px] leading-tight whitespace-nowrap ${
                      entry.depth_order === 1
                        ? "bg-background/90 border border-primary/40 font-semibold text-foreground shadow-sm"
                        : "bg-background/70 border border-border/50 text-muted-foreground"
                    }`}
                  >
                    <span className="truncate max-w-[60px] sm:max-w-[80px]">{entry.player_name}</span>
                    <span className={`text-[8px] sm:text-[9px] ${
                      entry.depth_order === 1 ? "text-primary" : "text-muted-foreground/70"
                    }`}>
                      {depthLabel(entry.depth_order)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BaseballFieldView;
