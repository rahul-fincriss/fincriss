import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileText, Home, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function STRConfirmationPage() {
  const navigate = useNavigate();
  
  const strDetails = {
    id: 'STR-2024-0045',
    fiuReference: 'FIU-SG-2024-00892',
    submittedAt: new Date(),
    caseId: 'CASE-2024-0091',
    customerName: 'Sunrise Exports Ltd',
    amount: 5670000,
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-lg w-full animate-fade-in">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-risk-low/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-risk-low" />
              </div>

              <div>
                <h1 className="text-2xl font-bold mb-2">STR Submitted Successfully</h1>
                <p className="text-muted-foreground">
                  The Suspicious Transaction Report has been filed with the FIU
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-6 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">STR Reference</span>
                  <Badge variant="secondary" className="font-mono">{strDetails.id}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">FIU Reference</span>
                  <span className="font-mono text-sm font-medium text-primary">{strDetails.fiuReference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span className="text-sm">
                    {strDetails.submittedAt.toLocaleDateString()} at {strDetails.submittedAt.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Case</span>
                  <span className="font-mono text-sm">{strDetails.caseId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subject</span>
                  <span className="text-sm">{strDetails.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-mono text-sm">${strDetails.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>This STR is now read-only and cannot be modified</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/audit')}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Audit Trail
                </Button>
                <Button className="flex-1" onClick={() => navigate('/dashboard')}>
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
