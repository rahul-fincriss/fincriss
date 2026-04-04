import { useState } from 'react';
import { Copy, Check, FileCode, Clock, Database, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PrioritizedAlert, RawAlert } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface RawAlertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: PrioritizedAlert | RawAlert | null;
  onAuditLog?: (alertId: string, userId: string, userName: string) => void;
}

export function RawAlertDrawer({
  open,
  onOpenChange,
  alert,
  onAuditLog,
}: RawAlertDrawerProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Log audit event when drawer opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && alert && user && onAuditLog) {
      onAuditLog(alert.id, user.id, user.name);
    }
    onOpenChange(isOpen);
  };

  if (!alert) return null;

  const safeFormatDate = (date: any) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '—';
      return format(d, 'PPpp');
    } catch {
      return '—';
    }
  };

  const rawPayload = JSON.stringify(alert.rawPayload, null, 2);

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(rawPayload);
      setCopied(true);
      toast.success('Raw payload copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg w-full">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <SheetTitle>Raw Alert Payload</SheetTitle>
          </div>
          <SheetDescription>
            Original alert data as received from source systems (read-only)
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Header Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileCode className="h-3 w-3" />
                Alert ID
              </p>
              <p className="font-mono text-sm font-medium">{alert.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Database className="h-3 w-3" />
                Source System
              </p>
              <Badge variant="secondary" className="font-mono text-xs">
                {alert.sourceSystem}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Timestamp
              </p>
              <p className="text-sm">{format(alert.timestamp, 'PPpp')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Customer ID
              </p>
              <p className="font-mono text-sm">{alert.customerId}</p>
            </div>
          </div>

          <Separator />

          {/* Alert Type & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Alert Type</p>
              <Badge variant="outline" className="capitalize">
                {alert.alertType.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="font-mono text-sm font-medium">
                {alert.amount.toLocaleString()} {alert.currency}
              </p>
            </div>
          </div>

          <Separator />

          {/* Raw Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Raw Payload</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleCopyPayload}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[300px] rounded-lg border border-border bg-muted/30">
              <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                {rawPayload}
              </pre>
            </ScrollArea>
          </div>

          {/* Read-only notice */}
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">⚠️ Read-only:</span> This is the original alert data 
              exactly as received from the source system. No modifications are permitted.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
