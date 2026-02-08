import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface TeamAdminContentAssignmentProps {
  teamId: string;
  contentType: "workouts" | "videos" | "playbook";
}

const contentConfig = {
  workouts: {
    title: "Assign Team Workouts",
    description: "Your team has access to all published workouts from the global library. As a coach, you can recommend specific workouts to your players.",
    globalLink: "/workouts",
    globalLabel: "View All Workouts",
    icon: "💪",
  },
  videos: {
    title: "Assign Team Videos",
    description: "Your team has access to all published videos from the global library. Use these to help your players learn and improve.",
    globalLink: "/videos",
    globalLabel: "View All Videos",
    icon: "🎬",
  },
  playbook: {
    title: "Assign Playbook Content",
    description: "Your team has access to the global playbook journeys and chapters. Guide your players through the content that matters most.",
    globalLink: "/playbook",
    globalLabel: "View Playbook",
    icon: "📚",
  },
};

const TeamAdminContentAssignment = ({ teamId, contentType }: TeamAdminContentAssignmentProps) => {
  const config = contentConfig[contentType];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
          <Link to={config.globalLink}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              {config.globalLabel}
            </Button>
          </Link>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Team-specific content assignments are coming soon! For now, your team members can access all published content from the global library.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamAdminContentAssignment;
