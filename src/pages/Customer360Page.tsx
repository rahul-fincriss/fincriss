import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Building2, Shield, AlertTriangle, Filter, Eye, FileDown, FolderPlus, Bookmark } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomerList, useCustomer360 } from '@/hooks/useCustomer360';
import { Customer360Summary, ListCustomersParams } from '@/services/customer360.service';
import { C360OverviewTab } from '@/components/customer360-page/C360OverviewTab';
import { C360IdentityTab } from '@/components/customer360-page/C360IdentityTab';
import { C360AccountsTab } from '@/components/customer360-page/C360AccountsTab';
import { C360RiskKYCTab } from '@/components/customer360-page/C360RiskKYCTab';
import { C360ScreeningTab } from '@/components/customer360-page/C360ScreeningTab';
import { C360AlertsCasesTab } from '@/components/customer360-page/C360AlertsCasesTab';
import { C360NetworkTab } from '@/components/customer360-page/C360NetworkTab';
import { cn } from '@/lib/utils';

const FILTER_CHIPS = [
  { label: 'ALL', value: '' },
  { label: 'HIGH RISK', value: 'HIGH' },
  { label: 'CRITICAL', value: 'CRITICAL' },
  { label: 'WATCHLISTED', value: 'watchlisted' },
  { label: 'PEP', value: 'pep' },
  { label: 'OPEN CASES', value: 'open_cases' },
];

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'identity', label: 'Identity' },
  { value: 'accounts', label: 'Accounts & Transactions' },
  { value: 'risk-kyc', label: 'Risk & KYC' },
  { value: 'screening', label: 'Screening' },
  { value: 'alerts-cases', label: 'Alerts & Cases' },
  { value: 'network', label: 'Network' },
];

function riskColor(rating: string) {
  switch (rating?.toUpperCase()) {
    case 'CRITICAL': return 'bg-risk-high text-white';
    case 'HIGH': return 'bg-orange-600 text-white';
    case 'MEDIUM': return 'bg-risk-medium text-risk-medium-foreground';
    case 'LOW': return 'bg-risk-low text-risk-low-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function kycStatusColor(status: string) {
  switch (status) {
    case 'VERIFIED': return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    case 'PENDING': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
    case 'EXPIRED': return 'bg-muted text-muted-foreground border-border';
    case 'UNDER_REVIEW': return 'bg-status-info/20 text-status-info border-status-info/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

function partyIcon(type: string) {
  switch (type) {
    case 'business': return <Building2 className="h-4 w-4" />;
    case 'trust': return <Shield className="h-4 w-4" />;
    default: return <User className="h-4 w-4" />;
  }
}

export default function Customer360Page() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterChip, setFilterChip] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derive active tab from URL hash
  const hashTab = location.hash?.replace('#', '') || 'overview';
  const activeTab = TABS.find(t => t.value === hashTab) ? hashTab : 'overview';
  const setActiveTab = useCallback((tab: string) => {
    navigate({ hash: `#${tab}` }, { replace: true });
  }, [navigate]);

  // Build list params
  const listParams: ListCustomersParams = { search, limit: 50 };
  if (filterChip === 'HIGH' || filterChip === 'CRITICAL') listParams.risk_rating = filterChip;
  else if (filterChip === 'pep') listParams.is_pep = true;

  const { data: customers = [], isLoading: listLoading } = useCustomerList(listParams);
  const { data: profile, isLoading: profileLoading } = useCustomer360(selectedId);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-5rem)] -m-6">
        {/* Left Panel — Customer List */}
        <div className="w-[280px] min-w-[280px] border-r border-border bg-card flex flex-col">
          <div className="p-3 space-y-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Name, ID, PAN, Aadhaar…"
                className="pl-8 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTER_CHIPS.map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setFilterChip(chip.value)}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-medium rounded border transition-colors',
                    filterChip === chip.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {listLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">No customers found</div>
            ) : (
              <div className="p-1">
                {customers.map((c: Customer360Summary) => (
                  <button
                    key={c.customer_id}
                    onClick={() => setSelectedId(c.customer_id)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded transition-colors',
                      selectedId === c.customer_id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-accent border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{partyIcon(c.party_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.full_name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{c.customer_id}</p>
                      </div>
                      <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', riskColor(c.risk_rating))}>
                        {c.risk_rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {c.is_watchlisted && (
                        <span className="text-[9px] text-risk-high flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" /> WL
                        </span>
                      )}
                      {c.open_alerts_count > 0 && (
                        <span className="text-[9px] text-risk-medium flex items-center gap-0.5">
                          <AlertTriangle className="h-2.5 w-2.5" /> {c.open_alerts_count}
                        </span>
                      )}
                      {c.is_pep && (
                        <span className="text-[9px] text-status-info">PEP</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel — Customer 360 Profile */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <User className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm">Select a customer to view their 360 profile</p>
              </div>
            </div>
          ) : profileLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : profile ? (
            <>
              <div className="border-b border-border bg-card/70 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-foreground">
                      {partyIcon(profile.party_type)}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-base font-semibold text-foreground">{profile.full_name}</h1>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground">{profile.customer_id}</code>
                        <Badge variant="outline" className="h-5 text-[10px] capitalize">{profile.party_type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', riskColor(profile.risk_rating))}>
                          {profile.risk_rating}
                        </span>
                        <span className={cn('rounded border px-2 py-0.5 text-[10px] font-medium', kycStatusColor(profile.kyc_status))}>
                          KYC: {profile.kyc_status}
                        </span>
                        {profile.open_alerts_count > 0 && (
                          <span className="text-[10px] text-muted-foreground">{profile.open_alerts_count} Open Alerts</span>
                        )}
                        {profile.active_cases_count > 0 && (
                          <span className="text-[10px] text-muted-foreground">· {profile.active_cases_count} Active Cases</span>
                        )}
                        {profile.is_watchlisted && (
                          <span className="text-[10px] font-medium text-risk-high">· Watchlisted</span>
                        )}
                        {profile.is_pep && (
                          <span className="text-[10px] font-medium text-status-info">· PEP Linked</span>
                        )}
                        {profile.sanctions_hits > 0 && (
                          <span className="text-[10px] font-medium text-risk-high">· {profile.sanctions_hits} Sanctions Hits</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                      <FolderPlus className="h-3 w-3" /> Open Case
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                      <Bookmark className="h-3 w-3" /> Watchlist
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                      <FileDown className="h-3 w-3" /> Export PDF
                    </Button>
                  </div>
                </div>

                <nav
                  aria-label="Customer 360 sections"
                  className="mt-4 flex flex-wrap gap-2"
                  role="tablist"
                >
                  {TABS.map(tab => {
                    const isActive = activeTab === tab.value;
                    return (
                      <button
                        aria-selected={isActive}
                        key={tab.value}
                        role="tab"
                        tabIndex={isActive ? 0 : -1}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                          'inline-flex min-h-9 items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          isActive
                            ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                            : 'border-border bg-background text-foreground hover:bg-accent'
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col min-h-0">

                <ScrollArea className="flex-1">
                  <div className="p-5">
                    <TabsContent value="overview" className="mt-0">
                      <C360OverviewTab profile={profile} />
                    </TabsContent>
                    <TabsContent value="identity" className="mt-0">
                      <C360IdentityTab profile={profile} />
                    </TabsContent>
                    <TabsContent value="accounts" className="mt-0">
                      <C360AccountsTab profile={profile} customerId={selectedId} />
                    </TabsContent>
                    <TabsContent value="risk-kyc" className="mt-0">
                      <C360RiskKYCTab profile={profile} />
                    </TabsContent>
                    <TabsContent value="screening" className="mt-0">
                      <C360ScreeningTab profile={profile} />
                    </TabsContent>
                    <TabsContent value="alerts-cases" className="mt-0">
                      <C360AlertsCasesTab profile={profile} />
                    </TabsContent>
                    <TabsContent value="network" className="mt-0">
                      <C360NetworkTab profile={profile} onSelectCustomer={(id) => setSelectedId(id)} />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Failed to load customer profile</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
