import { Customer360Profile } from '@/services/customer360.service';
import { formatINR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { User, MapPin, Phone, Mail, TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Eye } from 'lucide-react';

interface Props {
  profile: Customer360Profile;
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

function RiskGauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 80 ? 'bg-risk-high' : pct >= 50 ? 'bg-risk-medium' : 'bg-risk-low';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span className="font-semibold text-foreground text-sm">{score}</span>
        <span>100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn('text-xs font-medium mt-0.5', mono && 'font-mono')}>{value ?? '—'}</p>
    </div>
  );
}

function FlagIndicator({ active, label, icon: Icon }: { active: boolean; label: string; icon: any }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border',
      active ? 'bg-risk-high/10 text-risk-high border-risk-high/30' : 'bg-muted/50 text-muted-foreground border-border'
    )}>
      <Icon className="h-3 w-3" />
      {label}: {active ? 'YES' : 'NO'}
    </div>
  );
}

export function C360OverviewTab({ profile }: Props) {
  const isOverdue = profile.next_kyc_review_due && new Date(profile.next_kyc_review_due) < new Date();

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Column 1 — Core Profile */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> Core Profile
        </h3>
        <div className="panel-section space-y-3">
          <Field label="Full Name" value={profile.full_name} />
          {profile.display_name && <Field label="Display Name" value={profile.display_name} />}
          {profile.aliases && profile.aliases.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Aliases</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {profile.aliases.map((a: any, i: number) => (
                  <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    {typeof a === 'string' ? a : a.alias_value || a.alias_type || JSON.stringify(a)}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Field label={profile.party_type === 'individual' ? 'Date of Birth' : 'Incorporation Date'} value={profile.date_of_birth || profile.incorporation_date} />
          <Field label="Nationality" value={profile.nationality} />
          <Field label="Residency" value={profile.residency_country} />
          <Field label="Tax Residency" value={profile.tax_residency} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Occupation / Industry</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-medium">{profile.occupation || profile.industry || '—'}</span>
              {profile.industry_risk_level && ['HIGH', 'CRITICAL'].includes(profile.industry_risk_level.toUpperCase()) && (
                <span className="text-[9px] bg-risk-high/20 text-risk-high px-1 rounded">HIGH RISK</span>
              )}
            </div>
          </div>
          <Field label="Customer Since" value={profile.customer_since} />
          <Field label="Relationship Manager" value={profile.relationship_manager} />
        </div>
      </div>

      {/* Column 2 — Contact & Address */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Contact & Address
        </h3>
        <div className="panel-section space-y-3">
          {profile.primary_address ? (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Primary Address</p>
              <p className="text-xs mt-0.5">
                {profile.primary_address.line1}
                {profile.primary_address.line2 && <>, {profile.primary_address.line2}</>}<br />
                {profile.primary_address.city}, {profile.primary_address.state} - {profile.primary_address.pin}<br />
                {profile.primary_address.country}
              </p>
            </div>
          ) : (
            <Field label="Address" value="—" />
          )}
          {profile.phone_numbers && profile.phone_numbers.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone Numbers</p>
              {profile.phone_numbers.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{p.number} ({p.type})</span>
                  {p.verified && <span className="text-[9px] text-risk-low">✓</span>}
                </div>
              ))}
            </div>
          )}
          {profile.email_addresses && profile.email_addresses.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
              {profile.email_addresses.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{e.email}</span>
                  {e.verified && <span className="text-[9px] text-risk-low">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 3 — Risk Snapshot */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> Risk Snapshot
        </h3>
        <div className="panel-section space-y-3">
          <RiskGauge score={profile.risk_score} />
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded', riskColor(profile.risk_rating))}>
              {profile.risk_rating}
            </span>
            {profile.last_risk_assessed && (
              <span className="text-[10px] text-muted-foreground">Last assessed: {profile.last_risk_assessed}</span>
            )}
          </div>

          {/* Rating history sparkline */}
          {profile.risk_rating_history && profile.risk_rating_history.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Rating History</p>
              <div className="flex items-center gap-1 flex-wrap">
                {profile.risk_rating_history.map((h, i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    <span className={cn('px-1 py-0.5 text-[8px] font-bold rounded', riskColor(h.rating))}>{h.rating}</span>
                    {i < profile.risk_rating_history!.length - 1 && <span className="text-[10px] text-muted-foreground">→</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Next KYC Review</p>
            <p className={cn('text-xs font-medium mt-0.5', isOverdue && 'text-risk-high font-bold')}>
              {profile.next_kyc_review_due || '—'}
              {isOverdue && <span className="ml-1 text-[9px]">⚠ OVERDUE</span>}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <FlagIndicator active={profile.is_pep} label="PEP" icon={User} />
            <FlagIndicator active={profile.is_sanctioned} label="Sanctions" icon={Shield} />
            <FlagIndicator active={profile.is_watchlisted} label="Watchlist" icon={Eye} />
          </div>
        </div>
      </div>
    </div>
  );
}
