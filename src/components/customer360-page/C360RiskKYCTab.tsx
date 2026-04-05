import { Customer360Profile } from '@/services/customer360.service';
import { cn } from '@/lib/utils';

interface Props {
  profile: Customer360Profile;
}

function statusColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'VERIFIED': return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    case 'PENDING': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
    case 'EXPIRED': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
    case 'FAILED': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function riskColor(rating: string) {
  switch (rating?.toUpperCase()) {
    case 'CRITICAL': return 'bg-risk-high text-white';
    case 'HIGH': return 'bg-orange-600 text-white';
    case 'MEDIUM': return 'bg-risk-medium text-risk-medium-foreground';
    case 'LOW': return 'bg-risk-low text-risk-low-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function C360RiskKYCTab({ profile }: Props) {
  const isOverdue = profile.next_kyc_due && new Date(profile.next_kyc_due) < new Date();
  const docs = profile.kyc_documents || [];
  const assessments = profile.risk_assessments || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {/* KYC Profile - left 40% */}
        <div className="col-span-2 panel-section space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KYC Profile</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC Level</span>
              <span className="font-medium">{profile.kyc_level || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Onboarding Method</span>
              <span className="font-medium">{profile.onboarding_method || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CDD Type</span>
              <span className="font-medium">{profile.cdd_type || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Refresh</span>
              <span className="font-medium">{profile.last_kyc_refresh || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Due</span>
              <span className={cn('font-medium', isOverdue && 'text-risk-high font-bold')}>
                {profile.next_kyc_due || '—'} {isOverdue && '⚠ OVERDUE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Relationship Purpose</span>
              <span className="font-medium">{profile.relationship_purpose || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source of Funds</span>
              <span className="font-medium">{profile.source_of_funds || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source of Wealth</span>
              <span className="font-medium">{profile.source_of_wealth || '—'}</span>
            </div>
            <div className="pt-2 flex flex-col gap-1">
              <div className={cn('flex items-center gap-1.5 text-[10px] font-medium', profile.is_pep ? 'text-risk-high' : 'text-muted-foreground')}>
                <span className={cn('w-2 h-2 rounded-full', profile.is_pep ? 'bg-risk-high' : 'bg-muted-foreground/30')} />
                PEP: {profile.is_pep ? 'YES' : 'NO'}
              </div>
              <div className={cn('flex items-center gap-1.5 text-[10px] font-medium', profile.adverse_media_flag ? 'text-risk-high' : 'text-muted-foreground')}>
                <span className={cn('w-2 h-2 rounded-full', profile.adverse_media_flag ? 'bg-risk-high' : 'bg-muted-foreground/30')} />
                Adverse Media: {profile.adverse_media_flag ? 'YES' : 'NO'}
              </div>
              <div className={cn('flex items-center gap-1.5 text-[10px] font-medium', profile.high_risk_jurisdiction_flag ? 'text-risk-medium' : 'text-muted-foreground')}>
                <span className={cn('w-2 h-2 rounded-full', profile.high_risk_jurisdiction_flag ? 'bg-risk-medium' : 'bg-muted-foreground/30')} />
                High-Risk Jurisdiction: {profile.high_risk_jurisdiction_flag ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>

        {/* KYC Documents - right 60% */}
        <div className="col-span-3 panel-section">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">KYC Documents</h3>
          {docs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No documents on file</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left py-1.5 font-medium">Type</th>
                  <th className="text-left py-1.5 font-medium">Number</th>
                  <th className="text-left py-1.5 font-medium">Authority</th>
                  <th className="text-left py-1.5 font-medium">Country</th>
                  <th className="text-left py-1.5 font-medium">Method</th>
                  <th className="text-left py-1.5 font-medium">Expiry</th>
                  <th className="text-left py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-1.5">{d.document_type}</td>
                    <td className="py-1.5 font-mono text-[10px]">{d.document_number}</td>
                    <td className="py-1.5">{d.issuing_authority}</td>
                    <td className="py-1.5">{d.country}</td>
                    <td className="py-1.5">{d.verification_method}</td>
                    <td className="py-1.5">{d.expiry || '—'}</td>
                    <td className="py-1.5">
                      <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', statusColor(d.verification_status))}>
                        {d.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Risk Assessment History */}
      <div className="panel-section">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Assessment History</h3>
        {assessments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No assessment history available</p>
        ) : (
          <>
            {/* Timeline visualization */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
              {assessments.map((a, i) => (
                <div key={i} className="flex items-center gap-1 shrink-0">
                  <div className="text-center">
                    <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded block', riskColor(a.rating))}>{a.rating}</span>
                    <span className="text-[8px] text-muted-foreground block mt-0.5">{a.date}</span>
                  </div>
                  {i < assessments.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                </div>
              ))}
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left py-1.5 font-medium">Date</th>
                  <th className="text-left py-1.5 font-medium">Rating</th>
                  <th className="text-right py-1.5 font-medium">Score</th>
                  <th className="text-left py-1.5 font-medium">Previous</th>
                  <th className="text-left py-1.5 font-medium">Review Type</th>
                  <th className="text-left py-1.5 font-medium">Model</th>
                  <th className="text-left py-1.5 font-medium">Reviewer</th>
                  <th className="text-left py-1.5 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-1.5">{a.date}</td>
                    <td className="py-1.5">
                      <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', riskColor(a.rating))}>{a.rating}</span>
                    </td>
                    <td className="py-1.5 text-right font-mono">{a.score}</td>
                    <td className="py-1.5">
                      {a.previous_rating ? (
                        <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', riskColor(a.previous_rating))}>{a.previous_rating}</span>
                      ) : '—'}
                    </td>
                    <td className="py-1.5">{a.review_type}</td>
                    <td className="py-1.5">{a.model || '—'}</td>
                    <td className="py-1.5">{a.reviewer || '—'}</td>
                    <td className="py-1.5 max-w-[200px] truncate">{a.rationale || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
