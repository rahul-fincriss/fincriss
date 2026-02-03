import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STRSection } from '@/types/str';
import { STRFormData, generateMockSTRFormData } from '@/types/str-form';
import { STRFormPage, PartHeader, FormField, FormBox, CheckboxField, FormTable, NumberedList } from './STRFormPage';
import { toast } from 'sonner';

interface STRPreviewFIUProps {
  sections: STRSection[];
  caseId: string;
  customerName: string;
  investigatorComments?: string;
}

export function STRPreviewFIU({
  sections,
  caseId,
  customerName,
  investigatorComments,
}: STRPreviewFIUProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const totalPages = 4;

  // Generate form data with narrative content
  const formData: STRFormData = generateMockSTRFormData(caseId, customerName);

  // Extract grounds of suspicion from narrative sections
  const getGroundsOfSuspicion = (): string[] => {
    const gosSection = sections.find(s => s.type === 'grounds_of_suspicion');
    if (!gosSection) return [];
    
    const content = gosSection.paragraphs
      .filter(p => p.content)
      .map(p => p.content)
      .join('\n\n');
    
    // Split into sentences/points for the numbered list
    if (!content) return [];
    const sentences = content.split(/\.\s+/).filter(s => s.trim().length > 0);
    return sentences.map(s => s.trim().toUpperCase() + (s.endsWith('.') ? '' : '.'));
  };

  const groundsOfSuspicion = getGroundsOfSuspicion();

  const handleDownloadPDF = () => {
    toast.success('PDF download initiated. Check your downloads folder.');
    // In a real implementation, this would generate a PDF
    // using a library like jsPDF or call a backend service
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPage1 = () => (
    <STRFormPage pageNumber={1} pageCode="SBA01">
      {/* PART 1: Details of Report */}
      <PartHeader partNumber={1} title="DETAILS OF REPORT" />
      <div className="space-y-3 pl-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField number="1.1" label="Date of sending report" value={formData.dateOfReport} />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="font-bold">1.2</span>
          <span>Is this a replacement to an earlier report?</span>
          <CheckboxField label="NO" checked={!formData.isReplacement} />
          <CheckboxField label="YES" checked={formData.isReplacement} />
        </div>
        <FormField 
          number="1.3" 
          label="Date of sending original report (if replacement)" 
          value={formData.originalReportDate || ''} 
        />
      </div>

      {/* PART 2: Details of Principal Officer */}
      <PartHeader partNumber={2} title="DETAILS OF PRINCIPAL OFFICER" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 pl-4">
        <FormField number="2.1" label="Name of Bank" value={formData.bankName} />
        <FormField number="2.2" label="BSR code" value={formData.bsrCode} />
        <FormField number="2.3" label="ID allotted by FIU‑IND" value={formData.fiuIndId} />
        <FormField number="2.4" label="Category of bank" value={formData.bankCategory} />
        <FormField number="2.5" label="Name of principal officer" value={formData.principalOfficerName} />
        <FormField number="2.6" label="Designation" value={formData.principalOfficerDesignation} />
        <FormField number="2.7" label="Address (No., Building)" value={formData.poAddressLine1} />
        <FormField number="2.8" label="Street/Road" value={formData.poStreet} />
        <FormField number="2.9" label="Locality" value={formData.poLocality} />
        <FormField number="2.10" label="City/Town, District" value={formData.poCityDistrict} />
        <FormField number="2.11" label="State, Country" value={formData.poStateCountry} />
        <FormField number="2.12" label="Pin code" value={formData.poPinCode} />
        <FormField number="2.13" label="Tel (with STD code)" value={formData.poTelephone} />
        <FormField number="2.14" label="Fax" value={formData.poFax} />
        <FormField number="2.15" label="E‑mail" className="col-span-2" value={formData.poEmail} />
      </div>

      {/* PART 3: Details of Reporting Branch */}
      <PartHeader partNumber={3} title="DETAILS OF REPORTING BRANCH / LOCATION" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 pl-4">
        <FormField number="3.1" label="Name of Branch/Location" value={formData.branchName} />
        <FormField number="3.2" label="BSR code" value={formData.branchBsrCode} />
        <FormField number="3.3" label="ID allotted by FIU‑IND" value={formData.branchFiuIndId} />
        <div /> {/* Empty for alignment */}
        <FormField number="3.4" label="Address (No., Building)" value={formData.branchAddressLine1} />
        <FormField number="3.5" label="Street/Road" value={formData.branchStreet} />
        <FormField number="3.6" label="Locality" value={formData.branchLocality} />
        <FormField number="3.7" label="City/Town, District" value={formData.branchCityDistrict} />
        <FormField number="3.8" label="State, Country" value={formData.branchStateCountry} />
        <FormField number="3.9" label="Pin code" value={formData.branchPinCode} />
        <FormField number="3.10" label="Tel (with STD code)" value={formData.branchTelephone} />
        <FormField number="3.11" label="Fax" value={formData.branchFax} />
        <FormField number="3.12" label="E‑mail" className="col-span-2" value={formData.branchEmail} />
      </div>
    </STRFormPage>
  );

  const renderPage2 = () => {
    // Create rows for individuals table (15 rows)
    const individualRows = Array.from({ length: 15 }, (_, i) => {
      const ind = formData.individuals[i];
      return {
        cells: [
          `4.${i + 1}`,
          ind?.name || '',
          ind?.customerId || '',
          ind?.annexureNumber || `A ${i + 1}`,
        ],
      };
    });

    // Create rows for legal entities table (10 rows)
    const entityRows = Array.from({ length: 10 }, (_, i) => {
      const ent = formData.legalEntities[i];
      return {
        cells: [
          `5.${i + 1}`,
          ent?.name || '',
          ent?.customerId || '',
          ent?.annexureNumber || `B ${i + 1}`,
        ],
      };
    });

    return (
      <STRFormPage pageNumber={2} pageCode="SBA02">
        {/* PART 4: List of Individuals */}
        <PartHeader partNumber={4} title="LIST OF INDIVIDUALS LINKED TO TRANSACTIONS" />
        <div className="space-y-2 pl-4">
          <FormTable
            headers={['S.No.', 'Name of individual', 'Customer ID/number', 'Annexure']}
            rows={individualRows}
            columnWidths={['50px', '40%', '30%', '15%']}
          />
          <p className="text-xs italic text-gray-600">
            (Details of all individuals should be furnished in prescribed annexure) Tick ✓ to confirm
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span>Number of additional sheets for PART 4 attached:</span>
            <div className="w-16 h-6 border border-gray-400 bg-gray-50" />
          </div>
        </div>

        {/* PART 5: List of Legal Persons/Entities */}
        <PartHeader partNumber={5} title="LIST OF LEGAL PERSONS/ENTITIES LINKED TO TRANSACTIONS" />
        <div className="space-y-2 pl-4">
          <FormTable
            headers={['S.No.', 'Name of legal person/entity', 'Customer ID/number', 'Annexure']}
            rows={entityRows}
            columnWidths={['50px', '40%', '30%', '15%']}
          />
          <p className="text-xs italic text-gray-600">
            (Details of all legal persons/entities should be furnished in prescribed annexure) Tick ✓ to confirm
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span>Number of additional sheets for PART 5 attached:</span>
            <div className="w-16 h-6 border border-gray-400 bg-gray-50" />
          </div>
        </div>
      </STRFormPage>
    );
  };

  const renderPage3 = () => {
    // Create rows for accounts table (10 rows)
    const accountRows = Array.from({ length: 10 }, (_, i) => {
      const acc = formData.accounts[i];
      return {
        cells: [
          `6.${i + 1}`,
          acc?.accountNumber || '',
          acc?.accountHolderName || '',
          acc?.annexureNumber || `C ${i + 1}`,
        ],
      };
    });

    // First 10 grounds for page 3
    const groundsPage3 = groundsOfSuspicion.slice(0, 10);
    while (groundsPage3.length < 10) {
      groundsPage3.push('');
    }

    return (
      <STRFormPage pageNumber={3} pageCode="SBA03">
        {/* PART 6: List of Accounts */}
        <PartHeader partNumber={6} title="LIST OF ACCOUNTS LINKED TO TRANSACTIONS" />
        <div className="space-y-2 pl-4">
          <FormTable
            headers={['S.No.', 'Account Number', 'Name of First Account Holder', 'Annexure']}
            rows={accountRows}
            columnWidths={['50px', '30%', '40%', '15%']}
          />
          <p className="text-xs italic text-gray-600">
            (Details of all accounts should be furnished in prescribed annexure) Tick ✓ to confirm
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span>Number of additional sheets for PART 6 attached:</span>
            <div className="w-16 h-6 border border-gray-400 bg-gray-50" />
          </div>
        </div>

        {/* PART 7: Details of Suspicious Transaction */}
        <PartHeader partNumber={7} title="DETAILS OF SUSPICIOUS TRANSACTION" />
        <div className="space-y-4 pl-4">
          <FormBox number="7.1" label="Reasons for suspicion (Tick ✓ as applicable. Multiple selection is possible)">
            <div className="grid grid-cols-2 gap-2 p-2 border border-gray-400 bg-gray-50">
              <CheckboxField label="A. Identity of client" checked={formData.reasonsForSuspicion.identityOfClient} />
              <CheckboxField label="B. Background of client" checked={formData.reasonsForSuspicion.backgroundOfClient} />
              <CheckboxField label="C. Multiple accounts" checked={formData.reasonsForSuspicion.multipleAccounts} />
              <CheckboxField label="D. Activity in account" checked={formData.reasonsForSuspicion.activityInAccount} />
              <CheckboxField label="E. Nature of transaction" checked={formData.reasonsForSuspicion.natureOfTransaction} />
              <CheckboxField label="F. Value of transaction" checked={formData.reasonsForSuspicion.valueOfTransaction} />
              <div className="col-span-2">
                <CheckboxField label="Z. Other reason (specify)" checked={formData.reasonsForSuspicion.otherReason} />
              </div>
            </div>
          </FormBox>

          <FormBox number="7.2" label="Grounds of Suspicion (Mention summary of suspicion and sequence of events)">
            <NumberedList items={groundsPage3} startNumber={1} />
          </FormBox>
          <p className="text-xs italic text-gray-500 text-right">(continued on next page)</p>
        </div>
      </STRFormPage>
    );
  };

  const renderPage4 = () => {
    // Grounds continued (11-30)
    const groundsPage4 = groundsOfSuspicion.slice(10, 30);
    while (groundsPage4.length < 20) {
      groundsPage4.push('');
    }

    // Action taken items
    const actionItems = [...formData.actionTaken];
    while (actionItems.length < 5) {
      actionItems.push('');
    }

    return (
      <STRFormPage pageNumber={4} pageCode="SBA04">
        {/* PART 7 continued */}
        <div className="space-y-4">
          <FormBox number="7.3" label="Grounds of Suspicion (continued from previous page)">
            <NumberedList items={groundsPage4} startNumber={11} />
          </FormBox>
          <div className="flex items-center gap-2 text-xs">
            <span>Number of additional sheets for PART 7 attached:</span>
            <div className="w-16 h-6 border border-gray-400 bg-gray-50" />
          </div>
        </div>

        {/* PART 8: Details of Action Taken */}
        <PartHeader partNumber={8} title="DETAILS OF ACTION TAKEN" />
        <div className="space-y-4 pl-4">
          <FormBox number="8.1" label="Whether the matter is/was under any investigation? (Mention the name of agency, person and contact details)">
            <NumberedList items={actionItems} startNumber={1} />
          </FormBox>
          <div className="flex items-center gap-2 text-xs">
            <span>Number of additional sheets for PART 8 attached:</span>
            <div className="w-16 h-6 border border-gray-400 bg-gray-50" />
          </div>
        </div>

        {/* Signature Block */}
        <div className="mt-8 pt-4 border-t-2 border-black">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="text-xs font-medium">Signature</div>
              <div className="h-16 border border-gray-400 bg-gray-50" />
              <FormField label="Name" value={formData.signatoryName} />
              <p className="text-xs text-gray-500 italic">(Should be same as the person mentioned in PART 2)</p>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-medium text-gray-400">DO NOT FILL. FOR FIU‑IND USE ONLY</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span>ACK. NO.</span>
                  <div className="flex-1 h-6 border border-gray-400 bg-gray-100" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>DATE</span>
                  <div className="flex gap-1">
                    {['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'].map((char, i) => (
                      <div key={i} className="w-5 h-6 border border-gray-400 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </STRFormPage>
    );
  };

  const pages = [renderPage1, renderPage2, renderPage3, renderPage4];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">STR Preview (FIU-IND SBA01)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Official Suspicious Transaction Report format for Banking Company
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button size="sm" className="gap-2" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
              Download STR (PDF)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-4 px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Content */}
        <ScrollArea className="h-[700px]">
          <div ref={previewRef} className="flex justify-center">
            <div className="w-[816px] shadow-lg print:shadow-none">
              {pages[currentPage - 1]()}
            </div>
          </div>
        </ScrollArea>

        {/* Page indicator */}
        <div className="text-center text-xs text-muted-foreground mt-4">
          Page {currentPage} of {totalPages}
        </div>
      </CardContent>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .str-form-page, .str-form-page * {
            visibility: visible;
          }
          .str-form-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-after: always;
          }
        }
      `}</style>
    </Card>
  );
}
