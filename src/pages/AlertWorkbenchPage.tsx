import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Eye, Filter, FolderPlus, Search, XCircle, Users } from 'lucide-react';
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
import { mockPrioritizedAlerts } from '@/data/mockData';
import { PrioritizedAlert, RiskLevel } from '@/types';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

    // Get unique top drivers
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

  // Sort groups by max priority, then by earliest SLA
  return groups.sort((a, b) => {
    const priorityDiff = priorityOrder[b.maxPriority] - priorityOrder[a.maxPriority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.earliestSLA.getTime() - b.earliestSLA.getTime();
  });
}

export default function AlertWorkbenchPage() {
  const navigate = useNavigate();
  const [alerts] = useState<PrioritizedAlert[]>(mockPrioritizedAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  const customerGroups = useMemo(() => {
    const filtered = alerts.filter((alert) => {
      const matchesSearch =
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const groups = groupAlertsByCustomer(filtered);

    // Filter by priority at customer level (MAX priority)
    if (priorityFilter !== 'all') {
      return groups.filter((group) => group.maxPriority === priorityFilter);
    }

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

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alert Workbench</h1>
            <p className="text-muted-foreground">
              Customer-grouped alerts with AI prioritization and SLA tracking
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
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
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
                <TableHead className="w-[100px]">Alerts</TableHead>
                <TableHead className="w-[200px]">Priority Breakdown</TableHead>
                <TableHead>MAPS Score</TableHead>
                <TableHead className="max-w-[280px]">Top Risk Drivers</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerGroups.map((group) => (
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
                            {group.totalAlerts} {group.totalAlerts === 1 ? 'alert' : 'alerts'}
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
                        <TableCell className="max-w-[280px]">
                          <div className="flex flex-wrap gap-1">
                            {group.aggregatedDrivers.slice(0, 2).map((driver, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {driver}
                              </Badge>
                            ))}
                            {group.aggregatedDrivers.length > 2 && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                +{group.aggregatedDrivers.length - 2} more
                              </Badge>
                            )}
                          </div>
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
                        {group.alerts.map((alert) => (
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
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {alertTypeLabels[alert.alertType] || alert.alertType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {alert.amount.toLocaleString()} {alert.currency}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <RiskBadge level={alert.riskLevel} size="sm" />
                                <span className="text-xs text-muted-foreground font-mono">
                                  {alert.mapsScore}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[280px]">
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
                                  className="h-7 w-7 text-primary hover:text-primary"
                                  onClick={(e) => handleAddToCase(e, alert.id)}
                                  title="Add to case"
                                >
                                  <FolderPlus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>

        {customerGroups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No customers match your search criteria
          </div>
        )}
      </div>
    </AppLayout>
  );
}
