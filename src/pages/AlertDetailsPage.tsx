import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  DollarSign, 
  FolderPlus, 
  Globe, 
  TrendingUp, 
  User, 
  XCircle 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { mockPrioritizedAlerts, mockCustomerKYC, mockTransactions } from '@/data/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AlertDetailsPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();

  const alert = mockPrioritizedAlerts.find((a) => a.id === alertId) || mockPrioritizedAlerts[0];
  const customer = mockCustomerKYC;
  const transactions = mockTransactions;

  const handleCreateCase = () => {
    toast.success('Case created successfully');
    navigate('/cases');
  };

  const handleDropAlert = () => {
    toast.success('Alert dropped');
    navigate('/alerts/workbench');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono">{alert.id}</h1>
                <RiskBadge level={alert.riskLevel} />
              </div>
              <p className="text-muted-foreground">{alert.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SLATimer deadline={alert.slaDeadline} />
            <Button variant="outline" onClick={handleDropAlert}>
              <XCircle className="mr-2 h-4 w-4" />
              Drop as False Positive
            </Button>
            <Button onClick={handleCreateCase}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Case
            </Button>
          </div>
        </div>

        {/* Four Panel View */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Panel 1: Alert Summary */}
          <Card className="card-interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Alert Summary & Trigger</CardTitle>
              </div>
              <CardDescription>Why MAPS flagged this alert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MAPS Score</span>
                <span className="text-2xl font-bold text-primary">{alert.mapsScore}</span>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Risk Drivers</span>
                <div className="space-y-2">
                  {alert.riskDrivers.map((driver, i) => (
                    <div
                      key={i}
                      className="ai-generated rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">{driver}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">AI Explanation</p>
                <p className="text-sm">
                  This transaction pattern indicates potential trade-based money laundering. 
                  The entity shows characteristics of a shell company with mismatched business profile.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Panel 2: Customer KYC */}
          <Card className="card-interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Customer KYC Snapshot</CardTitle>
              </div>
              <CardDescription>Profile vs. behavioral analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer Type</p>
                  <p className="font-medium capitalize">{customer.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk Rating</p>
                  <RiskBadge level={customer.riskRating} size="sm" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Industry</p>
                  <p className="font-medium">{customer.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account Age</p>
                  <p className="font-medium">{customer.accountAge} months</p>
                </div>
              </div>
              
              <div className="rounded-lg border border-risk-high/30 bg-risk-high/10 p-3">
                <p className="text-xs font-medium text-risk-high mb-2">⚠️ Income vs. Behavior Mismatch</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Declared Income</p>
                    <p className="font-mono font-medium">${customer.declaredIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual Turnover</p>
                    <p className="font-mono font-medium text-risk-high">${customer.actualTurnover.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {customer.pep && <Badge variant="destructive">PEP</Badge>}
                {customer.sanctions && <Badge variant="destructive">Sanctions Hit</Badge>}
                {!customer.pep && !customer.sanctions && (
                  <Badge variant="secondary">No PEP/Sanctions</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Panel 3: Transaction Aggregates */}
          <Card className="card-interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Transaction Aggregates</CardTitle>
              </div>
              <CardDescription>Recent transaction patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-1.5 ${txn.type === 'credit' ? 'bg-risk-low/20' : 'bg-risk-high/20'}`}>
                        <TrendingUp className={`h-4 w-4 ${txn.type === 'credit' ? 'text-risk-low' : 'text-risk-high rotate-180'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{txn.counterparty}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(txn.date, 'MMM dd')} • {txn.channel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-medium ${txn.type === 'credit' ? 'text-risk-low' : 'text-risk-high'}`}>
                        {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {txn.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel 4: Risk Signals */}
          <Card className="card-interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Risk Signals</CardTitle>
              </div>
              <CardDescription>AI-detected risk patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="ai-generated rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Smurfing Pattern</span>
                    <Badge className="badge-risk-high">Detected</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Multiple transactions just below $10,000 threshold within 48-hour window
                  </p>
                </div>

                <div className="ai-generated rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Geo Anomaly</span>
                    <Badge className="badge-risk-medium">Flagged</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Transactions originating from 3 high-risk jurisdictions: VG, PA, CY
                  </p>
                </div>

                <div className="ai-generated rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Behavior Deviation</span>
                    <Badge className="badge-risk-high">Score: 0.87</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Transaction volume 280% above historical average for this customer segment
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                <p className="text-xs font-medium text-primary mb-1">Model Version</p>
                <p className="text-sm font-mono">MAPS-v2.3.1</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
