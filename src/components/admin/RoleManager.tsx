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
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Loader2, Search, Crown, ShieldCheck, Users } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  granted_by: string | null;
  user_email?: string;
  user_display_name?: string;
}

const roleConfig: Record<AppRole, { label: string; color: string; icon: typeof Shield }> = {
  super_admin: { label: "Super Admin", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Crown },
  admin: { label: "Admin", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: ShieldCheck },
  coach: { label: "Coach", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Users },
  player: { label: "Player", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Users },
  parent: { label: "Parent", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Users },
  user: { label: "User", color: "bg-muted text-muted-foreground border-muted", icon: Users },
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
        // If endpoint doesn't exist yet, return empty array
        if (response.status === 404) return [];
        throw new Error("Failed to fetch roles");
      }

      const result = await response.json();
      return result.roles || [];
    },
    enabled: isSuperAdmin,
  });

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

  const filteredRoles = userRoles.filter((role: UserRole) =>
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
            Assign Role
          </CardTitle>
          <CardDescription>
            Grant administrative privileges to users by email address
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
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="user">User</SelectItem>
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
                User Roles
              </CardTitle>
              <CardDescription>
                {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""} assigned
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role: UserRole) => {
                    const config = roleConfig[role.role];
                    const Icon = config.icon;
                    return (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {role.user_display_name || "Unknown User"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {role.user_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(role.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteRoleId(role.id)}
                            disabled={role.user_id === user?.id && role.role === "super_admin"}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
