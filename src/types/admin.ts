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
  | 'queue_membership_changed'
  | 'settings_changed';

// Settings Types
export type TimeZoneOption = 'Asia/Kolkata' | 'UTC' | 'America/New_York' | 'Europe/London';
export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type CurrencyOption = 'INR' | 'USD' | 'EUR' | 'GBP';
export type NotificationChannel = 'in_app' | 'email';

export interface GeneralSettings {
  theme: 'light'; // Read-only
  timeZone: TimeZoneOption;
  dateFormat: DateFormatOption;
  currency: CurrencyOption;
  platformName: 'FinCrisS'; // Read-only
}

export interface QueueRoutingSettings {
  defaultQueueId: string;
  inactiveQueueFallback: 'default_aml' | 'hold' | 'escalate';
  noActiveUsersBehavior: 'queue_default' | 'escalate_to_supervisor' | 'hold';
  requireQueueBeforeCaseCreation: boolean;
}

export interface SLAThreshold {
  priority: 'high' | 'medium' | 'low';
  resolutionHours: number;
  warningPercent: number;
  breachPercent: number;
}

export interface QueueSLAOverride {
  queueId: string;
  queueName: string;
  resolutionHours: number;
  warningPercent: number;
  breachPercent: number;
  enabled: boolean;
}

export interface SLASettings {
  thresholds: SLAThreshold[];
  queueOverrides: QueueSLAOverride[];
  escalationNotifyRoles: UserRole[];
}

export interface NotificationSettings {
  slaWarning: { enabled: boolean; channels: NotificationChannel[] };
  slaBreach: { enabled: boolean; channels: NotificationChannel[] };
  queueAssignment: { enabled: boolean; channels: NotificationChannel[] };
  caseEscalation: { enabled: boolean; channels: NotificationChannel[] };
}

export interface RetentionSettings {
  auditLogDays: number;
  alertRetentionDays: number;
  caseRetentionDays: number;
  strRetentionDays: number;
}

export interface PlatformSettings {
  general: GeneralSettings;
  queueRouting: QueueRoutingSettings;
  sla: SLASettings;
  notifications: NotificationSettings;
  retention: RetentionSettings;
}

export interface SettingsAuditEntry {
  id: string;
  section: 'general' | 'queue_routing' | 'sla' | 'notifications' | 'retention';
  field: string;
  previousValue: string;
  newValue: string;
  performedBy: string;
  performedAt: Date;
}

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
