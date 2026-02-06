import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, Plus, ChevronDown, ChevronRight } from "lucide-react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableVideoItem from "./SortableVideoItem";

interface VideoCategory {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  color_gradient: string;
  display_order: number;
  published: boolean;
}

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

interface SortableVideoCategoryProps {
  category: VideoCategory;
  videos: Video[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
  onAddVideo: () => void;
  onEditVideo: (video: Video) => void;
  onDeleteVideo: (videoId: string) => void;
  onToggleVideoPublished: (video: Video) => void;
  onReorderVideos: (videos: Video[]) => void;
  getIcon: (iconName: string) => React.ComponentType<{ className?: string }>;
}

const SortableVideoCategory = ({
  category,
  videos,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onTogglePublished,
  onAddVideo,
  onEditVideo,
  onDeleteVideo,
  onToggleVideoPublished,
  onReorderVideos,
  getIcon,
}: SortableVideoCategoryProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getIcon(category.icon_name);

  const videoSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over.id);

      const newVideos = [...videos];
      const [removed] = newVideos.splice(oldIndex, 1);
      newVideos.splice(newIndex, 0, removed);

      const updatedVideos = newVideos.map((v, index) => ({
        ...v,
        display_order: index,
      }));

      onReorderVideos(updatedVideos);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <div className={`rounded-lg border ${category.published ? "" : "opacity-60"}`}>
          <CollapsibleTrigger asChild>
            <div
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 rounded-t-lg bg-gradient-to-r ${category.color_gradient}`}
            >
              {/* Drag handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>

              {isExpanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}

              <Icon className="w-5 h-5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {videos.length} video{videos.length !== 1 ? "s" : ""}
                  {!category.published && " • Draft"}
                </p>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onTogglePublished}
                  title={category.published ? "Unpublish" : "Publish"}
                >
                  {category.published ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAddVideo}
                  title="Add video to category"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  title="Edit category"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Delete category">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{category.name}"? This will also delete all {videos.length} videos in this category.
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
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t">
              {videos.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No videos in this category yet.
                </div>
              ) : (
                <DndContext
                  sensors={videoSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleVideoDragEnd}
                >
                  <SortableContext
                    items={videos.map((v) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-y">
                      {videos.map((video) => (
                        <SortableVideoItem
                          key={video.id}
                          video={video}
                          onEdit={() => onEditVideo(video)}
                          onDelete={() => onDeleteVideo(video.id)}
                          onTogglePublished={() => onToggleVideoPublished(video)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default SortableVideoCategory;
