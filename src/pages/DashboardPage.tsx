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
import { mockPrioritizedAlerts, mockCases, mockSTRDrafts } from '@/data/mockData';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const highRiskAlerts = mockPrioritizedAlerts.filter(a => a.riskLevel === 'high').length;
  const openCases = mockCases.filter(c => c.status !== 'closed' && c.status !== 'submitted').length;
  const pendingSTRs = mockSTRDrafts.filter(s => s.status === 'pending_po_review').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
            value={highRiskAlerts}
            subtitle="Require immediate attention"
            icon={AlertTriangle}
            variant="risk-high"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Alerts in Queue"
            value={mockPrioritizedAlerts.length}
            subtitle="Pending review"
            icon={Zap}
            trend={{ value: 5, isPositive: true }}
          />
          <MetricCard
            title="Open Cases"
            value={openCases}
            subtitle="Under investigation"
            icon={FolderOpen}
          />
          <MetricCard
            title="Pending STRs"
            value={pendingSTRs}
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
              {mockPrioritizedAlerts.slice(0, 3).map((alert) => (
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
              {mockCases.map((caseItem) => (
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
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-sm text-muted-foreground">Alerts Resolved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.3h</p>
                  <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-risk-medium/20 p-2">
                  <TrendingDown className="h-5 w-5 text-risk-medium" />
                </div>
                <div>
                  <p className="text-2xl font-bold">23%</p>
                  <p className="text-sm text-muted-foreground">False Positive Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="rounded-lg bg-risk-high/20 p-2">
                  <FileText className="h-5 w-5 text-risk-high" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
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
