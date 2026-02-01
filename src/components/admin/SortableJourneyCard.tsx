import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import JourneyCard from './JourneyCard';

interface SortableJourneyCardProps {
  journey: Tables<'journeys'>;
  chapters: Tables<'chapters'>[];
  onEdit: () => void;
  onDelete: () => void;
  onAddChapter: () => void;
  onEditChapter: (chapter: Tables<'chapters'>) => void;
  onDeleteChapter: (chapterId: string) => void;
  onReorderChapters: (journeyId: string, chapters: Tables<'chapters'>[]) => void;
}

const SortableJourneyCard = ({
  journey,
  chapters,
  onEdit,
  onDelete,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onReorderChapters,
}: SortableJourneyCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: journey.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <JourneyCard
        journey={journey}
        chapters={chapters}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddChapter={onAddChapter}
        onEditChapter={onEditChapter}
        onDeleteChapter={onDeleteChapter}
        onReorderChapters={onReorderChapters}
      />
    </div>
  );
};

export default SortableJourneyCard;
