import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Save, Archive, History, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { mockPlatformSettings, mockSettingsAuditLog } from '@/data/adminMockData';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuditRetentionSettingsTabProps {
  isReadOnly: boolean;
}

const retentionFields = [
  { key: 'auditLogDays' as const, label: 'Audit Logs', description: 'System and user action logs' },
  { key: 'alertRetentionDays' as const, label: 'Alerts', description: 'Alert records and history' },
  { key: 'caseRetentionDays' as const, label: 'Cases', description: 'Case investigation records' },
  { key: 'strRetentionDays' as const, label: 'STR Records', description: 'Suspicious Transaction Reports' },
];

const daysToYears = (days: number): string => {
  const years = days / 365;
  if (years >= 1) {
    return `~${years.toFixed(1)} years`;
  }
  return `${days} days`;
};

export function AuditRetentionSettingsTab({ isReadOnly }: AuditRetentionSettingsTabProps) {
  const [settings, setSettings] = useState(mockPlatformSettings.retention);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleChange = (key: keyof typeof settings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    toast.success('Retention settings saved successfully');
    setShowConfirmDialog(false);
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'general':
        return 'General';
      case 'queue_routing':
        return 'Queues & Routing';
      case 'sla':
        return 'SLA & Escalations';
      case 'notifications':
        return 'Notifications';
      case 'retention':
        return 'Audit & Retention';
      default:
        return section;
    }
  };

  return (
    <div className="space-y-6">
      {/* Read-only notice for compliance */}
      {isReadOnly && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have read-only access to audit and retention settings. This confirms your compliance review access.
          </AlertDescription>
        </Alert>
      )}

      {/* Retention Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Data Retention Periods
          </CardTitle>
          <CardDescription>
            Configure how long different record types are retained for regulatory compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {retentionFields.map((field) => (
              <div key={field.key} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{field.label}</Label>
                  <Badge variant="outline">{daysToYears(settings[field.key])}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{field.description}</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, parseInt(e.target.value) || 0)
                    }
                    className="w-32"
                    disabled={isReadOnly}
                    min={30}
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Retention periods should comply with local regulatory requirements. 
              STR records typically require 10-year retention. Consult your compliance team before making changes.
            </p>
          </div>

          {/* Save button */}
          {!isReadOnly && (
            <div className="flex justify-end pt-4 mt-4 border-t">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Change Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Settings Change History
          </CardTitle>
          <CardDescription>
            Audit trail of all settings modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSettingsAuditLog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No settings changes recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  mockSettingsAuditLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span>{format(entry.performedAt, 'MMM d, yyyy')}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(entry.performedAt, 'HH:mm:ss')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSectionLabel(entry.section)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {entry.field}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {entry.previousValue}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                            {entry.newValue}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{entry.performedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Retention Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update data retention periods. These changes affect how long records are kept 
              and may have regulatory implications. Please ensure compliance before proceeding.
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
