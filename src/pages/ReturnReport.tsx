import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings, Video, ExternalLink, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RecordingCard from "@/components/RecordingCard";
import type { ReturnReportSettings, ReturnReportRecording } from "@/types/returnReport";

const SUPER_ADMIN_EMAIL = "krichardson@wegive110.com";

const ReturnReport = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const { data: settings } = useQuery({
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
  });

  const { data: recordings = [], isLoading: recordingsLoading } = useQuery({
    queryKey: ["return-report-recordings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_report_recordings")
        .select("*")
        .eq("published", true)
        .order("recording_date", { ascending: false });
      if (error) throw error;
      return data as ReturnReportRecording[];
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground">
                Return & Report
              </h1>
              <p className="text-muted-foreground">Team meetings and past recordings</p>
            </div>
          </div>
          {isSuperAdmin && (
            <Link to="/return-report/admin">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Link>
          )}
        </div>

        {/* Pinned Meeting Card */}
        {settings?.google_meet_url && (
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      Pinned Meeting
                    </span>
                  </div>
                  <h2 className="font-display text-2xl text-foreground mb-2">
                    {settings.meet_title || "Team Meeting"}
                  </h2>
                  {settings.meet_description && (
                    <p className="text-muted-foreground mb-4">
                      {settings.meet_description}
                    </p>
                  )}
                  <Button asChild>
                    <a
                      href={settings.google_meet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Recordings */}
        <section>
          <h2 className="font-display text-2xl text-foreground mb-6">
            Past Recordings
          </h2>
          
          {recordingsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recordings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No recordings available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnReport;
