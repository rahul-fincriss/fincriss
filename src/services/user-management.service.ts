import api from '@/lib/api-client';
import { ManagedUser } from '@/types/admin';
import { UserRole } from '@/types';

export const userManagementService = {
  async listUsers(): Promise<ManagedUser[]> {
    const response = await api.get('/api/users');
    const data = response.data;
    console.log("userManagementService.listUsers raw data:", data);
    
    const users = Array.isArray(data) ? data : (data.users || data.items || data.data || []);
    return users.map((u: any) => {
      const roles = Array.isArray(u.roles) 
        ? u.roles.map((r: any) => (typeof r === 'string' ? r : r.role_name)) 
        : [u.roles || u.role].filter(Boolean) as UserRole[];
        
      return {
        id: (u.user_id || u.id).toString(),
        name: u.full_name || u.name || u.username,
        email: u.email,
        username: u.username,
        role: roles[0] || 'analyst', // For compatibility with User type
        roles: roles,
        status: u.is_active ? 'active' : 'inactive',
        department: u.department,
        team: u.team,
        assignedQueueIds: u.assigned_queue_ids || [],
        lastLogin: u.last_login ? new Date(u.last_login) : undefined,
        createdAt: new Date(u.created_at || Date.now()),
      };
    });
  },
};
