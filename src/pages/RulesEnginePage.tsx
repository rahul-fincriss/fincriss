import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Settings2,
  Sliders,
  Activity,
  Search,
  Filter,
  RotateCcw,
  Save,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  ArrowRight,
  BookOpen,
  Zap,
  Globe,
  Users,
  MapPin,
  Clock,
  CircleDollarSign,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useRules,
  useRuleThresholds,
  useToggleRule,
  useBulkUpdateThresholds,
  useResetThresholds,
  useRuleAuditLog,
} from "@/hooks/useRules";
import type { RuleConfig, RuleThreshold, RuleAuditEntry } from "@/services/rules.service";

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
  TRANSACTION: CircleDollarSign,
  CROSS_BORDER: Globe,
  VELOCITY: Zap,
  CUSTOMER: Users,
  GEOGRAPHY: MapPin,
  ACCOUNT: Clock,
};

const categoryColors: Record<string, string> = {
  TRANSACTION: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  CROSS_BORDER: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  VELOCITY: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  CUSTOMER: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  GEOGRAPHY: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  ACCOUNT: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
};

const changeTypeLabels: Record<string, string> = {
  CONFIG_CHANGED: "Config Updated",
  THRESHOLD_CHANGED: "Threshold Modified",
  TOGGLED: "Rule Toggled",
  RESET_TO_DEFAULT: "Reset to Default",
};

export default function RulesEnginePage() {
  const { data: rules, isLoading: rulesLoading, error: rulesError } = useRules();
  const toggleMutation = useToggleRule();
  const bulkUpdateMutation = useBulkUpdateThresholds();
  const resetMutation = useResetThresholds();

  // State
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("rules-list");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localThresholdValues, setLocalThresholdValues] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveReason, setSaveReason] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [auditRuleFilter, setAuditRuleFilter] = useState("all");
  const [auditLimit, setAuditLimit] = useState(50);

  // Derived
  const { data: thresholds, isLoading: thresholdsLoading } = useRuleThresholds(selectedRuleId);
  const { data: auditLogs, isLoading: auditLoading } = useRuleAuditLog({
    rule_id: auditRuleFilter !== "all" ? auditRuleFilter : undefined,
    limit: auditLimit,
  });

  const selectedRule = useMemo(
    () => rules?.find((r) => r.rule_id === selectedRuleId),
    [rules, selectedRuleId]
  );

  // Select first rule by default
  useEffect(() => {
    if (rules?.length && !selectedRuleId) {
      setSelectedRuleId(rules[0].rule_id);
    }
  }, [rules, selectedRuleId]);

  // Sync local threshold values
  useEffect(() => {
    if (thresholds?.length) {
      const initial: Record<string, number> = {};
      thresholds.forEach((t) => {
        initial[String(t.threshold_id)] = t.parameter_value;
      });
      setLocalThresholdValues(initial);
      setHasUnsavedChanges(false);
    }
  }, [thresholds]);

  // Filtered rules
  const filteredRules = useMemo(() => {
    if (!rules) return [];
    return rules.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.rule_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
      const isEnabled = r.is_enabled ?? r.is_active;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rules, searchQuery, categoryFilter, statusFilter]);

  // Categories from rules
  const categories = useMemo(() => {
    if (!rules) return [];
    return [...new Set(rules.map((r) => r.category))].sort();
  }, [rules]);

  // Handlers
  const handleSelectRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setActiveTab("rule-detail");
    setHasUnsavedChanges(false);
  };

  const handleThresholdChange = (thresholdId: string | number, value: number) => {
    setLocalThresholdValues((prev) => ({ ...prev, [String(thresholdId)]: value }));
    setHasUnsavedChanges(true);
  };

  const handleToggle = (ruleId: string) => {
    toast.promise(toggleMutation.mutateAsync(ruleId), {
      loading: "Toggling rule...",
      success: "Rule status updated",
      error: "Failed to toggle rule",
    });
  };

  const handleSaveAll = () => {
    if (!selectedRuleId || !thresholds) return;
    const thresholdMap: Record<string, number> = {};
    thresholds.forEach((t) => {
      const key = t.parameter_name;
      thresholdMap[key] = localThresholdValues[String(t.threshold_id)] ?? t.parameter_value;
    });
    toast.promise(
      bulkUpdateMutation.mutateAsync({
        ruleId: selectedRuleId,
        thresholds: thresholdMap,
        reason: saveReason || "Manual threshold update",
        changedBy: "admin",
      }),
      {
        loading: "Saving thresholds...",
        success: () => {
          setHasUnsavedChanges(false);
          setSaveReason("");
          return "Thresholds updated successfully";
        },
        error: "Failed to update thresholds",
      }
    );
  };

  const handleReset = () => {
    if (!selectedRuleId) return;
    toast.promise(
      resetMutation.mutateAsync({ ruleId: selectedRuleId, changedBy: "admin" }),
      {
        loading: "Resetting to defaults...",
        success: () => {
          setShowResetDialog(false);
          setHasUnsavedChanges(false);
          return "Thresholds reset to defaults";
        },
        error: "Failed to reset thresholds",
      }
    );
  };

  const formatThresholdValue = (value: number, unit: string, paramType?: string) => {
    if (paramType === "PERCENTAGE" || unit === "%") return `${value}%`;
    if (unit === "INR" || unit === "₹") return `₹${value.toLocaleString("en-IN")}`;
    return `${value.toLocaleString()} ${unit}`;
  };

  // Scoring info
  const scoringFormula = "Final Score = 0.6 × Rule Score + 0.4 × ML Score × 100";
  const priorityLevels = [
    { label: "HIGH", range: "≥ 70", color: "text-status-error" },
    { label: "MEDIUM", range: "≥ 40", color: "text-status-warning" },
    { label: "LOW", range: "< 40", color: "text-status-success" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rules Engine Configuration</h1>
            <p className="text-muted-foreground">
              Manage detection rules, thresholds, and scoring parameters
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <Shield className="h-3 w-3" />
              {rules?.length || 0} Rules
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-status-success" />
              {rules?.filter((r) => r.is_enabled ?? r.is_active).length || 0} Active
            </Badge>
          </div>
        </div>

        {/* Scoring Info Banner */}
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary text-sm">Scoring Formula</AlertTitle>
          <AlertDescription className="text-muted-foreground text-xs">
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
              {scoringFormula}
            </code>
            <span className="ml-3">
              Priority: {priorityLevels.map((p) => (
                <span key={p.label} className={`${p.color} font-semibold mx-1`}>
                  {p.label} ({p.range})
                </span>
              ))}
            </span>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="rules-list" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Rules List
            </TabsTrigger>
            <TabsTrigger value="rule-detail" className="gap-1.5" disabled={!selectedRuleId}>
              <Sliders className="h-3.5 w-3.5" />
              Rule Detail
            </TabsTrigger>
            <TabsTrigger value="audit-log" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* ============ TAB 1: RULES LIST ============ */}
          <TabsContent value="rules-list" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rules Table */}
            {rulesLoading ? (
              <Card>
                <CardContent className="h-64 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading rules...</p>
                </CardContent>
              </Card>
            ) : rulesError ? (
              <Card>
                <CardContent className="h-64 flex flex-col items-center justify-center gap-3 text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p>Failed to load rules. Check API connection.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[280px]">Rule</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Base Score</TableHead>
                        <TableHead className="text-center">Priority</TableHead>
                        <TableHead className="text-center">Version</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                            No rules match your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRules.map((rule) => {
                          const isEnabled = rule.is_enabled ?? rule.is_active;
                          const CategoryIcon = categoryIcons[rule.category] || Shield;
                          return (
                            <TableRow
                              key={rule.rule_id}
                              className="cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => handleSelectRule(rule.rule_id)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{rule.rule_name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {rule.description}
                                  </p>
                                  <code className="text-[10px] text-muted-foreground/60 font-mono">
                                    {rule.rule_id}
                                  </code>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`gap-1 text-xs ${categoryColors[rule.category] || ""}`}
                                >
                                  <CategoryIcon className="h-3 w-3" />
                                  {rule.category?.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-mono text-sm">
                                {rule.base_score ?? "—"}
                              </TableCell>
                              <TableCell className="text-center font-mono text-sm">
                                {rule.priority ?? "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="text-xs">
                                  v{rule.version ?? 1}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(e) => {
                                    e; // prevent row click
                                    handleToggle(rule.rule_id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                <div>
                                  {rule.updated_at
                                    ? format(new Date(rule.updated_at), "MMM d, yyyy")
                                    : "—"}
                                </div>
                                {rule.updated_by && (
                                  <div className="text-[10px] text-muted-foreground/60">
                                    by {rule.updated_by}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  Configure
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============ TAB 2: RULE DETAIL / EDIT ============ */}
          <TabsContent value="rule-detail" className="space-y-6">
            {!selectedRule ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a rule from the Rules List to configure it.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Rule Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold">{selectedRule.rule_name}</h2>
                          <Badge
                            variant="outline"
                            className={categoryColors[selectedRule.category] || ""}
                          >
                            {selectedRule.category?.replace(/_/g, " ")}
                          </Badge>
                          {(selectedRule.is_enabled ?? selectedRule.is_active) ? (
                            <Badge className="bg-status-success/20 text-status-success border-status-success/30">
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xl">
                          {selectedRule.description}
                        </p>
                        <code className="text-xs text-muted-foreground/60 font-mono">
                          {selectedRule.rule_id}
                        </code>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm space-y-1">
                          <div className="text-muted-foreground">
                            Base Score: <span className="font-mono font-bold text-foreground">{selectedRule.base_score ?? "—"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Version: <span className="font-mono text-foreground">v{selectedRule.version ?? 1}</span>
                          </div>
                        </div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="rule-toggle" className="text-sm">Active</Label>
                          <Switch
                            id="rule-toggle"
                            checked={selectedRule.is_enabled ?? selectedRule.is_active}
                            onCheckedChange={() => handleToggle(selectedRule.rule_id)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Unsaved Changes Bar */}
                {hasUnsavedChanges && (
                  <Alert className="border-status-warning/30 bg-status-warning/10">
                    <AlertTriangle className="h-4 w-4 text-status-warning" />
                    <AlertTitle className="text-status-warning text-sm">Unsaved Changes</AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="flex-1">You have modified threshold values. Save to apply changes.</span>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Reason for change (optional)..."
                          value={saveReason}
                          onChange={(e) => setSaveReason(e.target.value)}
                          className="h-8 text-xs w-64"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (thresholds) {
                              const initial: Record<string, number> = {};
                              thresholds.forEach((t) => {
                                initial[String(t.threshold_id)] = t.parameter_value;
                              });
                              setLocalThresholdValues(initial);
                              setHasUnsavedChanges(false);
                            }
                          }}
                        >
                          Discard
                        </Button>
                        <Button size="sm" onClick={handleSaveAll} disabled={bulkUpdateMutation.isPending}>
                          {bulkUpdateMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          ) : (
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Save All
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Thresholds */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Sliders className="h-5 w-5 text-primary" />
                          Threshold Parameters
                        </CardTitle>
                        <CardDescription>
                          Adjust detection sensitivity. Each parameter has defined minimum and maximum bounds.
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowResetDialog(true)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {thresholdsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !thresholds?.length ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Sliders className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No configurable thresholds for this rule.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {/* Header row */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                          <div className="col-span-3">Parameter</div>
                          <div className="col-span-5">Value</div>
                          <div className="col-span-2 text-center">Range</div>
                          <div className="col-span-2 text-right">Default</div>
                        </div>

                        {[...thresholds]
                          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                          .map((t) => {
                            const currentValue =
                              localThresholdValues[String(t.threshold_id)] ?? t.parameter_value;
                            const isModified = currentValue !== t.parameter_value;
                            return (
                              <div
                                key={t.threshold_id}
                                className={`grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-lg transition-colors ${
                                  isModified ? "bg-status-warning/5 border border-status-warning/20" : "hover:bg-muted/30"
                                }`}
                              >
                                <div className="col-span-3">
                                  <Label className="text-sm font-medium">
                                    {t.display_name || t.parameter_name}
                                  </Label>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {t.description}
                                  </p>
                                </div>
                                <div className="col-span-5 space-y-2">
                                  <Slider
                                    value={[currentValue]}
                                    onValueChange={(val) =>
                                      handleThresholdChange(t.threshold_id, val[0])
                                    }
                                    min={t.min_allowed ?? 0}
                                    max={t.max_allowed ?? 100}
                                    step={t.parameter_type === "DECIMAL" ? 0.1 : 1}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
                                    <span>{formatThresholdValue(t.min_allowed ?? 0, t.unit, t.parameter_type)}</span>
                                    <span className="text-sm font-mono font-bold text-primary">
                                      {formatThresholdValue(currentValue, t.unit, t.parameter_type)}
                                    </span>
                                    <span>{formatThresholdValue(t.max_allowed ?? 100, t.unit, t.parameter_type)}</span>
                                  </div>
                                </div>
                                <div className="col-span-2 text-center text-xs text-muted-foreground font-mono">
                                  {formatThresholdValue(t.min_allowed ?? 0, t.unit, t.parameter_type)}
                                  {" – "}
                                  {formatThresholdValue(t.max_allowed ?? 100, t.unit, t.parameter_type)}
                                </div>
                                <div className="col-span-2 text-right">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {formatThresholdValue(t.default_value ?? t.parameter_value, t.unit, t.parameter_type)}
                                  </span>
                                  {isModified && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-[10px] border-status-warning/40 text-status-warning"
                                    >
                                      Modified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ============ TAB 3: AUDIT LOG ============ */}
          <TabsContent value="audit-log" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={auditRuleFilter} onValueChange={setAuditRuleFilter}>
                <SelectTrigger className="w-[220px]">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rules</SelectItem>
                  {rules?.map((r) => (
                    <SelectItem key={r.rule_id} value={r.rule_id}>
                      {r.rule_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(auditLimit)} onValueChange={(v) => setAuditLimit(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 entries</SelectItem>
                  <SelectItem value="50">50 entries</SelectItem>
                  <SelectItem value="100">100 entries</SelectItem>
                  <SelectItem value="500">500 entries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Rules Change History
                </CardTitle>
                <CardDescription>
                  All configuration and threshold changes are logged for compliance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {auditLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !auditLogs?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No audit entries found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[160px]">Timestamp</TableHead>
                        <TableHead>Rule</TableHead>
                        <TableHead>Change Type</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((entry, idx) => (
                        <TableRow key={entry.log_id || idx}>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {entry.changed_at
                              ? format(new Date(entry.changed_at), "MMM d, HH:mm:ss")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs font-mono">{entry.rule_id}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {changeTypeLabels[entry.change_type] || entry.change_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {entry.field_changed || "—"}
                          </TableCell>
                          <TableCell>
                            {entry.old_value !== undefined && entry.new_value !== undefined ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-mono text-muted-foreground bg-muted px-1 rounded">
                                  {entry.old_value}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-mono text-foreground bg-primary/10 px-1 rounded">
                                  {entry.new_value}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{entry.changed_by || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {entry.reason || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-status-warning" />
              Reset Thresholds to Defaults
            </DialogTitle>
            <DialogDescription>
              This will reset all threshold parameters for{" "}
              <span className="font-semibold text-foreground">
                {selectedRule?.rule_name}
              </span>{" "}
              back to their factory default values. This action is logged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
