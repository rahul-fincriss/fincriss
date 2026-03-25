import api from '@/lib/api-client';

export interface Permission {
  permission_id: number;
  resource_name: string;
  action_name: string;
  description?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
  description: string;
  permissions: Permission[];
}

export const rolesService = {
  async listRoles(): Promise<Role[]> {
    const response = await api.get('/api/roles');
    console.log("rolesService.listRoles raw:", response.data);
    const rawRoles = Array.isArray(response.data) ? response.data : (response.data?.roles || response.data?.data || response.data?.items || []);
    return rawRoles.map((r: any) => ({
      role_id: r.role_id || r.id,
      role_name: r.role_name || r.name,
      description: r.description,
      permissions: (r.permissions || r.assigned_permissions || []).map((p: any) => ({
        permission_id: p.permission_id || p.id,
        resource_name: p.resource_name || p.resource || p.name || 'unknown',
        action_name: p.action_name || p.action || 'view',
        description: p.description,
        _raw: p
      }))
    }));
  },
  
  async createRole(roleName: string, description?: string): Promise<Role> {
    const response = await api.post('/api/roles', { role_name: roleName, description });
    return response.data;
  },
  
  async listPermissions(): Promise<Permission[]> {
    const response = await api.get('/api/permissions');
    console.log("rolesService.listPermissions raw:", response.data);
    const rawPerms = Array.isArray(response.data) ? response.data : (response.data?.permissions || response.data?.data || response.data?.items || []);
    return rawPerms.map((p: any) => ({
      permission_id: p.permission_id || p.id,
      resource_name: p.resource_name || p.resource || p.name || 'unknown',
      action_name: p.action_name || p.action || 'view',
      description: p.description,
      _raw: p
    }));
  },
  
  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    await api.post(`/api/roles/${roleId}/permissions`, { permission_id: permissionId });
  },
  
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    await api.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
  }
};
