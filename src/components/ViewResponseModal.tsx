import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenTool, CheckCircle, MessageCircle, FileText, Clock, Calendar, Trash2, Loader2 } from "lucide-react";
import { ExerciseResponse, useDeleteExerciseResponse } from "@/hooks/useExerciseResponses";
import { Exercise } from "@/hooks/usePlaybook";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ViewResponseModalProps {
  exercise: Exercise | null;
  response: ExerciseResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const exerciseTypeIcons = {
  reflection: PenTool,
  action: CheckCircle,
  discussion: MessageCircle,
  journaling: FileText,
};

const exerciseTypeLabels = {
  reflection: "Reflection",
  action: "Action Item",
  discussion: "Team Discussion",
  journaling: "Journaling",
};

const ViewResponseModal = ({ exercise, response, open, onOpenChange, onEdit }: ViewResponseModalProps) => {
  const deleteResponse = useDeleteExerciseResponse();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!exercise || !response) return null;

  const Icon = exerciseTypeIcons[exercise.type];

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleDelete = async () => {
    try {
      await deleteResponse.mutateAsync(response.id);
      toast.success("Response deleted");
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete response");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                <Icon className="w-3 h-3 mr-1" />
                {exerciseTypeLabels[exercise.type]}
              </Badge>
            </div>
            <DialogTitle className="text-xl">{exercise.title}</DialogTitle>
            <DialogDescription className="text-base">
              {exercise.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Completion Stats */}
            <div className="flex flex-wrap gap-4 bg-secondary/30 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Completed:</span>
                <span className="text-sm text-foreground">
                  {format(new Date(response.completed_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {response.time_spent_seconds && response.time_spent_seconds > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Time spent:</span>
                  <span className="text-sm text-foreground">
                    {formatTime(response.time_spent_seconds)}
                  </span>
                </div>
              )}
            </div>

            {/* Response Content */}
            {response.response_text && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Your Response</h4>
                <ScrollArea className="h-[200px] rounded-lg border border-border bg-card p-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {response.response_text}
                  </p>
                </ScrollArea>
              </div>
            )}

            {!response.response_text && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No written response saved for this exercise.</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onEdit}>
              Edit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your response for this exercise. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteResponse.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteResponse.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ViewResponseModal;
