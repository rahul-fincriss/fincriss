import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileCheck, Search, SortAsc, SortDesc } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { STRStatusBadge } from '@/components/shared/STRStatusBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { mockCases } from '@/data/mockData';
import { Case, CaseStatus, STRStatusType } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortField = 'createdAt' | 'strStatus' | 'slaDeadline';
type SortDirection = 'asc' | 'desc';

const strStatusOrder: Record<STRStatusType, number> = {
  str_ready: 0,
  draft_in_progress: 1,
  no_str: 2,
  str_downloaded: 3,
  discarded: 4,
};

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases] = useState<Case[]>(mockCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [strStatusFilter, setStrStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSTRReadyFirst, setShowSTRReadyFirst] = useState(false);

  const filteredAndSortedCases = useMemo(() => {
    let result = cases.filter((caseItem) => {
      const matchesSearch =
        caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || caseItem.status === statusFilter;
      const matchesSTRStatus =
        strStatusFilter === 'all' || caseItem.strStatus === strStatusFilter;
      return matchesSearch && matchesStatus && matchesSTRStatus;
    });

    // Sort
    result.sort((a, b) => {
      // If showSTRReadyFirst is enabled, STR Ready cases always come first
      if (showSTRReadyFirst) {
        if (a.strStatus === 'str_ready' && b.strStatus !== 'str_ready') return -1;
        if (a.strStatus !== 'str_ready' && b.strStatus === 'str_ready') return 1;
      }

      let comparison = 0;
      if (sortField === 'strStatus') {
        comparison = strStatusOrder[a.strStatus] - strStatusOrder[b.strStatus];
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'slaDeadline') {
        comparison = new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [cases, searchQuery, statusFilter, strStatusFilter, sortField, sortDirection, showSTRReadyFirst]);

  const handleViewCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const strReadyCount = cases.filter((c) => c.strStatus === 'str_ready').length;
  const draftInProgressCount = cases.filter((c) => c.strStatus === 'draft_in_progress').length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Case Management</h1>
            <p className="text-muted-foreground">
              Track and manage investigation cases with STR status visibility
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="badge-status-in-progress">
              {cases.filter((c) => c.status === 'investigation').length} Active
            </Badge>
            <Badge variant="outline" className="badge-status-pending">
              {cases.filter((c) => c.status === 'pending_review').length} Pending Review
            </Badge>
            {strReadyCount > 0 && (
              <Badge 
                variant="outline" 
                className="bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-400 font-semibold"
              >
                <FileCheck className="h-3 w-3 mr-1" />
                {strReadyCount} STR Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={strStatusFilter === 'str_ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStrStatusFilter(strStatusFilter === 'str_ready' ? 'all' : 'str_ready')}
            className={cn(
              strStatusFilter === 'str_ready' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950'
            )}
          >
            <FileCheck className="h-4 w-4 mr-1.5" />
            STR Ready ({strReadyCount})
          </Button>
          <Button
            variant={strStatusFilter === 'draft_in_progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStrStatusFilter(strStatusFilter === 'draft_in_progress' ? 'all' : 'draft_in_progress')}
            className={cn(
              strStatusFilter === 'draft_in_progress' && 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            Draft In Progress ({draftInProgressCount})
          </Button>
          <Button
            variant={showSTRReadyFirst ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowSTRReadyFirst(!showSTRReadyFirst)}
          >
            {showSTRReadyFirst ? <SortDesc className="h-4 w-4 mr-1.5" /> : <SortAsc className="h-4 w-4 mr-1.5" />}
            Show STR Ready First
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Case Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Case Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigation">Investigation</SelectItem>
              <SelectItem value="str_draft">STR Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={strStatusFilter} onValueChange={setStrStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="STR Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All STR Status</SelectItem>
              <SelectItem value="no_str">No STR</SelectItem>
              <SelectItem value="draft_in_progress">Draft In Progress</SelectItem>
              <SelectItem value="str_ready">STR Ready</SelectItem>
              <SelectItem value="str_downloaded">STR Downloaded</SelectItem>
              <SelectItem value="discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${sortField}-${sortDirection}`} onValueChange={(v) => {
            const [field, dir] = v.split('-') as [SortField, SortDirection];
            setSortField(field);
            setSortDirection(dir);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="strStatus-asc">STR Status (Ready First)</SelectItem>
              <SelectItem value="strStatus-desc">STR Status (No STR First)</SelectItem>
              <SelectItem value="slaDeadline-asc">SLA (Urgent First)</SelectItem>
              <SelectItem value="slaDeadline-desc">SLA (Most Time First)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cases Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Case ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Linked Alerts</TableHead>
                <TableHead>Investigator</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Case Status</TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort('strStatus')}
                  >
                    STR Status
                    {sortField === 'strStatus' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  className={cn(
                    'table-row-interactive',
                    caseItem.strStatus === 'str_ready' && 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  )}
                  onClick={() => handleViewCase(caseItem.id)}
                >
                  <TableCell className="font-mono text-sm">{caseItem.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{caseItem.customerName}</p>
                      <p className="text-xs text-muted-foreground">{caseItem.customerId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {caseItem.linkedAlerts.length} alert{caseItem.linkedAlerts.length !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>{caseItem.investigatorName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {caseItem.totalAmount.toLocaleString()} {caseItem.currency}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={caseItem.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <STRStatusBadge 
                      status={caseItem.strStatus} 
                      size="sm" 
                      highlighted={caseItem.strStatus === 'str_ready'}
                    />
                  </TableCell>
                  <TableCell>
                    <SLATimer deadline={caseItem.slaDeadline} />
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewCase(caseItem.id)}
                        title="View case"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedCases.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No cases match your filters.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
