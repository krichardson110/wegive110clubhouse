import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PenTool, CheckCircle, MessageCircle, FileText, Clock, Play, Pause, RotateCcw, Save, Loader2 } from "lucide-react";
import { useSaveExerciseResponse, ExerciseResponse } from "@/hooks/useExerciseResponses";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Exercise } from "@/hooks/usePlaybook";

interface ExerciseModalProps {
  exercise: Exercise | null;
  chapterId: string;
  existingResponse?: ExerciseResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const exerciseTypeColors = {
  reflection: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  action: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  discussion: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  journaling: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const ExerciseModal = ({ exercise, chapterId, existingResponse, open, onOpenChange }: ExerciseModalProps) => {
  const { user } = useAuth();
  const saveResponse = useSaveExerciseResponse();
  
  const [responseText, setResponseText] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Parse time estimate to get suggested duration in seconds
  const parseTimeEstimate = useCallback((estimate: string): number => {
    const match = estimate.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (estimate.toLowerCase().includes("hour")) return num * 3600;
      if (estimate.toLowerCase().includes("min")) return num * 60;
      return num * 60; // Default to minutes
    }
    return 900; // Default 15 minutes
  }, []);

  // Reset state when exercise changes
  useEffect(() => {
    if (exercise && open) {
      setResponseText(existingResponse?.response_text || "");
      setTimerSeconds(existingResponse?.time_spent_seconds || 0);
      setIsTimerRunning(false);
      setHasStarted(!!existingResponse);
    }
  }, [exercise, existingResponse, open]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  const handlePauseResume = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReset = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save your response");
      return;
    }

    if (!exercise) return;

    try {
      setIsTimerRunning(false);
      await saveResponse.mutateAsync({
        chapterId,
        exerciseId: exercise.id,
        responseText: responseText.trim() || undefined,
        timeSpentSeconds: timerSeconds > 0 ? timerSeconds : undefined,
      });
      toast.success("Exercise response saved!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save response");
    }
  };

  if (!exercise) return null;

  const Icon = exerciseTypeIcons[exercise.type];
  const suggestedTime = parseTimeEstimate(exercise.timeEstimate);
  const isTextBased = exercise.type === "reflection" || exercise.type === "journaling";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={exerciseTypeColors[exercise.type]}>
              <Icon className="w-3 h-3 mr-1" />
              {exerciseTypeLabels[exercise.type]}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {exercise.timeEstimate}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{exercise.title}</DialogTitle>
          <DialogDescription className="text-base">
            {exercise.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timer Section */}
          <div className="bg-secondary/30 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm text-muted-foreground">Time Tracker</Label>
              {!hasStarted && (
                <span className="text-xs text-muted-foreground">
                  Suggested: {Math.floor(suggestedTime / 60)} min
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="font-mono text-4xl text-foreground tabular-nums">
                {formatTime(timerSeconds)}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              {!hasStarted ? (
                <Button onClick={handleStart} className="gap-2">
                  <Play className="w-4 h-4" />
                  Start Exercise
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePauseResume}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Response Input - show for text-based exercises or after starting */}
          {(isTextBased || hasStarted) && (
            <div className="space-y-3">
              <Label htmlFor="response" className="text-sm">
                {isTextBased ? "Your Response" : "Notes (optional)"}
              </Label>
              <Textarea
                id="response"
                placeholder={
                  exercise.type === "reflection"
                    ? "Write your reflections here..."
                    : exercise.type === "journaling"
                    ? "Start journaling your thoughts..."
                    : exercise.type === "discussion"
                    ? "Capture key takeaways from your team discussion..."
                    : "Add any notes about completing this action item..."
                }
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[150px] resize-y"
              />
              {isTextBased && (
                <p className="text-xs text-muted-foreground">
                  {responseText.length} characters
                </p>
              )}
            </div>
          )}

          {/* Instructions based on type */}
          {!hasStarted && (
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h4 className="font-medium text-foreground mb-2">How to complete this exercise:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {exercise.type === "reflection" && (
                  <>
                    <li>• Start the timer when you begin reflecting</li>
                    <li>• Write your honest thoughts and insights</li>
                    <li>• Save when you feel you've fully reflected</li>
                  </>
                )}
                {exercise.type === "action" && (
                  <>
                    <li>• Start the timer when you begin the action</li>
                    <li>• Complete the task described above</li>
                    <li>• Add notes about what you did or learned</li>
                  </>
                )}
                {exercise.type === "discussion" && (
                  <>
                    <li>• Gather your team for the discussion</li>
                    <li>• Start the timer when conversation begins</li>
                    <li>• Capture key points and insights shared</li>
                  </>
                )}
                {exercise.type === "journaling" && (
                  <>
                    <li>• Find a quiet space to write</li>
                    <li>• Start the timer and begin journaling</li>
                    <li>• Write freely without editing yourself</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {hasStarted ? "Cancel" : "Close"}
          </Button>
          {hasStarted && (
            <Button onClick={handleSave} disabled={saveResponse.isPending}>
              {saveResponse.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Response
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseModal;
