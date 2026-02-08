import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Target, Users, Shield, Flame, Star, Heart, 
  Lightbulb, Trophy, Zap, Award, UsersRound 
} from "lucide-react";

// Icon mapping from database icon_name to component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Target,
  Users,
  Shield,
  Flame,
  Star,
  Heart,
  Lightbulb,
  Trophy,
  Zap,
  Award,
  UsersRound,
};

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: "reflection" | "action" | "discussion" | "journaling";
  timeEstimate: string;
}

export interface ReadingMaterial {
  id: string;
  title: string;
  author?: string;
  description: string;
  type: "article" | "quote" | "story" | "excerpt";
  content: string;
  source?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  keyTakeaways: string[];
  readings: ReadingMaterial[];
  exercises: Exercise[];
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  chapters: Chapter[];
}

export const usePlaybook = () => {
  return useQuery({
    queryKey: ["playbook-journeys"],
    queryFn: async (): Promise<Journey[]> => {
      // Fetch journeys
      const { data: journeysData, error: journeysError } = await supabase
        .from("journeys")
        .select("*")
        .eq("published", true)
        .order("journey_order");

      if (journeysError) throw journeysError;

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("*")
        .eq("published", true)
        .order("chapter_order");

      if (chaptersError) throw chaptersError;

      // Transform and combine data
      const journeys: Journey[] = journeysData.map((journey) => {
        const journeyChapters = chaptersData
          .filter((ch) => ch.journey_id === journey.id)
          .map((ch) => ({
            id: ch.id,
            number: ch.chapter_number,
            title: ch.title,
            subtitle: ch.subtitle || "",
            description: ch.description || "",
            icon: iconMap[ch.icon_name || "BookOpen"] || BookOpen,
            color: ch.color_gradient || "from-primary/20 to-accent/20 border-primary/40",
            keyTakeaways: (ch.key_takeaways as unknown as string[]) || [],
            readings: (ch.readings as unknown as ReadingMaterial[]) || [],
            exercises: (ch.exercises as unknown as Exercise[]) || [],
          }));

        return {
          id: journey.id,
          title: journey.title,
          description: journey.description || "",
          icon: iconMap[journey.icon_name || "BookOpen"] || BookOpen,
          color: journey.color_gradient || "from-primary/20 to-accent/20 border-primary/40",
          chapters: journeyChapters,
        };
      });

      return journeys;
    },
  });
};
