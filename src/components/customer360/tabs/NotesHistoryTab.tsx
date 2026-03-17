import { AlertTriangle, FileText, MessageSquare, User, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ExtendedCustomerProfile } from '@/types';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { formatINRFull } from '@/lib/formatters';

interface NotesHistoryTabProps {
  customerProfile: ExtendedCustomerProfile;
}

export function NotesHistoryTab({ customerProfile }: NotesHistoryTabProps) {
  const { priorAlerts, priorCases, priorSTRs, investigatorNotes } = customerProfile;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{priorAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Prior Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{priorCases.length}</p>
              <p className="text-xs text-muted-foreground">Prior Cases</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-risk-high">{priorSTRs.length}</p>
              <p className="text-xs text-muted-foreground">STRs Filed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prior Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Prior Alerts</CardTitle>
          </div>
          <CardDescription>Historical alerts for this customer</CardDescription>
        </CardHeader>
        <CardContent>
          {priorAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No prior alerts</p>
          ) : (
            <div className="space-y-3">
              {priorAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-3 px-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-medium">{alert.id}</p>
                        <RiskBadge level={alert.riskLevel} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(alert.date, 'MMM dd, yyyy')} • {alert.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.resolution.includes('Case') ? 'default' : 'secondary'} className="text-xs">
                      {alert.resolution}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">by {alert.resolvedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prior Cases */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Prior Cases</CardTitle>
          </div>
          <CardDescription>Investigation cases involving this customer</CardDescription>
        </CardHeader>
        <CardContent>
          {priorCases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No prior cases</p>
          ) : (
            <div className="space-y-3">
              {priorCases.map((caseItem) => (
                <div key={caseItem.id} className="py-3 px-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-medium">{caseItem.id}</p>
                      <Badge variant="outline" className="text-xs capitalize">{caseItem.status}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(caseItem.date, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {caseItem.linkedAlerts} linked alerts
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="badge-risk-high text-xs">{caseItem.outcome}</Badge>
                      {caseItem.strId && (
                        <span className="text-xs font-mono text-muted-foreground">{caseItem.strId}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Investigator: {caseItem.investigator}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prior STRs */}
      {priorSTRs.length > 0 && (
        <Card className="border-risk-high/30 bg-risk-high/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-risk-high" />
              <CardTitle className="text-sm font-medium">Previous STRs</CardTitle>
            </div>
            <CardDescription>Suspicious Transaction Reports filed for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorSTRs.map((str) => (
                <div key={str.id} className="py-3 px-3 rounded-lg border border-risk-high/20 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-mono font-medium">{str.id}</p>
                    <Badge variant="destructive" className="text-xs">{str.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Filed Date</p>
                      <p>{format(str.filedDate, 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-mono">{formatINRFull(str.amount)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">FIU Reference</p>
                      <p className="font-mono text-xs">{str.fiuReference}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investigator Notes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Investigator Notes</CardTitle>
          </div>
          <CardDescription>Notes from previous investigations</CardDescription>
        </CardHeader>
        <CardContent>
          {investigatorNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No investigator notes</p>
          ) : (
            <div className="space-y-4">
              {investigatorNotes.map((note, idx) => (
                <div key={note.id}>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{note.author}</span>
                        <Badge variant="outline" className="text-xs">{note.role}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(note.date, 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  </div>
                  {idx < investigatorNotes.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read-Only Notice */}
      <div className="rounded-lg bg-muted/50 border px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          This view is read-only. Notes can be added from the Case Workspace.
        </p>
      </div>
    </div>
  );
}