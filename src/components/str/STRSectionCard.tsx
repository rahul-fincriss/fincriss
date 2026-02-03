import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { STRParagraphBlock } from './STRParagraphBlock';
import { STRSection, STRParagraph } from '@/types/str';
import { toast } from 'sonner';

interface STRSectionCardProps {
  section: STRSection;
  onUpdateParagraph: (paragraphId: string, content: string, isEdited: boolean) => void;
  onGenerateParagraph: (paragraphId: string) => void;
  onAddParagraph: () => void;
  generatingParagraphs: Set<string>;
  readOnly?: boolean;
}

export function STRSectionCard({
  section,
  onUpdateParagraph,
  onGenerateParagraph,
  onAddParagraph,
  generatingParagraphs,
  readOnly = false,
}: STRSectionCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleGenerate = (paragraphId: string) => {
    onGenerateParagraph(paragraphId);
  };

  const handleRegenerate = (paragraphId: string) => {
    onGenerateParagraph(paragraphId);
    toast.info('Regenerating paragraph with FinCrisS Agent...');
  };

  const handleEdit = (paragraphId: string, content: string) => {
    onUpdateParagraph(paragraphId, content, true);
    toast.success('Paragraph updated and marked as investigator-owned');
  };

  const handleAccept = (paragraphId: string, paragraph: STRParagraph) => {
    // Mark as accepted (removes AI highlight but keeps the content)
    onUpdateParagraph(paragraphId, paragraph.content, true);
    toast.success('Paragraph accepted');
  };

  const hasContent = section.paragraphs.some((p) => p.content.length > 0);
  const allEmpty = section.paragraphs.every((p) => !p.content);

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasContent && (
                  <span className="text-xs text-muted-foreground">
                    {section.paragraphs.filter((p) => p.content).length} paragraph(s)
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Generate all paragraphs action for empty section */}
            {allEmpty && !readOnly && (
              <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary mb-1">
                      Generate with FinCrisS Agent
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create a narrative draft using linked alerts, risk drivers, transactions, and KYC data
                    </p>
                    <Button
                      onClick={() => handleGenerate(section.paragraphs[0]?.id)}
                      className="gap-2"
                      disabled={generatingParagraphs.size > 0}
                    >
                      <Brain className="h-4 w-4" />
                      Generate with FinCrisS Agent
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Paragraph blocks */}
            {!allEmpty && (
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <STRParagraphBlock
                    key={paragraph.id}
                    paragraph={paragraph}
                    isGenerating={generatingParagraphs.has(paragraph.id)}
                    onGenerate={() => handleGenerate(paragraph.id)}
                    onRegenerate={() => handleRegenerate(paragraph.id)}
                    onEdit={(content) => handleEdit(paragraph.id, content)}
                    onAccept={() => handleAccept(paragraph.id, paragraph)}
                    readOnly={readOnly}
                  />
                ))}

                {/* Add another paragraph */}
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddParagraph}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Paragraph
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
