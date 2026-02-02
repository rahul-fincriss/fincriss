import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Shield, History, Layers } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTable } from '@/components/admin/UserTable';
import { RolePermissionsTab } from '@/components/admin/RolePermissionsTab';
import { AdminAuditLog } from '@/components/admin/AdminAuditLog';
import { QueuesTeamsTab } from '@/components/admin/QueuesTeamsTab';

export default function WorkforceManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Super Admin has full access, Compliance has read-only
  const isReadOnly = user?.role === 'compliance';
  
  if (!user || (user.role !== 'super_admin' && user.role !== 'compliance')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Intelligent Workforce Management
          </h1>
          <p className="text-muted-foreground">
            Manage people, roles, queues, and work visibility across the platform
          </p>
          {isReadOnly && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              You have read-only access to this module.
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="queues" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Queues & Teams
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserTable />
          </TabsContent>

          <TabsContent value="roles">
            <RolePermissionsTab />
          </TabsContent>

          <TabsContent value="queues">
            <QueuesTeamsTab />
          </TabsContent>

          <TabsContent value="audit">
            <AdminAuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}