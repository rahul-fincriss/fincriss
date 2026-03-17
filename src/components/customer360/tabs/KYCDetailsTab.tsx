import { Shield, MapPin, Calendar, FileCheck, AlertTriangle, User, Briefcase, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ExtendedCustomerProfile } from '@/types';
import { formatINRFull } from '@/lib/formatters';

interface KYCDetailsTabProps {
  customerProfile: ExtendedCustomerProfile;
}

export function KYCDetailsTab({ customerProfile }: KYCDetailsTabProps) {
  const { kyc, riskRatingHistory, documents, pepScreening, sanctionsScreening } = customerProfile;

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
              <p className="font-medium">{kyc.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Customer Type</p>
              <p className="font-medium capitalize">{kyc.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nationality</p>
              <p className="font-medium">{kyc.nationality}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kyc.type === 'corporate' ? 'Date of Incorporation' : 'Date of Birth'}</p>
              <p className="font-medium">{kyc.dateOfBirth || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID Type</p>
              <p className="font-medium">{kyc.idType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID Number</p>
              <p className="font-mono text-muted-foreground">{kyc.idNumber || 'N/A'}</p>
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
              <p className="font-medium">{kyc.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">City</p>
              <p className="font-medium">{kyc.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="font-medium">{kyc.country || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Postal Code</p>
              <p className="font-medium">{kyc.postalCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-mono text-muted-foreground">{kyc.phoneNumber || 'N/A'}</p>
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
              <p className="font-medium">{kyc.occupation || kyc.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Industry</p>
              <p className="font-medium">{kyc.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source of Wealth</p>
              <p className="font-medium">{kyc.sourceOfWealth || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source of Funds</p>
              <p className="font-medium">{kyc.sourceOfFunds || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Declared Income</p>
              <p className="font-mono font-medium">{formatINRFull(kyc.declaredIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expected Turnover</p>
              <p className="font-medium">{kyc.expectedTurnover || 'N/A'}</p>
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
            <RiskBadge level={kyc.riskRating} size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskRatingHistory.map((entry, idx) => (
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
              <p className="font-medium">{kyc.onboardingDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last KYC Review</p>
              <p className="font-medium">{kyc.lastKYCReview || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next KYC Review</p>
              <p className="font-medium text-primary">{kyc.nextKYCReview || 'N/A'}</p>
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
            {documents.map((doc, idx) => (
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
        <Card className={pepScreening.status === 'hit' ? 'border-risk-high/30 bg-risk-high/5' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">PEP Screening</CardTitle>
              </div>
              <Badge variant={pepScreening.status === 'hit' ? 'destructive' : 'secondary'}>
                {pepScreening.status === 'hit' ? 'HIT' : 'CLEAR'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Screened</span>
                <span>{pepScreening.lastScreened}</span>
              </div>
              <p className="text-xs text-muted-foreground">{pepScreening.details}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={sanctionsScreening.status === 'hit' ? 'border-risk-high/30 bg-risk-high/5' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Sanctions Screening</CardTitle>
              </div>
              <Badge variant={sanctionsScreening.status === 'hit' ? 'destructive' : 'secondary'}>
                {sanctionsScreening.status === 'hit' ? 'HIT' : 'CLEAR'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Screened</span>
                <span>{sanctionsScreening.lastScreened}</span>
              </div>
              <p className="text-xs text-muted-foreground">{sanctionsScreening.details}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}