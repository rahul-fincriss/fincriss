import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Activity,
  Settings2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  FlaskConical,
  Shield,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

// Mock data for models
const availableModels = [
  {
    id: "fincriss-v3.2.1",
    name: "FinCrisS v3.2.1",
    status: "active",
    accuracy: 94.2,
    fpRate: 8.5,
    deployedAt: "2024-01-15",
    description: "Production model with enhanced structuring detection",
  },
  {
    id: "fincriss-v3.1.0",
    name: "FinCrisS v3.1.0",
    status: "available",
    accuracy: 92.8,
    fpRate: 10.2,
    deployedAt: "2023-11-20",
    description: "Previous stable release",
  },
  {
    id: "fincriss-v3.3.0-beta",
    name: "FinCrisS v3.3.0 (Beta)",
    status: "testing",
    accuracy: 95.1,
    fpRate: 7.8,
    deployedAt: null,
    description: "Experimental model with improved geo-anomaly detection",
  },
];

const performanceHistory = [
  { date: "Jan 1", accuracy: 93.5, fpRate: 9.2, alerts: 245 },
  { date: "Jan 8", accuracy: 93.8, fpRate: 9.0, alerts: 312 },
  { date: "Jan 15", accuracy: 94.2, fpRate: 8.8, alerts: 289 },
  { date: "Jan 22", accuracy: 94.0, fpRate: 8.5, alerts: 356 },
  { date: "Jan 29", accuracy: 94.3, fpRate: 8.3, alerts: 298 },
  { date: "Feb 5", accuracy: 94.1, fpRate: 8.5, alerts: 320 },
];

const driftIndicators = [
  { metric: "Feature Distribution", status: "stable", change: -0.2 },
  { metric: "Prediction Confidence", status: "stable", change: 0.1 },
  { metric: "Alert Volume", status: "warning", change: 12.5 },
  { metric: "High-Risk Ratio", status: "stable", change: -1.8 },
];

import { useRules, useRuleThresholds, useToggleRule, useUpdateThresholds } from "@/hooks/useRules";
import { useRuleAuditLogs } from "@/hooks/useAudit";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ModelTuningPage() {
  const { data: rules, isLoading, error } = useRules();
  const [activeModel, setActiveModel] = useState<string | null>(null);
  
  // Selection logic - pick first rule by default if none selected
  const selectedRuleId = activeModel || (rules?.[0]?.rule_id || null);
  const { data: thresholds, isLoading: thresholdsLoading } = useRuleThresholds(selectedRuleId);
  const toggleMutation = useToggleRule();
  const updateMutation = useUpdateThresholds();
  const { data: ruleLogs, isLoading: logsLoading } = useRuleAuditLogs({ rule_id: selectedRuleId, limit: 5 });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localThresholdValues, setLocalThresholdValues] = useState<Record<string, number>>({});

  // Sync local state when thresholds load
  useEffect(() => {
    if (thresholds) {
      const initialValues: Record<string, number> = {};
      thresholds.forEach(t => initialValues[t.threshold_id] = t.parameter_value);
      setLocalThresholdValues(initialValues);
      setHasUnsavedChanges(false);
    }
  }, [thresholds]);

  const handleModelChange = (modelId: string) => {
    setActiveModel(modelId);
    setHasUnsavedChanges(false);
  };

  const handleThresholdUpdate = (id: string, val: number) => {
    setLocalThresholdValues(prev => ({ ...prev, [id]: val }));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    if (!selectedRuleId || !thresholds) return;
    
    toast.promise(
      updateMutation.mutateAsync({
        ruleId: selectedRuleId,
        thresholds: Object.entries(localThresholdValues).map(([id, val]) => ({
          threshold_id: id,
          parameter_value: val
        }))
      }),
      {
        loading: 'Updating parameters...',
        success: 'Production configuration updated',
        error: 'Failed to update configuration'
      }
    );
    setHasUnsavedChanges(false);
  };

  const getStatusBadge = (active: boolean) => {
    return active ? 
      <Badge className="bg-status-success/20 text-status-success border-status-success/30">Active</Badge> : 
      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
  };

  const getDriftIcon = (status: string) => {
    switch (status) {
      case "stable":
        return <Minus className="h-4 w-4 text-status-success" />;
      case "warning":
        return <TrendingUp className="h-4 w-4 text-status-warning" />;
      case "critical":
        return <TrendingDown className="h-4 w-4 text-status-error" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Model Tuning & Oversight</h1>
            <p className="text-muted-foreground">Internal administrative controls for FinCrisS model configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Experimental & Governance Workspace</span>
          </div>
        </div>

        {/* Warning Banner */}
        <Alert className="border-status-warning/30 bg-status-warning/10">
          <AlertTriangle className="h-4 w-4 text-status-warning" />
          <AlertTitle className="text-status-warning">Administrative Control Panel</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Changes made here directly affect the FinCrisS alert prioritization system. All modifications are logged and
            require governance review before production deployment. Proceed with caution.
          </AlertDescription>
        </Alert>

        {hasUnsavedChanges && (
          <div className="flex items-center justify-end gap-3">
            <Badge variant="outline" className="border-status-warning/50 text-status-warning">
              Unsaved Changes
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setHasUnsavedChanges(false)}>
              Discard
            </Button>
            <Button size="sm" onClick={handleSaveAll} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit for Review
            </Button>
          </div>
        )}

        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="models">Model Selection</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tuning">Parameters</TabsTrigger>
          </TabsList>

          {/* Model Selection Tab */}
          <TabsContent value="models" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="h-64 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse">Fetching rule configurations...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="h-64 flex flex-col items-center justify-center gap-3 text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p>Failed to load detection parameters. Check API connection.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Available Detection Rules
                  </CardTitle>
                  <CardDescription>
                    Select a rule to view and adjust its sensitivity parameters.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules?.map((rule) => (
                        <TableRow 
                          key={rule.rule_id} 
                          className={selectedRuleId === rule.rule_id ? "bg-primary/5 border-l-2 border-l-primary" : ""}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{rule.rule_name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">{rule.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(rule.is_active)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {rule.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(rule.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {selectedRuleId === rule.rule_id ? (
                              <Badge className="bg-primary/20 text-primary">Focused</Badge>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleModelChange(rule.rule_id)}>
                                Select
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Drift Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Model Drift Indicators
                </CardTitle>
                <CardDescription>Monitor for distribution shifts that may affect model performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {driftIndicators.map((indicator) => (
                    <div
                      key={indicator.metric}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="text-sm font-medium">{indicator.metric}</p>
                        <p
                          className={`text-xs ${
                            indicator.status === "stable"
                              ? "text-status-success"
                              : indicator.status === "warning"
                                ? "text-amber-400"
                                : "text-status-error"
                          }`}
                        >
                          {indicator.change > 0 ? "+" : ""}
                          {indicator.change}%
                        </p>
                      </div>
                      {getDriftIcon(indicator.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-status-success">94.2%</span>
                    <span className="text-sm text-status-success mb-1">+0.3%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">False Positive Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-status-warning">8.5%</span>
                    <span className="text-sm text-status-success mb-1">-0.2%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Model Stability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-status-success" />
                    <span className="text-xl font-semibold">Stable</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Historical accuracy and false positive rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceHistory}>
                      <defs>
                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={[85, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#accuracyGradient)"
                        name="Accuracy %"
                      />
                      <Line
                        type="monotone"
                        dataKey="fpRate"
                        stroke="hsl(var(--status-warning))"
                        strokeDasharray="5 5"
                        name="FP Rate %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parameter Tuning Tab */}
          <TabsContent value="tuning" className="space-y-6">
            <Alert className="border-status-info/30 bg-status-info/10">
              <Info className="h-4 w-4 text-status-info" />
              <AlertTitle className="text-status-info">Direct Configuration</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Adjusting thresholds for rule: <span className="font-mono font-bold text-foreground">
                  {rules?.find(r => r.rule_id === selectedRuleId)?.rule_name || selectedRuleId}
                </span>. 
                All changes are subject to compliance audit and monitoring.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    Parameter Controls
                  </CardTitle>
                  <CardDescription>Adjust specific numeric thresholds for detection triggers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {thresholdsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : thresholds && thresholds.length > 0 ? (
                    thresholds.map((t) => (
                      <div key={t.threshold_id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor={t.threshold_id}>{t.parameter_name}</Label>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                          </div>
                          <span className="text-sm font-mono font-medium text-primary">
                            {localThresholdValues[t.threshold_id] ?? t.parameter_value} {t.unit}
                          </span>
                        </div>
                        <Slider
                          id={t.threshold_id}
                          value={[localThresholdValues[t.threshold_id] ?? t.parameter_value]}
                          onValueChange={(val) => handleThresholdUpdate(t.threshold_id, val[0])}
                          min={0}
                          max={t.parameter_name.toLowerCase().includes('amount') ? 1000000 : 100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No adjustable thresholds found for this rule.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Operational Status
                  </CardTitle>
                  <CardDescription>Toggle detection capability in production</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="rule-status">Detection Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Turn this rule ON or OFF to affect real-time alert generation
                      </p>
                    </div>
                    <Switch
                      id="rule-status"
                      checked={rules?.find(r => r.rule_id === selectedRuleId)?.is_active || false}
                      onCheckedChange={() => {
                        if (selectedRuleId) {
                          toast.promise(toggleMutation.mutateAsync(selectedRuleId), {
                            loading: 'Toggling rule status...',
                            success: 'Rule status updated',
                            error: 'Failed to toggle rule'
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Category</span>
                      <Badge variant="outline" className="capitalize">
                        {rules?.find(r => r.rule_id === selectedRuleId)?.category || 'General'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Last Modified</span>
                      <span>{selectedRuleId ? new Date(rules?.find(r => r.rule_id === selectedRuleId)?.updated_at || '').toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Tuning History</CardTitle>
                <CardDescription>View detailed change logs in the Audit Trail module</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : ruleLogs && ruleLogs.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[150px]">Date</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Changes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ruleLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs">
                              {format(log.performedAt, "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {log.performedBy}
                            </TableCell>
                            <TableCell className="text-xs">
                              {log.action}
                            </TableCell>
                            <TableCell>
                              {log.previousValue !== undefined && log.newValue !== undefined ? (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-mono text-muted-foreground bg-muted px-1 rounded">
                                    {log.previousValue}
                                  </span>
                                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                                  <span className="font-mono text-foreground bg-primary/10 px-1 rounded">
                                    {log.newValue}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">
                                  {log.details}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No recent tuning changes recorded for this rule</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => (window.location.hash = '/admin/audit')}
                    className="text-xs h-auto p-0"
                  >
                    View All Platform Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
