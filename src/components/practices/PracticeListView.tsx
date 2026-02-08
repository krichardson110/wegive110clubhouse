import { useState } from "react";
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { Practice, seasons, phases, seasonConfig, phaseConfig } from "@/types/practice";
import PracticeCard from "./PracticeCard";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PracticeListViewProps {
  practices: Practice[];
  isCoach?: boolean;
  onEdit?: (practice: Practice) => void;
  onDelete?: (practiceId: string) => void;
}

const PracticeListView = ({ practices, isCoach, onEdit, onDelete }: PracticeListViewProps) => {
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter practices
  const filteredPractices = practices.filter((practice) => {
    const matchesSeason = seasonFilter === "all" || practice.season === seasonFilter;
    const matchesPhase = phaseFilter === "all" || practice.phase === phaseFilter;
    const matchesSearch = 
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (practice.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.focus_areas?.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSeason && matchesPhase && matchesSearch;
  });

  // Group practices by time period
  const groupPractices = () => {
    const groups: Record<string, Practice[]> = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      upcoming: [],
      past: [],
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    filteredPractices.forEach((practice) => {
      const practiceDate = new Date(practice.practice_date + "T00:00:00");
      
      if (practiceDate < now) {
        groups.past.push(practice);
      } else if (isToday(practiceDate)) {
        groups.today.push(practice);
      } else if (isTomorrow(practiceDate)) {
        groups.tomorrow.push(practice);
      } else if (isThisWeek(practiceDate)) {
        groups.thisWeek.push(practice);
      } else if (isThisMonth(practiceDate)) {
        groups.thisMonth.push(practice);
      } else {
        groups.upcoming.push(practice);
      }
    });

    return groups;
  };

  const groups = groupPractices();

  const renderGroup = (title: string, practices: Practice[]) => {
    if (practices.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {title}
          <Badge variant="secondary">{practices.length}</Badge>
        </h3>
        <div className="space-y-4">
          {practices.map((practice) => (
            <PracticeCard
              key={practice.id}
              practice={practice}
              isCoach={isCoach}
              onEdit={() => onEdit?.(practice)}
              onDelete={() => onDelete?.(practice.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search practices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {seasons.map((season) => (
              <SelectItem key={season} value={season}>
                {seasonConfig[season].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {phases.map((phase) => (
              <SelectItem key={phase} value={phase}>
                {phaseConfig[phase].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Practice groups */}
      {renderGroup("Today", groups.today)}
      {renderGroup("Tomorrow", groups.tomorrow)}
      {renderGroup("This Week", groups.thisWeek)}
      {renderGroup("This Month", groups.thisMonth)}
      {renderGroup("Upcoming", groups.upcoming)}
      {renderGroup("Past Practices", groups.past)}

      {filteredPractices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No practices found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default PracticeListView;
