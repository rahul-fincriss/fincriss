import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Send, XCircle, Filter, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockRawAlerts } from '@/data/mockData';
import { RawAlert } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const alertTypeLabels: Record<string, string> = {
  large_cash: 'Large Cash',
  structuring: 'Structuring',
  rapid_movement: 'Rapid Movement',
  geo_anomaly: 'Geo Anomaly',
  behavior_deviation: 'Behavior Deviation',
  smurfing: 'Smurfing',
};

export default function RawAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<RawAlert[]>(mockRawAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<RawAlert | null>(null);
  const [showPayloadDialog, setShowPayloadDialog] = useState(false);
  const [showDropDialog, setShowDropDialog] = useState(false);
  const [dropReason, setDropReason] = useState('');

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewPayload = (alert: RawAlert) => {
    setSelectedAlert(alert);
    setShowPayloadDialog(true);
  };

  const handleDropAlert = (alert: RawAlert) => {
    setSelectedAlert(alert);
    setShowDropDialog(true);
  };

  const confirmDrop = () => {
    if (!dropReason.trim()) {
      toast.error('Please provide a reason for dropping this alert');
      return;
    }

    setAlerts(alerts.map((a) =>
      a.id === selectedAlert?.id ? { ...a, status: 'dropped' as const } : a
    ));
    toast.success('Alert dropped successfully');
    setShowDropDialog(false);
    setDropReason('');
    setSelectedAlert(null);
  };

  const handleSendToMAPS = (alert: RawAlert) => {
    setAlerts(alerts.map((a) =>
      a.id === alert.id ? { ...a, status: 'sent_to_maps' as const } : a
    ));
    toast.success('Alert sent to MAPS processing');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Raw Alert Intake</h1>
            <p className="text-muted-foreground">
              Review alerts exactly as received from bank systems. No AI processing applied.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-risk-high border-risk-high">
              {alerts.filter((a) => a.status === 'new').length} New
            </Badge>
            <Badge variant="outline" className="text-status-in-progress border-status-in-progress">
              {alerts.filter((a) => a.status === 'in_review').length} In Review
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Alerts Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Alert ID</TableHead>
                <TableHead>Source System</TableHead>
                <TableHead>Alert Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className="table-row-interactive">
                  <TableCell className="font-mono text-sm">{alert.id}</TableCell>
                  <TableCell>{alert.sourceSystem}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {alertTypeLabels[alert.alertType] || alert.alertType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{alert.customerName}</p>
                      <p className="text-xs text-muted-foreground">{alert.customerId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {alert.amount.toLocaleString()} {alert.currency}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(alert.timestamp, 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={alert.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewPayload(alert)}
                        title="View raw payload"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {alert.status !== 'dropped' && alert.status !== 'sent_to_maps' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDropAlert(alert)}
                            title="Drop alert"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary"
                            onClick={() => handleSendToMAPS(alert)}
                            title="Send to MAPS"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Raw Payload Dialog */}
        <Dialog open={showPayloadDialog} onOpenChange={setShowPayloadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono">{selectedAlert?.id}</DialogTitle>
              <DialogDescription>
                Raw alert payload as received from {selectedAlert?.sourceSystem}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm font-mono overflow-auto max-h-96">
                {JSON.stringify(selectedAlert?.rawPayload, null, 2)}
              </pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayloadDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drop Alert Dialog */}
        <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Drop Alert</DialogTitle>
              <DialogDescription>
                Please provide a mandatory reason for dropping alert {selectedAlert?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for dropping this alert (required)..."
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                This action will be recorded in the audit trail.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDropDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDrop}>
                Confirm Drop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
