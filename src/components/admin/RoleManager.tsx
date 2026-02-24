import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Loader2, Search, Crown, ShieldCheck, Settings, ChevronDown, ChevronUp, Video, Dumbbell, BookOpen, Calendar, ClipboardList, Award, Radio, Heart, Users as UsersIcon, MessageSquare } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  granted_by: string | null;
  user_email?: string;
  user_display_name?: string;
}

interface AdminPermission {
  id: string;
  user_id: string;
  permission: string;
  enabled: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { key: "manage_users", label: "User Management", description: "View and edit user profiles, reset passwords", icon: UsersIcon },
  { key: "manage_teams", label: "Team Management", description: "Create, edit, and manage teams and rosters", icon: UsersIcon },
  { key: "manage_videos", label: "Video Library", description: "Add, edit, and remove video content and categories", icon: Video },
  { key: "manage_workouts", label: "Workouts", description: "Manage workout content, categories, and exercises", icon: Dumbbell },
  { key: "manage_playbook", label: "Playbook", description: "Edit journeys, chapters, and playbook content", icon: BookOpen },
  { key: "manage_schedule", label: "Schedule", description: "Create and manage schedule events", icon: Calendar },
  { key: "manage_practices", label: "Practices", description: "Create and manage practice plans and drills", icon: ClipboardList },
  { key: "manage_badges", label: "Badges", description: "Create, edit, and award badges to users", icon: Award },
  { key: "manage_recordings", label: "Return Report", description: "Manage return report recordings and settings", icon: Radio },
  { key: "manage_wellness", label: "Wellness Videos", description: "Manage wellness video content", icon: Heart },
  { key: "manage_community", label: "Community", description: "Moderate community posts and comments", icon: MessageSquare },
];

const roleConfig: Record<string, { label: string; description: string; color: string; icon: typeof Shield }> = {
  super_admin: { label: "Super Admin", description: "Full system access — manage all users, teams, content, and settings", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Crown },
  admin: { label: "Admin", description: "Permissions controlled by super admin", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: ShieldCheck },
};

const RoleManager = () => {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Fetch all user roles with user info
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/roles`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch roles");
      }

      const result = await response.json();
      return result.roles || [];
    },
    enabled: isSuperAdmin,
  });

  // Fetch permissions for expanded user
  const { data: userPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["admin-permissions", expandedUserId],
    queryFn: async () => {
      if (!expandedUserId) return [];
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("user_id", expandedUserId);
      if (error) throw error;
      return (data || []) as AdminPermission[];
    },
    enabled: !!expandedUserId && isSuperAdmin,
  });

  // Toggle permission mutation
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission, enabled }: { userId: string; permission: string; enabled: boolean }) => {
      const existing = userPermissions.find(p => p.permission === permission);
      if (existing) {
        const { error } = await supabase
          .from("admin_permissions")
          .update({ enabled, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("admin_permissions")
          .insert({ user_id: userId, permission, enabled, granted_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions", expandedUserId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk toggle all permissions
  const toggleAllPermissions = async (userId: string, enabled: boolean) => {
    for (const perm of AVAILABLE_PERMISSIONS) {
      await togglePermissionMutation.mutateAsync({ userId, permission: perm.key, enabled });
    }
    toast({
      title: enabled ? "All Permissions Enabled" : "All Permissions Disabled",
      description: `All admin permissions have been ${enabled ? "enabled" : "disabled"}.`,
    });
  };

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/roles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, role }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      setSelectedEmail("");
      setIsAddingRole(false);
      toast({
        title: "Role Added",
        description: "User role has been assigned successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/roles/${roleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      setDeleteRoleId(null);
      toast({
        title: "Role Removed",
        description: "User role has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddRole = () => {
    if (!selectedEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a user email address.",
        variant: "destructive",
      });
      return;
    }

    addRoleMutation.mutate({ email: selectedEmail.trim(), role: selectedRole });
  };

  const isPermissionEnabled = (permission: string) => {
    const found = userPermissions.find(p => p.permission === permission);
    return found ? found.enabled : false;
  };

  const enabledCount = AVAILABLE_PERMISSIONS.filter(p => isPermissionEnabled(p.key)).length;

  const filteredRoles = userRoles
    .filter((role: UserRole) => role.role === 'super_admin' || role.role === 'admin')
    .filter((role: UserRole) =>
      role.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You do not have permission to manage roles.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Role Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Management Role
          </CardTitle>
          <CardDescription>
            Grant system management privileges to internal staff who help administer the Clubhouse platform. These roles are for internal users only — coaches, players, and parents are managed through Teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="role" className="sr-only">Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddRole} 
              disabled={addRoleMutation.isPending}
            >
              {addRoleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roles List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Management Roles
              </CardTitle>
              <CardDescription>
                Internal staff with system management access — {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""} assigned
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No roles match your search." : "No roles assigned yet."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoles.map((role: UserRole) => {
                const config = roleConfig[role.role];
                const Icon = config.icon;
                const isExpanded = expandedUserId === role.user_id && role.role === "admin";
                const isAdmin = role.role === "admin";

                return (
                  <div key={role.id} className="rounded-lg border bg-card">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {role.user_display_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {role.user_email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <Badge variant="outline" className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          {isAdmin && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {enabledCount > 0 && isExpanded
                                ? `${enabledCount} of ${AVAILABLE_PERMISSIONS.length} permissions`
                                : config.description}
                            </p>
                          )}
                          {!isAdmin && (
                            <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                          )}
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedUserId(isExpanded ? null : role.user_id)}
                            className="gap-1"
                          >
                            <Settings className="w-4 h-4" />
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteRoleId(role.id)}
                          disabled={role.user_id === user?.id && role.role === "super_admin"}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Permissions Panel */}
                    {isExpanded && (
                      <div className="border-t px-4 py-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            Permissions for {role.user_display_name || role.user_email}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAllPermissions(role.user_id, true)}
                              disabled={togglePermissionMutation.isPending}
                            >
                              Enable All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAllPermissions(role.user_id, false)}
                              disabled={togglePermissionMutation.isPending}
                            >
                              Disable All
                            </Button>
                          </div>
                        </div>

                        {permissionsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {AVAILABLE_PERMISSIONS.map((perm) => {
                              const PermIcon = perm.icon;
                              const enabled = isPermissionEnabled(perm.key);
                              return (
                                <div
                                  key={perm.key}
                                  className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                                    enabled ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <PermIcon className={`w-4 h-4 flex-shrink-0 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
                                    <div className="min-w-0">
                                      <p className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground"}`}>
                                        {perm.label}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {perm.description}
                                      </p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={enabled}
                                    onCheckedChange={(checked) =>
                                      togglePermissionMutation.mutate({
                                        userId: role.user_id,
                                        permission: perm.key,
                                        enabled: checked,
                                      })
                                    }
                                    disabled={togglePermissionMutation.isPending}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this role? The user will lose the associated permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoleId && removeRoleMutation.mutate(deleteRoleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRoleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManager;
