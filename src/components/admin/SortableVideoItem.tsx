import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

interface Video {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  display_order: number;
  published: boolean;
}

interface SortableVideoItemProps {
  video: Video;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
}

const SortableVideoItem = ({
  video,
  onEdit,
  onDelete,
  onTogglePublished,
}: SortableVideoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-background ${
        video.published ? "" : "opacity-60"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-secondary">
        <img
          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-sm truncate">{video.title}</h5>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {video.duration && <span>{video.duration}</span>}
          {!video.published && (
            <>
              <span>•</span>
              <span className="text-yellow-500">Draft</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePublished}
          title={video.published ? "Unpublish" : "Publish"}
        >
          {video.published ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>

        <a
          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon" title="Watch on YouTube">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>

        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Delete">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Video</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{video.title}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SortableVideoItem;
