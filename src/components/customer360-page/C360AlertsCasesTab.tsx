import { Customer360Profile } from '@/services/customer360.service';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface Props {
  profile: Customer360Profile;
}

function severityColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'CRITICAL': return 'bg-risk-high text-white';
    case 'HIGH': return 'bg-orange-600 text-white';
    case 'MEDIUM': return 'bg-risk-medium text-risk-medium-foreground';
    case 'LOW': return 'bg-risk-low text-risk-low-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function caseStatusColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'OPEN': return 'bg-status-info/20 text-status-info border-status-info/30';
    case 'IN_PROGRESS': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
    case 'STR_DRAFT': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'UNDER_REVIEW': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'CLOSED': return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    case 'CLOSED_FALSE_POSITIVE': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function scenarioColor(s: string) {
  const colors: Record<string, string> = {
    STRUCTURING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    HAWALA: 'bg-risk-high/20 text-risk-high border-risk-high/30',
    PEP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    MONEY_MULE: 'bg-risk-high/20 text-risk-high border-risk-high/30',
    RAPID_MOVEMENT: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30',
    INVESTMENT_FRAUD: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[s?.toUpperCase()] || 'bg-muted text-muted-foreground border-border';
}

function PriorityBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-risk-high' : score >= 50 ? 'bg-risk-medium' : 'bg-risk-low';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-mono">{score}</span>
    </div>
  );
}

export function C360AlertsCasesTab({ profile }: Props) {
  const navigate = useNavigate();
  const alerts = profile.alerts || [];
  const cases = profile.cases || [];

  return (
    <div className="space-y-4">
      {/* Alerts */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Alerts ({alerts.length})</h3>
        {alerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No alerts found</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                <th className="text-left py-1.5 font-medium">Alert ID</th>
                <th className="text-left py-1.5 font-medium">Date</th>
                <th className="text-left py-1.5 font-medium">Scenario</th>
                <th className="text-left py-1.5 font-medium">Severity</th>
                <th className="text-right py-1.5 font-medium">Amount</th>
                <th className="text-left py-1.5 font-medium">Priority</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-left py-1.5 font-medium">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-accent/30 cursor-pointer"
                  onClick={() => navigate(`/alerts/${a.alert_id}`)}
                >
                  <td className="py-1.5 font-mono text-primary">{a.alert_id}</td>
                  <td className="py-1.5">{a.date}</td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', scenarioColor(a.scenario))}>{a.scenario}</span>
                  </td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', severityColor(a.severity))}>{a.severity}</span>
                  </td>
                  <td className="py-1.5 text-right font-mono">{formatINR(a.amount)}</td>
                  <td className="py-1.5"><PriorityBar score={a.priority_score} /></td>
                  <td className="py-1.5">{a.status}</td>
                  <td className="py-1.5">{a.assigned_to || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cases */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cases ({cases.length})</h3>
        {cases.length === 0 ? (
          <p className="text-xs text-muted-foreground">No cases found</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                <th className="text-left py-1.5 font-medium">Case #</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-left py-1.5 font-medium">Priority</th>
                <th className="text-left py-1.5 font-medium">Investigator</th>
                <th className="text-left py-1.5 font-medium">Opened</th>
                <th className="text-left py-1.5 font-medium">Closed</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-accent/30 cursor-pointer"
                  onClick={() => navigate(`/cases/${c.case_number}`)}
                >
                  <td className="py-1.5 font-mono text-primary">{c.case_number}</td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', caseStatusColor(c.status))}>{c.status}</span>
                  </td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', severityColor(c.priority))}>{c.priority}</span>
                  </td>
                  <td className="py-1.5">{c.assigned_investigator || '—'}</td>
                  <td className="py-1.5">{c.opened_date}</td>
                  <td className="py-1.5">{c.closed_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
