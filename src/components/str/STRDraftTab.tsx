import { useState, useCallback } from 'react';
import { Brain, Eye, FileText, Info, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { STRSectionCard } from './STRSectionCard';
import { STRPreviewPanel } from './STRPreviewPanel';
import { STRSection, STRParagraph, STRSectionType, STRNarrativeAuditEntry } from '@/types/str';
import { Case } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface STRDraftTabProps {
  caseData: Case;
  readOnly?: boolean;
  onSubmitToPO?: () => void;
}

// Mock narrative content for AI generation by case context
const mockNarrativesByCase: Record<string, Record<STRSectionType, string[]>> = {
  // Use Case 4: Money Mule / Funnel Account - Priya V. Sharma
  'CASE-MM-2026-001': {
    grounds_of_suspicion: [
      'The subject account, held by Ms. Priya V. Sharma (Customer ID: CUS-PS-1995), a 30-year-old homemaker residing in Pune, Maharashtra, has exhibited transaction patterns strongly indicative of Money Mule / Funnel Account activity. The account holder has declared zero income and an expected monthly turnover of ₹0 to ₹50,000.',
      'Between 20th January 2026 and 30th January 2026, the account received ₹12,00,000 through 8 inbound IMPS/NEFT transfers of ₹1,50,000 each, originating from 8 unrelated individuals across geographically dispersed locations in India (Delhi, Jaipur, Mumbai, Kolkata, Hyderabad, Chennai, Ahmedabad, and Indore). None of these remitters have any known relationship with the account holder.',
      'Within 48 hours of the final domestic inflow, ₹10,00,000 was transferred via SWIFT to Eurolink Consulting Ltd in Cyprus, a high-risk jurisdiction under FATF assessment. The stated purpose was "Consulting Fee," which is inconsistent with the account holder\'s homemaker profile and zero declared income.',
    ],
    transaction_narrative: [
      'Transaction flow analysis reveals a classic funnel account pattern: (1) Multiple small-to-medium inflows from unrelated domestic sources aggregated rapidly into the subject account, followed by (2) a single large outbound international transfer to a high-risk jurisdiction.',
      'Inbound Transactions (Placement/Funneling Phase):\n- 20-Jan-2026: ₹1,50,000 IMPS from Rajesh Kumar Gupta (Delhi)\n- 21-Jan-2026: ₹1,50,000 NEFT from Mohan Singh Rathore (Jaipur)\n- 23-Jan-2026: ₹1,50,000 IMPS from Vikram Joshi (Mumbai)\n- 24-Jan-2026: ₹1,50,000 NEFT from Amit Banerjee (Kolkata)\n- 25-Jan-2026: ₹1,50,000 IMPS from Suresh Reddy (Hyderabad)\n- 27-Jan-2026: ₹1,50,000 NEFT from Karthik Iyer (Chennai)\n- 28-Jan-2026: ₹1,50,000 IMPS from Dinesh Patel (Ahmedabad)\n- 30-Jan-2026: ₹1,50,000 NEFT from Rakesh Tiwari (Indore)\nTotal Inflows: ₹12,00,000 over 10 days from 8 cities.',
      'Outbound Transaction (Layering Phase):\n- 01-Feb-2026: ₹10,00,000 SWIFT transfer to Eurolink Consulting Ltd, Cyprus\n- Purpose stated: "Consulting Fee"\n- Jurisdiction Risk: HIGH (Cyprus)\n- Time from last inflow: <48 hours\n\nThe rapid aggregation and swift international remittance is characteristic of money mule operations used for layering proceeds of predicate offenses.',
    ],
    customer_background: [
      'Ms. Priya V. Sharma (PAN: WXYZ1010A) is a 30-year-old individual customer, onboarded on 10th February 2023. Her KYC profile indicates: Occupation: Homemaker; Declared Income: ₹0; Source of Wealth: Spouse Income; Source of Funds: Household Transfers; Expected Monthly Turnover: ₹0 - ₹50,000.',
      'The customer maintains a single Savings Account (A/c No: 3000XXXXXX) at the Pune branch. Pre-alert risk rating was Low based on minimal historical account activity. PEP and Sanctions screening: Clear. No prior alerts, cases, or STR filings exist for this customer.',
      'The severe mismatch between declared profile (zero-income homemaker with minimal expected turnover) and actual transaction behavior (₹12,00,000 inflows from 8 unrelated parties, ₹10,00,000 international outflow to Cyprus) raises significant concern about the account being used as a conduit for illicit funds without the account holder\'s full understanding of the fund sources.',
    ],
    supporting_indicators: [
      'FinCrisS Priority Rating: HIGH (Score: 95/100)\n\nRisk Indicators Identified:\n1. Money Mule / Funnel Account typology match (High Confidence)\n2. Severe profile mismatch: Zero declared income vs ₹12,00,000 actual inflows\n3. Multiple unrelated third-party deposits from 8 geographically dispersed cities\n4. High velocity: 8 deposits received within a 10-day window\n5. Rapid international outflow to high-risk jurisdiction (Cyprus) within 48 hours of aggregation',
      'Behavioral Anomaly Indicators:\n- Account historically dormant with minimal activity\n- Sudden spike in both volume and velocity of transactions\n- No commercial or business rationale evident for consulting fee payment\n- Beneficiary entity (Eurolink Consulting Ltd, Cyprus) has limited verifiable corporate presence\n\nTypology Classification: Money Mule / Funnel Account\nRecommendation: File STR with FIU-IND under Section 12 of PMLA, 2002',
    ],
  },
};

// Default mock narratives for other cases
const defaultMockNarratives: Record<STRSectionType, string[]> = {
  grounds_of_suspicion: [
    'The subject account has exhibited a pattern of transactions that deviate significantly from the declared business profile. Between January 2024 and present, the entity conducted 47 wire transfers totaling ₹5,67,00,000 to entities incorporated in jurisdictions with elevated money laundering risk ratings.',
    'Analysis of transaction flow indicates systematic structuring of payments just below reporting thresholds. The timing and amounts suggest deliberate fragmentation to evade detection, which is consistent with known money laundering methodologies.',
  ],
  transaction_narrative: [
    'The subject initiated a series of outbound wire transfers to Global Trade BVI Ltd (British Virgin Islands), Pacific Holdings Panama (Panama), and Eastern Materials Co (Hong Kong). Individual transaction amounts ranged from ₹18,00,000 to ₹32,00,000, with an aggregate value of ₹74,50,000 within a 72-hour period.',
    'Fund flow analysis reveals rapid movement of funds through multiple intermediary accounts before final settlement in offshore entities. This layering pattern is characteristic of trade-based money laundering schemes utilizing over-invoicing of goods and services.',
  ],
  customer_background: [
    'The entity is registered as a trading company with declared annual turnover of ₹2,00,00,000. The entity was incorporated 18 months ago with limited operational history. Beneficial ownership traces to a single individual with no prior commercial record in this jurisdiction.',
    'KYC review indicates the actual transaction volume exceeds the declared business activity by approximately 280%. The customer has been unable to provide satisfactory documentation supporting the commercial rationale for transactions with counterparties in high-risk jurisdictions.',
  ],
  supporting_indicators: [
    'FinCrisS risk scoring assigned this case a priority rating of High based on the following indicators: (1) Transactions with known shell company structures, (2) Use of high-risk jurisdictions including UAE, Singapore, and Cyprus, (3) Structuring patterns consistent with evasion of ₹10,00,000 CTR threshold.',
    'Additional red flags include: rapid account activity following dormancy period, mismatched invoice values compared to standard market pricing, and counterparties with minimal digital footprint or verifiable business operations.',
  ],
};

// Helper to get narratives based on case
const getNarrativesForCase = (caseId: string): Record<STRSectionType, string[]> => {
  return mockNarrativesByCase[caseId] || defaultMockNarratives;
};

// Initialize empty sections
const createInitialSections = (): STRSection[] => [
  {
    type: 'grounds_of_suspicion',
    title: 'Grounds of Suspicion',
    description: 'Explain why this activity is considered suspicious under AML regulations',
    paragraphs: [
      {
        id: 'gos-p1',
        sectionType: 'grounds_of_suspicion',
        content: '',
        isAiGenerated: false,
        isEdited: false,
        version: 1,
      },
    ],
  },
  {
    type: 'transaction_narrative',
    title: 'Transaction Narrative',
    description: 'Detailed description of the suspicious transactions and fund flows',
    paragraphs: [
      {
        id: 'txn-p1',
        sectionType: 'transaction_narrative',
        content: '',
        isAiGenerated: false,
        isEdited: false,
        version: 1,
      },
    ],
  },
  {
    type: 'customer_background',
    title: 'Customer Background',
    description: 'Background information from KYC profile and relationship history',
    paragraphs: [
      {
        id: 'cust-p1',
        sectionType: 'customer_background',
        content: '',
        isAiGenerated: false,
        isEdited: false,
        version: 1,
      },
    ],
  },
  {
    type: 'supporting_indicators',
    title: 'Supporting Indicators',
    description: 'Risk indicators and system findings that support the suspicion',
    paragraphs: [
      {
        id: 'ind-p1',
        sectionType: 'supporting_indicators',
        content: '',
        isAiGenerated: false,
        isEdited: false,
        version: 1,
      },
    ],
  },
];

export function STRDraftTab({ caseData, readOnly = false, onSubmitToPO }: STRDraftTabProps) {
  const [sections, setSections] = useState<STRSection[]>(createInitialSections);
  const [investigatorComments, setInvestigatorComments] = useState('');
  const [generatingParagraphs, setGeneratingParagraphs] = useState<Set<string>>(new Set());
  const [auditLog, setAuditLog] = useState<STRNarrativeAuditEntry[]>([]);
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');

  // Add audit entry
  const addAuditEntry = useCallback(
    (
      paragraphId: string,
      sectionType: STRSectionType,
      action: STRNarrativeAuditEntry['action'],
      previousContent?: string,
      newContent?: string
    ) => {
      const entry: STRNarrativeAuditEntry = {
        id: `audit-${Date.now()}`,
        caseId: caseData.id,
        paragraphId,
        sectionType,
        action,
        performedBy: action === 'generated' || action === 'regenerated' ? 'FinCrisS Agent' : 'Michael Torres',
        performedAt: new Date(),
        previousContent,
        newContent,
      };
      setAuditLog((prev) => [entry, ...prev]);
    },
    [caseData.id]
  );

  // Simulate AI generation with delay
  const simulateGeneration = useCallback(
    async (paragraphId: string, sectionType: STRSectionType): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const caseNarratives = getNarrativesForCase(caseData.id);
          const narratives = caseNarratives[sectionType];
          // Get a random narrative or combine them
          const content = narratives.join('\n\n');
          resolve(content);
        }, 2000 + Math.random() * 1000);
      });
    },
    [caseData.id]
  );

  // Generate paragraph
  const handleGenerateParagraph = useCallback(
    async (paragraphId: string) => {
      // Find the section containing this paragraph
      const section = sections.find((s) => s.paragraphs.some((p) => p.id === paragraphId));
      if (!section) return;

      const paragraph = section.paragraphs.find((p) => p.id === paragraphId);
      const previousContent = paragraph?.content || '';

      setGeneratingParagraphs((prev) => new Set(prev).add(paragraphId));

      try {
        const generatedContent = await simulateGeneration(paragraphId, section.type);

        setSections((prev) =>
          prev.map((s) =>
            s.type === section.type
              ? {
                ...s,
                paragraphs: s.paragraphs.map((p) =>
                  p.id === paragraphId
                    ? {
                      ...p,
                      content: generatedContent,
                      isAiGenerated: true,
                      isEdited: false,
                      generatedAt: new Date(),
                      generatedBy: 'fincriss_agent',
                      version: p.version + 1,
                    }
                    : p
                ),
              }
              : s
          )
        );

        addAuditEntry(
          paragraphId,
          section.type,
          previousContent ? 'regenerated' : 'generated',
          previousContent,
          generatedContent
        );

        toast.success('Narrative generated by FinCrisS Agent');
      } catch (error) {
        toast.error('Failed to generate narrative');
      } finally {
        setGeneratingParagraphs((prev) => {
          const next = new Set(prev);
          next.delete(paragraphId);
          return next;
        });
      }
    },
    [sections, simulateGeneration, addAuditEntry]
  );

  // Update paragraph (edit)
  const handleUpdateParagraph = useCallback(
    (sectionType: STRSectionType, paragraphId: string, content: string, isEdited: boolean) => {
      setSections((prev) =>
        prev.map((s) =>
          s.type === sectionType
            ? {
              ...s,
              paragraphs: s.paragraphs.map((p) =>
                p.id === paragraphId
                  ? {
                    ...p,
                    content,
                    isEdited,
                    editedAt: isEdited ? new Date() : p.editedAt,
                    editedBy: isEdited ? 'Michael Torres' : p.editedBy,
                  }
                  : p
              ),
            }
            : s
        )
      );

      if (isEdited) {
        const section = sections.find((s) => s.type === sectionType);
        const paragraph = section?.paragraphs.find((p) => p.id === paragraphId);
        addAuditEntry(paragraphId, sectionType, 'edited', paragraph?.content, content);
      }
    },
    [sections, addAuditEntry]
  );

  // Add paragraph to section
  const handleAddParagraph = useCallback((sectionType: STRSectionType) => {
    const newParagraphId = `${sectionType.slice(0, 3)}-p${Date.now()}`;
    setSections((prev) =>
      prev.map((s) =>
        s.type === sectionType
          ? {
            ...s,
            paragraphs: [
              ...s.paragraphs,
              {
                id: newParagraphId,
                sectionType,
                content: '',
                isAiGenerated: false,
                isEdited: false,
                version: 1,
              },
            ],
          }
          : s
      )
    );
  }, []);

  const handleSubmit = () => {
    onSubmitToPO?.();
    toast.success('STR Draft submitted to Principal Officer for review');
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">STR Draft</h2>
            <p className="text-sm text-muted-foreground">
              Case {caseData.id} • {caseData.customerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'edit' | 'preview')}>
            <TabsList>
              <TabsTrigger value="edit" className="gap-2">
                <FileText className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {!readOnly && (
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="h-4 w-4" />
              Submit to Principal Officer
            </Button>
          )}
        </div>
      </div>

      {/* AI Notice */}
      <Alert className="border-primary/30 bg-primary/5">
        <Brain className="h-4 w-4 text-primary" />
        <AlertDescription className="ml-2">
          <span className="font-medium">FinCrisS Agent Narrative Assistance</span> — Generate
          narrative paragraphs on-demand using linked alerts, risk drivers, STR-relevant
          transactions, and KYC profile. You are responsible for reviewing and finalizing all
          content.
        </AlertDescription>
      </Alert>

      {/* Input sources reference */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Data Sources for Narrative Generation</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {caseData.linkedAlerts.length} Linked Alerts
            </Badge>
            <Badge variant="outline" className="text-xs">
              Risk Drivers
            </Badge>
            <Badge variant="outline" className="text-xs">
              STR-Relevant Transactions
            </Badge>
            <Badge variant="outline" className="text-xs">
              Customer KYC Profile
            </Badge>
            <Badge variant="outline" className="text-xs">
              System Findings
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Content area */}
      {activeView === 'edit' ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <STRSectionCard
              key={section.type}
              section={section}
              onUpdateParagraph={(paragraphId, content, isEdited) =>
                handleUpdateParagraph(section.type, paragraphId, content, isEdited)
              }
              onGenerateParagraph={handleGenerateParagraph}
              onAddParagraph={() => handleAddParagraph(section.type)}
              generatingParagraphs={generatingParagraphs}
              readOnly={readOnly}
            />
          ))}

          {/* Investigator Comments */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Investigator Comments</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional notes and observations from your investigation
                  </p>
                </div>
                <Textarea
                  value={investigatorComments}
                  onChange={(e) => setInvestigatorComments(e.target.value)}
                  placeholder="Add any additional comments or observations relevant to the STR filing..."
                  className="min-h-[100px]"
                  disabled={readOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail Summary */}
          {auditLog.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Generation & Edit History</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {auditLog.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-xs py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              entry.action === 'generated' || entry.action === 'regenerated'
                                ? 'text-primary border-primary'
                                : 'text-muted-foreground'
                            }
                          >
                            {entry.action}
                          </Badge>
                          <span className="text-muted-foreground">
                            {entry.sectionType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{entry.performedBy}</span>
                          <span>•</span>
                          <span>{format(entry.performedAt, 'HH:mm')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <STRPreviewPanel
          sections={sections}
          caseId={caseData.id}
          customerName={caseData.customerName}
          investigatorComments={investigatorComments}
          caseData={caseData}
        />
      )}
    </div>
  );
}
