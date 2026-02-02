import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ManagedUser, UserStatus, WorkforceQueue } from '@/types/admin';
import { UserRole } from '@/types';
import { mockWorkforceQueues } from '@/data/adminMockData';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null;
  onSave: (userData: Partial<ManagedUser>) => void;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'analyst', label: 'AML Analyst' },
  { value: 'investigator', label: 'Case Investigator' },
  { value: 'principal_officer', label: 'Principal Officer' },
  { value: 'compliance', label: 'Compliance/Audit' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserFormDialogProps) {
  const [queues] = useState<WorkforceQueue[]>(mockWorkforceQueues);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    roles: [] as UserRole[],
    status: 'active' as UserStatus,
    department: '',
    team: '',
    assignedQueueIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        roles: user.roles,
        status: user.status,
        department: user.department || '',
        team: user.team || '',
        assignedQueueIds: user.assignedQueueIds || [],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        username: '',
        roles: [],
        status: 'active',
        department: '',
        team: '',
        assignedQueueIds: [],
      });
    }
    setErrors({});
  }, [user, open]);

  // Get queues that this user is eligible for based on their roles
  const eligibleQueues = queues.filter(
    (q) => q.status === 'active' && formData.roles.some((r) => q.allowedRoles.includes(r))
  );

  const handleRoleToggle = (role: UserRole) => {
    const newRoles = formData.roles.includes(role)
      ? formData.roles.filter((r) => r !== role)
      : [...formData.roles, role];
    
    // Remove queue assignments that are no longer valid
    const validQueueIds = queues
      .filter((q) => newRoles.some((r) => q.allowedRoles.includes(r)))
      .map((q) => q.id);
    
    setFormData({
      ...formData,
      roles: newRoles,
      assignedQueueIds: formData.assignedQueueIds.filter((id) => validQueueIds.includes(id)),
    });
  };

  const handleQueueToggle = (queueId: string) => {
    setFormData({
      ...formData,
      assignedQueueIds: formData.assignedQueueIds.includes(queueId)
        ? formData.assignedQueueIds.filter((id) => id !== queueId)
        : [...formData.assignedQueueIds, queueId],
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {user
              ? 'Update user information, roles, and queue assignments'
              : 'Create a new user account with role and queue assignments'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Full Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter full name"
            />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@company.com"
            />
            {errors.email && (
              <span className="text-xs text-destructive">{errors.email}</span>
            )}
          </div>

          {/* Username */}
          <div className="grid gap-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="username"
            />
            {errors.username && (
              <span className="text-xs text-destructive">{errors.username}</span>
            )}
          </div>

          {/* Roles (Multi-select) */}
          <div className="grid gap-2">
            <Label>Roles *</Label>
            <p className="text-xs text-muted-foreground">
              Roles define what actions the user can perform
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
              {roleOptions.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={formData.roles.includes(role.value)}
                    onCheckedChange={() => handleRoleToggle(role.value)}
                  />
                  <Label
                    htmlFor={`role-${role.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.roles && (
              <span className="text-xs text-destructive">{errors.roles}</span>
            )}
          </div>

          {/* Assigned Queues */}
          <div className="grid gap-2">
            <Label>Assigned Queues</Label>
            <p className="text-xs text-muted-foreground">
              Queues determine which work the user can see and be assigned to
            </p>
            {eligibleQueues.length === 0 ? (
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                {formData.roles.length === 0
                  ? 'Select roles first to see available queues'
                  : 'No active queues available for the selected roles'}
              </div>
            ) : (
              <div className="rounded-lg border p-3 space-y-2 max-h-[150px] overflow-y-auto">
                {eligibleQueues.map((queue) => (
                  <div key={queue.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`queue-${queue.id}`}
                        checked={formData.assignedQueueIds.includes(queue.id)}
                        onCheckedChange={() => handleQueueToggle(queue.id)}
                      />
                      <Label
                        htmlFor={`queue-${queue.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {queue.name}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {queue.category.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: UserStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department & Team */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) =>
                  setFormData({ ...formData, team: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}