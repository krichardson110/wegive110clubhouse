import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, BookOpen, Target, Users, Shield, Flame, Star, Heart, Lightbulb, Trophy, Compass, Map, Flag, Award, Zap, Mountain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface SortableChapterItemProps {
  chapter: Tables<'chapters'>;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableChapterItem = ({ chapter, onEdit, onDelete }: SortableChapterItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ChapterIcon = iconMap[chapter.icon_name || 'BookOpen'] || BookOpen;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-background/50 rounded-lg group"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
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
        <Button variant="ghost" size="icon" onClick={onEdit}>
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
                onClick={onDelete}
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
};

export default SortableChapterItem;
