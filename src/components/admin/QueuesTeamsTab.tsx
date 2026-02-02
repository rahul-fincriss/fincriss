import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Users,
  Filter,
  Power,
  PowerOff,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { mockWorkforceQueues, queueCategoryLabels, mockManagedUsers } from '@/data/adminMockData';
import { WorkforceQueue, QueueCategory, ManagedUser } from '@/types/admin';
import { UserRole } from '@/types';
import { toast } from 'sonner';

const roleLabels: Record<UserRole, string> = {
  analyst: 'AML Analyst',
  investigator: 'Investigator',
  principal_officer: 'Principal Officer',
  compliance: 'Compliance',
  super_admin: 'Super Admin',
};

const roleOptions: UserRole[] = ['analyst', 'investigator', 'principal_officer', 'compliance', 'super_admin'];

const categoryOptions: QueueCategory[] = ['aml', 'pep', 'trade', 'cash', 'behavioral', 'general'];

interface QueueFormData {
  name: string;
  description: string;
  category: QueueCategory;
  allowedRoles: UserRole[];
  assignedUserIds: string[];
  status: 'active' | 'inactive';
}

export function QueuesTeamsTab() {
  const [queues, setQueues] = useState<WorkforceQueue[]>(mockWorkforceQueues);
  const [users] = useState<ManagedUser[]>(mockManagedUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<WorkforceQueue | null>(null);
  const [deactivatingQueue, setDeactivatingQueue] = useState<WorkforceQueue | null>(null);

  const [formData, setFormData] = useState<QueueFormData>({
    name: '',
    description: '',
    category: 'aml',
    allowedRoles: [],
    assignedUserIds: [],
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredQueues = useMemo(() => {
    return queues.filter((queue) => {
      const matchesSearch =
        searchQuery === '' ||
        queue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        queue.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || queue.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' || queue.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [queues, searchQuery, categoryFilter, statusFilter]);

  const getAssignedUserNames = (userIds: string[]): string[] => {
    return userIds
      .map((id) => users.find((u) => u.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const getEligibleUsers = (allowedRoles: UserRole[]): ManagedUser[] => {
    return users.filter(
      (u) => u.status === 'active' && u.roles.some((r) => allowedRoles.includes(r))
    );
  };

  const openCreateForm = () => {
    setEditingQueue(null);
    setFormData({
      name: '',
      description: '',
      category: 'aml',
      allowedRoles: [],
      assignedUserIds: [],
      status: 'active',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (queue: WorkforceQueue) => {
    setEditingQueue(queue);
    setFormData({
      name: queue.name,
      description: queue.description,
      category: queue.category,
      allowedRoles: queue.allowedRoles,
      assignedUserIds: queue.assignedUserIds,
      status: queue.status,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Queue name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.allowedRoles.length === 0) errors.roles = 'At least one role must be allowed';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingQueue) {
      setQueues(queues.map((q) =>
        q.id === editingQueue.id
          ? { ...q, ...formData }
          : q
      ));
      toast.success(`Queue "${formData.name}" updated successfully`);
    } else {
      const newQueue: WorkforceQueue = {
        id: `queue-${Date.now()}`,
        ...formData,
        hasHistoricalActivity: false,
        createdAt: new Date(),
      };
      setQueues([...queues, newQueue]);
      toast.success(`Queue "${formData.name}" created successfully`);
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (queue: WorkforceQueue) => {
    if (queue.hasHistoricalActivity && queue.status === 'active') {
      setDeactivatingQueue(queue);
    } else {
      performToggleStatus(queue);
    }
  };

  const performToggleStatus = (queue: WorkforceQueue) => {
    const newStatus = queue.status === 'active' ? 'inactive' : 'active';
    setQueues(queues.map((q) =>
      q.id === queue.id ? { ...q, status: newStatus } : q
    ));
    toast.success(
      `Queue "${queue.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`
    );
    setDeactivatingQueue(null);
  };

  const handleRoleToggle = (role: UserRole) => {
    const newRoles = formData.allowedRoles.includes(role)
      ? formData.allowedRoles.filter((r) => r !== role)
      : [...formData.allowedRoles, role];
    
    // Remove assigned users who no longer have allowed roles
    const eligibleUserIds = users
      .filter((u) => u.roles.some((r) => newRoles.includes(r)))
      .map((u) => u.id);
    
    setFormData({
      ...formData,
      allowedRoles: newRoles,
      assignedUserIds: formData.assignedUserIds.filter((id) => eligibleUserIds.includes(id)),
    });
  };

  const handleUserToggle = (userId: string) => {
    setFormData({
      ...formData,
      assignedUserIds: formData.assignedUserIds.includes(userId)
        ? formData.assignedUserIds.filter((id) => id !== userId)
        : [...formData.assignedUserIds, userId],
    });
  };

  const eligibleUsersForForm = getEligibleUsers(formData.allowedRoles);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">Queues & Teams</CardTitle>
            <CardDescription>
              Manage work routing queues and team assignments
            </CardDescription>
          </div>
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Queue
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <Info className="inline h-4 w-4 mr-2" />
            <strong>Queue Visibility:</strong> Users can only see and be assigned to alerts/cases routed to their assigned queues.
            Roles define <em>what</em> actions users can perform; queues define <em>which</em> work they see.
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search queues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {queueCategoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Queues Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Queue Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Allowed Roles</TableHead>
                  <TableHead>Assigned Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No queues found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueues.map((queue) => (
                    <TableRow key={queue.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{queue.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {queue.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {queueCategoryLabels[queue.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {queue.allowedRoles.slice(0, 2).map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {roleLabels[role]}
                            </Badge>
                          ))}
                          {queue.allowedRoles.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{queue.allowedRoles.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {queue.assignedUserIds.length} users
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={queue.status === 'active' ? 'default' : 'secondary'}
                          className={
                            queue.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }
                        >
                          {queue.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(queue.createdAt, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(queue)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Queue
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(queue)}>
                              {queue.status === 'active' ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredQueues.length} of {queues.length} queues
          </div>
        </CardContent>
      </Card>

      {/* Queue Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQueue ? 'Edit Queue' : 'Create New Queue'}
            </DialogTitle>
            <DialogDescription>
              {editingQueue
                ? 'Update queue settings and team assignments'
                : 'Create a new work routing queue'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Queue Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Queue Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., High-Value Transactions Queue"
              />
              {formErrors.name && (
                <span className="text-xs text-destructive">{formErrors.name}</span>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this queue..."
                rows={2}
              />
              {formErrors.description && (
                <span className="text-xs text-destructive">{formErrors.description}</span>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>Queue Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: QueueCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {queueCategoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Allowed Roles */}
            <div className="grid gap-2">
              <Label>Allowed Roles *</Label>
              <p className="text-xs text-muted-foreground">
                Which roles can work alerts/cases in this queue
              </p>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                {roleOptions.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={formData.allowedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <Label
                      htmlFor={`role-${role}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {roleLabels[role]}
                    </Label>
                  </div>
                ))}
              </div>
              {formErrors.roles && (
                <span className="text-xs text-destructive">{formErrors.roles}</span>
              )}
            </div>

            {/* Assigned Users */}
            <div className="grid gap-2">
              <Label>Assigned Users</Label>
              <p className="text-xs text-muted-foreground">
                Users assigned to this queue (must have an allowed role)
              </p>
              {eligibleUsersForForm.length === 0 ? (
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  Select allowed roles first to see eligible users
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 max-h-[200px] overflow-y-auto">
                  {eligibleUsersForForm.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={formData.assignedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <Label
                        htmlFor={`user-${user.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingQueue ? 'Save Changes' : 'Create Queue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivation Confirmation */}
      <AlertDialog
        open={!!deactivatingQueue}
        onOpenChange={(open) => !open && setDeactivatingQueue(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Queue?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deactivatingQueue?.name}"</strong> has historical activity and cannot be deleted.
              Deactivating will prevent new work from being routed to this queue, but existing
              records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivatingQueue && performToggleStatus(deactivatingQueue)}
            >
              Deactivate Queue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}