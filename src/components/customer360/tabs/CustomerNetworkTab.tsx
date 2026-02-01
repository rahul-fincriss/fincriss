import { Users, Building, AlertTriangle, Link2, CreditCard, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerKYC, Transaction } from '@/types';

interface CustomerNetworkTabProps {
  customer: CustomerKYC;
  transactions: Transaction[];
}

export function CustomerNetworkTab({ customer, transactions }: CustomerNetworkTabProps) {
  // Mock network data
  const accounts = [
    { id: 'ACC-001', type: 'Current Account', currency: 'USD', status: 'active', balance: 145000 },
    { id: 'ACC-002', type: 'Savings Account', currency: 'USD', status: 'active', balance: 52000 },
    { id: 'ACC-003', type: 'Foreign Currency', currency: 'EUR', status: 'active', balance: 28500 },
  ];

  // Extract unique counterparties from transactions
  const counterparties = [...new Set(transactions.map(t => t.counterparty))].map((name, idx) => {
    const relatedTxns = transactions.filter(t => t.counterparty === name);
    const totalAmount = relatedTxns.reduce((sum, t) => sum + t.amount, 0);
    const isFlagged = relatedTxns.some(t => ['VG', 'PA', 'CY'].includes(t.country));
    return {
      id: `CP-${idx + 1}`,
      name,
      transactionCount: relatedTxns.length,
      totalAmount,
      countries: [...new Set(relatedTxns.map(t => t.country))],
      isFlagged,
    };
  });

  // Mock related entities
  const relatedEntities = [
    { id: 'ENT-001', name: 'Global Trading Partners Ltd', relationship: 'Subsidiary', jurisdiction: 'BVI', flagged: true },
    { id: 'ENT-002', name: 'Pacific Investment Holdings', relationship: 'Shareholder', jurisdiction: 'Singapore', flagged: false },
    { id: 'ENT-003', name: 'Eastern Commerce Group', relationship: 'Business Partner', jurisdiction: 'Hong Kong', flagged: false },
  ];

  // Mock common identifiers
  const commonIdentifiers = [
    { type: 'Phone Number', value: '+65 ****-7890', sharedWith: ['Global Trading Partners Ltd'] },
    { type: 'Address', value: '123 Business Park, Singapore', sharedWith: ['Pacific Investment Holdings'] },
    { type: 'Director', value: 'John Smith', sharedWith: ['Global Trading Partners Ltd', 'Eastern Commerce Group'] },
  ];

  return (
    <div className="space-y-4">
      {/* Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Linked Accounts</CardTitle>
          </div>
          <CardDescription>All accounts associated with this customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between py-2 px-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.type}</p>
                    <p className="text-xs text-muted-foreground font-mono">{account.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium">
                    {account.currency} {account.balance.toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">{account.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Counterparties */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Transaction Counterparties</CardTitle>
          </div>
          <CardDescription>Entities this customer has transacted with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {counterparties.map((cp) => (
              <div 
                key={cp.id} 
                className={`flex items-center justify-between py-3 px-3 rounded-lg border ${cp.isFlagged ? 'border-risk-high/30 bg-risk-high/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {cp.isFlagged && <AlertTriangle className="h-4 w-4 text-risk-high" />}
                  <div>
                    <p className="text-sm font-medium">{cp.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{cp.transactionCount} transactions</span>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{cp.countries.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium">${cp.totalAmount.toLocaleString()}</p>
                  {cp.isFlagged && <Badge className="badge-risk-high text-xs mt-1">Flagged</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Entities */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Related Entities</CardTitle>
          </div>
          <CardDescription>Corporate relationships and affiliations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {relatedEntities.map((entity) => (
              <div 
                key={entity.id} 
                className={`flex items-center justify-between py-3 px-3 rounded-lg border ${entity.flagged ? 'border-risk-high/30 bg-risk-high/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {entity.flagged && <AlertTriangle className="h-4 w-4 text-risk-high" />}
                  <div>
                    <p className="text-sm font-medium">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">{entity.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {entity.jurisdiction}
                  </Badge>
                  {entity.flagged && <Badge className="badge-risk-high text-xs">High Risk</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Identifiers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Common Identifiers</CardTitle>
          </div>
          <CardDescription>Shared attributes with other entities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commonIdentifiers.map((identifier, idx) => (
              <div key={idx} className="py-3 px-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{identifier.type}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{identifier.value}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground">Shared with:</span>
                  {identifier.sharedWith.map((entity, eidx) => (
                    <Badge key={eidx} variant="secondary" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Visualization Placeholder */}
      <Card className="bg-muted/20">
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Interactive network graph visualization
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Available in premium tier
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
