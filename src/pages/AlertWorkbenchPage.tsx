import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  FolderPlus, 
  Search, 
  XCircle, 
  Users, 
  History,
  AlertTriangle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { mockPrioritizedAlerts, mockAnalysts } from '@/data/mockData';
import { PrioritizedAlert, RiskLevel, UserPriority, CustomerGroupOverrides, WorkbenchAuditEntry, User } from '@/types';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/contexts/AuthContext';
import { AuditPanel } from '@/components/workbench/AuditPanel';
import { PriorityOverrideDialog } from '@/components/workbench/PriorityOverrideDialog';
import { AnalystAssignmentDropdown } from '@/components/workbench/AnalystAssignmentDropdown';
import { UserPriorityBadge } from '@/components/workbench/UserPriorityBadge';

const alertTypeLabels: Record<string, string> = {
  large_cash: 'Large Cash',
  structuring: 'Structuring',
  rapid_movement: 'Rapid Movement',
  geo_anomaly: 'Geo Anomaly',
  behavior_deviation: 'Behavior Deviation',
  smurfing: 'Smurfing',
};

interface CustomerGroup {
  customerId: string;
  customerName: string;
  alerts: PrioritizedAlert[];
  totalAlerts: number;
  maxPriority: RiskLevel;
  maxScore: number;
  minScore: number;
  priorityBreakdown: { high: number; medium: number; low: number };
  aggregatedDrivers: string[];
  earliestSLA: Date;
}

const priorityOrder: Record<RiskLevel, number> = { high: 3, medium: 2, low: 1 };
const userPriorityOrder: Record<UserPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };

function groupAlertsByCustomer(alerts: PrioritizedAlert[]): CustomerGroup[] {
  const groupMap = new Map<string, PrioritizedAlert[]>();

  alerts.forEach((alert) => {
    const existing = groupMap.get(alert.customerId) || [];
    existing.push(alert);
    groupMap.set(alert.customerId, existing);
  });

  const groups: CustomerGroup[] = Array.from(groupMap.entries()).map(([customerId, customerAlerts]) => {
    const priorityBreakdown = { high: 0, medium: 0, low: 0 };
    let maxPriority: RiskLevel = 'low';
    let maxScore = 0;
    let minScore = 100;
    let earliestSLA = customerAlerts[0].slaDeadline;
    const allDrivers: string[] = [];

    customerAlerts.forEach((alert) => {
      priorityBreakdown[alert.riskLevel]++;
      if (priorityOrder[alert.riskLevel] > priorityOrder[maxPriority]) {
        maxPriority = alert.riskLevel;
      }
      if (alert.mapsScore > maxScore) maxScore = alert.mapsScore;
      if (alert.mapsScore < minScore) minScore = alert.mapsScore;
      if (alert.slaDeadline < earliestSLA) earliestSLA = alert.slaDeadline;
      allDrivers.push(...alert.riskDrivers);
    });

    const driverFrequency = new Map<string, number>();
    allDrivers.forEach((driver) => {
      driverFrequency.set(driver, (driverFrequency.get(driver) || 0) + 1);
    });
    const aggregatedDrivers = Array.from(driverFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([driver]) => driver);

    return {
      customerId,
      customerName: customerAlerts[0].customerName,
      alerts: customerAlerts.sort((a, b) => priorityOrder[b.riskLevel] - priorityOrder[a.riskLevel]),
      totalAlerts: customerAlerts.length,
      maxPriority,
      maxScore,
      minScore,
      priorityBreakdown,
      aggregatedDrivers,
      earliestSLA,
    };
  });

  return groups;
}

export default function AlertWorkbenchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alerts] = useState<PrioritizedAlert[]>(mockPrioritizedAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [priorityMode, setPriorityMode] = useState<'maps' | 'user'>('maps');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  
  // Customer-level overrides
  const [customerOverrides, setCustomerOverrides] = useState<Map<string, CustomerGroupOverrides>>(new Map());
  
  // Per-alert overrides (for expanded view)
  const [alertOverrides, setAlertOverrides] = useState<Map<string, { userPriority?: UserPriority; assignedAnalyst?: User }>>(new Map());
  
  // Audit log
  const [auditLog, setAuditLog] = useState<Map<string, WorkbenchAuditEntry[]>>(new Map());
  
  // Dialog states
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedCustomerForPriority, setSelectedCustomerForPriority] = useState<CustomerGroup | null>(null);
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [selectedCustomerForAudit, setSelectedCustomerForAudit] = useState<CustomerGroup | null>(null);

  const canEdit = user?.role === 'analyst' || user?.role === 'super_admin';

  const addAuditEntry = useCallback((customerId: string, entry: Omit<WorkbenchAuditEntry, 'id' | 'performedAt'>) => {
    setAuditLog((prev) => {
      const newLog = new Map(prev);
      const existing = newLog.get(customerId) || [];
      newLog.set(customerId, [
        ...existing,
        {
          ...entry,
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          performedAt: new Date(),
        },
      ]);
      return newLog;
    });
  }, []);

  const handleSetUserPriority = useCallback((
    customerId: string,
    priority: UserPriority,
    category: string,
    reason: string
  ) => {
    const existing = customerOverrides.get(customerId);
    const previousPriority = existing?.userPriority || 'none';
    
    setCustomerOverrides((prev) => {
      const newOverrides = new Map(prev);
      newOverrides.set(customerId, {
        ...existing,
        customerId,
        userPriority: priority,
        userPriorityReason: reason,
        userPriorityCategory: category,
        userPriorityChangedBy: user?.name,
        userPriorityChangedAt: new Date(),
      });
      return newOverrides;
    });

    addAuditEntry(customerId, {
      customerId,
      action: 'priority_change',
      performedBy: user?.name || 'Unknown',
      previousValue: previousPriority,
      newValue: priority,
      reason,
      category,
    });

    toast.success(`Priority override set to ${priority === 'none' ? 'cleared' : priority}`);
  }, [customerOverrides, user?.name, addAuditEntry]);

  const handleAssignAnalyst = useCallback((customerId: string, analyst: User, isReassignment: boolean = false) => {
    const existing = customerOverrides.get(customerId);
    const previousAssignee = existing?.assignedAnalystName;
    
    setCustomerOverrides((prev) => {
      const newOverrides = new Map(prev);
      newOverrides.set(customerId, {
        ...existing,
        customerId,
        userPriority: existing?.userPriority || 'none',
        assignedAnalystId: analyst.id,
        assignedAnalystName: analyst.name,
        assignedAt: new Date(),
        assignedBy: user?.name,
      });
      return newOverrides;
    });

    addAuditEntry(customerId, {
      customerId,
      action: isReassignment ? 'analyst_reassignment' : 'analyst_assignment',
      performedBy: user?.name || 'Unknown',
      previousValue: previousAssignee,
      newValue: analyst.name,
    });

    toast.success(`Assigned to ${analyst.name}`);
  }, [customerOverrides, user?.name, addAuditEntry]);

  const handleAssignToMe = useCallback((customerId: string) => {
    if (!user) return;
    const existing = customerOverrides.get(customerId);
    const isReassignment = !!existing?.assignedAnalystId;
    handleAssignAnalyst(customerId, user, isReassignment);
  }, [user, customerOverrides, handleAssignAnalyst]);

  // Alert-level overrides
  const handleAlertPriorityChange = useCallback((alertId: string, priority: UserPriority) => {
    setAlertOverrides((prev) => {
      const newOverrides = new Map(prev);
      const existing = newOverrides.get(alertId) || {};
      newOverrides.set(alertId, { ...existing, userPriority: priority });
      return newOverrides;
    });
    toast.success(`Alert priority set to ${priority}`);
  }, []);

  const handleAlertAssignment = useCallback((alertId: string, analyst: User) => {
    setAlertOverrides((prev) => {
      const newOverrides = new Map(prev);
      const existing = newOverrides.get(alertId) || {};
      newOverrides.set(alertId, { ...existing, assignedAnalyst: analyst });
      return newOverrides;
    });
    toast.success(`Alert assigned to ${analyst.name}`);
  }, []);

  const customerGroups = useMemo(() => {
    const filtered = alerts.filter((alert) => {
      const matchesSearch =
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    let groups = groupAlertsByCustomer(filtered);

    // Filter by priority
    if (priorityFilter !== 'all') {
      if (priorityMode === 'maps') {
        groups = groups.filter((group) => group.maxPriority === priorityFilter);
      } else {
        groups = groups.filter((group) => {
          const override = customerOverrides.get(group.customerId);
          return override?.userPriority === priorityFilter;
        });
      }
    }

    // Sort based on priority mode
    if (priorityMode === 'user') {
      groups.sort((a, b) => {
        const aOverride = customerOverrides.get(a.customerId)?.userPriority || 'none';
        const bOverride = customerOverrides.get(b.customerId)?.userPriority || 'none';
        const priorityDiff = userPriorityOrder[bOverride] - userPriorityOrder[aOverride];
        if (priorityDiff !== 0) return priorityDiff;
        // Fall back to MAPS priority, then SLA
        const mapsDiff = priorityOrder[b.maxPriority] - priorityOrder[a.maxPriority];
        if (mapsDiff !== 0) return mapsDiff;
        return a.earliestSLA.getTime() - b.earliestSLA.getTime();
      });
    } else {
      groups.sort((a, b) => {
        const priorityDiff = priorityOrder[b.maxPriority] - priorityOrder[a.maxPriority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.earliestSLA.getTime() - b.earliestSLA.getTime();
      });
    }

    return groups;
  }, [alerts, searchQuery, priorityFilter, priorityMode, customerOverrides]);

  const totalAlerts = alerts.length;
  const totalCustomers = customerGroups.length;

  const toggleCustomerExpand = (customerId: string) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  const handleViewAlertDetails = (alert: PrioritizedAlert) => {
    navigate(`/alerts/${alert.id}`);
  };

  const handleCreateCustomerCase = (group: CustomerGroup) => {
    toast.success(`Case created for ${group.customerName} with ${group.totalAlerts} alerts`);
    navigate('/cases');
  };

  const handleDropAlert = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    toast.success(`Alert ${alertId} dropped`);
  };

  const handleAddToCase = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    toast.success(`Alert ${alertId} added to case`);
  };

  const openPriorityDialog = (group: CustomerGroup) => {
    setSelectedCustomerForPriority(group);
    setPriorityDialogOpen(true);
  };

  const openAuditPanel = (group: CustomerGroup) => {
    setSelectedCustomerForAudit(group);
    setAuditPanelOpen(true);
  };

  const getEffectiveAlertPriority = (alert: PrioritizedAlert, customerOverride?: CustomerGroupOverrides): UserPriority => {
    const alertOverride = alertOverrides.get(alert.id);
    if (alertOverride?.userPriority && alertOverride.userPriority !== 'none') {
      return alertOverride.userPriority;
    }
    return customerOverride?.userPriority || 'none';
  };

  const getEffectiveAlertAssignee = (alert: PrioritizedAlert, customerOverride?: CustomerGroupOverrides): { id: string; name: string } | undefined => {
    const alertOverride = alertOverrides.get(alert.id);
    if (alertOverride?.assignedAnalyst) {
      return { id: alertOverride.assignedAnalyst.id, name: alertOverride.assignedAnalyst.name };
    }
    if (customerOverride?.assignedAnalystId && customerOverride?.assignedAnalystName) {
      return { id: customerOverride.assignedAnalystId, name: customerOverride.assignedAnalystName };
    }
    return undefined;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alert Workbench</h1>
            <p className="text-muted-foreground">
              Customer-grouped alerts with AI prioritization, user overrides, and SLA tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <Users className="h-3 w-3" />
              {totalCustomers} Customers
            </Badge>
            <div className="h-4 w-px bg-border" />
            <Badge variant="outline" className="badge-risk-high">
              {alerts.filter((a) => a.riskLevel === 'high').length} High
            </Badge>
            <Badge variant="outline" className="badge-risk-medium">
              {alerts.filter((a) => a.riskLevel === 'medium').length} Medium
            </Badge>
            <Badge variant="outline" className="badge-risk-low">
              {alerts.filter((a) => a.riskLevel === 'low').length} Low
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers or alert IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Priority Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort/Filter by:</span>
            <ToggleGroup
              type="single"
              value={priorityMode}
              onValueChange={(value) => value && setPriorityMode(value as 'maps' | 'user')}
              className="bg-muted/50 rounded-lg p-1"
            >
              <ToggleGroupItem
                value="maps"
                className="text-xs px-3 data-[state=on]:bg-background"
              >
                MAPS Priority
              </ToggleGroupItem>
              <ToggleGroupItem
                value="user"
                className="text-xs px-3 data-[state=on]:bg-background"
              >
                User Priority
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorityMode === 'user' && <SelectItem value="urgent">Urgent</SelectItem>}
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              {priorityMode === 'user' && <SelectItem value="none">No Override</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Customer-Grouped Alerts Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-[80px]">Alerts</TableHead>
                <TableHead className="w-[180px]">Priority Breakdown</TableHead>
                <TableHead>MAPS Score</TableHead>
                <TableHead className="w-[140px]">User Priority</TableHead>
                <TableHead className="w-[160px]">Assigned Analyst</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerGroups.map((group) => {
                const override = customerOverrides.get(group.customerId);
                const hasOverride = override?.userPriority && override.userPriority !== 'none';
                const assignee = override?.assignedAnalystId 
                  ? { id: override.assignedAnalystId, name: override.assignedAnalystName! }
                  : undefined;
                const auditEntries = auditLog.get(group.customerId) || [];

                return (
                  <Collapsible
                    key={group.customerId}
                    open={expandedCustomers.has(group.customerId)}
                    onOpenChange={() => toggleCustomerExpand(group.customerId)}
                    asChild
                  >
                    <>
                      {/* Customer Row */}
                      <CollapsibleTrigger asChild>
                        <TableRow className="table-row-interactive cursor-pointer hover:bg-muted/50">
                          <TableCell className="w-[40px]">
                            {expandedCustomers.has(group.customerId) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{group.customerName}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {group.customerId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">
                              {group.totalAlerts}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {group.priorityBreakdown.high > 0 && (
                                <Badge className="badge-risk-high text-xs px-1.5 py-0.5">
                                  {group.priorityBreakdown.high} High
                                </Badge>
                              )}
                              {group.priorityBreakdown.medium > 0 && (
                                <Badge className="badge-risk-medium text-xs px-1.5 py-0.5">
                                  {group.priorityBreakdown.medium} Med
                                </Badge>
                              )}
                              {group.priorityBreakdown.low > 0 && (
                                <Badge className="badge-risk-low text-xs px-1.5 py-0.5">
                                  {group.priorityBreakdown.low} Low
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RiskBadge level={group.maxPriority} size="sm" />
                              <span className="text-xs text-muted-foreground font-mono">
                                {group.minScore === group.maxScore
                                  ? group.maxScore
                                  : `${group.minScore}–${group.maxScore}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {canEdit ? (
                              <UserPriorityBadge
                                priority={override?.userPriority || 'none'}
                                isOverride={hasOverride}
                                showEditButton
                                onClick={() => openPriorityDialog(group)}
                                size="sm"
                              />
                            ) : (
                              <UserPriorityBadge
                                priority={override?.userPriority || 'none'}
                                isOverride={hasOverride}
                                size="sm"
                              />
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {canEdit ? (
                              <AnalystAssignmentDropdown
                                analysts={mockAnalysts}
                                currentAssignee={assignee}
                                onAssign={(analyst) => handleAssignAnalyst(group.customerId, analyst, !!assignee)}
                                onAssignToMe={() => handleAssignToMe(group.customerId)}
                              />
                            ) : (
                              assignee ? (
                                <Badge variant="secondary" className="gap-1">
                                  {assignee.name}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground border-dashed">
                                  Unassigned
                                </Badge>
                              )
                            )}
                          </TableCell>
                          <TableCell>
                            <SLATimer deadline={group.earliestSLA} />
                          </TableCell>
                          <TableCell>
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openAuditPanel(group)}
                                title="View activity log"
                              >
                                <History className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => toggleCustomerExpand(group.customerId)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => handleCreateCustomerCase(group)}
                              >
                                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                                Create Case
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>

                      {/* Expanded Alert Rows */}
                      <CollapsibleContent asChild>
                        <>
                          {group.alerts.map((alert) => {
                            const effectivePriority = getEffectiveAlertPriority(alert, override);
                            const effectiveAssignee = getEffectiveAlertAssignee(alert, override);
                            const alertHasOwnOverride = alertOverrides.has(alert.id);

                            return (
                              <TableRow
                                key={alert.id}
                                className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-l-2 border-l-primary/20"
                                onClick={() => handleViewAlertDetails(alert)}
                              >
                                <TableCell className="w-[40px]"></TableCell>
                                <TableCell colSpan={1}>
                                  <div className="pl-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    <span className="font-mono text-sm">{alert.id}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {alertTypeLabels[alert.alertType] || alert.alertType}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {alert.amount.toLocaleString()} {alert.currency}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {alert.riskDrivers.slice(0, 2).map((driver, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {driver}
                                      </Badge>
                                    ))}
                                    {alert.riskDrivers.length > 2 && (
                                      <Badge variant="outline" className="text-xs text-muted-foreground">
                                        +{alert.riskDrivers.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <RiskBadge level={alert.riskLevel} size="sm" />
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {alert.mapsScore}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-1">
                                    <UserPriorityBadge
                                      priority={effectivePriority}
                                      isOverride={effectivePriority !== 'none'}
                                      size="sm"
                                    />
                                    {!alertHasOwnOverride && effectivePriority !== 'none' && (
                                      <span className="text-[10px] text-muted-foreground">(inherited)</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  {canEdit ? (
                                    <AnalystAssignmentDropdown
                                      analysts={mockAnalysts}
                                      currentAssignee={effectiveAssignee}
                                      onAssign={(analyst) => handleAlertAssignment(alert.id, analyst)}
                                      onAssignToMe={() => user && handleAlertAssignment(alert.id, user)}
                                      compact
                                    />
                                  ) : (
                                    effectiveAssignee ? (
                                      <span className="text-xs">{effectiveAssignee.name}</span>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">—</span>
                                    )
                                  )}
                                </TableCell>
                                <TableCell>
                                  <SLATimer deadline={alert.slaDeadline} />
                                </TableCell>
                                <TableCell>
                                  <div
                                    className="flex items-center justify-end gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleViewAlertDetails(alert)}
                                      title="View details"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={(e) => handleDropAlert(e, alert.id)}
                                      title="Drop alert"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={(e) => handleAddToCase(e, alert.id)}
                                      title="Add to case"
                                    >
                                      <FolderPlus className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {customerGroups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No customers match your search criteria</p>
          </div>
        )}
      </div>

      {/* Priority Override Dialog */}
      {selectedCustomerForPriority && (
        <PriorityOverrideDialog
          open={priorityDialogOpen}
          onOpenChange={setPriorityDialogOpen}
          customerName={selectedCustomerForPriority.customerName}
          currentPriority={customerOverrides.get(selectedCustomerForPriority.customerId)?.userPriority || 'none'}
          onConfirm={(priority, category, reason) => {
            handleSetUserPriority(selectedCustomerForPriority.customerId, priority, category, reason);
          }}
        />
      )}

      {/* Audit Panel */}
      {selectedCustomerForAudit && (
        <AuditPanel
          open={auditPanelOpen}
          onOpenChange={setAuditPanelOpen}
          customerName={selectedCustomerForAudit.customerName}
          customerId={selectedCustomerForAudit.customerId}
          auditEntries={auditLog.get(selectedCustomerForAudit.customerId) || []}
        />
      )}
    </AppLayout>
  );
}
