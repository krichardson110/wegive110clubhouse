import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import type { DepthChartEntry } from "@/hooks/useDepthChart";
import { BASEBALL_POSITIONS } from "@/hooks/useDepthChart";

interface LineupPdfGeneratorProps {
  entries: DepthChartEntry[];
  teamName?: string;
}

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

const getEntriesForPosition = (entries: DepthChartEntry[], posKey: string) =>
  entries.filter((e) => e.position === posKey).sort((a, b) => a.depth_order - b.depth_order);

// Traditional batting order positions
const BATTING_ORDER_POSITIONS = ["1B", "2B", "SS", "3B", "LF", "CF", "RF", "C", "P", "DH"];

const LineupPdfGenerator = ({ entries, teamName }: LineupPdfGeneratorProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Build batting order from starters
  const starters = BATTING_ORDER_POSITIONS
    .map((pos) => {
      const posEntries = getEntriesForPosition(entries, pos);
      return posEntries.length > 0 ? { ...posEntries[0], position: pos } : null;
    })
    .filter(Boolean) as DepthChartEntry[];

  const handleGeneratePdf = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${teamName || "Team"} Lineup</title>
        <style>
          @page { size: letter; margin: 0.5in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: white; }
          
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }
          
          /* HEADER */
          .header { text-align: center; padding: 16px 0 12px; border-bottom: 3px solid #1a1a1a; margin-bottom: 16px; }
          .header h1 { font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
          .header .date { font-size: 12px; color: #666; margin-top: 4px; }
          
          /* LINEUP TABLE */
          .lineup-section { margin-bottom: 24px; }
          .lineup-section h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 0; }
          
          .lineup-table { width: 100%; border-collapse: collapse; }
          .lineup-table th { 
            background: #1a1a1a; color: white; font-size: 11px; font-weight: 700; 
            text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: left; 
          }
          .lineup-table td { 
            padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 14px; 
          }
          .lineup-table tr:nth-child(even) { background: #f8f8f8; }
          .lineup-table .order-num { 
            font-weight: 800; font-size: 18px; width: 40px; text-align: center; color: #333;
          }
          .lineup-table .pos { 
            font-weight: 700; width: 50px; text-align: center; 
            background: #e8e8e8; border-radius: 4px; font-size: 13px;
          }
          .lineup-table .player-name { font-weight: 600; font-size: 15px; }
          
          /* BENCH */
          .bench-section { margin-top: 16px; }
          .bench-section h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 6px; }
          .bench-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .bench-item { 
            padding: 4px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;
            background: #f5f5f5;
          }
          .bench-item .pos-tag { font-weight: 700; margin-right: 4px; }
          
          /* FIELD VIEW */
          .field-section { margin-top: 20px; }
          .field-section h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 12px; }
          .field-container { position: relative; width: 100%; max-width: 500px; margin: 0 auto; }
          .field-container svg { width: 100%; height: auto; }
          
          .field-player { 
            position: absolute; transform: translate(-50%, -50%); text-align: center; 
            font-size: 10px; white-space: nowrap; 
          }
          .field-player .fp-pos { 
            font-weight: 800; font-size: 12px; background: #333; color: white; 
            padding: 2px 8px; border-radius: 10px; display: inline-block; margin-bottom: 2px;
          }
          .field-player .fp-name { 
            display: block; font-weight: 600; font-size: 11px; background: white;
            border: 1px solid #999; padding: 2px 6px; border-radius: 4px; margin-top: 1px;
          }
          
          .footer { text-align: center; font-size: 10px; color: #aaa; margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  };

  // Get bench players (depth_order > 1)
  const benchPlayers = entries
    .filter((e) => e.depth_order > 1)
    .sort((a, b) => a.position.localeCompare(b.position) || a.depth_order - b.depth_order);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Button
        onClick={handleGeneratePdf}
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={starters.length === 0}
      >
        <FileDown className="w-4 h-4" />
        Generate Lineup PDF
      </Button>

      {/* Hidden printable content */}
      <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div className="page">
          {/* Header */}
          <div className="header">
            <h1>{teamName || "Team"} Lineup</h1>
            <div className="date">{today}</div>
          </div>

          {/* Batting Order */}
          <div className="lineup-section">
            <h2>Batting Order</h2>
            <table className="lineup-table">
              <thead>
                <tr>
                  <th style={{ width: "40px", textAlign: "center" }}>#</th>
                  <th style={{ width: "50px", textAlign: "center" }}>Pos</th>
                  <th>Player</th>
                </tr>
              </thead>
              <tbody>
                {starters.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td className="order-num">{idx + 1}</td>
                    <td className="pos">{entry.position}</td>
                    <td className="player-name">{entry.player_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bench */}
          {benchPlayers.length > 0 && (
            <div className="bench-section">
              <h3>Bench / Reserves</h3>
              <div className="bench-list">
                {benchPlayers.map((entry) => (
                  <span key={entry.id} className="bench-item">
                    <span className="pos-tag">{entry.position}</span>
                    {entry.player_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Field View */}
          <div className="field-section">
            <h2>Field Positions</h2>
            <div className="field-container" style={{ position: "relative", paddingBottom: "90%" }}>
              <svg
                viewBox="0 0 500 450"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="gs" patternUnits="userSpaceOnUse" width="24" height="24">
                    <rect width="24" height="12" fill="#2d6b3f" />
                    <rect y="12" width="24" height="12" fill="#327344" />
                  </pattern>
                  <radialGradient id="dg" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#c4956a" />
                    <stop offset="100%" stopColor="#a67c52" />
                  </radialGradient>
                  <radialGradient id="mg" cx="50%" cy="40%">
                    <stop offset="0%" stopColor="#d4a574" />
                    <stop offset="100%" stopColor="#a67c52" />
                  </radialGradient>
                </defs>
                <rect width="500" height="450" fill="#1a472a" />
                <ellipse cx="250" cy="290" rx="245" ry="230" fill="url(#gs)" />
                <path d="M 5,141 Q 250,-10 495,141" fill="none" stroke="#1a3a1a" strokeWidth="6" />
                <polygon points="250,365 0,100 0,450 250,450" fill="#1a472a" fillOpacity="0.85" />
                <polygon points="250,365 500,100 500,450 250,450" fill="#1a472a" fillOpacity="0.85" />
                <polygon points="250,195 345,285 250,375 155,285" fill="url(#dg)" />
                <circle cx="250" cy="285" r="52" fill="#327344" />
                <circle cx="250" cy="272" r="11" fill="url(#mg)" />
                <rect x="245" y="270" width="10" height="2.5" rx="0.5" fill="white" />
                <line x1="250" y1="195" x2="345" y2="285" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="345" y1="285" x2="250" y2="375" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="250" y1="375" x2="155" y2="285" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="155" y1="285" x2="250" y2="195" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="250" y1="375" x2="5" y2="141" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                <line x1="250" y1="375" x2="495" y2="141" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                <rect x="244" y="189" width="12" height="12" rx="1" transform="rotate(45 250 195)" fill="white" />
                <rect x="339" y="279" width="12" height="12" rx="1" transform="rotate(45 345 285)" fill="white" />
                <rect x="149" y="279" width="12" height="12" rx="1" transform="rotate(45 155 285)" fill="white" />
                <polygon points="245,370 250,378 255,370 255,366 245,366" fill="white" />

                {/* Player labels on field */}
                {Object.entries(POSITION_COORDS).map(([posKey, coords]) => {
                  const posEntries = getEntriesForPosition(entries, posKey);
                  const starter = posEntries[0];
                  const svgX = (coords.x / 100) * 500;
                  const svgY = (coords.y / 100) * 450;
                  return (
                    <g key={posKey}>
                      <rect
                        x={svgX - 20}
                        y={svgY - 16}
                        width="40"
                        height="16"
                        rx="8"
                        fill="#333"
                      />
                      <text
                        x={svgX}
                        y={svgY - 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="sans-serif"
                      >
                        {posKey}
                      </text>
                      {starter && (
                        <>
                          <rect
                            x={svgX - 40}
                            y={svgY + 2}
                            width="80"
                            height="16"
                            rx="3"
                            fill="white"
                            stroke="#999"
                            strokeWidth="0.5"
                          />
                          <text
                            x={svgX}
                            y={svgY + 13}
                            textAnchor="middle"
                            fill="#1a1a1a"
                            fontSize="9"
                            fontWeight="600"
                            fontFamily="sans-serif"
                          >
                            {starter.player_name.length > 14
                              ? starter.player_name.slice(0, 12) + "…"
                              : starter.player_name}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="footer">
            Generated on {today}
          </div>
        </div>
      </div>
    </>
  );
};

export default LineupPdfGenerator;
