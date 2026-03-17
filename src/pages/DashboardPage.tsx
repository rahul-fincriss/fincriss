import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  FolderOpen, 
  TrendingDown,
  Zap 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { StatusBadge } from '@/components/shared/StatusBadge';

import { useDashboardSummary } from '@/hooks/useDashboard';
import { useAlerts } from '@/hooks/useAlerts';
import { useCases } from '@/hooks/useCases';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Metrics from summary API
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
  
  // Real alert and case data for quick actions
  const { data: alerts, isLoading: isAlertsLoading } = useAlerts({ limit: 3 });
  const { data: cases, isLoading: isCasesLoading } = useCases({ limit: 3 });

  const isLoading = isSummaryLoading || isAlertsLoading || isCasesLoading;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Computing compliance metrics...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Here's your AML compliance overview for today
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="High Risk Alerts"
            value={summary?.highRiskAlerts || 0}
            subtitle="Require immediate attention"
            icon={AlertTriangle}
            variant="risk-high"
            trend={summary?.highRiskTrend ? { value: summary.highRiskTrend, isPositive: summary.highRiskTrend > 0 } : undefined}
          />
          <MetricCard
            title="Alerts in Queue"
            value={summary?.alertsInQueue || 0}
            subtitle="Pending review"
            icon={Zap}
            trend={summary?.alertsTrend ? { value: summary.alertsTrend, isPositive: summary.alertsTrend > 0 } : undefined}
          />
          <MetricCard
            title="Open Cases"
            value={summary?.openCases || 0}
            subtitle="Under investigation"
            icon={FolderOpen}
          />
          <MetricCard
            title="Pending STRs"
            value={summary?.pendingSTRs || 0}
            subtitle="Awaiting PO approval"
            icon={FileText}
            variant="risk-medium"
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Priority Alerts */}
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Priority Alerts</CardTitle>
                <CardDescription>High-risk alerts requiring immediate action</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts/workbench')}>
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(alerts || []).slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 table-row-interactive"
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <RiskBadge level={alert.riskLevel} size="sm" />
                    <div>
                      <p className="font-mono text-sm">{alert.id}</p>
                      <p className="text-sm text-muted-foreground">{alert.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {alert.amount.toLocaleString()} {alert.currency}
                      </p>
                      <SLATimer deadline={alert.slaDeadline} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">No priority alerts</p>
              )}
            </CardContent>
          </Card>

          {/* Active Cases */}
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Active Cases</CardTitle>
                <CardDescription>Cases under investigation</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(cases || []).slice(0, 3).map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 table-row-interactive"
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={caseItem.status} size="sm" />
                    <div>
                      <p className="font-mono text-sm">{caseItem.id}</p>
                      <p className="text-sm text-muted-foreground">{caseItem.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {caseItem.totalAmount.toLocaleString()} {caseItem.currency}
                      </p>
                      <SLATimer deadline={caseItem.slaDeadline} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
              {(!cases || cases.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">No active cases</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Performance</CardTitle>
            <CardDescription>Your team's AML compliance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-risk-low/20 p-2">
                  <CheckCircle className="h-5 w-5 text-risk-low" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.resolvedAlerts || 0}</p>
                  <p className="text-sm text-muted-foreground">Alerts Resolved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.avgResolutionTime || '0h'}</p>
                  <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-risk-medium/20 p-2">
                  <TrendingDown className="h-5 w-5 text-risk-medium" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.falsePositiveRate || '0%'}</p>
                  <p className="text-sm text-muted-foreground">False Positive Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-risk-high/20 p-2">
                  <FileText className="h-5 w-5 text-risk-high" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.strsFiled || 0}</p>
                  <p className="text-sm text-muted-foreground">STRs Filed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
