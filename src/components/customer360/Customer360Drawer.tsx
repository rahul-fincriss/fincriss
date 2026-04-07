import { X, User, AlertTriangle, Shield, MapPin, CreditCard, Globe, FileCheck, Activity, TrendingUp, TrendingDown, Building2, IdCard, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { PrioritizedAlert } from '@/types';
import { useCustomer360 } from '@/hooks/useCustomer360';
import { useState } from 'react';
import { format } from 'date-fns';
import { formatINRFull } from '@/lib/formatters';

interface Customer360DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  alert: PrioritizedAlert;
}

function safe(val: any, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val);
}

function safeDate(val: any) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM yyyy');
  } catch { return '—'; }
}

function riskColor(level: string): string {
  switch ((level || '').toUpperCase()) {
    case 'HIGH': case 'CRITICAL': return 'bg-risk-high text-white';
    case 'MEDIUM': return 'bg-risk-medium text-risk-medium-foreground';
    case 'LOW': return 'bg-risk-low text-risk-low-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 mr-4">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[65%] break-words">{safe(value)}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">{children}</CardContent>
    </Card>
  );
}

function FlagPill({ active, label, activeVariant = 'destructive' }: { active: boolean; label: string; activeVariant?: 'destructive' | 'secondary' }) {
  return (
    <Badge variant={active ? activeVariant : 'outline'} className="text-[10px]">
      {active ? label : `No ${label}`}
    </Badge>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <Skeleton className="h-10 w-full" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
    </div>
  );
}

export function Customer360Drawer({ open, onOpenChange, customerId, alert }: Customer360DrawerProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: profile, isLoading, error } = useCustomer360(open ? customerId : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto p-0">
        {isLoading ? (
          <DrawerSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 p-6">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load customer data</p>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : profile ? (
          <>
            {/* Header */}
            <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-semibold">{safe(profile.full_name, 'Unknown Customer')}</SheetTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{safe(profile.customer_id)}</code>
                      <Badge variant="outline" className="text-xs capitalize">{safe(profile.party_type)}</Badge>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${riskColor(profile.risk_rating)}`}>
                        {safe(profile.risk_rating)}
                      </span>
                      {profile.is_pep && <Badge variant="destructive" className="text-xs">PEP</Badge>}
                      {profile.is_sanctioned && <Badge variant="destructive" className="text-xs">Sanctioned</Badge>}
                      {profile.is_watchlisted && <Badge variant="secondary" className="text-xs">Watchlisted</Badge>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4 mr-1" /> Back to Alert
                </Button>
              </div>

              {/* Stats bar */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted/50 border px-3 py-2 text-center">
                  <p className="text-lg font-bold text-primary">{profile.risk_score ?? '—'}</p>
                  <p className="text-[10px] text-muted-foreground">Risk Score</p>
                </div>
                <div className="rounded-lg bg-muted/50 border px-3 py-2 text-center">
                  <p className="text-lg font-bold">{profile.open_alerts_count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Open Alerts</p>
                </div>
                <div className="rounded-lg bg-muted/50 border px-3 py-2 text-center">
                  <p className="text-lg font-bold">{profile.active_cases_count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Active Cases</p>
                </div>
              </div>

              {/* Alert context banner */}
              <div className="mt-3 rounded-lg bg-muted/50 border px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Context of alert:</span>
                  <span className="font-mono font-medium">{alert.id}</span>
                </div>
                <RiskBadge level={alert.riskLevel} size="sm" />
              </div>
            </SheetHeader>

            <div className="px-6 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 h-10">
                  <TabsTrigger value="profile" className="text-xs gap-1"><User className="h-3.5 w-3.5" /><span className="hidden sm:inline">Profile</span></TabsTrigger>
                  <TabsTrigger value="risk" className="text-xs gap-1"><Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">Risk & KYC</span></TabsTrigger>
                  <TabsTrigger value="accounts" className="text-xs gap-1"><CreditCard className="h-3.5 w-3.5" /><span className="hidden sm:inline">Accounts</span></TabsTrigger>
                  <TabsTrigger value="screening" className="text-xs gap-1"><Globe className="h-3.5 w-3.5" /><span className="hidden sm:inline">Screening</span></TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs gap-1"><Activity className="h-3.5 w-3.5" /><span className="hidden sm:inline">Activity</span></TabsTrigger>
                </TabsList>

                {/* ── PROFILE TAB ── */}
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <SectionCard title="Identity" icon={<User className="h-4 w-4" />}>
                    <InfoRow label="Full Name" value={profile.full_name} />
                    {profile.date_of_birth && <InfoRow label="Date of Birth" value={safeDate(profile.date_of_birth)} />}
                    {profile.incorporation_date && <InfoRow label="Incorporation Date" value={safeDate(profile.incorporation_date)} />}
                    <InfoRow label="Gender" value={profile.gender} />
                    <InfoRow label="Nationality" value={profile.nationality} />
                    <InfoRow label="Residency" value={profile.residency_country} />
                    <InfoRow label="Tax Residency" value={profile.tax_residency} />
                    <InfoRow label="Occupation" value={profile.occupation} />
                    <InfoRow label="Customer Since" value={safeDate(profile.customer_since)} />
                    <InfoRow label="Status" value={profile.customer_status} />
                    <InfoRow label="Segment" value={(profile as any).customer_segment} />
                    <InfoRow label="Branch" value={profile.branch} />
                    <InfoRow label="Relationship Manager" value={profile.relationship_manager} />
                    <InfoRow label="Expected Activity" value={profile.expected_account_activity} />
                  </SectionCard>

                  {profile.aliases && profile.aliases.length > 0 && (
                    <SectionCard title="Aliases & Former Names">
                      {profile.aliases.map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                          <div>
                            <p className="text-xs font-medium">{safe(a.alias_value)}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{safe(a.alias_type, '').replace(/_/g, ' ')}</p>
                          </div>
                          {a.end_date && <span className="text-[10px] text-muted-foreground">Until {safeDate(a.end_date)}</span>}
                        </div>
                      ))}
                    </SectionCard>
                  )}

                  {profile.government_ids && profile.government_ids.length > 0 && (
                    <SectionCard title="Government Identifiers" icon={<IdCard className="h-4 w-4" />}>
                      {profile.government_ids.map((id, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-medium">{safe(id.id_number)}</span>
                              {id.is_primary && <Badge variant="outline" className="text-[9px] py-0">Primary</Badge>}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{safe(id.type)} · {safe(id.issuing_country)}</p>
                          </div>
                          <Badge
                            variant={id.verification_status === 'VERIFIED' ? 'secondary' : 'destructive'}
                            className="text-[9px]"
                          >
                            {safe(id.verification_status)}
                          </Badge>
                        </div>
                      ))}
                    </SectionCard>
                  )}

                  {profile.primary_address && (
                    <SectionCard title="Address" icon={<MapPin className="h-4 w-4" />}>
                      <InfoRow label="Line 1" value={profile.primary_address.line1} />
                      {profile.primary_address.line2 && <InfoRow label="Line 2" value={profile.primary_address.line2} />}
                      <InfoRow label="City" value={profile.primary_address.city} />
                      <InfoRow label="State" value={profile.primary_address.state} />
                      <InfoRow label="PIN" value={profile.primary_address.pin} />
                      <InfoRow label="Country" value={profile.primary_address.country} />
                    </SectionCard>
                  )}

                  {((profile.phone_numbers && profile.phone_numbers.length > 0) ||
                    (profile.email_addresses && profile.email_addresses.length > 0)) && (
                    <SectionCard title="Contact">
                      {profile.phone_numbers?.map((p, i) => (
                        <InfoRow key={i} label={`Phone (${p.type})`} value={p.number} />
                      ))}
                      {profile.email_addresses?.map((e, i) => (
                        <InfoRow key={i} label="Email" value={e.email} />
                      ))}
                    </SectionCard>
                  )}
                </TabsContent>

                {/* ── RISK & KYC TAB ── */}
                <TabsContent value="risk" className="mt-4 space-y-4">
                  <SectionCard title="Risk Assessment" icon={<Shield className="h-4 w-4" />}>
                    <InfoRow label="Risk Rating" value={profile.risk_rating} />
                    <InfoRow label="Risk Score" value={profile.risk_score} />
                    <InfoRow label="Industry" value={profile.industry} />
                    <InfoRow label="Last Assessed" value={safeDate(profile.last_risk_assessed)} />
                    <InfoRow label="Next KYC Review" value={safeDate(profile.next_kyc_review_due)} />
                    <div className="flex gap-2 pt-2">
                      <FlagPill active={profile.is_pep} label="PEP" />
                      <FlagPill active={profile.is_sanctioned} label="Sanctioned" />
                      <FlagPill active={profile.is_watchlisted} label="Watchlisted" />
                      <FlagPill active={!!profile.adverse_media_flag} label="Adverse Media" />
                    </div>
                  </SectionCard>

                  <SectionCard title="KYC" icon={<FileCheck className="h-4 w-4" />}>
                    <InfoRow label="KYC Status" value={profile.kyc_status} />
                    <InfoRow label="KYC Level" value={profile.kyc_level} />
                    <InfoRow label="CDD Type" value={profile.cdd_type} />
                    <InfoRow label="Onboarding Method" value={profile.onboarding_method} />
                    <InfoRow label="Last KYC Refresh" value={safeDate(profile.last_kyc_refresh)} />
                    <InfoRow label="Next KYC Due" value={safeDate(profile.next_kyc_due)} />
                    <InfoRow label="Relationship Purpose" value={profile.relationship_purpose} />
                    <InfoRow label="Source of Funds" value={profile.source_of_funds} />
                    <InfoRow label="Source of Wealth" value={profile.source_of_wealth} />
                    <InfoRow label="Declared Income" value={profile.declared_income != null ? formatINRFull(profile.declared_income) : '—'} />
                    <InfoRow label="Expected Turnover" value={profile.actual_turnover != null ? formatINRFull(profile.actual_turnover) : '—'} />
                  </SectionCard>

                  {profile.risk_assessments && profile.risk_assessments.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Assessment History</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {profile.risk_assessments.map((ra, i) => (
                            <div key={i} className="rounded-lg border p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium">{safe(ra.review_type)}</p>
                                  <p className="text-[10px] text-muted-foreground">{safeDate(ra.date)} · {safe(ra.reviewer)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {ra.previous_rating && (
                                    <span className="text-[10px] text-muted-foreground">{ra.previous_rating} →</span>
                                  )}
                                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${riskColor(ra.rating)}`}>{safe(ra.rating)}</span>
                                  <span className="text-xs font-mono">{safe(ra.score)}</span>
                                </div>
                              </div>
                              {ra.rationale && (
                                <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-1.5">{ra.rationale}</p>
                              )}
                              {ra.risk_factors && Object.keys(ra.risk_factors).length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {Object.entries(ra.risk_factors).map(([k, v]) => (
                                    <span key={k} className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                      {k}: {String(v)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {profile.watchlist_entries && profile.watchlist_entries.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Watchlist Entries</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {profile.watchlist_entries.map((w, i) => (
                            <div key={i} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">{safe(w.watchlist_type).replace(/_/g, ' ')}</span>
                                <Badge variant={w.status === 'ACTIVE' ? 'destructive' : 'secondary'} className="text-[9px]">{safe(w.status)}</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{safe(w.reason)}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">Added {safeDate(w.added_date)} by {safe(w.added_by)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ── ACCOUNTS TAB ── */}
                <TabsContent value="accounts" className="mt-4 space-y-4">
                  {profile.accounts && profile.accounts.length > 0 ? (
                    profile.accounts.map((acct, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4 space-y-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-mono font-medium">{safe(acct.account_number_masked)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {acct.account_risk_rating && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${riskColor(acct.account_risk_rating)}`}>
                                  {acct.account_risk_rating}
                                </span>
                              )}
                              <Badge variant="outline" className="text-[10px] capitalize">{safe(acct.status)}</Badge>
                            </div>
                          </div>
                          <InfoRow label="Account ID" value={acct.account_id} />
                          <InfoRow label="Type" value={[acct.account_type, acct.account_subtype].filter(Boolean).join(' / ')} />
                          <InfoRow label="Balance" value={formatINRFull(acct.balance)} />
                          <InfoRow label="Avg Balance" value={formatINRFull(acct.average_balance)} />
                          <InfoRow label="Currency" value={acct.currency} />
                          <InfoRow label="Ownership" value={acct.ownership_type} />
                          <InfoRow label="Branch" value={acct.branch} />
                          <InfoRow label="Opened" value={safeDate(acct.opened_date)} />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10 text-sm text-muted-foreground">No accounts found</div>
                  )}
                </TabsContent>

                {/* ── SCREENING TAB ── */}
                <TabsContent value="screening" className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-3">Screening Hits</p>
                    {profile.screening_results && profile.screening_results.length > 0 ? (
                      <div className="space-y-3">
                        {profile.screening_results.map((hit, i) => (
                          <Card key={i}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-xs font-medium">{safe(hit.matched_entity_name)}</p>
                                  <p className="text-[10px] text-muted-foreground">{safe(hit.type)} · {safe(hit.provider)}</p>
                                </div>
                                <Badge
                                  variant={hit.status === 'CONFIRMED_MATCH' ? 'destructive' : hit.status === 'POSSIBLE_MATCH' ? 'secondary' : 'outline'}
                                  className="text-[10px]"
                                >
                                  {safe(hit.status).replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <InfoRow label="List" value={hit.list_name} />
                              <InfoRow label="Match Score" value={hit.match_score != null ? `${hit.match_score}%` : '—'} />
                              <InfoRow label="Jurisdiction" value={hit.jurisdiction} />
                              <InfoRow label="Screened" value={safeDate(hit.screened_at)} />
                              {hit.analyst_disposition && (
                                <InfoRow label="Analyst Disposition" value={safe(hit.analyst_disposition).replace(/_/g, ' ')} />
                              )}
                              {hit.notes && (
                                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-2">{hit.notes}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground rounded-lg border border-dashed">No screening hits</div>
                    )}
                  </div>

                  {profile.beneficial_owners && profile.beneficial_owners.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Beneficial Owners / UBOs</p>
                      <div className="space-y-3">
                        {profile.beneficial_owners.map((bo, i) => (
                          <Card key={i}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-xs font-medium">{safe(bo.name)}</p>
                                  {bo.related_customer_id && (
                                    <p className="text-[10px] font-mono text-muted-foreground">{bo.related_customer_id}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {bo.risk_flag && <Badge variant="destructive" className="text-[9px]">Risk Flagged</Badge>}
                                  <Badge variant="outline" className="text-[10px] capitalize">{safe(bo.relationship_type)}</Badge>
                                </div>
                              </div>
                              <InfoRow label="Ownership" value={bo.ownership_pct != null ? `${bo.ownership_pct}%` : '—'} />
                              <InfoRow label="Control" value={bo.control_pct != null ? `${bo.control_pct}%` : '—'} />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ── ACTIVITY TAB ── */}
                <TabsContent value="activity" className="mt-4 space-y-4">

                  {/* Recent Alerts */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-3">Recent Alerts</p>
                    {profile.alerts && profile.alerts.length > 0 ? (
                      <div className="space-y-2">
                        {profile.alerts.map((a, i) => (
                          <div key={i} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="text-xs font-mono font-medium">{safe(a.alert_id)}</span>
                                <span className="text-[10px] text-muted-foreground ml-2">{safeDate(a.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${riskColor(a.severity)}`}>{safe(a.severity)}</span>
                                <Badge variant="outline" className="text-[9px]">{safe(a.status).replace(/_/g, ' ')}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{safe(a.scenario).replace(/_/g, ' ')}</span>
                              <span className="text-xs font-mono">{a.amount ? formatINRFull(a.amount) : '—'}</span>
                            </div>
                            {(a.ml_score != null || a.rule_score != null) && (
                              <div className="flex gap-3 mt-1.5 pt-1.5 border-t border-border/50">
                                {a.ml_score != null && <span className="text-[10px] text-muted-foreground">ML: <strong>{a.ml_score}</strong></span>}
                                {a.rule_score != null && <span className="text-[10px] text-muted-foreground">Rule: <strong>{a.rule_score}</strong></span>}
                                {a.priority_score != null && <span className="text-[10px] text-muted-foreground">Priority: <strong>{a.priority_score}</strong></span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground rounded-lg border border-dashed">No alerts on record</div>
                    )}
                  </div>

                  {/* Open Cases */}
                  {profile.cases && profile.cases.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Open Cases</p>
                      <div className="space-y-2">
                        {profile.cases.map((c, i) => (
                          <div key={i} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono font-medium">Case #{safe(c.case_number)}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px]">{safe(c.priority)}</Badge>
                                <Badge variant="secondary" className="text-[9px]">{safe(c.status).replace(/_/g, ' ')}</Badge>
                              </div>
                            </div>
                            <InfoRow label="Investigator" value={c.assigned_investigator} />
                            <InfoRow label="Opened" value={safeDate(c.opened_date)} />
                            {c.alert_id && <InfoRow label="Alert" value={c.alert_id} />}
                            {c.notes && <p className="text-[10px] text-muted-foreground mt-1.5 border-t border-border/50 pt-1.5">{c.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Transactions */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-3">Recent Transactions (last 20)</p>
                    {profile.transactions && profile.transactions.length > 0 ? (
                      <div className="space-y-2">
                        {profile.transactions.map((txn, i) => (
                          <div key={i} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full p-1.5 ${txn.direction === 'C' ? 'bg-risk-low/20' : 'bg-risk-high/20'}`}>
                                {txn.direction === 'C'
                                  ? <TrendingUp className="h-3.5 w-3.5 text-risk-low" />
                                  : <TrendingDown className="h-3.5 w-3.5 text-risk-high" />}
                              </div>
                              <div>
                                <p className="text-xs font-medium">{safe(txn.counterparty) !== '—' ? txn.counterparty : safe(txn.type).replace(/_/g, ' ')}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] text-muted-foreground">{safeDate(txn.date)}</p>
                                  {txn.channel && <span className="text-[10px] text-muted-foreground">· {txn.channel}</span>}
                                  {txn.is_cash && <Badge variant="outline" className="text-[8px] py-0 px-1">Cash</Badge>}
                                  {txn.is_cross_border && <Badge variant="outline" className="text-[8px] py-0 px-1">Cross-border</Badge>}
                                  {txn.is_suspicious && <Badge variant="destructive" className="text-[8px] py-0 px-1">Suspicious</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs font-mono font-medium ${txn.direction === 'C' ? 'text-risk-low' : 'text-risk-high'}`}>
                                {txn.direction === 'C' ? '+' : '-'}{formatINRFull(txn.amount)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{txn.currency} · {txn.country}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground rounded-lg border border-dashed">No recent transactions</div>
                    )}
                  </div>

                  {/* Regulatory Filings */}
                  {profile.regulatory_filings && profile.regulatory_filings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Regulatory Filings</p>
                      <div className="space-y-2">
                        {profile.regulatory_filings.map((f: any, i: number) => (
                          <div key={i} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium">{safe(f.filing_type)}</span>
                                {f.acknowledgment_number && (
                                  <span className="text-[10px] font-mono text-muted-foreground">{f.acknowledgment_number}</span>
                                )}
                              </div>
                              <Badge
                                variant={f.filing_status === 'submitted' ? 'secondary' : f.filing_status === 'rejected' ? 'destructive' : 'outline'}
                                className="text-[9px] capitalize"
                              >
                                {safe(f.filing_status)}
                              </Badge>
                            </div>
                            <InfoRow label="Filed" value={safeDate(f.filing_date)} />
                            <InfoRow label="Regulator" value={f.regulator} />
                            <InfoRow label="Filed By" value={f.filed_by} />
                            {f.filing_reason && (
                              <p className="text-[10px] text-muted-foreground mt-1.5 border-t border-border/50 pt-1.5">{f.filing_reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
