import { Clock, Info, Video, Image } from "lucide-react";
import { PracticeDrill } from "@/types/practice";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PracticeDrillListProps {
  drills: PracticeDrill[];
}

const PracticeDrillList = ({ drills }: PracticeDrillListProps) => {
  // Group drills by phase_name
  const groupedDrills = drills.reduce((acc, drill) => {
    if (!acc[drill.phase_name]) {
      acc[drill.phase_name] = [];
    }
    acc[drill.phase_name].push(drill);
    return acc;
  }, {} as Record<string, PracticeDrill[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedDrills).map(([phaseName, phaseDrills]) => (
        <div key={phaseName} className="border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/50 px-4 py-2 border-b border-border">
            <h5 className="font-medium text-sm">{phaseName}</h5>
          </div>
          <div className="divide-y divide-border">
            {phaseDrills.map((drill, idx) => (
              <div key={drill.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {drill.drill_number && (
                        <span className="text-xs text-muted-foreground">#{drill.drill_number}</span>
                      )}
                      <span className="font-medium text-sm">{drill.drill_name}</span>
                      {drill.duration_minutes && (
                        <Badge variant="outline" className="text-xs ml-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {drill.duration_minutes} min
                        </Badge>
                      )}
                    </div>
                    
                    {drill.description && (
                      <p className="text-sm text-muted-foreground mt-1">{drill.description}</p>
                    )}
                    
                    {drill.coaching_points && drill.coaching_points.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-primary">Coaching Points:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                          {drill.coaching_points.map((point, pointIdx) => (
                            <li key={pointIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {drill.notes && (
                      <div className="mt-2 text-xs text-muted-foreground italic">
                        Note: {drill.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {drill.video_url && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={drill.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Watch Video</TooltipContent>
                      </Tooltip>
                    )}
                    {drill.diagram_url && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={drill.diagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                          >
                            <Image className="w-4 h-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>View Diagram</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PracticeDrillList;
