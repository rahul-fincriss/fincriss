import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, FolderPlus, Search, XCircle } from 'lucide-react';
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
import { format } from 'date-fns';
import { toast } from 'sonner';

const alertTypeLabels: Record<string, string> = {
  large_cash: 'Large Cash',
  structuring: 'Structuring',
  rapid_movement: 'Rapid Movement',
  geo_anomaly: 'Geo Anomaly',
  behavior_deviation: 'Behavior Deviation',
  smurfing: 'Smurfing',
};

export default function AlertWorkbenchPage() {
  const navigate = useNavigate();
  const [alerts] = useState<PrioritizedAlert[]>(mockPrioritizedAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === 'all' || alert.riskLevel === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleViewDetails = (alert: PrioritizedAlert) => {
    navigate(`/alerts/${alert.id}`);
  };

  const handleCreateCase = (alertId: string) => {
    toast.success(`Case created from alert ${alertId}`);
    navigate('/cases');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prioritized Alert Workbench</h1>
            <p className="text-muted-foreground">
              AI-prioritized alerts with risk scoring and SLA tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              placeholder="Search alerts..."
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

        {/* Alerts Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Alert ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Alert Type</TableHead>
                <TableHead>MAPS Priority</TableHead>
                <TableHead>Risk Drivers</TableHead>
                <TableHead>SLA Timer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className="table-row-interactive"
                  onClick={() => handleViewDetails(alert)}
                >
                  <TableCell className="font-mono text-sm">{alert.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{alert.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.amount.toLocaleString()} {alert.currency}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {alertTypeLabels[alert.alertType] || alert.alertType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={alert.riskLevel} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        Score: {alert.mapsScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="flex flex-wrap gap-1">
                      {alert.riskDrivers.slice(0, 2).map((driver, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {driver}
                        </Badge>
                      ))}
                      {alert.riskDrivers.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{alert.riskDrivers.length - 2} more
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
                        className="h-8 w-8"
                        onClick={() => handleViewDetails(alert)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Drop alert"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary"
                        onClick={() => handleCreateCase(alert.id)}
                        title="Create case"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
