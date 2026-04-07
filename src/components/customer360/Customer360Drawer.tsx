import { X, User, AlertTriangle, Shield, MapPin, Building2, CreditCard, Globe, Calendar, FileCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { PrioritizedAlert, RiskLevel } from '@/types';
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
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
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

              {/* Context Banner */}
              <div className="mt-4 rounded-lg bg-muted/50 border px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Viewing in context of alert:</span>
                  <span className="font-mono font-medium">{alert.id}</span>
                </div>
                <RiskBadge level={alert.riskLevel} size="sm" />
              </div>
            </SheetHeader>

            {/* Tabs */}
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

                  {profile.addresses && profile.addresses.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Addresses</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {profile.addresses.map((addr: any, i: number) => (
                          <div key={i} className="rounded-lg border p-3 text-xs">
                            <div className="flex justify-between mb-1">
                              <Badge variant="outline" className="text-[10px] capitalize">{safe(addr.address_type)}</Badge>
                              {addr.is_primary && <Badge className="text-[10px] bg-primary/20 text-primary">Primary</Badge>}
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {[addr.address_line1, addr.address_line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {profile.contact_info && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Contact</CardTitle></CardHeader>
                      <CardContent className="space-y-0">
                        <InfoRow label="Primary Phone" value={profile.contact_info.primary_phone} />
                        <InfoRow label="Email" value={profile.contact_info.primary_email} />
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
                      <InfoRow label="Risk Score" value={profile.risk_score_numeric} />
                      <InfoRow label="Industry" value={profile.industry} />
                      <InfoRow label="Industry Risk" value={profile.industry_risk_level} />
                      <InfoRow label="PEP Status" value={profile.is_pep ? 'Yes' : 'No'} />
                    </CardContent>
                  </Card>

                  {profile.kyc_profile && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileCheck className="h-4 w-4" /> KYC Profile</CardTitle></CardHeader>
                      <CardContent className="space-y-0">
                        <InfoRow label="KYC Status" value={profile.kyc_profile.kyc_status} />
                        <InfoRow label="Last Verification" value={safeDate(profile.kyc_profile.last_kyc_date)} />
                        <InfoRow label="Next Review" value={safeDate(profile.kyc_profile.next_review_date)} />
                        <InfoRow label="Verification Level" value={profile.kyc_profile.verification_level} />
                        <InfoRow label="Source of Funds" value={profile.kyc_profile.source_of_funds} />
                        <InfoRow label="Declared Income" value={profile.kyc_profile.declared_annual_income ? formatINRFull(profile.kyc_profile.declared_annual_income) : '—'} />
                      </CardContent>
                    </Card>
                  )}

                  {profile.risk_factors && profile.risk_factors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Factors</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {profile.risk_factors.map((rf: any, i: number) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                              <div>
                                <p className="text-xs font-medium">{safe(rf.factor_name)}</p>
                                <p className="text-[10px] text-muted-foreground">{safe(rf.category)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono">{safe(rf.score)}</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${riskBadgeColor(rf.level)}`}>{safe(rf.level)}</span>
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
                    profile.accounts.map((acct: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="pt-4 space-y-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-mono font-medium">{safe(acct.account_number)}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] capitalize">{safe(acct.account_status)}</Badge>
                          </div>
                          <InfoRow label="Type" value={acct.account_type} />
                          <InfoRow label="Balance" value={acct.current_balance != null ? formatINRFull(acct.current_balance) : '—'} />
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
                    profile.screening_results.map((hit: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">{safe(hit.matched_name)}</span>
                            <Badge variant={hit.match_status === 'TRUE_POSITIVE' ? 'destructive' : 'secondary'} className="text-[10px]">
                              {safe(hit.match_status)}
                            </Badge>
                          </div>
                          <InfoRow label="List" value={hit.list_name} />
                          <InfoRow label="Match Score" value={hit.match_score ? `${hit.match_score}%` : '—'} />
                          <InfoRow label="Screened" value={safeDate(hit.screened_date)} />
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
