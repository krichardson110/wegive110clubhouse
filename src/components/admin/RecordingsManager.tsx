import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Video, ExternalLink, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecordingForm from "./RecordingForm";
import type { ReturnReportRecording } from "@/types/returnReport";
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

const RecordingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRecording, setEditingRecording] = useState<ReturnReportRecording | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ["return-report-recordings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_report_recordings")
        .select("*")
        .order("recording_date", { ascending: false });
      if (error) throw error;
      return data as ReturnReportRecording[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ReturnReportRecording>) => {
      if (editingRecording) {
        const { error } = await supabase
          .from("return_report_recordings")
          .update(data)
          .eq("id", editingRecording.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("return_report_recordings")
          .insert([data as ReturnReportRecording]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-report-recordings-admin"] });
      queryClient.invalidateQueries({ queryKey: ["return-report-recordings"] });
      toast({ title: editingRecording ? "Recording updated" : "Recording added" });
      setIsFormOpen(false);
      setEditingRecording(null);
    },
    onError: (error) => {
      toast({ title: "Error saving recording", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("return_report_recordings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-report-recordings-admin"] });
      queryClient.invalidateQueries({ queryKey: ["return-report-recordings"] });
      toast({ title: "Recording deleted" });
      setDeletingId(null);
    },
    onError: (error) => {
      toast({ title: "Error deleting recording", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (recording: ReturnReportRecording) => {
    setEditingRecording(recording);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingRecording(null);
    setIsFormOpen(true);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Past Recordings
        </CardTitle>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Recording
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recordings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No recordings yet. Add your first one!
          </p>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">{recording.title}</h4>
                    {!recording.published && (
                      <Badge variant="secondary" className="text-xs">Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(recording.recording_date).toLocaleDateString()}
                    </span>
                    {recording.duration && <span>{recording.duration}</span>}
                    {recording.youtube_id && (
                      <a
                        href={`https://youtube.com/watch?v=${recording.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        YouTube
                      </a>
                    )}
                    {recording.external_url && (
                      <a
                        href={recording.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        External
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(recording)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingId(recording.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <RecordingForm
          recording={editingRecording}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecording(null);
          }}
          onSave={(data) => saveMutation.mutate(data)}
          isLoading={saveMutation.isPending}
        />

        <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recording</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this recording? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingId && deleteMutation.mutate(deletingId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default RecordingsManager;
