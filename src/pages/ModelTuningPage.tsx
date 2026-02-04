import { useState } from "react";
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

export default function ModelTuningPage() {
  const [activeModel, setActiveModel] = useState("fincriss-v3.2.1");
  const [sensitivityThreshold, setSensitivityThreshold] = useState([65]);
  const [highRiskWeight, setHighRiskWeight] = useState([80]);
  const [geoAnomalyEnabled, setGeoAnomalyEnabled] = useState(true);
  const [structuringDetection, setStructuringDetection] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleModelChange = (modelId: string) => {
    setActiveModel(modelId);
    setHasUnsavedChanges(true);
  };

  const handleParameterChange = () => {
    setHasUnsavedChanges(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-status-success/20 text-status-success border-status-success/30">Active</Badge>;
      case "available":
        return <Badge variant="outline">Available</Badge>;
      case "testing":
        return <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Testing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
            <Button size="sm">Submit for Review</Button>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Available FinCrisS Models
                </CardTitle>
                <CardDescription>
                  Select the active model for alert prioritization. Changes require governance approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>FP Rate</TableHead>
                      <TableHead>Deployed</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableModels.map((model) => (
                      <TableRow key={model.id} className={activeModel === model.id ? "bg-primary/5" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{model.name}</p>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(model.status)}</TableCell>
                        <TableCell>
                          <span className="text-status-success">{model.accuracy}%</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-status-warning">{model.fpRate}%</span>
                        </TableCell>
                        <TableCell>
                          {model.deployedAt || <span className="text-muted-foreground">Not deployed</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          {activeModel === model.id ? (
                            <Badge className="bg-primary/20 text-primary">Selected</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleModelChange(model.id)}>
                              {model.status === "testing" ? "Test in Shadow" : "Select"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

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
              <AlertTitle className="text-status-info">Configuration Changes</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Parameter adjustments will be tested in shadow mode before production deployment. All changes are
                subject to compliance review and audit logging.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    Sensitivity Controls
                  </CardTitle>
                  <CardDescription>Adjust model sensitivity thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sensitivity">Alert Sensitivity Threshold</Label>
                      <span className="text-sm text-muted-foreground">{sensitivityThreshold[0]}%</span>
                    </div>
                    <Slider
                      id="sensitivity"
                      value={sensitivityThreshold}
                      onValueChange={(val) => {
                        setSensitivityThreshold(val);
                        handleParameterChange();
                      }}
                      min={30}
                      max={90}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values reduce false positives but may miss subtle patterns
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="highRisk">High-Risk Weighting</Label>
                      <span className="text-sm text-muted-foreground">{highRiskWeight[0]}%</span>
                    </div>
                    <Slider
                      id="highRisk"
                      value={highRiskWeight}
                      onValueChange={(val) => {
                        setHighRiskWeight(val);
                        handleParameterChange();
                      }}
                      min={50}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Adjusts priority weight given to high-risk indicators
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Detection Modules
                  </CardTitle>
                  <CardDescription>Enable or disable specific detection capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="geoAnomaly">Geo-Anomaly Detection</Label>
                      <p className="text-xs text-muted-foreground">
                        Flag transactions from unusual geographic locations
                      </p>
                    </div>
                    <Switch
                      id="geoAnomaly"
                      checked={geoAnomalyEnabled}
                      onCheckedChange={(checked) => {
                        setGeoAnomalyEnabled(checked);
                        handleParameterChange();
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="structuring">Structuring Detection</Label>
                      <p className="text-xs text-muted-foreground">Identify potential transaction splitting patterns</p>
                    </div>
                    <Switch
                      id="structuring"
                      checked={structuringDetection}
                      onCheckedChange={(checked) => {
                        setStructuringDetection(checked);
                        handleParameterChange();
                      }}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Configuration Update</span>
                      <span>2024-01-28 14:32 UTC</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Updated By</span>
                      <span>Rahul Arora (Super Admin)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Change History</CardTitle>
                <CardDescription>Recent parameter modifications and their review status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Made By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2024-01-28</TableCell>
                      <TableCell>Sensitivity threshold: 60% → 65%</TableCell>
                      <TableCell>Rahul Arora</TableCell>
                      <TableCell>
                        <Badge className="bg-status-success/20 text-status-success">Deployed</Badge>
                      </TableCell>
                      <TableCell className="text-status-success">-2.1% FP Rate</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-01-20</TableCell>
                      <TableCell>Enabled enhanced structuring module</TableCell>
                      <TableCell>Rahul Arora</TableCell>
                      <TableCell>
                        <Badge className="bg-status-success/20 text-status-success">Deployed</Badge>
                      </TableCell>
                      <TableCell className="text-status-success">+1.2% Accuracy</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-01-15</TableCell>
                      <TableCell>Model upgrade: v3.1.0 → v3.2.1</TableCell>
                      <TableCell>Rahul Arora</TableCell>
                      <TableCell>
                        <Badge className="bg-status-success/20 text-status-success">Deployed</Badge>
                      </TableCell>
                      <TableCell className="text-status-success">+1.4% Accuracy</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
