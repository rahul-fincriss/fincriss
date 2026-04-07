import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  DollarSign, 
  FolderPlus, 
  Globe, 
  TrendingUp, 
  User, 
  XCircle,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { RawAlertDrawer } from '@/components/workbench/RawAlertDrawer';
import { Customer360Drawer } from '@/components/customer360/Customer360Drawer';
import { 
  mockPrioritizedAlerts, 
  getExtendedCustomerProfile, 
  getTransactionsByCustomerId,
  mockExtendedCustomerProfiles,
  formatINRFull
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useAlert, useOpenCase } from '@/hooks/useAlerts';
import { Loader2 } from 'lucide-react';

export default function AlertDetailsPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rawAlertDrawerOpen, setRawAlertDrawerOpen] = useState(false);
  const [customer360Open, setCustomer360Open] = useState(false);

  // Real API data
  const { data: alert, isLoading, error } = useAlert(alertId || '');
  const openCaseMutation = useOpenCase();
  
  // Handlers
  const handleCreateCase = async () => {
    if (!alert) return;
    
    toast.promise(
      openCaseMutation.mutateAsync({ 
        alertId: alert.id, 
        request: { notes: `Case manually opened for alert ${alert.id}` } 
      }),
      {
        loading: 'Opening case...',
        success: () => {
          navigate('/cases');
          return 'Case created successfully';
        },
        error: 'Failed to create case',
      }
    );
  };

  const handleDropAlert = () => {
    toast.success('Alert dropped');
    navigate('/alerts/workbench');
  };

  const handleRawPayloadAuditLog = (alertId: string, userId: string, userName: string) => {
    toast.info(`Raw payload view logged for ${alertId}`);
    console.log(`[AUDIT] User ${userName} (${userId}) viewed raw payload for alert ${alertId} at ${new Date().toISOString()}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Fetching alert details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !alert) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-bold">Alert Not Found</h2>
            <p className="text-muted-foreground">The alert ID might be invalid or you don't have permission to view it.</p>
          </div>
          <Button onClick={() => navigate('/alerts/workbench')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workbench
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Look up customer and transactions (keeping mock for these for now as they are Phase 2/3)
  const customerProfile = getExtendedCustomerProfile(alert.customerId) || mockExtendedCustomerProfiles[0];
  const transactions = getTransactionsByCustomerId(alert.customerId);
  const customer = customerProfile.kyc;

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
            <Button variant="outline" onClick={() => setRawAlertDrawerOpen(true)}>
              <FileCode className="mr-2 h-4 w-4" />
              View Raw Payload
            </Button>
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
              <CardDescription>Why FinCrisS flagged this alert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">FinCrisS Score</span>
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
                    <p className="font-mono font-medium">{formatINRFull(customer.declaredIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual Turnover</p>
                    <p className="font-mono font-medium text-risk-high">{formatINRFull(customer.actualTurnover)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {customer.pep && <Badge variant="destructive">PEP</Badge>}
                  {customer.sanctions && <Badge variant="destructive">Sanctions Hit</Badge>}
                  {!customer.pep && !customer.sanctions && (
                    <Badge variant="secondary">No PEP/Sanctions</Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/customers?id=${alert.customerId}`)}
                  className="gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Customer 360
                </Button>
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
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No transactions found for this customer</p>
                ) : (
                  transactions.slice(0, 5).map((txn) => (
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
                          {txn.type === 'credit' ? '+' : '-'}{formatINRFull(txn.amount)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {txn.country}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    Multiple transactions just below ₹10,00,000 CTR threshold within 48-hour window
                  </p>
                </div>

                <div className="ai-generated rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Geo Anomaly</span>
                    <Badge className="badge-risk-medium">Flagged</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Transactions originating from 3 high-risk jurisdictions: UAE, SG, HK
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
                <p className="text-sm font-mono">FinCrisS-v2.3.1</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Raw Alert Drawer */}
      <RawAlertDrawer
        open={rawAlertDrawerOpen}
        onOpenChange={setRawAlertDrawerOpen}
        alert={alert}
        onAuditLog={handleRawPayloadAuditLog}
      />

      {/* Customer 360 Drawer */}
      <Customer360Drawer
        open={customer360Open}
        onOpenChange={setCustomer360Open}
        customerProfile={customerProfile}
        transactions={transactions}
        alert={alert}
      />
    </AppLayout>
  );
}