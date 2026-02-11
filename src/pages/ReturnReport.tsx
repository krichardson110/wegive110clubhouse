import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings, Video, ExternalLink, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import type { ReturnReportSettings } from "@/types/returnReport";

const ReturnReport = () => {
  const { isSuperAdmin } = useAuth();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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
              <p className="text-muted-foreground">Team meetings</p>
            </div>
          </div>
          {isSuperAdmin && (
            <Link to="/return-report/admin" className="ml-auto sm:ml-0">
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
      </main>

      <Footer />
    </div>
  );
};

export default ReturnReport;
