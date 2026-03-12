import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import type { DepthChartEntry } from "@/hooks/useDepthChart";
import type { BattingLineupEntry } from "@/hooks/useBattingLineup";

interface LineupPdfGeneratorProps {
  battingLineup: BattingLineupEntry[];
  depthChartEntries: DepthChartEntry[];
  teamName?: string;
}

const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  P:  { x: 50, y: 62 },
  C:  { x: 50, y: 88 },
  "1B": { x: 66, y: 62 },
  "2B": { x: 60, y: 48 },
  "3B": { x: 34, y: 62 },
  SS: { x: 40, y: 48 },
  LF: { x: 22, y: 30 },
  CF: { x: 50, y: 18 },
  RF: { x: 78, y: 30 },
  DH: { x: 86, y: 92 },
};

const getStarterForPosition = (entries: DepthChartEntry[], posKey: string) =>
  entries.filter((e) => e.position === posKey).sort((a, b) => a.depth_order - b.depth_order)[0] || null;

const LineupPdfGenerator = ({ battingLineup, depthChartEntries, teamName }: LineupPdfGeneratorProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const starters = battingLineup.filter((e) => !e.is_substitute).sort((a, b) => a.batting_order - b.batting_order);
  const substitutes = battingLineup.filter((e) => e.is_substitute).sort((a, b) => a.batting_order - b.batting_order);

  const handleGeneratePdf = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>${teamName || "Team"} Lineup</title>
<style>
  @page { size: letter; margin: 0.4in 0.5in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #1a1a1a; background: white; }

  .page-1, .page-2 { page-break-after: always; }
  .page-2 { page-break-after: auto; }

  /* PAGE 1: LINEUP */
  .header { text-align: center; padding: 20px 0 14px; border-bottom: 4px double #1a1a1a; margin-bottom: 20px; }
  .header h1 { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; }
  .header .subtitle { font-size: 14px; color: #666; margin-top: 4px; font-weight: 500; }

  .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #333;
    border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 0; }

  /* Lineup table */
  .lineup-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .lineup-table th {
    background: #1a1a1a; color: white; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.5px; padding: 10px 12px; text-align: left;
  }
  .lineup-table th:first-child { text-align: center; width: 50px; }
  .lineup-table th:nth-child(2) { text-align: center; width: 60px; }
  .lineup-table td { padding: 12px 12px; border-bottom: 1px solid #ddd; font-size: 15px; }
  .lineup-table tr:nth-child(even) td { background: #f7f7f7; }
  .lineup-table .order-num { font-weight: 900; font-size: 20px; text-align: center; color: #222; width: 50px; }
  .lineup-table .pos-cell { text-align: center; width: 60px; }
  .lineup-table .pos-badge {
    display: inline-block; font-weight: 800; font-size: 12px; background: #e8e8e8;
    padding: 3px 10px; border-radius: 4px; min-width: 36px; text-align: center;
  }
  .lineup-table .player-name { font-weight: 700; font-size: 16px; letter-spacing: 0.3px; }

  /* Substitutions */
  .subs-section { margin-top: 8px; }
  .subs-table { width: 100%; border-collapse: collapse; }
  .subs-table th {
    background: #555; color: white; font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px; padding: 8px 10px; text-align: left;
  }
  .subs-table td { padding: 8px 10px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
  .subs-table .pos-badge {
    display: inline-block; font-weight: 700; font-size: 11px; background: #eee;
    padding: 2px 8px; border-radius: 3px;
  }
  .subs-table .sub-name { font-weight: 600; }
  .subs-table .sub-detail { color: #888; font-size: 11px; }

  .notes-area { margin-top: 24px; border: 1px solid #ccc; border-radius: 4px; padding: 12px; min-height: 80px; }
  .notes-area h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #999; margin-bottom: 8px; }
  .notes-lines { border-bottom: 1px solid #e8e8e8; height: 24px; }

  /* PAGE 2: FIELD */
  .field-header { text-align: center; margin-bottom: 12px; }
  .field-header h2 { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
  .field-wrapper { width: 100%; aspect-ratio: 1 / 0.9; position: relative; }
  .field-wrapper svg { width: 100%; height: 100%; }

  .footer { text-align: center; font-size: 9px; color: #bbb; margin-top: 12px; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>${printContent.innerHTML}</body>
</html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 300);
    };
  };

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
        {/* PAGE 1: Lineup Card */}
        <div className="page-1">
          <div className="header">
            <h1>{teamName || "Team"} Lineup</h1>
            <div className="subtitle">{today}</div>
          </div>

          <div className="section-title">Batting Order</div>
          <table className="lineup-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "50px" }}>#</th>
                <th style={{ textAlign: "center", width: "60px" }}>Pos</th>
                <th>Player</th>
              </tr>
            </thead>
            <tbody>
              {starters.map((entry) => (
                <tr key={entry.id}>
                  <td className="order-num">{entry.batting_order}</td>
                  <td className="pos-cell">
                    <span className="pos-badge">{entry.position}</span>
                  </td>
                  <td className="player-name">{entry.player_name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {substitutes.length > 0 && (
            <div className="subs-section">
              <div className="section-title">Substitutions</div>
              <table className="subs-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>Pos</th>
                    <th>Player</th>
                    <th style={{ width: "120px" }}>Replaces</th>
                    <th style={{ width: "70px" }}>Inning</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutes.map((sub) => {
                    const replacingStarter = sub.substitutes_for
                      ? starters.find((s) => s.batting_order === sub.substitutes_for)
                      : null;
                    return (
                      <tr key={sub.id}>
                        <td><span className="pos-badge">{sub.position}</span></td>
                        <td className="sub-name">{sub.player_name}</td>
                        <td className="sub-detail">{replacingStarter ? replacingStarter.player_name : "—"}</td>
                        <td className="sub-detail">{sub.inning_enter ? `Inn ${sub.inning_enter}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="notes-area">
            <h4>Coach Notes</h4>
            <div className="notes-lines"></div>
            <div className="notes-lines"></div>
            <div className="notes-lines"></div>
          </div>
        </div>

        {/* PAGE 2: Full-width Field View */}
        <div className="page-2">
          <div className="field-header">
            <h2>{teamName || "Team"} Field Positions</h2>
          </div>

          <div className="field-wrapper">
            <svg
              viewBox="0 0 600 540"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                <pattern id="gs2" patternUnits="userSpaceOnUse" width="24" height="24">
                  <rect width="24" height="12" fill="#2d6b3f" />
                  <rect y="12" width="24" height="12" fill="#327344" />
                </pattern>
                <radialGradient id="dg2" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#c4956a" />
                  <stop offset="100%" stopColor="#a67c52" />
                </radialGradient>
                <radialGradient id="mg2" cx="50%" cy="40%">
                  <stop offset="0%" stopColor="#d4a574" />
                  <stop offset="100%" stopColor="#a67c52" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect width="600" height="540" fill="#1a472a" />
              <ellipse cx="300" cy="340" rx="290" ry="270" fill="url(#gs2)" />

              {/* Outfield wall */}
              <path d="M 10,165 Q 300,-15 590,165" fill="none" stroke="#1a3a1a" strokeWidth="7" />
              <path d="M 10,165 Q 300,-15 590,165" fill="none" stroke="#ffdd00" strokeWidth="2" strokeOpacity="0.5" />

              {/* Foul territory */}
              <polygon points="300,440 0,120 0,540 300,540" fill="#1a472a" fillOpacity="0.85" />
              <polygon points="300,440 600,120 600,540 300,540" fill="#1a472a" fillOpacity="0.85" />

              {/* Infield dirt diamond */}
              <polygon points="300,235 415,340 300,450 185,340" fill="url(#dg2)" />
              {/* Infield grass */}
              <circle cx="300" cy="340" r="62" fill="#327344" />
              <circle cx="300" cy="340" r="62" fill="url(#gs2)" fillOpacity="0.5" />

              {/* Pitcher's mound */}
              <circle cx="300" cy="325" r="14" fill="url(#mg2)" />
              <rect x="294" y="323" width="12" height="3" rx="0.5" fill="white" />

              {/* Base paths */}
              <line x1="300" y1="235" x2="415" y2="340" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
              <line x1="415" y1="340" x2="300" y2="450" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
              <line x1="300" y1="450" x2="185" y2="340" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
              <line x1="185" y1="340" x2="300" y2="235" stroke="white" strokeWidth="2" strokeOpacity="0.7" />

              {/* Foul lines */}
              <line x1="300" y1="450" x2="10" y2="165" stroke="white" strokeWidth="2.5" strokeOpacity="0.8" />
              <line x1="300" y1="450" x2="590" y2="165" stroke="white" strokeWidth="2.5" strokeOpacity="0.8" />

              {/* Bases */}
              <rect x="293" y="228" width="14" height="14" rx="1" transform="rotate(45 300 235)" fill="white" />
              <rect x="408" y="333" width="14" height="14" rx="1" transform="rotate(45 415 340)" fill="white" />
              <rect x="178" y="333" width="14" height="14" rx="1" transform="rotate(45 185 340)" fill="white" />

              {/* Home plate */}
              <polygon points="294,444 300,454 306,444 306,439 294,439" fill="white" />

              {/* Player labels */}
              {Object.entries(POSITION_COORDS).map(([posKey, coords]) => {
                const starter = getStarterForPosition(depthChartEntries, posKey);
                const svgX = (coords.x / 100) * 600;
                const svgY = (coords.y / 100) * 540;
                return (
                  <g key={posKey}>
                    {/* Position badge */}
                    <rect
                      x={svgX - 24}
                      y={svgY - 20}
                      width="48"
                      height="20"
                      rx="10"
                      fill="#222"
                    />
                    <text
                      x={svgX}
                      y={svgY - 6}
                      textAnchor="middle"
                      fill="white"
                      fontSize="13"
                      fontWeight="900"
                      fontFamily="Arial, sans-serif"
                    >
                      {posKey}
                    </text>
                    {/* Player name card */}
                    {starter && (
                      <>
                        <rect
                          x={svgX - 55}
                          y={svgY + 4}
                          width="110"
                          height="22"
                          rx="4"
                          fill="white"
                          stroke="#666"
                          strokeWidth="1"
                        />
                        <text
                          x={svgX}
                          y={svgY + 19}
                          textAnchor="middle"
                          fill="#1a1a1a"
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="Arial, sans-serif"
                        >
                          {starter.player_name.length > 16
                            ? starter.player_name.slice(0, 14) + "…"
                            : starter.player_name}
                        </text>
                      </>
                    )}
                    {!starter && (
                      <text
                        x={svgX}
                        y={svgY + 15}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.4)"
                        fontSize="11"
                        fontStyle="italic"
                        fontFamily="Arial, sans-serif"
                      >
                        —
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="footer">
            {teamName || "Team"} • Generated {today}
          </div>
        </div>
      </div>
    </>
  );
};

export default LineupPdfGenerator;
