import { X, User, AlertTriangle, Shield, MapPin, CreditCard, Globe, FileCheck } from 'lucide-react';
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

function riskBadgeColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'HIGH': case 'CRITICAL': return 'bg-risk-high text-white';
    case 'MEDIUM': return 'bg-risk-medium text-risk-medium-foreground';
    case 'LOW': return 'bg-risk-low text-risk-low-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">{safe(value)}</span>
    </div>
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
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{safe(profile.customer_id)}</code>
                      <Badge variant="outline" className="text-xs capitalize">{safe(profile.party_type)}</Badge>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${riskBadgeColor(profile.risk_rating)}`}>
                        {safe(profile.risk_rating)}
                      </span>
                      {profile.is_pep && <Badge variant="destructive" className="text-xs">PEP</Badge>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4 mr-1" /> Back to Alert
                </Button>
              </div>
              <div className="mt-4 rounded-lg bg-muted/50 border px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Viewing in context of alert:</span>
                  <span className="font-mono font-medium">{alert.id}</span>
                </div>
                <RiskBadge level={alert.riskLevel} size="sm" />
              </div>
            </SheetHeader>

            <div className="px-6 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-10">
                  <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
                  <TabsTrigger value="risk" className="text-xs gap-1.5"><Shield className="h-3.5 w-3.5" /> Risk & KYC</TabsTrigger>
                  <TabsTrigger value="accounts" className="text-xs gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Accounts</TabsTrigger>
                  <TabsTrigger value="screening" className="text-xs gap-1.5"><Globe className="h-3.5 w-3.5" /> Screening</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
                    <CardContent className="space-y-0">
                      <InfoRow label="Full Name" value={profile.full_name} />
                      <InfoRow label="Date of Birth" value={safeDate(profile.date_of_birth)} />
                      <InfoRow label="Gender" value={profile.gender} />
                      <InfoRow label="Nationality" value={profile.nationality} />
                      <InfoRow label="Occupation" value={profile.occupation} />
                      <InfoRow label="Customer Since" value={safeDate(profile.customer_since)} />
                      <InfoRow label="Status" value={profile.customer_status} />
                      <InfoRow label="Branch" value={profile.branch} />
                      <InfoRow label="Relationship Manager" value={profile.relationship_manager} />
                    </CardContent>
                  </Card>

                  {profile.primary_address && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</CardTitle></CardHeader>
                      <CardContent className="space-y-0">
                        <InfoRow label="Line 1" value={profile.primary_address.line1} />
                        {profile.primary_address.line2 && <InfoRow label="Line 2" value={profile.primary_address.line2} />}
                        <InfoRow label="City" value={profile.primary_address.city} />
                        <InfoRow label="State" value={profile.primary_address.state} />
                        <InfoRow label="PIN" value={profile.primary_address.pin} />
                        <InfoRow label="Country" value={profile.primary_address.country} />
                      </CardContent>
                    </Card>
                  )}

                  {profile.phone_numbers && profile.phone_numbers.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Contact</CardTitle></CardHeader>
                      <CardContent className="space-y-0">
                        {profile.phone_numbers.map((p, i) => (
                          <InfoRow key={i} label={`Phone (${p.type})`} value={p.number} />
                        ))}
                        {profile.email_addresses?.map((e, i) => (
                          <InfoRow key={i} label="Email" value={e.email} />
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Risk & KYC Tab */}
                <TabsContent value="risk" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Assessment</CardTitle></CardHeader>
                    <CardContent className="space-y-0">
                      <InfoRow label="Risk Rating" value={profile.risk_rating} />
                      <InfoRow label="Risk Score" value={profile.risk_score} />
                      <InfoRow label="Industry" value={profile.industry} />
                      <InfoRow label="Industry Risk" value={profile.industry_risk_level} />
                      <InfoRow label="PEP Status" value={profile.is_pep ? 'Yes' : 'No'} />
                      <InfoRow label="Sanctioned" value={profile.is_sanctioned ? 'Yes' : 'No'} />
                      <InfoRow label="Watchlisted" value={profile.is_watchlisted ? 'Yes' : 'No'} />
                      <InfoRow label="Last Risk Assessed" value={safeDate(profile.last_risk_assessed)} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileCheck className="h-4 w-4" /> KYC</CardTitle></CardHeader>
                    <CardContent className="space-y-0">
                      <InfoRow label="KYC Status" value={profile.kyc_status} />
                      <InfoRow label="KYC Level" value={profile.kyc_level} />
                      <InfoRow label="CDD Type" value={profile.cdd_type} />
                      <InfoRow label="Last KYC Refresh" value={safeDate(profile.last_kyc_refresh)} />
                      <InfoRow label="Next KYC Due" value={safeDate(profile.next_kyc_due)} />
                      <InfoRow label="Source of Funds" value={profile.source_of_funds} />
                      <InfoRow label="Declared Income" value={profile.declared_income != null ? formatINRFull(profile.declared_income) : '—'} />
                      <InfoRow label="Actual Turnover" value={profile.actual_turnover != null ? formatINRFull(profile.actual_turnover) : '—'} />
                    </CardContent>
                  </Card>

                  {profile.risk_assessments && profile.risk_assessments.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Assessment History</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {profile.risk_assessments.map((ra, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                              <div>
                                <p className="text-xs font-medium">{safe(ra.review_type)}</p>
                                <p className="text-[10px] text-muted-foreground">{safeDate(ra.date)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono">{safe(ra.score)}</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${riskBadgeColor(ra.rating)}`}>{safe(ra.rating)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Accounts Tab */}
                <TabsContent value="accounts" className="mt-4 space-y-4">
                  {profile.accounts && profile.accounts.length > 0 ? (
                    profile.accounts.map((acct, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4 space-y-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-mono font-medium">{safe(acct.account_number_masked)}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] capitalize">{safe(acct.status)}</Badge>
                          </div>
                          <InfoRow label="Type" value={acct.account_type} />
                          <InfoRow label="Balance" value={formatINRFull(acct.balance)} />
                          <InfoRow label="Avg Balance" value={formatINRFull(acct.average_balance)} />
                          <InfoRow label="Currency" value={acct.currency} />
                          <InfoRow label="Branch" value={acct.branch} />
                          <InfoRow label="Opened" value={safeDate(acct.opened_date)} />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">No accounts found</div>
                  )}
                </TabsContent>

                {/* Screening Tab */}
                <TabsContent value="screening" className="mt-4 space-y-4">
                  {profile.screening_results && profile.screening_results.length > 0 ? (
                    profile.screening_results.map((hit, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">{safe(hit.matched_entity_name)}</span>
                            <Badge variant={hit.status === 'TRUE_POSITIVE' ? 'destructive' : 'secondary'} className="text-[10px]">
                              {safe(hit.status)}
                            </Badge>
                          </div>
                          <InfoRow label="List" value={hit.list_name} />
                          <InfoRow label="Match Score" value={hit.match_score ? `${hit.match_score}%` : '—'} />
                          <InfoRow label="Provider" value={hit.provider} />
                          <InfoRow label="Screened" value={safeDate(hit.screened_at)} />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">No screening hits found</div>
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
