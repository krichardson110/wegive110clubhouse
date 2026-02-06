import * as LucideIcons from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Badge } from "@/types/community";

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const BadgeDisplay = ({ badge, size = "md", showTooltip = true }: BadgeDisplayProps) => {
  const iconName = badge.icon_name as keyof typeof LucideIcons;
  const Icon = (LucideIcons[iconName] as React.ComponentType<{ className?: string }>) || LucideIcons.Award;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const badgeElement = (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${badge.color_gradient} flex items-center justify-center shadow-lg`}
    >
      <Icon className={`${iconSizes[size]} text-white`} />
    </div>
  );

  if (!showTooltip) return badgeElement;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeElement}
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">{badge.name}</p>
          {badge.description && (
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default BadgeDisplay;
