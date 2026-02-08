import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReturnReportSettingsForm from "@/components/admin/ReturnReportSettingsForm";
import RecordingsManager from "@/components/admin/RecordingsManager";
import type { ReturnReportSettings } from "@/types/returnReport";

const ReturnReportAdmin = () => {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["return-report-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_report_settings")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as ReturnReportSettings | null;
    },
    enabled: isSuperAdmin,
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: Partial<ReturnReportSettings>) => {
      if (settings) {
        const { error } = await supabase
          .from("return_report_settings")
          .update({ ...data, updated_by: user?.id })
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("return_report_settings")
          .insert({ ...data, updated_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-report-settings"] });
      toast({ title: "Meeting settings saved" });
    },
    onError: (error) => {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    },
  });

  if (!isSuperAdmin) {
    return <Navigate to="/return-report" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/return-report">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-3xl text-foreground">Manage Return & Report</h1>
            <p className="text-muted-foreground">Configure your team meeting and past recordings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            <ReturnReportSettingsForm
              settings={settings}
              onSave={(data) => settingsMutation.mutate(data)}
              isLoading={settingsMutation.isPending}
            />
            <RecordingsManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnReportAdmin;
