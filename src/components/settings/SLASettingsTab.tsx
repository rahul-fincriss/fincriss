import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Save, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { mockPlatformSettings } from '@/data/adminMockData';
import { UserRole } from '@/types';

interface SLASettingsTabProps {
  isReadOnly: boolean;
}

const roleLabels: Record<UserRole, string> = {
  analyst: 'AML Analyst',
  investigator: 'Investigator',
  principal_officer: 'Principal Officer',
  compliance: 'Compliance',
  super_admin: 'Super Admin',
};

export function SLASettingsTab({ isReadOnly }: SLASettingsTabProps) {
  const [settings, setSettings] = useState(mockPlatformSettings.sla);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleThresholdChange = (
    priority: 'high' | 'medium' | 'low',
    field: 'resolutionHours' | 'warningPercent' | 'breachPercent',
    value: number
  ) => {
    setSettings({
      ...settings,
      thresholds: settings.thresholds.map((t) =>
        t.priority === priority ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleQueueOverrideChange = (
    queueId: string,
    field: 'resolutionHours' | 'warningPercent' | 'breachPercent' | 'enabled',
    value: number | boolean
  ) => {
    setSettings({
      ...settings,
      queueOverrides: settings.queueOverrides.map((q) =>
        q.queueId === queueId ? { ...q, [field]: value } : q
      ),
    });
  };

  const handleEscalationRoleToggle = (role: UserRole) => {
    const currentRoles = settings.escalationNotifyRoles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    setSettings({ ...settings, escalationNotifyRoles: newRoles });
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    toast.success('SLA settings saved successfully');
    setShowConfirmDialog(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Priority-based SLA Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Thresholds by Priority
          </CardTitle>
          <CardDescription>
            Define resolution times and warning thresholds based on FinCrisS Priority level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[150px]">Priority</TableHead>
                  <TableHead>Resolution Time (Hours)</TableHead>
                  <TableHead>Warning at (%)</TableHead>
                  <TableHead>Breach at (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.thresholds.map((threshold) => (
                  <TableRow key={threshold.priority}>
                    <TableCell>
                      <Badge className={getPriorityColor(threshold.priority)}>
                        {threshold.priority.charAt(0).toUpperCase() + threshold.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={threshold.resolutionHours}
                        onChange={(e) =>
                          handleThresholdChange(
                            threshold.priority,
                            'resolutionHours',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24"
                        disabled={isReadOnly}
                        min={1}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={threshold.warningPercent}
                          onChange={(e) =>
                            handleThresholdChange(
                              threshold.priority,
                              'warningPercent',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-24"
                          disabled={isReadOnly}
                          min={1}
                          max={99}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={threshold.breachPercent}
                          onChange={(e) =>
                            handleThresholdChange(
                              threshold.priority,
                              'breachPercent',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-24"
                          disabled={isReadOnly}
                          min={1}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Queue-level SLA Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Queue SLA Overrides
          </CardTitle>
          <CardDescription>
            Queue-specific SLA settings take precedence over priority-based thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Queue</TableHead>
                  <TableHead className="w-[80px]">Enabled</TableHead>
                  <TableHead>Resolution (Hours)</TableHead>
                  <TableHead>Warning (%)</TableHead>
                  <TableHead>Breach (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.queueOverrides.map((override) => (
                  <TableRow key={override.queueId}>
                    <TableCell className="font-medium">{override.queueName}</TableCell>
                    <TableCell>
                      <Switch
                        checked={override.enabled}
                        onCheckedChange={(checked) =>
                          handleQueueOverrideChange(override.queueId, 'enabled', checked)
                        }
                        disabled={isReadOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={override.resolutionHours}
                        onChange={(e) =>
                          handleQueueOverrideChange(
                            override.queueId,
                            'resolutionHours',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24"
                        disabled={isReadOnly || !override.enabled}
                        min={1}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={override.warningPercent}
                        onChange={(e) =>
                          handleQueueOverrideChange(
                            override.queueId,
                            'warningPercent',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24"
                        disabled={isReadOnly || !override.enabled}
                        min={1}
                        max={99}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={override.breachPercent}
                        onChange={(e) =>
                          handleQueueOverrideChange(
                            override.queueId,
                            'breachPercent',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24"
                        disabled={isReadOnly || !override.enabled}
                        min={1}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Breach Escalation</CardTitle>
          <CardDescription>
            Configure which roles are notified when an SLA breach occurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Notify on SLA Breach:</Label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.entries(roleLabels) as [UserRole, string][]).map(([role, label]) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`escalate-${role}`}
                    checked={settings.escalationNotifyRoles.includes(role)}
                    onCheckedChange={() => handleEscalationRoleToggle(role)}
                    disabled={isReadOnly}
                  />
                  <label
                    htmlFor={`escalate-${role}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save SLA Settings
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm SLA Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update SLA thresholds and escalation settings. 
              These changes will affect alert processing and notifications immediately.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
