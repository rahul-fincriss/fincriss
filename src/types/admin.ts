import { UserRole, QueueType } from './index';

export type UserStatus = 'active' | 'inactive';

export type QueueCategory = 'aml' | 'pep' | 'trade' | 'cash' | 'behavioral' | 'general';

export interface WorkforceQueue {
  id: string;
  name: string;
  description: string;
  category: QueueCategory;
  allowedRoles: UserRole[];
  assignedUserIds: string[];
  status: 'active' | 'inactive';
  hasHistoricalActivity: boolean;
  createdAt: Date;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  username: string;
  roles: UserRole[];
  status: UserStatus;
  department?: string;
  team?: string;
  assignedQueueIds: string[];
  lastLogin?: Date;
  createdAt: Date;
  hasHistoricalActivity?: boolean;
}

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  isSystemRole: boolean;
  userCount: number;
}

export type PermissionAction = 'view' | 'edit' | 'approve' | 'admin';

export interface ScreenPermission {
  screenId: string;
  screenName: string;
  actions: Record<PermissionAction, boolean>;
}

export interface ActionPermission {
  actionId: string;
  actionName: string;
  description: string;
  allowed: boolean;
}

export interface RolePermissions {
  roleId: UserRole;
  screens: ScreenPermission[];
  actions: ActionPermission[];
}

export type AdminAuditActionType = 
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_activated'
  | 'user_deactivated'
  | 'role_created'
  | 'role_updated'
  | 'role_renamed'
  | 'permission_changed'
  | 'queue_created'
  | 'queue_updated'
  | 'queue_deactivated'
  | 'queue_membership_changed';

export interface AdminAuditEntry {
  id: string;
  actionType: AdminAuditActionType;
  entityType: 'user' | 'role' | 'permission' | 'queue';
  entityId: string;
  entityName: string;
  performedBy: string;
  performedAt: Date;
  previousValue?: string;
  newValue?: string;
  details?: string;
}
