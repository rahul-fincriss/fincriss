import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
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
import { useAuditLogs } from '@/hooks/useAudit';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditTrailPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  
  const { data: entries, isLoading, error } = useAuditLogs();

  const filteredEntries = (entries || []).filter((entry) => {
    const matchesSearch =
      entry.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.performedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity =
      entityFilter === 'all' || entry.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const getEntityBadgeVariant = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-primary/20 text-primary';
      case 'case':
        return 'bg-status-in-progress/20 text-status-in-progress';
      case 'str':
        return 'bg-risk-medium/20 text-risk-medium';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Complete history of all actions across alerts, cases, and STRs
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search audit entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
              <SelectItem value="case">Cases</SelectItem>
              <SelectItem value="str">STRs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Model Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-muted-foreground animate-pulse">Loading activity history...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center py-8 text-destructive">
                    <AlertCircle className="h-8 w-8 mx-auto" />
                    <p className="mt-2 font-medium">Failed to load audit logs</p>
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center py-8 text-muted-foreground">
                    No matching audit entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      {format(entry.performedAt, 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getEntityBadgeVariant(entry.entityType)}>
                          {entry.entityType.toUpperCase()}
                        </Badge>
                        <span className="font-mono text-xs">{entry.entityId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.performedBy}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {entry.details}
                    </TableCell>
                    <TableCell>
                      {entry.modelVersion && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {entry.modelVersion}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
