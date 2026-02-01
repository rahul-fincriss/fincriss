import { useState } from 'react';
import { Check, X, Eye, Info } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRoleDefinitions, mockRolePermissions } from '@/data/adminMockData';
import { RoleDefinition, RolePermissions, ScreenPermission, ActionPermission } from '@/types/admin';
import { UserRole } from '@/types';
import { toast } from 'sonner';

export function RolePermissionsTab() {
  const [roles] = useState<RoleDefinition[]>(mockRoleDefinitions);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Record<UserRole, RolePermissions>>(mockRolePermissions);
  const [hasChanges, setHasChanges] = useState(false);
  const [detailRole, setDetailRole] = useState<RoleDefinition | null>(null);

  const handleScreenPermissionChange = (
    roleId: UserRole,
    screenId: string,
    action: 'view' | 'edit' | 'approve' | 'admin',
    value: boolean
  ) => {
    if (roleId === 'super_admin') {
      toast.error('Super Admin permissions cannot be modified');
      return;
    }

    setPermissions((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        screens: prev[roleId].screens.map((s) =>
          s.screenId === screenId
            ? { ...s, actions: { ...s.actions, [action]: value } }
            : s
        ),
      },
    }));
    setHasChanges(true);
  };

  const handleActionPermissionChange = (
    roleId: UserRole,
    actionId: string,
    value: boolean
  ) => {
    if (roleId === 'super_admin') {
      toast.error('Super Admin permissions cannot be modified');
      return;
    }

    setPermissions((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        actions: prev[roleId].actions.map((a) =>
          a.actionId === actionId ? { ...a, allowed: value } : a
        ),
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success('Permissions saved successfully');
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions(mockRolePermissions);
    setHasChanges(false);
    toast.info('Permissions reset to default');
  };

  const renderPermissionCell = (value: boolean, disabled: boolean = false) => {
    return value ? (
      <Check className={`h-4 w-4 ${disabled ? 'text-muted-foreground' : 'text-green-600'}`} />
    ) : (
      <X className={`h-4 w-4 ${disabled ? 'text-muted-foreground' : 'text-muted-foreground/50'}`} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === role.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{role.name}</CardTitle>
                <Badge variant="secondary">{role.userCount} users</Badge>
              </div>
              <CardDescription className="text-xs line-clamp-2">
                {role.description}
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
                {role.isSystemRole && (
                  <Badge variant="outline" className="text-xs">
                    System Role
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      {selectedRole && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>
                Permissions for{' '}
                {roles.find((r) => r.id === selectedRole)?.name}
              </CardTitle>
              <CardDescription>
                Configure screen access and action permissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="screens">
              <TabsList>
                <TabsTrigger value="screens">Screen Access</TabsTrigger>
                <TabsTrigger value="actions">Action Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="screens" className="mt-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px]">Screen</TableHead>
                        <TableHead className="text-center w-[100px]">View</TableHead>
                        <TableHead className="text-center w-[100px]">Edit</TableHead>
                        <TableHead className="text-center w-[100px]">Approve</TableHead>
                        <TableHead className="text-center w-[100px]">Admin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions[selectedRole].screens.map((screen) => (
                        <TableRow key={screen.screenId}>
                          <TableCell className="font-medium">
                            {screen.screenName}
                          </TableCell>
                          {(['view', 'edit', 'approve', 'admin'] as const).map(
                            (action) => (
                              <TableCell key={action} className="text-center">
                                <Checkbox
                                  checked={screen.actions[action] === true}
                                  onCheckedChange={(checked) =>
                                    handleScreenPermissionChange(
                                      selectedRole,
                                      screen.screenId,
                                      action,
                                      checked === true
                                    )
                                  }
                                  disabled={selectedRole === 'super_admin'}
                                />
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px]">Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center w-[100px]">Allowed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions[selectedRole].actions.map((action) => (
                        <TableRow key={action.actionId}>
                          <TableCell className="font-medium">
                            {action.actionName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {action.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={action.allowed}
                              onCheckedChange={(checked) =>
                                handleActionPermissionChange(
                                  selectedRole,
                                  action.actionId,
                                  checked === true
                                )
                              }
                              disabled={selectedRole === 'super_admin'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>

            {selectedRole === 'super_admin' && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                <Info className="inline h-4 w-4 mr-2" />
                Super Admin permissions cannot be modified. This role has full
                access to all features.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Detail Sheet */}
      <Sheet open={!!detailRole} onOpenChange={(open) => !open && setDetailRole(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailRole?.name}</SheetTitle>
            <SheetDescription>{detailRole?.description}</SheetDescription>
          </SheetHeader>

          {detailRole && (
            <div className="mt-6 space-y-6">
              {/* Role Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Role Information</h4>
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Users with this role:</span>
                    <span className="font-medium">{detailRole.userCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">System role:</span>
                    <span>{detailRole.isSystemRole ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Screen Permissions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Screen Access</h4>
                <div className="rounded-lg border divide-y">
                  {permissions[detailRole.id].screens.map((screen) => {
                    const hasAny = Object.values(screen.actions).some(Boolean);
                    if (!hasAny) return null;
                    return (
                        <div key={screen.screenId} className="p-3 flex items-center justify-between">
                        <span className="text-sm">{screen.screenName}</span>
                        <div className="flex gap-2">
                          {screen.actions.view && (
                            <Badge variant="secondary" className="text-xs">View</Badge>
                          )}
                          {screen.actions.edit && (
                            <Badge variant="outline" className="text-xs">Edit</Badge>
                          )}
                          {screen.actions.approve && (
                            <Badge variant="outline" className="text-xs">Approve</Badge>
                          )}
                          {screen.actions.admin && (
                            <Badge variant="outline" className="text-xs">Admin</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Permissions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Allowed Actions</h4>
                <div className="rounded-lg border divide-y">
                  {permissions[detailRole.id].actions
                    .filter((a) => a.allowed)
                    .map((action) => (
                      <div key={action.actionId} className="p-3">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{action.actionName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6 mt-1">
                          {action.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
