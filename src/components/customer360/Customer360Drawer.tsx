import { useState } from 'react';
import { X, User, FileText, Network, History, Shield, MapPin, Building, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { CustomerKYC, Transaction, PrioritizedAlert } from '@/types';
import { KYCDetailsTab } from './tabs/KYCDetailsTab';
import { TransactionsTab } from './tabs/TransactionsTab';
import { CustomerNetworkTab } from './tabs/CustomerNetworkTab';
import { NotesHistoryTab } from './tabs/NotesHistoryTab';

interface Customer360DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerKYC;
  transactions: Transaction[];
  alert: PrioritizedAlert;
}

export function Customer360Drawer({ 
  open, 
  onOpenChange, 
  customer, 
  transactions, 
  alert 
}: Customer360DrawerProps) {
  const [activeTab, setActiveTab] = useState('kyc');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto p-0"
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl font-semibold">{customer.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {customer.type}
                  </Badge>
                  <RiskBadge level={customer.riskRating} size="sm" />
                  {customer.pep && <Badge variant="destructive" className="text-xs">PEP</Badge>}
                  {customer.sanctions && <Badge variant="destructive" className="text-xs">Sanctions</Badge>}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Back to Alert
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
              <TabsTrigger value="kyc" className="text-xs sm:text-sm gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">KYC Details</span>
                <span className="sm:hidden">KYC</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Transactions</span>
                <span className="sm:hidden">Txns</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="text-xs sm:text-sm gap-1.5">
                <Network className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Network</span>
                <span className="sm:hidden">Net</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm gap-1.5">
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Notes & History</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kyc" className="mt-4">
              <KYCDetailsTab customer={customer} />
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <TransactionsTab transactions={transactions} alertId={alert.id} />
            </TabsContent>

            <TabsContent value="network" className="mt-4">
              <CustomerNetworkTab customer={customer} transactions={transactions} />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <NotesHistoryTab customer={customer} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
