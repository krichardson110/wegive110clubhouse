import { useState } from "react";
import { Calendar, List, Plus, Settings } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePractices } from "@/hooks/usePractices";
import PracticeCalendarView from "@/components/practices/PracticeCalendarView";
import PracticeListView from "@/components/practices/PracticeListView";
import PracticeForm from "@/components/practices/PracticeForm";
import { Practice } from "@/types/practice";

const Practices = () => {
  const { user, isSuperAdmin } = useAuth();
  const { practices, isLoading, createPractice, updatePractice, deletePractice, createDrill, isCreating, isUpdating, isDeleting } = usePractices();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [deletingPracticeId, setDeletingPracticeId] = useState<string | null>(null);

  // Coaches and super admins can manage practices
  const canManage = isSuperAdmin;

  const handleCreatePractice = async (data: any) => {
    const { drills, ...practiceData } = data;
    
    createPractice({
      ...practiceData,
      created_by: user?.id,
    }, {
      onSuccess: (newPractice: any) => {
        // Create drills for the practice
        if (drills && drills.length > 0) {
          drills.forEach((drill: any, index: number) => {
            createDrill({
              practice_id: newPractice.id,
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/20 text-primary">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Training Programs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button onClick={() => setShowPracticeForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Practice
                      </Button>
                      <Link to="/practices/admin">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
                PRACTICE <span className="gradient-text">PLANS</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Structured practice plans with drills, coaching points, and diagrams. 
                {practices.length > 0 ? ` ${practices.length} practices available.` : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* View Toggle */}
            <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")} className="mb-6">
              <TabsList>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  List View
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="mt-6 space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  <TabsContent value="calendar">
                    <PracticeCalendarView
                      practices={practices}
                      isCoach={canManage}
                      onEdit={setEditingPractice}
                      onDelete={setDeletingPracticeId}
                    />
                  </TabsContent>

                  <TabsContent value="list">
                    <PracticeListView
                      practices={practices}
                      isCoach={canManage}
                      onEdit={setEditingPractice}
                      onDelete={setDeletingPracticeId}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </section>
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

export default Practices;
