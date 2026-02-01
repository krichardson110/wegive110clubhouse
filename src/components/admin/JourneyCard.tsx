import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  BookOpen,
  Target,
  Users,
  Shield,
  Flame,
  Star,
  Heart,
  Lightbulb,
  Trophy,
  Compass,
  Map,
  Flag,
  Award,
  Zap,
  Mountain,
  Rocket,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tables } from '@/integrations/supabase/types';

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
  Compass,
  Map,
  Flag,
  Award,
  Zap,
  Mountain,
  Rocket,
};

interface JourneyCardProps {
  journey: Tables<'journeys'>;
  chapters: Tables<'chapters'>[];
  onEdit: () => void;
  onDelete: () => void;
  onAddChapter: () => void;
  onEditChapter: (chapter: Tables<'chapters'>) => void;
  onDeleteChapter: (chapterId: string) => void;
}

const JourneyCard = ({
  journey,
  chapters,
  onEdit,
  onDelete,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
}: JourneyCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[journey.icon_name || 'BookOpen'] || BookOpen;

  return (
    <Card className={`bg-gradient-to-br ${journey.color_gradient} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background/50">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{journey.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{journey.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={journey.published ? 'default' : 'secondary'}>
              {journey.published ? 'Published' : 'Draft'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Journey?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{journey.title}" and all its chapters. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground"
          >
            {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {chapters.length} Chapters
          </Button>
          <Button variant="outline" size="sm" onClick={onAddChapter}>
            <Plus className="w-4 h-4 mr-1" />
            Add Chapter
          </Button>
        </div>

        {expanded && (
          <div className="space-y-2 mt-4 border-t border-border/50 pt-4">
            {chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No chapters yet. Add your first chapter to get started.
              </p>
            ) : (
              chapters.map((chapter) => {
                const ChapterIcon = iconMap[chapter.icon_name || 'BookOpen'] || BookOpen;
                return (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">
                        Ch. {chapter.chapter_number}
                      </span>
                      <ChapterIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{chapter.title}</p>
                        {chapter.subtitle && (
                          <p className="text-xs text-muted-foreground">{chapter.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={chapter.published ? 'default' : 'secondary'} className="text-xs">
                        {chapter.published ? 'Published' : 'Draft'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => onEditChapter(chapter)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{chapter.title}". This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteChapter(chapter.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
