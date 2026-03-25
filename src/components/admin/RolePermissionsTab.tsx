import { useState, useEffect, useMemo } from 'react';
import { Eye, Info, Loader2, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { rolesService, Role, Permission } from '@/services/roles.service';
import { toast } from 'sonner';

export function RolePermissionsTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group permissions by resource for the matrix
  const { resources, actions } = useMemo(() => {
    const rSet = new Set<string>();
    const aSet = new Set<string>();
    allPermissions.forEach(p => {
      rSet.add(p.resource_name);
      aSet.add(p.action_name);
    });
    return {
      resources: Array.from(rSet).sort(),
      actions: Array.from(aSet).sort()
    };
  }, [allPermissions]);
  
  const fetchRolesAndPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        rolesService.listRoles(),
        rolesService.listPermissions()
      ]);
      console.log("RolePermissionsTab received roles:", fetchedRoles);
      console.log("RolePermissionsTab received perms:", fetchedPermissions);
      setRoles(fetchedRoles);
      setAllPermissions(fetchedPermissions);
    } catch (err: any) {
      console.error("RolePermissionsTab fetch error:", err);
      setError(err.message || 'Failed to load roles and permissions');
      toast.error('Failed to load roles and permissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const handlePermissionToggle = async (
    role: Role,
    permission: Permission,
    isAssigned: boolean
  ) => {
    if (role.role_name === 'super_admin') {
      toast.error('Super Admin permissions cannot be modified');
      return;
    }

    // Optimistic update
    setRoles(prev => prev.map(r => {
      if (r.role_id === role.role_id) {
        const newPerms = isAssigned 
          ? r.permissions.filter(p => p.permission_id !== permission.permission_id)
          : [...r.permissions, permission];
        return { ...r, permissions: newPerms };
      }
      return r;
    }));

    try {
      if (isAssigned) {
        await rolesService.removePermission(role.role_id, permission.permission_id);
        toast.success(`Removed ${permission.action_name} on ${permission.resource_name}`);
      } else {
        await rolesService.assignPermission(role.role_id, permission.permission_id);
        toast.success(`Assigned ${permission.action_name} on ${permission.resource_name}`);
      }
    } catch (err) {
      toast.error('Failed to update permission');
      // Revert on failure
      await fetchRolesAndPermissions();
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {error}. Check your API connection or try again later.
          </p>
          <Button onClick={fetchRolesAndPermissions} variant="outline" className="gap-2">
            <Info className="h-4 w-4" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRole = roles.find(r => r.role_id === selectedRole);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.length === 0 ? (
          <div className="col-span-full py-12 text-center border rounded-lg bg-muted/20">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No roles found in the system</p>
          </div>
        ) : (
          roles.map((role) => (
            <Card
              key={role.role_id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === role.role_id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRole(selectedRole === role.role_id ? null : role.role_id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">{role.role_name}</CardTitle>
                  <Badge variant="secondary">{role.permissions?.length || 0} perms</Badge>
                </div>
                <CardDescription className="text-xs line-clamp-2">
                  {role.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailRole(role);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </Button>
                  {role.role_name === 'super_admin' && (
                    <Badge variant="outline" className="text-xs">
                      System Role
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {activeRole && (
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">Permissions for {activeRole.role_name}</CardTitle>
            <CardDescription>
              Configure access to resources based on specific actions (auto-saved)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              {resources.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground whitespace-pre-wrap">
                  No system permissions available to configure.{"\n"}
                  Ensure the backend metadata is properly synchronized.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px]">Resource</TableHead>
                      {actions.map(action => (
                        <TableHead key={action} className="text-center capitalize">
                          {action}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource}>
                        <TableCell className="font-medium capitalize">{resource}</TableCell>
                        {actions.map(action => {
                          const targetPerm = allPermissions.find(p => p.resource_name === resource && p.action_name === action);
                          const isAssigned = targetPerm ? (activeRole.permissions || []).some(p => {
                            const idMatch = String(p.permission_id) === String(targetPerm.permission_id);
                            // Extra safety for name matching
                            const currentPerm: any = p;
                            const pResource = currentPerm.resource_name || currentPerm.resource;
                            const pAction = currentPerm.action_name || currentPerm.action;
                            const conceptualMatch = (pResource === resource) && 
                                                 (pAction === action || (action === 'read' && pAction === 'view'));
                            return idMatch || conceptualMatch;
                          }) : false;
                          
                          return (
                            <TableCell key={action} className="text-center">
                              {targetPerm ? (
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={() => handlePermissionToggle(activeRole, targetPerm, isAssigned)}
                                  disabled={activeRole.role_name === 'super_admin'}
                                />
                              ) : (
                                <span className="text-muted-foreground/30">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {activeRole.role_name === 'super_admin' && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                <Info className="inline h-4 w-4 mr-2" />
                Super Admin permissions cannot be modified. This role has full access to all features.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Detail Sheet */}
      <Sheet open={!!detailRole} onOpenChange={(open) => !open && setDetailRole(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="capitalize">{detailRole?.role_name}</SheetTitle>
            <SheetDescription>{detailRole?.description}</SheetDescription>
          </SheetHeader>

          {detailRole && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Assigned Permissions</h4>
                <div className="rounded-lg border divide-y">
                  {(!detailRole.permissions || detailRole.permissions.length === 0) ? (
                    <div className="p-3 text-sm text-muted-foreground">No permissions assigned.</div>
                  ) : (
                    detailRole.permissions.map((perm, idx) => {
                       const fullPerm = allPermissions.find(ap => String(ap.permission_id) === String(perm.permission_id)) || perm;
                       return (
                         <div key={perm.permission_id || idx} className="p-3">
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium capitalize">{fullPerm.resource_name}</span>
                              <Badge variant="secondary" className="text-xs uppercase">{fullPerm.action_name}</Badge>
                           </div>
                           {fullPerm.description && (
                              <p className="text-xs text-muted-foreground mt-1">{fullPerm.description}</p>
                           )}
                         </div>
                       );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
