import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BadgeForm from "./BadgeForm";
import BadgeDisplay from "@/components/community/BadgeDisplay";
import type { Badge } from "@/types/community";
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

const BadgesManager = () => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["admin-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Badge[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Badge>) => {
      if (!data.name) throw new Error("Badge name is required");
      const insertData = {
        name: data.name,
        description: data.description,
        icon_name: data.icon_name,
        color_gradient: data.color_gradient,
        badge_type: data.badge_type,
        display_order: data.display_order,
      };
      const { error } = await supabase.from("badges").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success("Badge created successfully!");
      setFormOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create badge: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Badge> }) => {
      const { error } = await supabase.from("badges").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success("Badge updated successfully!");
      setEditingBadge(null);
    },
    onError: (error) => {
      toast.error("Failed to update badge: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success("Badge deleted successfully!");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete badge: " + error.message);
    },
  });

  const handleCreate = (data: Partial<Badge>) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: Partial<Badge>) => {
    if (editingBadge) {
      updateMutation.mutate({ id: editingBadge.id, data });
    }
  };

  const manualBadges = badges.filter((b) => b.badge_type === "manual");
  const automaticBadges = badges.filter((b) => b.badge_type === "automatic");

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Badge Types</h2>
          <p className="text-muted-foreground">Manage badges that can be awarded to players</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Badge
        </Button>
      </div>

      {/* Manual Badges (Coach Awards) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          ⚾ Coach Awards
          <span className="text-sm font-normal text-muted-foreground">
            (Manually awarded by coaches)
          </span>
        </h3>
        
        {manualBadges.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No coach award badges yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {manualBadges.map((badge) => (
              <Card key={badge.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <BadgeDisplay badge={badge} size="lg" showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {badge.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(badge.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Automatic Badges (Milestones) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🏆 Milestone Badges
          <span className="text-sm font-normal text-muted-foreground">
            (Automatically awarded for achievements)
          </span>
        </h3>
        
        {automaticBadges.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No milestone badges yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {automaticBadges.map((badge) => (
              <Card key={badge.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <BadgeDisplay badge={badge} size="lg" showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {badge.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(badge.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      <BadgeForm
        badge={editingBadge}
        open={formOpen || !!editingBadge}
        onClose={() => {
          setFormOpen(false);
          setEditingBadge(null);
        }}
        onSubmit={editingBadge ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this badge type. Any players who have earned this badge will lose it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BadgesManager;
