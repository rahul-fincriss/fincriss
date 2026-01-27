import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Filter, Search } from 'lucide-react';
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
import { SLATimer } from '@/components/shared/SLATimer';
import { mockCases } from '@/data/mockData';
import { Case, CaseStatus } from '@/types';
import { format } from 'date-fns';

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases] = useState<Case[]>(mockCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Case Management</h1>
            <p className="text-muted-foreground">
              Track and manage active investigation cases
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="badge-status-in-progress">
              {cases.filter((c) => c.status === 'investigation').length} Active
            </Badge>
            <Badge variant="outline" className="badge-status-pending">
              {cases.filter((c) => c.status === 'pending_review').length} Pending Review
            </Badge>
          </div>
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
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigation">Investigation</SelectItem>
              <SelectItem value="str_draft">STR Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
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
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  className="table-row-interactive"
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
                      {caseItem.status === 'str_draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary"
                          onClick={() => navigate(`/str/${caseItem.id}`)}
                          title="View STR"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
