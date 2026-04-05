import { useState } from 'react';
import { Customer360Profile } from '@/services/customer360.service';
import { useCustomerTransactions } from '@/hooks/useCustomer360';
import { TransactionsParams, Customer360Transaction } from '@/services/customer360.service';
import { formatINR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  profile: Customer360Profile;
  customerId: string;
}

function accountStatusColor(s: string) {
  switch (s?.toUpperCase()) {
    case 'ACTIVE': return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    case 'DORMANT': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
    case 'FROZEN': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
    case 'CLOSED': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function C360AccountsTab({ profile, customerId }: Props) {
  const accounts = profile.accounts || [];
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [cashOnly, setCashOnly] = useState(false);
  const [crossBorderOnly, setCrossBorderOnly] = useState(false);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [txnType, setTxnType] = useState('all');

  const params: TransactionsParams = {
    limit: 50,
    offset: page * 50,
    cash_only: cashOnly || undefined,
    cross_border_only: crossBorderOnly || undefined,
    suspicious_only: suspiciousOnly || undefined,
    account_id: selectedAccount || undefined,
    transaction_type: txnType !== 'all' ? txnType : undefined,
  };

  const { data: txnData, isLoading: txnLoading } = useCustomerTransactions(customerId, params);
  const transactions = txnData?.transactions || [];

  return (
    <div className="space-y-4">
      {/* Accounts grid */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {accounts.map(acc => (
            <button
              key={acc.account_id}
              onClick={() => setSelectedAccount(selectedAccount === acc.account_id ? null : acc.account_id)}
              className={cn(
                'panel-section text-left transition-colors',
                selectedAccount === acc.account_id ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">{acc.account_type}</span>
                <span className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded border', accountStatusColor(acc.status))}>{acc.status}</span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">{acc.account_number_masked}</p>
              <p className="text-sm font-semibold mt-1">{formatINR(acc.balance)}</p>
              <p className="text-[10px] text-muted-foreground">Avg: {formatINR(acc.average_balance)} · {acc.currency}</p>
              <p className="text-[10px] text-muted-foreground">Opened: {acc.opened_date}</p>
            </button>
          ))}
        </div>
      )}

      {/* Transaction filters */}
      <div className="flex items-center gap-3 flex-wrap panel-section py-2">
        <Select value={txnType} onValueChange={setTxnType}>
          <SelectTrigger className="w-32 h-7 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="WIRE">Wire</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="RTGS">RTGS</SelectItem>
            <SelectItem value="NEFT">NEFT</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Switch id="cash" checked={cashOnly} onCheckedChange={setCashOnly} className="h-4 w-7" />
          <Label htmlFor="cash" className="text-[10px]">Cash Only</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <Switch id="cb" checked={crossBorderOnly} onCheckedChange={setCrossBorderOnly} className="h-4 w-7" />
          <Label htmlFor="cb" className="text-[10px]">Cross-Border</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <Switch id="sus" checked={suspiciousOnly} onCheckedChange={setSuspiciousOnly} className="h-4 w-7" />
          <Label htmlFor="sus" className="text-[10px]">Suspicious</Label>
        </div>
        {txnData && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            Showing {transactions.length} of {txnData.total} · Debit: {formatINR(txnData.total_debit)} · Credit: {formatINR(txnData.total_credit)}
          </span>
        )}
      </div>

      {/* Transaction table */}
      {txnLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : (
        <div className="panel-section p-0 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase bg-muted/30">
                <th className="text-left p-2 font-medium">Date</th>
                <th className="text-center p-2 font-medium">D/C</th>
                <th className="text-right p-2 font-medium">Amount</th>
                <th className="text-left p-2 font-medium">Curr</th>
                <th className="text-left p-2 font-medium">Type</th>
                <th className="text-left p-2 font-medium">Description</th>
                <th className="text-left p-2 font-medium">Reference</th>
                <th className="text-left p-2 font-medium">Counterparty</th>
                <th className="text-left p-2 font-medium">Country</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-6 text-muted-foreground">No transactions found</td></tr>
              ) : (
                transactions.map((t: Customer360Transaction) => (
                  <tr
                    key={t.id}
                    className={cn(
                      'border-b border-border/50 hover:bg-accent/30',
                      t.is_suspicious && 'bg-risk-high/5',
                      t.is_cross_border && !t.is_suspicious && 'bg-risk-medium/5'
                    )}
                  >
                    <td className="p-2 whitespace-nowrap">{t.date}</td>
                    <td className="p-2 text-center">
                      <span className={cn('font-bold', t.direction === 'D' ? 'text-risk-high' : 'text-risk-low')}>{t.direction}</span>
                    </td>
                    <td className="p-2 text-right font-mono">{formatINR(t.amount)}</td>
                    <td className="p-2">{t.currency}</td>
                    <td className="p-2">{t.type}</td>
                    <td className="p-2 max-w-[150px] truncate">{t.description}</td>
                    <td className="p-2 font-mono text-[10px]">{t.reference}</td>
                    <td className="p-2">{t.counterparty}</td>
                    <td className="p-2">{t.country}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {txnData && txnData.total > 50 && (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" className="h-6 text-xs" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-3 w-3" /> Prev
          </Button>
          <span className="text-[10px] text-muted-foreground">Page {page + 1} of {Math.ceil(txnData.total / 50)}</span>
          <Button size="sm" variant="outline" className="h-6 text-xs" disabled={(page + 1) * 50 >= txnData.total} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
