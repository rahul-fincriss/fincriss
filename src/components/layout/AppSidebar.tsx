import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  FileText,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['analyst', 'investigator', 'principal_officer', 'compliance', 'super_admin'],
  },
  {
    title: 'Alert Workbench',
    url: '/alerts/workbench',
    icon: Zap,
    roles: ['analyst', 'investigator', 'super_admin'],
    badge: '12',
  },
  {
    title: 'Cases',
    url: '/cases',
    icon: FolderOpen,
    roles: ['investigator', 'principal_officer', 'compliance', 'super_admin'],
    badge: '8',
  },
  {
    title: 'STR Queue',
    url: '/str',
    icon: FileText,
    roles: ['investigator', 'principal_officer', 'compliance', 'super_admin'],
    badge: '3',
  },
  {
    title: 'Audit Trail',
    url: '/audit',
    icon: History,
    roles: ['compliance', 'super_admin'],
  },
  {
    title: 'ML Ops',
    url: '/mlops',
    icon: BarChart3,
    roles: ['super_admin'],
  },
  {
    title: 'Model Tuning',
    url: '/model-tuning',
    icon: Settings,
    roles: ['super_admin'],
  },
  {
    title: 'User Management',
    url: '/users',
    icon: Users,
    roles: ['super_admin'],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    roles: ['analyst', 'investigator', 'principal_officer', 'compliance', 'super_admin'],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      analyst: 'AML Analyst',
      investigator: 'Case Investigator',
      principal_officer: 'Principal Officer',
      compliance: 'Compliance',
      super_admin: 'Super Admin',
    };
    return labels[role];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                FinCrisS
              </span>
              <span className="text-xs text-muted-foreground">
                AML Intelligence
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <a
                        href={item.url}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.url);
                        }}
                        className={cn(
                          'flex items-center gap-3',
                          isActive && 'bg-sidebar-accent'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && !isCollapsed && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-5 justify-center bg-primary/20 text-primary"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 px-2 py-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
