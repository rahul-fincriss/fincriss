import { useState } from 'react';
import { Customer360Profile } from '@/services/customer360.service';
import { cn } from '@/lib/utils';

interface Props {
  profile: Customer360Profile;
}

function screeningStatusColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'CLEAR': return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    case 'POTENTIAL_MATCH': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
    case 'CONFIRMED_MATCH': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
    case 'FALSE_POSITIVE': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function watchlistStatusColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'ACTIVE': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
    case 'EXPIRED': return 'bg-muted text-muted-foreground border-border';
    case 'REMOVED': return 'bg-muted text-muted-foreground border-border line-through';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function C360ScreeningTab({ profile }: Props) {
  const [statusFilter, setStatusFilter] = useState('all');
  const screening = profile.screening_results || [];
  const watchlists = profile.watchlist_entries || [];

  const filteredScreening = statusFilter === 'all'
    ? screening
    : screening.filter(s => s.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* Sanctions & PEP Screening */}
      <div className="panel-section">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sanctions & PEP Screening</h3>
          <div className="flex gap-1">
            {['all', 'CLEAR', 'POTENTIAL_MATCH', 'CONFIRMED_MATCH', 'FALSE_POSITIVE'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2 py-0.5 text-[9px] font-medium rounded border transition-colors',
                  statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent'
                )}
              >
                {s === 'all' ? 'ALL' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        {filteredScreening.length === 0 ? (
          <p className="text-xs text-muted-foreground">No screening results</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                <th className="text-left py-1.5 font-medium">Screened At</th>
                <th className="text-left py-1.5 font-medium">Type</th>
                <th className="text-left py-1.5 font-medium">Provider</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-left py-1.5 font-medium">Matched Entity</th>
                <th className="text-left py-1.5 font-medium">List</th>
                <th className="text-right py-1.5 font-medium">Match %</th>
              </tr>
            </thead>
            <tbody>
              {filteredScreening.map((s, i) => (
                <tr key={i} className={cn('border-b border-border/50 hover:bg-accent/30', s.status === 'CONFIRMED_MATCH' && 'bg-risk-high/5')}>
                  <td className="py-1.5">{s.screened_at}</td>
                  <td className="py-1.5">{s.type}</td>
                  <td className="py-1.5">{s.provider}</td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', screeningStatusColor(s.status))}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-1.5">{s.matched_entity_name || '—'}</td>
                  <td className="py-1.5">{s.list_name || '—'}</td>
                  <td className="py-1.5 text-right font-mono">{s.match_score != null ? `${s.match_score}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Watchlist Entries */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Watchlist Entries</h3>
        {watchlists.length === 0 ? (
          <p className="text-xs text-muted-foreground">No watchlist entries</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                <th className="text-left py-1.5 font-medium">Type</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-left py-1.5 font-medium">Reason</th>
                <th className="text-left py-1.5 font-medium">Added</th>
                <th className="text-left py-1.5 font-medium">Start</th>
                <th className="text-left py-1.5 font-medium">End</th>
              </tr>
            </thead>
            <tbody>
              {watchlists.map((w, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-1.5">{w.watchlist_type}</td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', watchlistStatusColor(w.status))}>{w.status}</span>
                  </td>
                  <td className="py-1.5">{w.reason}</td>
                  <td className="py-1.5">{w.added_date}</td>
                  <td className="py-1.5">{w.start_date || '—'}</td>
                  <td className="py-1.5">{w.end_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
