import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
import SortableChapterItem from './SortableChapterItem';

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
  onReorderChapters: (journeyId: string, chapters: Tables<'chapters'>[]) => void;
}

const JourneyCard = ({
  journey,
  chapters,
  onEdit,
  onDelete,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onReorderChapters,
}: JourneyCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[journey.icon_name || 'BookOpen'] || BookOpen;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
      const newIndex = chapters.findIndex((ch) => ch.id === over.id);

      const newChapters = [...chapters];
      const [removed] = newChapters.splice(oldIndex, 1);
      newChapters.splice(newIndex, 0, removed);

      // Update chapter_order based on new positions
      const updatedChapters = newChapters.map((ch, index) => ({
        ...ch,
        chapter_order: index,
      }));

      onReorderChapters(journey.id, updatedChapters);
    }
  };

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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={chapters.map((ch) => ch.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {chapters.map((chapter) => (
                    <SortableChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      onEdit={() => onEditChapter(chapter)}
                      onDelete={() => onDeleteChapter(chapter.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
