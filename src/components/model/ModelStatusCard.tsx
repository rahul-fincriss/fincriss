import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RefreshCw, AlertTriangle, Info, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/lib/api-client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ModelStatus {
  model_type: string | null;
  trained_at: string | null;
  version: string | null;
  s3_model_key: string | null;
  rule_weight: number | null;
  ml_weight: number | null;
  high_priority_threshold: number | null;
  medium_priority_threshold: number | null;
  training_stats: {
    total_samples: number | null;
    true_positive_samples: number | null;
    false_positive_samples: number | null;
    analyst_labeled: number | null;
    heuristic_labeled: number | null;
  } | null;
  metadata_source: string | null;
  retrieved_at: string | null;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function getSourceBadge(source: string | null) {
  if (source === "s3")
    return <Badge className="bg-status-success/20 text-status-success border-status-success/30">S3</Badge>;
  if (source === "local")
    return <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Local</Badge>;
  return <Badge variant="destructive">Unavailable</Badge>;
}

export default function ModelStatusCard() {
  const navigate = useNavigate();
  const {
    data: status,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<ModelStatus>({
    queryKey: ["model-status"],
    queryFn: async () => {
      const res = await api.get("/api/model/status");
      return res.data;
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    meta: {
      onError: (error: any) => {
        if (error?.response?.status === 401) navigate("/login");
      },
    },
  });

  const ruleWeight = status?.rule_weight ?? 0;
  const mlWeight = status?.ml_weight ?? 0;
  const tp = status?.training_stats?.true_positive_samples ?? 0;
  const fp = status?.training_stats?.false_positive_samples ?? 0;
  const analystLabeled = status?.training_stats?.analyst_labeled ?? 0;
  const heuristicLabeled = status?.training_stats?.heuristic_labeled ?? 0;

  const donutData = [
    { name: "True Positive", value: tp },
    { name: "False Positive", value: fp },
  ];
  const DONUT_COLORS = ["hsl(38, 92%, 50%)", "hsl(215, 16%, 47%)"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" />
            </div>
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUnavailable = status?.metadata_source === "unavailable";

  return (
    <div className="space-y-6">
      {isUnavailable && (
        <Alert className="border-status-warning/30 bg-status-warning/10">
          <AlertTriangle className="h-4 w-4 text-status-warning" />
          <AlertDescription className="text-muted-foreground">
            Model metadata could not be retrieved from S3 or local storage. The scoring pipeline may be using an outdated model.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        {/* 1. Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">ML Model Status</CardTitle>
            {getSourceBadge(status?.metadata_source ?? null)}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* 2. Model Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Algorithm</p>
              <p className="text-sm font-semibold">{status?.model_type ?? "Not trained"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Last Trained</p>
              <p className="text-sm font-semibold">{formatDateTime(status?.trained_at ?? null)}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Version</p>
              <p className="text-sm font-semibold">{status?.version ?? "—"}</p>
            </div>
          </div>

          {/* 3. Score Blend Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Score Blend</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rules Engine</span>
                  <span className="font-mono font-medium text-primary">{Math.round(ruleWeight * 100)}%</span>
                </div>
                <Progress value={ruleWeight * 100} className="h-3 bg-muted" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ML Model</span>
                  <span className="font-mono font-medium" style={{ color: "hsl(262, 83%, 58%)" }}>{Math.round(mlWeight * 100)}%</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${mlWeight * 100}%`,
                      backgroundColor: "hsl(262, 83%, 58%)",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-risk-high" />
                <span className="text-muted-foreground">HIGH ≥ {status?.high_priority_threshold ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-risk-medium" />
                <span className="text-muted-foreground">MEDIUM ≥ {status?.medium_priority_threshold ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* 4. Training Data Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Training Data</h4>
            {tp + fp > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((_, idx) => (
                          <Cell key={idx} fill={DONUT_COLORS[idx]} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        formatter={(value: string) => (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: DONUT_COLORS[0] }} />
                    <span className="text-sm">True Positive: <span className="font-semibold">{tp.toLocaleString()}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: DONUT_COLORS[1] }} />
                    <span className="text-sm">False Positive: <span className="font-semibold">{fp.toLocaleString()}</span></span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{(status?.training_stats?.total_samples ?? 0).toLocaleString()}</span> samples
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No training data available.</p>
            )}

            <div className="flex flex-wrap gap-6 pt-2">
              <TooltipProvider>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Analyst-labeled:</span>
                  <span className="font-semibold">{analystLabeled.toLocaleString()}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      Analyst-labeled data comes from real case outcomes and is higher quality.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Heuristic-labeled:</span>
                <span className="font-semibold">{heuristicLabeled.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 5. Footer */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            Data source: {status?.metadata_source ?? "—"} · Last fetched: {timeAgo(status?.retrieved_at ?? null)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
