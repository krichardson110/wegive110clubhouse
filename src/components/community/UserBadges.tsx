import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BadgeDisplay from "./BadgeDisplay";
import type { Badge, UserBadge } from "@/types/community";

interface UserBadgesProps {
  userId: string;
  maxDisplay?: number;
}

const UserBadges = ({ userId, maxDisplay = 5 }: UserBadgesProps) => {
  const { data: userBadges = [] } = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId);
      
      if (badgesError) throw badgesError;
      
      if (badgesData.length === 0) return [];
      
      // Fetch badge details
      const badgeIds = badgesData.map((ub) => ub.badge_id);
      const { data: badges, error: detailsError } = await supabase
        .from("badges")
        .select("*")
        .in("id", badgeIds)
        .order("display_order");
      
      if (detailsError) throw detailsError;
      
      const badgeMap = new Map((badges || []).map((b) => [b.id, b]));
      
      return badgesData
        .map((ub) => ({
          ...ub,
          badge: badgeMap.get(ub.badge_id) as Badge | undefined,
        }))
        .filter((ub) => ub.badge) as UserBadge[];
    },
    enabled: !!userId,
  });

  if (userBadges.length === 0) return null;

  const displayBadges = userBadges.slice(0, maxDisplay);
  const remaining = userBadges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map((ub) => (
        <BadgeDisplay key={ub.id} badge={ub.badge!} size="sm" />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground ml-1">+{remaining}</span>
      )}
    </div>
  );
};

export default UserBadges;
