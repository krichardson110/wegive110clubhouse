import { Badge } from "@/components/ui/badge";
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

const depthLabel = (order: number) => {
  if (order === 1) return "Starter";
  if (order === 2) return "Backup";
  return `#${order}`;
};

const BaseballFieldView = ({ entries }: BaseballFieldViewProps) => {
  const getEntriesForPosition = (posKey: string) =>
    entries.filter((e) => e.position === posKey).sort((a, b) => a.depth_order - b.depth_order);

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "90%" }}>
      {/* Field SVG background */}
      <svg
        viewBox="0 0 500 450"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grass stripe pattern */}
          <pattern id="grassStripes" patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(0)">
            <rect width="24" height="12" fill="#2d6b3f" />
            <rect y="12" width="24" height="12" fill="#327344" />
          </pattern>
          {/* Infield dirt texture */}
          <radialGradient id="dirtGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#c4956a" />
            <stop offset="100%" stopColor="#a67c52" />
          </radialGradient>
          {/* Mound gradient */}
          <radialGradient id="moundGradient" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#a67c52" />
          </radialGradient>
          {/* Warning track */}
          <radialGradient id="warningTrack" cx="50%" cy="65%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="88%" stopColor="#8B6F47" stopOpacity="0.5" />
            <stop offset="95%" stopColor="#8B6F47" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6B5635" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* Sky / background fill */}
        <rect width="500" height="450" fill="#1a472a" />

        {/* Outfield grass with stripes */}
        <ellipse cx="250" cy="290" rx="245" ry="230" fill="url(#grassStripes)" />

        {/* Warning track overlay */}
        <ellipse cx="250" cy="290" rx="245" ry="230" fill="url(#warningTrack)" />

        {/* Outfield wall */}
        <path
          d="M 5,141 Q 250,-10 495,141"
          fill="none"
          stroke="#1a3a1a"
          strokeWidth="6"
        />
        <path
          d="M 5,141 Q 250,-10 495,141"
          fill="none"
          stroke="#ffdd00"
          strokeWidth="1.5"
          strokeDasharray="0"
          strokeOpacity="0.6"
        />

        {/* Foul territory */}
        <polygon points="250,365 0,100 0,450 250,450" fill="#1a472a" fillOpacity="0.85" />
        <polygon points="250,365 500,100 500,450 250,450" fill="#1a472a" fillOpacity="0.85" />

        {/* Infield dirt - full diamond area */}
        <polygon
          points="250,195 345,285 250,375 155,285"
          fill="url(#dirtGradient)"
        />

        {/* Infield grass (cutout circle) */}
        <circle cx="250" cy="285" r="52" fill="#327344" />
        <circle cx="250" cy="285" r="52" fill="url(#grassStripes)" fillOpacity="0.5" />

        {/* Pitcher's mound */}
        <circle cx="250" cy="272" r="11" fill="url(#moundGradient)" />
        {/* Pitcher's rubber */}
        <rect x="245" y="270" width="10" height="2.5" rx="0.5" fill="white" />

        {/* Base paths - white lines */}
        <line x1="250" y1="195" x2="345" y2="285" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="345" y1="285" x2="250" y2="375" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="250" y1="375" x2="155" y2="285" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="155" y1="285" x2="250" y2="195" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />

        {/* Foul lines extending to outfield - through 3B (155,285) and 1B (345,285) */}
        <line x1="250" y1="375" x2="5" y2="141" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
        <line x1="250" y1="375" x2="495" y2="141" stroke="white" strokeWidth="2" strokeOpacity="0.8" />

        {/* Bases - white diamonds */}
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

        {/* Dugout areas */}
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
