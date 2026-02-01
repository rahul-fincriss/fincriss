import { UserRole } from './index';

export type UserStatus = 'active' | 'inactive';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  username: string;
  roles: UserRole[];
  status: UserStatus;
  department?: string;
  team?: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  isSystemRole: boolean; // Cannot be deleted or renamed if true
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
  | 'permission_changed';

export interface AdminAuditEntry {
  id: string;
  actionType: AdminAuditActionType;
  entityType: 'user' | 'role' | 'permission';
  entityId: string;
  entityName: string;
  performedBy: string;
  performedAt: Date;
  previousValue?: string;
  newValue?: string;
  details?: string;
}
