import { useState } from 'react';
import { Filter, TrendingUp, Globe, ChevronRight, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { formatINRFull } from '@/data/mockData';

interface TransactionsTabProps {
  transactions: Transaction[];
  alertId: string;
}

export function TransactionsTab({ transactions, alertId }: TransactionsTabProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Get unique channels from transactions
  const channels = [...new Set(transactions.map(t => t.channel))];

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesChannel = filterChannel === 'all' || txn.channel === filterChannel;
    const matchesSearch = searchQuery === '' || 
      txn.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesChannel && matchesSearch;
  });

  // Calculate aggregates
  const totalCredits = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Context Banner */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{transactions.length}</span> transactions tied to alert <span className="font-mono font-medium text-primary">{alertId}</span>
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input 
              placeholder="Search counterparty..." 
              className="w-full sm:w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {channels.map(channel => (
                  <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Aggregates */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Credits</p>
                <p className="text-lg font-mono font-semibold text-risk-low">
                  +{formatINRFull(totalCredits)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-risk-low" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Debits</p>
                <p className="text-lg font-mono font-semibold text-risk-high">
                  -{formatINRFull(totalDebits)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-risk-high rotate-180" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Flow</p>
                <p className={`text-lg font-mono font-semibold ${totalCredits - totalDebits >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                  {formatINRFull(totalCredits - totalDebits)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
            ) : (
              filteredTransactions.map((txn) => (
                <button
                  key={txn.id}
                  onClick={() => setSelectedTransaction(txn)}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-1.5 ${txn.type === 'credit' ? 'bg-risk-low/20' : 'bg-risk-high/20'}`}>
                      <TrendingUp className={`h-4 w-4 ${txn.type === 'credit' ? 'text-risk-low' : 'text-risk-high rotate-180'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.counterparty}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(txn.date, 'MMM dd, yyyy')} • {txn.channel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-mono font-medium ${txn.type === 'credit' ? 'text-risk-low' : 'text-risk-high'}`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatINRFull(txn.amount)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Globe className="h-3 w-3" />
                        {txn.country}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Panel */}
      <Sheet open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selectedTransaction && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">Transaction Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Amount */}
                <div className="text-center py-4 rounded-lg bg-muted/30">
                  <p className={`text-3xl font-mono font-bold ${selectedTransaction.type === 'credit' ? 'text-risk-low' : 'text-risk-high'}`}>
                    {selectedTransaction.type === 'credit' ? '+' : '-'}{formatINRFull(selectedTransaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTransaction.currency}</p>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-sm">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="text-sm">{format(selectedTransaction.date, 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Counterparty</p>
                    <p className="text-sm font-medium">{selectedTransaction.counterparty}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Channel</p>
                      <Badge variant="outline">{selectedTransaction.channel}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Country</p>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{selectedTransaction.country}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedTransaction.description}</p>
                  </div>
                </div>

                <Separator />

                {/* Risk Flags */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Risk Indicators</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransaction.amount > 900000 && (
                      <Badge className="badge-risk-medium">Near ₹10L CTR Threshold</Badge>
                    )}
                    {['AE', 'PA', 'CY', 'HK'].includes(selectedTransaction.country) && (
                      <Badge className="badge-risk-high">High-Risk Jurisdiction</Badge>
                    )}
                    {selectedTransaction.channel === 'Wire - SWIFT' && (
                      <Badge variant="outline">Wire Transfer</Badge>
                    )}
                    {selectedTransaction.channel === 'Cash' && (
                      <Badge className="badge-risk-medium">Cash Transaction</Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}