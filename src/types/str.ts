// STR Draft paragraph-level types for FinCrisS Agent narrative generation

export type STRSectionType = 
  | 'grounds_of_suspicion' 
  | 'transaction_narrative' 
  | 'customer_background' 
  | 'supporting_indicators';

export interface STRParagraph {
  id: string;
  sectionType: STRSectionType;
  content: string;
  isAiGenerated: boolean;
  isEdited: boolean;
  generatedAt?: Date;
  generatedBy?: 'fincriss_agent';
  editedAt?: Date;
  editedBy?: string;
  version: number;
}

export interface STRSection {
  type: STRSectionType;
  title: string;
  description: string;
  paragraphs: STRParagraph[];
}

export interface STRDraftData {
  caseId: string;
  sections: STRSection[];
  investigatorComments: string;
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
}

export interface STRNarrativeAuditEntry {
  id: string;
  caseId: string;
  paragraphId: string;
  sectionType: STRSectionType;
  action: 'generated' | 'regenerated' | 'edited' | 'accepted';
  performedBy: string;
  performedAt: Date;
  previousContent?: string;
  newContent?: string;
}

// Input sources used for narrative generation
export interface NarrativeInputSources {
  linkedAlerts: string[];
  riskDrivers: string[];
  strRelevantTransactions: string[];
  customerKycProfile: string;
  systemFindings: string[];
}
