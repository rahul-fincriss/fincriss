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
  FileCode
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
import { PrioritizedAlert, RiskLevel, UserPriority, CustomerGroupOverrides, WorkbenchAuditEntry, User, QueueType } from '@/types';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { AuditPanel } from '@/components/workbench/AuditPanel';
import { AnalystAssignmentDropdown } from '@/components/workbench/AnalystAssignmentDropdown';
import { RawAlertDrawer } from '@/components/workbench/RawAlertDrawer';
import { QueueTypeDropdown, queueTypeShortLabels } from '@/components/workbench/QueueTypeDropdown';
import { useAlerts, useUsers, useOpenCase, useAssignAlert } from '@/hooks/useAlerts';
import { Loader2 } from 'lucide-react';

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
  
  // Real API data
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useAlerts();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const openCaseMutation = useOpenCase();
  
  const alerts = alertsData || [];
  const analysts = usersData || [];
  const isLoading = alertsLoading || usersLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  
  // Customer-level overrides
  const [customerOverrides, setCustomerOverrides] = useState<Map<string, CustomerGroupOverrides>>(new Map());
  
  // Per-alert overrides (for expanded view)
  const [alertOverrides, setAlertOverrides] = useState<Map<string, { userPriority?: UserPriority; assignedAnalyst?: User }>>(new Map());
  
  // Audit log
  const [auditLog, setAuditLog] = useState<Map<string, WorkbenchAuditEntry[]>>(new Map());
  
  // Dialog states
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [selectedCustomerForAudit, setSelectedCustomerForAudit] = useState<CustomerGroup | null>(null);
  
  // Raw alert drawer state
  const [rawAlertDrawerOpen, setRawAlertDrawerOpen] = useState(false);
  const [selectedAlertForRawView, setSelectedAlertForRawView] = useState<PrioritizedAlert | null>(null);

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

  const handleQueueChange = useCallback((customerId: string, queue: QueueType) => {
    const existing = customerOverrides.get(customerId);
    const previousQueue = existing?.queueType || 'default_aml';
    
    setCustomerOverrides((prev) => {
      const newOverrides = new Map(prev);
      newOverrides.set(customerId, {
        ...existing,
        customerId,
        userPriority: existing?.userPriority || 'none',
        queueType: queue,
        queueTypeChangedBy: user?.name,
        queueTypeChangedAt: new Date(),
      });
      return newOverrides;
    });

    addAuditEntry(customerId, {
      customerId,
      action: 'queue_change',
      performedBy: user?.name || 'Unknown',
      previousValue: queueTypeShortLabels[previousQueue],
      newValue: queueTypeShortLabels[queue],
    });

    toast.success(`Queue changed to ${queueTypeShortLabels[queue]}`);
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

    // Filter by FinCrisS priority
    if (priorityFilter !== 'all') {
      groups = groups.filter((group) => group.maxPriority === priorityFilter);
    }

    // Sort by FinCrisS priority, then SLA
    groups.sort((a, b) => {
      const priorityDiff = priorityOrder[b.maxPriority] - priorityOrder[a.maxPriority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.earliestSLA.getTime() - b.earliestSLA.getTime();
    });

    return groups;
  }, [alerts, searchQuery, priorityFilter]);

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

  const handleCreateCustomerCase = async (group: CustomerGroup) => {
    // Open cases for all alerts in the group
    toast.promise(
      Promise.all(group.alerts.map(alert => 
        openCaseMutation.mutateAsync({ 
          alertId: alert.id, 
          request: { notes: 'Bulk case opening from workbench' } 
        })
      )),
      {
        loading: 'Opening cases...',
        success: `Successfully created cases for ${group.customerName}`,
        error: 'Failed to open one or more cases',
      }
    );
  };

  const handleDropAlert = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    toast.success(`Alert ${alertId} dropped`);
  };

  const handleAddToCase = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    toast.success(`Alert ${alertId} added to case`);
  };

  const openAuditPanel = (group: CustomerGroup) => {
    setSelectedCustomerForAudit(group);
    setAuditPanelOpen(true);
  };

  const openRawAlertDrawer = (alert: PrioritizedAlert) => {
    setSelectedAlertForRawView(alert);
    setRawAlertDrawerOpen(true);
  };

  const handleRawAlertAuditLog = useCallback((alertId: string, userId: string, userName: string) => {
    // Find the alert's customer to log to the right audit trail
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      addAuditEntry(alert.customerId, {
        customerId: alert.customerId,
        action: 'raw_payload_viewed',
        performedBy: userName,
        newValue: alertId,
      });
    }
    toast.info(`Raw payload view logged for audit trail`);
  }, [alerts, addAuditEntry]);

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
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer-Grouped Alerts Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-[80px]">Alerts</TableHead>
                <TableHead className="w-[180px]">Priority Breakdown</TableHead>
                <TableHead>FinCrisS Priority</TableHead>
                <TableHead className="w-[180px]">Queue Type</TableHead>
                <TableHead className="w-[160px]">Assigned Analyst</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertsLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-muted-foreground">Loading prioritized alerts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : alertsError ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-destructive">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <XCircle className="h-8 w-8" />
                      <span>Failed to load alerts. Please check your API connection.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customerGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground text-lg">
                    No alerts found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                customerGroups.map((group) => {
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
                              <div className="flex flex-col gap-0.5">
                                {group.priorityBreakdown.high > 0 && (
                                  <Badge className="badge-risk-high text-[10px] leading-tight px-2 py-0 h-5 w-fit rounded-sm font-medium">
                                    {group.priorityBreakdown.high} High
                                  </Badge>
                                )}
                                {group.priorityBreakdown.medium > 0 && (
                                  <Badge className="badge-risk-medium text-[10px] leading-tight px-2 py-0 h-5 w-fit rounded-sm font-medium">
                                    {group.priorityBreakdown.medium} Med
                                  </Badge>
                                )}
                                {group.priorityBreakdown.low > 0 && (
                                  <Badge className="badge-risk-low text-[10px] leading-tight px-2 py-0 h-5 w-fit rounded-sm font-medium">
                                    {group.priorityBreakdown.low} Low
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <RiskBadge level={group.maxPriority} size="sm" />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {canEdit ? (
                                <QueueTypeDropdown
                                  currentQueue={override?.queueType}
                                  onQueueChange={(queue) => handleQueueChange(group.customerId, queue)}
                                />
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {queueTypeShortLabels[override?.queueType || 'default_aml']}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {canEdit ? (
                                <AnalystAssignmentDropdown
                                  analysts={analysts}
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
                              const effectiveAssignee = getEffectiveAlertAssignee(alert, override);

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
                                    <RiskBadge level={alert.riskLevel} size="sm" />
                                  </TableCell>
                                  <TableCell>
                                    {/* Queue inherited from customer level */}
                                    <span className="text-xs text-muted-foreground italic">
                                      (inherited)
                                    </span>
                                  </TableCell>
                                  <TableCell onClick={(e) => e.stopPropagation()}>
                                    {canEdit ? (
                                      <AnalystAssignmentDropdown
                                        analysts={analysts}
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
                                        onClick={() => openRawAlertDrawer(alert)}
                                        title="View raw alert"
                                      >
                                        <FileCode className="h-3.5 w-3.5" />
                                      </Button>
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
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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

      {/* Raw Alert Drawer */}
      <RawAlertDrawer
        open={rawAlertDrawerOpen}
        onOpenChange={setRawAlertDrawerOpen}
        alert={selectedAlertForRawView}
        onAuditLog={handleRawAlertAuditLog}
      />
    </AppLayout>
  );
}
