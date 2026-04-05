import { useState } from 'react';
import { Customer360Profile } from '@/services/customer360.service';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  profile: Customer360Profile;
}

function statusColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'VERIFIED': return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    case 'PENDING': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
    case 'FAILED': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
    case 'EXPIRED': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function C360IdentityTab({ profile }: Props) {
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleReveal = (idx: number) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const ids = profile.government_ids || [];
  const owners = profile.beneficial_owners || [];
  const showOwners = profile.party_type === 'business' || profile.party_type === 'trust';

  return (
    <div className={cn('gap-4', showOwners ? 'grid grid-cols-2' : '')}>
      {/* Government Identifiers */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Government Identifiers</h3>
        {ids.length === 0 ? (
          <p className="text-xs text-muted-foreground">No identifiers on file</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                <th className="text-left py-1.5 font-medium">Type</th>
                <th className="text-left py-1.5 font-medium">ID Number</th>
                <th className="text-left py-1.5 font-medium">Country</th>
                <th className="text-left py-1.5 font-medium">Expiry</th>
                <th className="text-left py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-1.5 font-medium">{id.type}</td>
                  <td className="py-1.5 font-mono">
                    <span className="inline-flex items-center gap-1">
                      {revealedIds.has(i) ? id.id_number : id.id_number.replace(/./g, '•').slice(0, 8) + id.id_number.slice(-4)}
                      <button onClick={() => toggleReveal(i)} className="text-muted-foreground hover:text-foreground">
                        {revealedIds.has(i) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </span>
                  </td>
                  <td className="py-1.5">{id.issuing_country}</td>
                  <td className="py-1.5">{id.expiry_date || '—'}</td>
                  <td className="py-1.5">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', statusColor(id.verification_status))}>
                      {id.verification_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Beneficial Owners */}
      {showOwners && (
        <div className="panel-section">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Beneficial Owners</h3>
          {owners.length === 0 ? (
            <p className="text-xs text-muted-foreground">No beneficial owners recorded</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left py-1.5 font-medium">Name</th>
                  <th className="text-left py-1.5 font-medium">Relationship</th>
                  <th className="text-right py-1.5 font-medium">Own%</th>
                  <th className="text-right py-1.5 font-medium">Ctrl%</th>
                  <th className="text-left py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-1.5">
                      {o.related_customer_id ? (
                        <span className="text-primary cursor-pointer hover:underline inline-flex items-center gap-0.5">
                          {o.name} <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      ) : o.name}
                    </td>
                    <td className="py-1.5">{o.relationship_type}</td>
                    <td className="py-1.5 text-right">{o.ownership_pct}%</td>
                    <td className="py-1.5 text-right">{o.control_pct}%</td>
                    <td className="py-1.5">
                      <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', statusColor(o.verification_status))}>
                        {o.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
