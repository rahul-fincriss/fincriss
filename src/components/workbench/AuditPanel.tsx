import { X, History, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkbenchAuditEntry, UserPriority } from '@/types';
import { format } from 'date-fns';

interface AuditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerId: string;
  auditEntries: WorkbenchAuditEntry[];
}

const priorityLabels: Record<UserPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

const priorityColors: Record<UserPriority, string> = {
  urgent: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-risk-high/20 text-risk-high border-risk-high/30',
  medium: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30',
  low: 'bg-risk-low/20 text-risk-low border-risk-low/30',
  none: 'bg-muted text-muted-foreground border-border',
};

function ActionIcon({ action }: { action: WorkbenchAuditEntry['action'] }) {
  switch (action) {
    case 'priority_change':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'analyst_assignment':
    case 'analyst_reassignment':
      return <UserCheck className="h-4 w-4 text-primary" />;
    default:
      return <History className="h-4 w-4 text-muted-foreground" />;
  }
}

function ActionLabel({ action }: { action: WorkbenchAuditEntry['action'] }) {
  switch (action) {
    case 'priority_change':
      return 'Priority Override';
    case 'analyst_assignment':
      return 'Analyst Assigned';
    case 'analyst_reassignment':
      return 'Analyst Reassigned';
    default:
      return action;
  }
}

export function AuditPanel({ open, onOpenChange, customerName, customerId, auditEntries }: AuditPanelProps) {
  const sortedEntries = [...auditEntries].sort(
    (a, b) => b.performedAt.getTime() - a.performedAt.getTime()
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log
          </SheetTitle>
          <SheetDescription>
            <span className="font-medium text-foreground">{customerName}</span>
            <span className="font-mono text-xs ml-2">({customerId})</span>
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-180px)]">
          {sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ActionIcon action={entry.action} />
                      <span className="font-medium text-sm">
                        <ActionLabel action={entry.action} />
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(entry.performedAt, 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>

                  {entry.action === 'priority_change' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className={priorityColors[(entry.previousValue as UserPriority) || 'none']}
                      >
                        {priorityLabels[(entry.previousValue as UserPriority) || 'none']}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className={priorityColors[(entry.newValue as UserPriority) || 'none']}
                      >
                        {priorityLabels[(entry.newValue as UserPriority) || 'none']}
                      </Badge>
                    </div>
                  )}

                  {(entry.action === 'analyst_assignment' || entry.action === 'analyst_reassignment') && (
                    <div className="flex items-center gap-2 text-sm">
                      {entry.previousValue && (
                        <>
                          <span className="text-muted-foreground">{entry.previousValue}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                      <span className="font-medium">{entry.newValue}</span>
                    </div>
                  )}

                  {entry.category && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Category:</span> {entry.category}
                    </div>
                  )}

                  {entry.reason && (
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                      "{entry.reason}"
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    by <span className="font-medium text-foreground">{entry.performedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
