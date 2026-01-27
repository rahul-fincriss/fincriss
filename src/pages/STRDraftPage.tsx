import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Check, 
  Edit3, 
  Eye, 
  Send 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockSTRDrafts, mockCases } from '@/data/mockData';
import { toast } from 'sonner';

export default function STRDraftPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  
  const strDraft = mockSTRDrafts[0];
  const caseData = mockCases.find((c) => c.id === strDraft.caseId) || mockCases[0];

  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    groundsOfSuspicion: strDraft.groundsOfSuspicion,
    transactionNarrative: strDraft.transactionNarrative,
    customerProfile: strDraft.customerProfile,
    riskRationale: strDraft.riskRationale,
    investigatorComments: strDraft.investigatorComments,
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmitToPO = () => {
    toast.success('STR submitted to Principal Officer for review');
    navigate('/str');
  };

  const sections = [
    {
      key: 'groundsOfSuspicion',
      title: 'Grounds of Suspicion',
      description: 'Why this transaction is considered suspicious',
      aiGenerated: strDraft.aiGenerated.groundsOfSuspicion,
    },
    {
      key: 'transactionNarrative',
      title: 'Transaction Narrative',
      description: 'Detailed description of the suspicious transactions',
      aiGenerated: strDraft.aiGenerated.transactionNarrative,
    },
    {
      key: 'customerProfile',
      title: 'Customer Profile',
      description: 'Background information about the customer',
      aiGenerated: strDraft.aiGenerated.customerProfile,
    },
    {
      key: 'riskRationale',
      title: 'Risk Rationale',
      description: 'Assessment of risk factors and indicators',
      aiGenerated: strDraft.aiGenerated.riskRationale,
    },
  ];

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
                <h1 className="text-2xl font-bold">STR Draft</h1>
                <Badge variant="secondary" className="font-mono">{strDraft.id}</Badge>
              </div>
              <p className="text-muted-foreground">
                Case: {caseData.id} • {caseData.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSubmitToPO}>
              <Send className="mr-2 h-4 w-4" />
              Submit to Principal Officer
            </Button>
          </div>
        </div>

        {/* AI Notice */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 p-2">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">AI-Generated Content</p>
                <p className="text-sm text-muted-foreground">
                  Sections marked with the AI badge contain AI-generated text. Review and edit as needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STR Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.key} className="card-interactive">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {section.aiGenerated && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <Brain className="mr-1 h-3 w-3" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  {editingField === section.key ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(null)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Done
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(section.key)}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {editingField === section.key ? (
                  <Textarea
                    value={formData[section.key as keyof typeof formData]}
                    onChange={(e) => handleFieldChange(section.key, e.target.value)}
                    className="min-h-[150px]"
                  />
                ) : (
                  <div className={section.aiGenerated ? 'ai-generated rounded-lg p-4' : ''}>
                    <p className="text-sm whitespace-pre-wrap">
                      {formData[section.key as keyof typeof formData]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Investigator Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Investigator Comments</CardTitle>
              <CardDescription>Additional notes from the investigation</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.investigatorComments}
                onChange={(e) => handleFieldChange('investigatorComments', e.target.value)}
                placeholder="Add any additional comments or observations..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
