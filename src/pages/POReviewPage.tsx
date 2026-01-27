import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  CheckCircle, 
  Clock, 
  History, 
  MessageSquare, 
  RotateCcw, 
  XCircle 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockSTRDrafts, mockCases } from '@/data/mockData';
import { toast } from 'sonner';

export default function POReviewPage() {
  const navigate = useNavigate();
  const strDraft = mockSTRDrafts[0];
  const caseData = mockCases.find((c) => c.id === strDraft.caseId) || mockCases[0];

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [checklist, setChecklist] = useState({
    groundsReviewed: false,
    narrativeComplete: false,
    customerProfileAccurate: false,
    riskRationaleSound: false,
    complianceApproved: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const handleApprove = () => {
    if (!allChecked) {
      toast.error('Please complete all checklist items before approving');
      return;
    }
    toast.success('STR approved and ready for submission');
    navigate('/str/confirmed');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    toast.success('STR returned to investigator');
    setShowRejectDialog(false);
    navigate('/str');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Principal Officer Review</h1>
                <Badge variant="secondary" className="font-mono">{strDraft.id}</Badge>
              </div>
              <p className="text-muted-foreground">
                {caseData.customerName} • ${caseData.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Send Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={!allChecked}>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - STR Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">STR Summary</CardTitle>
                <CardDescription>
                  Review the key findings and grounds for filing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Grounds of Suspicion</h4>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm">{strDraft.groundsOfSuspicion}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Transaction Summary</h4>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm">{strDraft.transactionNarrative}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm">{strDraft.riskRationale}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investigator Comments */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Investigator Comments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm">{strDraft.investigatorComments}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Compliance Checklist</CardTitle>
                </div>
                <CardDescription>
                  All items must be checked before approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="grounds"
                    checked={checklist.groundsReviewed}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, groundsReviewed: !!checked })
                    }
                  />
                  <label htmlFor="grounds" className="text-sm cursor-pointer">
                    Grounds of suspicion adequately documented
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="narrative"
                    checked={checklist.narrativeComplete}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, narrativeComplete: !!checked })
                    }
                  />
                  <label htmlFor="narrative" className="text-sm cursor-pointer">
                    Transaction narrative is complete and accurate
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="profile"
                    checked={checklist.customerProfileAccurate}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, customerProfileAccurate: !!checked })
                    }
                  />
                  <label htmlFor="profile" className="text-sm cursor-pointer">
                    Customer profile verified against KYC records
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="rationale"
                    checked={checklist.riskRationaleSound}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, riskRationaleSound: !!checked })
                    }
                  />
                  <label htmlFor="rationale" className="text-sm cursor-pointer">
                    Risk rationale is sound and well-supported
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="compliance"
                    checked={checklist.complianceApproved}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, complianceApproved: !!checked })
                    }
                  />
                  <label htmlFor="compliance" className="text-sm cursor-pointer">
                    Meets regulatory filing requirements
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Change History */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Change History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {strDraft.changes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No changes recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {strDraft.changes.map((change) => (
                      <div key={change.id} className="text-sm border-l-2 border-border pl-3 py-1">
                        <p className="font-medium">{change.field}</p>
                        <p className="text-xs text-muted-foreground">
                          Changed by {change.changedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject or Return STR</DialogTitle>
              <DialogDescription>
                Please provide a reason for returning this STR to the investigator
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter reason (required)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
