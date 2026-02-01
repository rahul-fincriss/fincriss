import { 
  AlertTriangle, 
  BarChart3, 
  CheckCircle, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp,
  XCircle 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MetricCard } from '@/components/shared/MetricCard';

export default function MLOpsPage() {
  const modelMetrics = {
    version: 'FinCrisS-v2.3.1',
    lastTrained: '2024-01-10',
    accuracy: 94.2,
    precision: 91.8,
    recall: 96.5,
    f1Score: 94.1,
  };

  const droppedAlerts = [
    { reason: 'Obvious false positive - test transaction', count: 23, percentage: 45 },
    { reason: 'Duplicate alert from same event', count: 12, percentage: 24 },
    { reason: 'Customer cleared by investigation', count: 8, percentage: 16 },
    { reason: 'System error - incorrect flagging', count: 5, percentage: 10 },
    { reason: 'Other', count: 3, percentage: 5 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">ML Operations Dashboard</h1>
            <p className="text-muted-foreground">
              Model performance, drift detection, and retraining controls
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {modelMetrics.version}
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Request Retraining
            </Button>
          </div>
        </div>

        {/* Model Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Model Accuracy"
            value={`${modelMetrics.accuracy}%`}
            subtitle="Overall classification accuracy"
            icon={BarChart3}
            trend={{ value: 1.2, isPositive: true }}
          />
          <MetricCard
            title="Precision"
            value={`${modelMetrics.precision}%`}
            subtitle="True positive rate"
            icon={CheckCircle}
            variant="risk-low"
          />
          <MetricCard
            title="Recall"
            value={`${modelMetrics.recall}%`}
            subtitle="Detection rate"
            icon={TrendingUp}
          />
          <MetricCard
            title="F1 Score"
            value={`${modelMetrics.f1Score}%`}
            subtitle="Harmonic mean"
            icon={BarChart3}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dropped Alerts Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dropped Alert Analysis</CardTitle>
              <CardDescription>
                Reasons for alert dispositions in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {droppedAlerts.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.reason}</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Model Drift Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Drift Indicators</CardTitle>
              <CardDescription>
                Monitoring for distribution shifts and performance degradation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-risk-low/30 bg-risk-low/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-risk-low" />
                  <div>
                    <p className="font-medium">Feature Distribution</p>
                    <p className="text-sm text-muted-foreground">Within expected range</p>
                  </div>
                </div>
                <Badge className="badge-risk-low">Stable</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-risk-medium/30 bg-risk-medium/10">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-risk-medium" />
                  <div>
                    <p className="font-medium">Prediction Confidence</p>
                    <p className="text-sm text-muted-foreground">Slight degradation detected</p>
                  </div>
                </div>
                <Badge className="badge-risk-medium">Watch</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-risk-low/30 bg-risk-low/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-risk-low" />
                  <div>
                    <p className="font-medium">Label Consistency</p>
                    <p className="text-sm text-muted-foreground">No significant shift</p>
                  </div>
                </div>
                <Badge className="badge-risk-low">Stable</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-risk-low/30 bg-risk-low/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-risk-low" />
                  <div>
                    <p className="font-medium">Output Calibration</p>
                    <p className="text-sm text-muted-foreground">Well calibrated</p>
                  </div>
                </div>
                <Badge className="badge-risk-low">Stable</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* False Positive Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">False Positive Trends</CardTitle>
            <CardDescription>
              Weekly false positive rates by alert type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                { type: 'Large Cash', rate: 18, trend: 'down' },
                { type: 'Structuring', rate: 24, trend: 'up' },
                { type: 'Rapid Movement', rate: 31, trend: 'down' },
                { type: 'Geo Anomaly', rate: 42, trend: 'stable' },
                { type: 'Behavior Dev.', rate: 15, trend: 'down' },
                { type: 'Smurfing', rate: 28, trend: 'up' },
              ].map((item) => (
                <div key={item.type} className="text-center p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">{item.type}</p>
                  <p className="text-2xl font-bold">{item.rate}%</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-risk-low" />}
                    {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-risk-high" />}
                    {item.trend === 'stable' && <span className="text-xs text-muted-foreground">—</span>}
                    <span className={`text-xs ${item.trend === 'down' ? 'text-risk-low' : item.trend === 'up' ? 'text-risk-high' : 'text-muted-foreground'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retraining Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retraining Approval Queue</CardTitle>
            <CardDescription>
              Pending model updates requiring approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[100px] text-muted-foreground">
              No pending retraining requests
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
