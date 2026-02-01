import { Shield, MapPin, Building, Calendar, FileCheck, AlertTriangle, User, Briefcase, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { CustomerKYC } from '@/types';
import { Separator } from '@/components/ui/separator';

interface KYCDetailsTabProps {
  customer: CustomerKYC;
}

export function KYCDetailsTab({ customer }: KYCDetailsTabProps) {
  // Mock extended KYC data
  const extendedKYC = {
    dateOfBirth: '1978-03-15',
    idType: 'Passport',
    idNumber: '****4521',
    idExpiry: '2028-06-20',
    address: '123 Business Park, Suite 400',
    city: 'Singapore',
    country: 'Singapore',
    postalCode: '048619',
    phoneNumber: '+65 ****-7890',
    email: 'contact@*****.com',
    onboardingDate: '2019-05-12',
    lastKYCReview: '2024-01-15',
    nextKYCReview: '2025-01-15',
    sourceOfWealth: 'Business Income',
    sourceOfFunds: 'Trading Revenue',
    expectedTurnover: '$500,000 - $1,000,000',
    riskRatingHistory: [
      { date: '2024-01-15', rating: 'high' as const, reason: 'Increased transaction volume' },
      { date: '2023-01-20', rating: 'medium' as const, reason: 'Annual review' },
      { date: '2022-01-18', rating: 'low' as const, reason: 'Initial onboarding' },
    ],
    documents: [
      { name: 'Passport Copy', status: 'verified', date: '2024-01-15' },
      { name: 'Proof of Address', status: 'verified', date: '2024-01-15' },
      { name: 'Business Registration', status: 'verified', date: '2019-05-12' },
      { name: 'Financial Statements', status: 'pending', date: '2024-06-01' },
    ],
    pepScreening: {
      lastScreened: '2024-12-01',
      status: customer.pep ? 'hit' : 'clear',
      details: customer.pep ? 'Identified as politically exposed person' : 'No PEP associations found',
    },
    sanctionsScreening: {
      lastScreened: '2024-12-01',
      status: customer.sanctions ? 'hit' : 'clear',
      details: customer.sanctions ? 'Match found in sanctions database' : 'No sanctions matches',
    },
  };

  return (
    <div className="space-y-4">
      {/* Identity & Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Identity Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Customer Type</p>
              <p className="font-medium capitalize">{customer.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nationality</p>
              <p className="font-medium">{customer.nationality}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth / Incorporation</p>
              <p className="font-medium">{extendedKYC.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID Type</p>
              <p className="font-medium">{extendedKYC.idType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID Number</p>
              <p className="font-mono text-muted-foreground">{extendedKYC.idNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address & Contact */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Address & Contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium">{extendedKYC.address}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">City</p>
              <p className="font-medium">{extendedKYC.city}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="font-medium">{extendedKYC.country}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Postal Code</p>
              <p className="font-medium">{extendedKYC.postalCode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-mono text-muted-foreground">{extendedKYC.phoneNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupation & Business */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Occupation & Business</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Occupation / Business</p>
              <p className="font-medium">{customer.occupation || customer.industry}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Industry</p>
              <p className="font-medium">{customer.industry}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source of Wealth</p>
              <p className="font-medium">{extendedKYC.sourceOfWealth}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source of Funds</p>
              <p className="font-medium">{extendedKYC.sourceOfFunds}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Declared Income</p>
              <p className="font-mono font-medium">${customer.declaredIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expected Turnover</p>
              <p className="font-medium">{extendedKYC.expectedTurnover}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Rating History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Risk Rating History</CardTitle>
            </div>
            <RiskBadge level={customer.riskRating} size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {extendedKYC.riskRatingHistory.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">{entry.date}</span>
                  <RiskBadge level={entry.rating} size="sm" />
                </div>
                <span className="text-xs text-muted-foreground">{entry.reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding & Review Dates */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Onboarding & Review</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Onboarding Date</p>
              <p className="font-medium">{extendedKYC.onboardingDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last KYC Review</p>
              <p className="font-medium">{extendedKYC.lastKYCReview}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next KYC Review</p>
              <p className="font-medium text-primary">{extendedKYC.nextKYCReview}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Documents Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {extendedKYC.documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{doc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{doc.date}</span>
                  <Badge 
                    variant={doc.status === 'verified' ? 'default' : 'secondary'}
                    className={doc.status === 'verified' ? 'bg-risk-low/20 text-risk-low border-risk-low/30' : ''}
                  >
                    {doc.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PEP & Sanctions Screening */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={extendedKYC.pepScreening.status === 'hit' ? 'border-risk-high/30 bg-risk-high/5' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">PEP Screening</CardTitle>
              </div>
              <Badge variant={extendedKYC.pepScreening.status === 'hit' ? 'destructive' : 'secondary'}>
                {extendedKYC.pepScreening.status === 'hit' ? 'HIT' : 'CLEAR'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Screened</span>
                <span>{extendedKYC.pepScreening.lastScreened}</span>
              </div>
              <p className="text-xs text-muted-foreground">{extendedKYC.pepScreening.details}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={extendedKYC.sanctionsScreening.status === 'hit' ? 'border-risk-high/30 bg-risk-high/5' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Sanctions Screening</CardTitle>
              </div>
              <Badge variant={extendedKYC.sanctionsScreening.status === 'hit' ? 'destructive' : 'secondary'}>
                {extendedKYC.sanctionsScreening.status === 'hit' ? 'HIT' : 'CLEAR'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Screened</span>
                <span>{extendedKYC.sanctionsScreening.lastScreened}</span>
              </div>
              <p className="text-xs text-muted-foreground">{extendedKYC.sanctionsScreening.details}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
