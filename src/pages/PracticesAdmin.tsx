import { useState } from "react";
import { Plus, Calendar, Trash2, Pencil, Copy, ChevronDown, ChevronUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { usePractices } from "@/hooks/usePractices";
import PracticeForm from "@/components/practices/PracticeForm";
import { Practice, seasonConfig, phaseConfig, seasons, phases } from "@/types/practice";

const PracticesAdmin = () => {
  const { user, isSuperAdmin, loading } = useAuth();
  const { practices, isLoading, createPractice, updatePractice, deletePractice, createDrill, isCreating, isUpdating, isDeleting } = usePractices();
  
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [deletingPracticeId, setDeletingPracticeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/practices" replace />;
  }

  const filteredPractices = practices.filter((practice) => {
    const matchesSeason = seasonFilter === "all" || practice.season === seasonFilter;
    const matchesPhase = phaseFilter === "all" || practice.phase === phaseFilter;
    const matchesSearch = 
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (practice.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeason && matchesPhase && matchesSearch;
  });

  const handleCreatePractice = async (data: any) => {
    const { drills, recurrence, ...practiceData } = data;
    
    createPractice({
      ...practiceData,
      created_by: user?.id,
      recurrence,
    }, {
      onSuccess: (newPractices: any) => {
        // Add drills to the first practice only (template)
        const firstPractice = Array.isArray(newPractices) ? newPractices[0] : newPractices;
        if (drills && drills.length > 0 && firstPractice) {
          drills.forEach((drill: any, index: number) => {
            createDrill({
              practice_id: firstPractice.id,
              drill_order: index,
              ...drill,
            });
          });
        }
        setShowPracticeForm(false);
      },
    });
  };

  const handleUpdatePractice = async (data: any) => {
    if (!editingPractice) return;
    const { drills, ...practiceData } = data;
    
    updatePractice({
      id: editingPractice.id,
      ...practiceData,
    }, {
      onSuccess: () => {
        setEditingPractice(null);
      },
    });
  };

  const handleDeletePractice = () => {
    if (!deletingPracticeId) return;
    deletePractice(deletingPracticeId, {
      onSuccess: () => {
        setDeletingPracticeId(null);
      },
    });
  };

  const handleDuplicate = (practice: Practice) => {
    const { id, created_at, updated_at, drills, ...practiceData } = practice;
    createPractice({
      ...practiceData,
      title: `${practice.title} (Copy)`,
      practice_date: new Date().toISOString().split("T")[0],
      created_by: user?.id!,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Practice Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage practice plans for your team
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/practices">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
              </Link>
              <Button onClick={() => setShowPracticeForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Practice
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Input
              placeholder="Search practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {seasonConfig[season].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phaseConfig[phase].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Practices List */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredPractices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No practices found</p>
                <Button onClick={() => setShowPracticeForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Practice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPractices.map((practice) => {
                const isExpanded = expandedId === practice.id;
                const practiceDate = new Date(practice.practice_date + "T00:00:00");
                
                return (
                  <Collapsible
                    key={practice.id}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedId(open ? practice.id : null)}
                  >
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={practice.published ? "default" : "secondary"}>
                                {practice.published ? "Published" : "Draft"}
                              </Badge>
                              <Badge variant="outline" className={seasonConfig[practice.season].bgColor}>
                                {seasonConfig[practice.season].label}
                              </Badge>
                              <Badge variant="outline" className={phaseConfig[practice.phase].bgColor}>
                                {phaseConfig[practice.phase].label}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{practice.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(practiceDate, "EEEE, MMMM d, yyyy")} at {practice.start_time}
                              {practice.drills && practice.drills.length > 0 && (
                                <span className="ml-2">• {practice.drills.length} drills</span>
                              )}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(practice)}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPractice(practice)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPracticeId(practice.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {practice.description && (
                            <p className="text-muted-foreground mb-4">{practice.description}</p>
                          )}
                          
                          {practice.focus_areas && practice.focus_areas.length > 0 && (
                            <div className="mb-4">
                              <span className="text-sm font-medium">Focus Areas: </span>
                              {practice.focus_areas.map((area, idx) => (
                                <Badge key={idx} variant="secondary" className="mr-1">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {practice.drills && practice.drills.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Drills:</h4>
                              <div className="space-y-2">
                                {practice.drills.map((drill, idx) => (
                                  <div key={drill.id} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                                    <span className="text-muted-foreground">#{idx + 1}</span>
                                    <Badge variant="outline" className="text-xs">{drill.phase_name}</Badge>
                                    <span>{drill.drill_name}</span>
                                    <span className="text-muted-foreground ml-auto">{drill.duration_minutes} min</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Create Practice Dialog */}
      <Dialog open={showPracticeForm} onOpenChange={setShowPracticeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Practice</DialogTitle>
          </DialogHeader>
          <PracticeForm
            onSubmit={handleCreatePractice}
            onCancel={() => setShowPracticeForm(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Practice Dialog */}
      <Dialog open={!!editingPractice} onOpenChange={(open) => !open && setEditingPractice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Practice</DialogTitle>
          </DialogHeader>
          <PracticeForm
            practice={editingPractice}
            onSubmit={handleUpdatePractice}
            onCancel={() => setEditingPractice(null)}
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPracticeId} onOpenChange={(open) => !open && setDeletingPracticeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Practice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this practice? This will also delete all associated drills. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePractice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PracticesAdmin;
