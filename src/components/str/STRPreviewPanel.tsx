import { FileText, Printer, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReactNode, useState, useMemo } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { STRSection } from "@/types/str";
import { Case } from "@/types";

interface STRPreviewPanelProps {
  sections: STRSection[];
  caseId: string;
  customerName: string;
  investigatorComments?: string;
  caseData?: Case; // Optional for now, to maintain backward compatibility
}

// Helper function to map sections to PDF data structure
const mapSectionsToPDFData = (
  sections: STRSection[],
  caseId: string,
  customerName: string,
  investigatorComments?: string,
  caseData?: Case,
) => {
  // Extract section content
  const getSectionContent = (sectionType: string): string[] => {
    const section = sections.find((s) => s.type === sectionType);
    if (!section) return [];
    return section.paragraphs.filter((p) => p.content && p.content.trim()).map((p) => p.content);
  };

  const groundsOfSuspicion = getSectionContent("grounds_of_suspicion");
  const transactionNarrative = getSectionContent("transaction_narrative");
  const customerBackground = getSectionContent("customer_background");
  const supportingIndicators = getSectionContent("supporting_indicators");

  // Combine all investigation details
  const investigationDetails = [
    ...groundsOfSuspicion.map((g) => `Grounds: ${g}`),
    ...transactionNarrative.map((t) => `Transaction Details: ${t}`),
    ...customerBackground.map((c) => `Customer Info: ${c}`),
    ...supportingIndicators.map((s) => `Indicators: ${s}`),
  ];

  if (investigatorComments && investigatorComments.trim()) {
    investigationDetails.push(`Investigator Comments: ${investigatorComments}`);
  }

  return {
    reportDetails: {
      dateOfSending: new Date().toISOString().split("T")[0],
      isReplacement: false,
      originalReportDate: undefined,
    },
    principalOfficer: {
      bankName: "ABC Bank Ltd", // TODO: Get from organization config
      bsrCode: "0123456",
      fiuIndId: "FIU-ABC-001",
      bankCategory: "C", // C = Commercial Bank
      officerName: "John Doe", // TODO: Get from user context
      designation: "Principal Officer - AML",
      addressNo: "Tower A, 5th Floor",
      street: "Financial District Road",
      locality: "Bandra Kurla Complex",
      cityDistrict: "Mumbai, Mumbai Suburban",
      stateCountry: "Maharashtra, India",
      pinCode: "400051",
      telephone: "+91-22-12345678",
      fax: "+91-22-12345679",
      email: "aml.officer@abcbank.com",
    },
    reportingBranch: {
      branchName: "ABC Bank - BKC Branch", // TODO: Get from organization config
      bsrCode: "0123457",
      fiuIndId: "FIU-ABC-BKC-001",
      addressNo: "Ground Floor, Wing B",
      street: "BKC Main Road",
      locality: "Bandra Kurla Complex",
      cityDistrict: "Mumbai, Mumbai Suburban",
      stateCountry: "Maharashtra, India",
      pinCode: "400051",
      telephone: "+91-22-87654321",
      fax: "+91-22-87654322",
      email: "bkc.branch@abcbank.com",
    },
    linkedIndividuals: [
      {
        name: customerName,
        customerId: caseData?.customerId || "CUST-" + caseId,
        annexure: "A1",
      },
    ],
    linkedEntities: [
      // TODO: Extract from case data if available
    ],
    linkedAccounts: [
      {
        accountNumber: `ACC-${caseId}`,
        accountHolderName: customerName,
        annexure: "C1",
      },
    ],
    suspiciousTransaction: {
      reasonsForSuspicion: ["D", "E", "F"], // TODO: Derive from risk drivers/alert types
      groundsOfSuspicion:
        groundsOfSuspicion.length > 0 ? groundsOfSuspicion : ["No grounds of suspicion documented yet"],
    },
    actionTaken: {
      investigationDetails:
        investigationDetails.length > 0 ? investigationDetails : ["Investigation in progress - Case ID: " + caseId],
    },
  };
};

// Helper Components
const ReportSection = ({ title, partNumber, children }: { title: string; partNumber: string; children: ReactNode }) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            PART {partNumber}
          </span>
          <h2 className="font-semibold text-lg text-foreground">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

const FormField = ({
  label,
  value,
  fieldNumber,
}: {
  label: string;
  value: string | undefined;
  fieldNumber?: string;
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {fieldNumber && <span className="text-xs text-primary font-semibold">{fieldNumber}</span>}
        {label}
      </label>
      <div className="bg-muted/50 border border-border rounded-md px-4 py-2.5 text-foreground font-medium min-h-[42px] flex items-center">
        {value || <span className="text-muted-foreground/50">—</span>}
      </div>
    </div>
  );
};

const DataTable = ({ columns, data }: { columns: { header: string; accessor: string }[]; data: any[] }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              S.No
            </th>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
              {columns.map((col) => (
                <td key={col.accessor} className="px-4 py-3 text-sm text-foreground font-medium">
                  {row[col.accessor] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const suspicionReasonLabels: Record<string, string> = {
  A: "Identity of client",
  B: "Background of client",
  C: "Multiple accounts",
  D: "Activity in account",
  E: "Nature of transaction",
  F: "Value of transaction",
  Z: "Other reason",
};

const bankCategoryLabels: Record<string, string> = {
  C: "Commercial Bank",
  P: "Private Bank",
  F: "Foreign Bank",
  R: "Regional Rural Bank",
  O: "Other",
};

export function STRPreviewPanel({
  sections,
  caseId,
  customerName,
  investigatorComments,
  caseData,
}: STRPreviewPanelProps) {
  // Map actual data from sections to PDF structure
  const data = useMemo(
    () => mapSectionsToPDFData(sections, caseId, customerName, investigatorComments, caseData),
    [sections, caseId, customerName, investigatorComments, caseData],
  );
  const [exporting, setExporting] = useState(false);

  // Sanitize text to ensure compatibility with WinAnsi encoding used in PDF templates
  const sanitizeForPDF = (text: string | undefined): string => {
    if (!text) return "";

    return (
      text
        // Replace Indian Rupee symbol with INR
        .replace(/₹/g, "INR ")
        // Replace other common currency symbols that might cause issues
        .replace(/€/g, "EUR ")
        .replace(/£/g, "GBP ")
        .replace(/¥/g, "JPY ")
        // Remove other problematic Unicode characters (keep only WinAnsi-safe chars)
        // This regex keeps standard ASCII and common Western European chars
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    );
  };

  const handleExportPDF = async () => {
    setExporting(true);
    toast.info("Generating PDF from template...");

    try {
      // Fetch the template PDF from the template directory
      const templateUrl = "/template/SBA STR Template.pdf";
      const existingPdfBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());

      // Load the PDF template
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Fill in the form fields with actual data mappings
      try {
        // Part 1: Report Details - Date of sending report
        const dateStr = data.reportDetails.dateOfSending;
        const [year, month, day] = dateStr.split("-");

        form.getTextField("Date1").setText(day[0]);
        form.getTextField("Date2").setText(day[1]);
        form.getTextField("Month1").setText(month[0]);
        form.getTextField("Month2").setText(month[1]);
        form.getTextField("Year").setText(year[3]);

        // Part 2: Principal Officer
        form.getTextField("NameEntity").setText(sanitizeForPDF(data.principalOfficer.bankName));
        form.getTextField("UnqiueCode").setText(sanitizeForPDF(data.principalOfficer.bsrCode));
        form.getTextField("IDFIU").setText(sanitizeForPDF(data.principalOfficer.fiuIndId));
        form.getTextField("EntityCategory").setText(sanitizeForPDF(data.principalOfficer.bankCategory));
        form
          .getTextField("DesignationPrincipal")
          .setText(sanitizeForPDF(`${data.principalOfficer.officerName}, ${data.principalOfficer.designation}`));
        form.getTextField("PrincipalAddress1").setText(sanitizeForPDF(data.principalOfficer.addressNo));
        form.getTextField("PrincipalAddress2").setText(sanitizeForPDF(data.principalOfficer.street));
        form.getTextField("PrincipalAddress3").setText(sanitizeForPDF(data.principalOfficer.locality));
        form.getTextField("PrincipalAddress4").setText(sanitizeForPDF(data.principalOfficer.cityDistrict));
        form.getTextField("PrincipalAddress5").setText(sanitizeForPDF(data.principalOfficer.stateCountry));
        form.getTextField("PrincipalPIN").setText(sanitizeForPDF(data.principalOfficer.pinCode));
        form.getTextField("PrincipalTel").setText(sanitizeForPDF(data.principalOfficer.telephone));
        form.getTextField("PrincipalFAX").setText(sanitizeForPDF(data.principalOfficer.fax));
        form.getTextField("PrincipalEmail").setText(sanitizeForPDF(data.principalOfficer.email));

        // Part 3: Reporting Branch
        form.getTextField("NameBranch").setText(sanitizeForPDF(data.reportingBranch.branchName));
        form.getTextField("BranchCode").setText(sanitizeForPDF(data.reportingBranch.bsrCode));
        form.getTextField("BranchIDFIU").setText(sanitizeForPDF(data.reportingBranch.fiuIndId));
        form.getTextField("BranchAddress1").setText(sanitizeForPDF(data.reportingBranch.addressNo));
        form.getTextField("BranchAddress2").setText(sanitizeForPDF(data.reportingBranch.street));
        form.getTextField("BranchAddress3").setText(sanitizeForPDF(data.reportingBranch.locality));
        form.getTextField("BranchAddress4").setText(sanitizeForPDF(data.reportingBranch.cityDistrict));
        form.getTextField("BranchAddress5").setText(sanitizeForPDF(data.reportingBranch.stateCountry));
        form.getTextField("BranchPIN").setText(sanitizeForPDF(data.reportingBranch.pinCode));
        form.getTextField("BranchTel").setText(sanitizeForPDF(data.reportingBranch.telephone));
        form.getTextField("BranchFAX").setText(sanitizeForPDF(data.reportingBranch.fax));
        form.getTextField("BranchEmail").setText(sanitizeForPDF(data.reportingBranch.email));

        // Part 4: Linked Individuals (up to 15)
        data.linkedIndividuals.forEach((individual, index) => {
          if (index < 15) {
            const fieldNum = index + 1;
            form
              .getTextField(`Individual${fieldNum}`)
              .setText(sanitizeForPDF(`${individual.name} | ${individual.customerId} | ${individual.annexure}`));
          }
        });

        // Part 5: Linked Entities (up to 3)
        data.linkedEntities.forEach((entity, index) => {
          if (index < 3) {
            const fieldNum = index + 1;
            form
              .getTextField(`LegalPerson${fieldNum}`)
              .setText(sanitizeForPDF(`${entity.name} | ${entity.customerId} | ${entity.annexure}`));
          }
        });

        // Part 6: Linked Accounts (up to 10)
        data.linkedAccounts.forEach((account, index) => {
          if (index < 10) {
            const fieldNum = index + 1;
            form.getTextField(`Account${fieldNum}`).setText(sanitizeForPDF(account.accountNumber));
            form.getTextField(`AccountHolder${fieldNum}`).setText(sanitizeForPDF(account.accountHolderName));
            if (account.annexure) {
              form.getCheckBox(`AccountAnnexureYN${fieldNum}`).check();
            }
          }
        });

        // Part 7: Suspicious Transaction Details
        data.suspiciousTransaction.reasonsForSuspicion.forEach((reason) => {
          if (reason === "Z") {
            form.getCheckBox("SuspicionCategoryZ").check();
          } else {
            form.getCheckBox(`SuspicionCategory${reason}`).check();
          }
        });

        const grounds = data.suspiciousTransaction.groundsOfSuspicion;
        if (grounds.length > 0) {
          form.getTextField("GroundOfSuspicion1").setText(sanitizeForPDF(grounds[0]));
        }
        if (grounds.length > 1) {
          const remainingGrounds = grounds.slice(1).join(" | ");
          form.getTextField("GroundOfSuspicion2").setText(sanitizeForPDF(remainingGrounds));
        }

        // Part 8: Action Taken
        const actions = data.actionTaken.investigationDetails.join(" | ");
        form.getTextField("ActionTaken").setText(sanitizeForPDF(actions));

        toast.success("PDF form filled with STR data");
      } catch (fieldError) {
        console.error("Error filling form fields:", fieldError);
        toast.warning("Some fields could not be filled: " + fieldError);
      }

      // Update field appearances before flattening
      form.updateFieldAppearances();

      // Flatten the form to make it non-editable
      form.flatten();

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `STR_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to export PDF: ${error}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">STR Preview</CardTitle>
              <CardDescription>FIU / Regulatory Format</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Exporting..." : "Download"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background">
          {/* Report Header Banner */}
          <div className="bg-primary/5 border-b border-border">
            <div className="container mx-auto px-6 py-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">FIU-IND Financial Intelligence Unit - India</p>
                <h2 className="font-display font-bold text-2xl text-foreground">SUSPICIOUS TRANSACTION REPORT (STR)</h2>
                <p className="text-sm text-muted-foreground mt-1">FOR A BANKING COMPANY</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <main className="container mx-auto px-6 py-8 space-y-6">
            {/* Part 1: Report Details */}
            <ReportSection title="DETAILS OF REPORT" partNumber="1">
              <div className="grid md:grid-cols-3 gap-4">
                <FormField label="Date of sending report" value={data.reportDetails.dateOfSending} fieldNumber="1.1" />
                <FormField
                  label="Is this a replacement to an earlier report?"
                  value={data.reportDetails.isReplacement ? "YES" : "NO"}
                  fieldNumber="1.2"
                />
                <FormField
                  label="Date of original report (if replacement)"
                  value={data.reportDetails.originalReportDate}
                  fieldNumber="1.3"
                />
              </div>
            </ReportSection>

            {/* Part 2: Principal Officer */}
            <ReportSection title="DETAILS OF PRINCIPAL OFFICER" partNumber="2">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Name of Bank" value={data.principalOfficer.bankName} fieldNumber="2.1" />
                <FormField label="BSR Code" value={data.principalOfficer.bsrCode} fieldNumber="2.2" />
                <FormField label="ID allotted by FIU-IND" value={data.principalOfficer.fiuIndId} fieldNumber="2.3" />
                <FormField
                  label="Category of Bank"
                  value={bankCategoryLabels[data.principalOfficer.bankCategory] || data.principalOfficer.bankCategory}
                  fieldNumber="2.4"
                />
                <FormField
                  label="Name of Principal Officer"
                  value={data.principalOfficer.officerName}
                  fieldNumber="2.5"
                />
                <FormField label="Designation" value={data.principalOfficer.designation} fieldNumber="2.6" />
                <FormField label="Address (No., Building)" value={data.principalOfficer.addressNo} fieldNumber="2.7" />
                <FormField label="Street/Road" value={data.principalOfficer.street} fieldNumber="2.8" />
                <FormField label="Locality" value={data.principalOfficer.locality} fieldNumber="2.9" />
                <FormField label="City/Town, District" value={data.principalOfficer.cityDistrict} fieldNumber="2.10" />
                <FormField label="State, Country" value={data.principalOfficer.stateCountry} fieldNumber="2.11" />
                <FormField label="Pin Code" value={data.principalOfficer.pinCode} fieldNumber="2.12" />
                <FormField label="Tel (with STD code)" value={data.principalOfficer.telephone} fieldNumber="2.13" />
                <FormField label="Fax" value={data.principalOfficer.fax} fieldNumber="2.14" />
                <FormField label="E-mail" value={data.principalOfficer.email} fieldNumber="2.15" />
              </div>
            </ReportSection>

            {/* Part 3: Reporting Branch */}
            <ReportSection title="DETAILS OF REPORTING BRANCH / LOCATION" partNumber="3">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Name of Branch/Location" value={data.reportingBranch.branchName} fieldNumber="3.1" />
                <FormField label="BSR Code" value={data.reportingBranch.bsrCode} fieldNumber="3.2" />
                <FormField label="ID allotted by FIU-IND" value={data.reportingBranch.fiuIndId} fieldNumber="3.3" />
                <FormField label="Address (No., Building)" value={data.reportingBranch.addressNo} fieldNumber="3.4" />
                <FormField label="Street/Road" value={data.reportingBranch.street} fieldNumber="3.5" />
                <FormField label="Locality" value={data.reportingBranch.locality} fieldNumber="3.6" />
                <FormField label="City/Town, District" value={data.reportingBranch.cityDistrict} fieldNumber="3.7" />
                <FormField label="State, Country" value={data.reportingBranch.stateCountry} fieldNumber="3.8" />
                <FormField label="Pin Code" value={data.reportingBranch.pinCode} fieldNumber="3.9" />
                <FormField label="Tel (with STD code)" value={data.reportingBranch.telephone} fieldNumber="3.10" />
                <FormField label="Fax" value={data.reportingBranch.fax} fieldNumber="3.11" />
                <FormField label="E-mail" value={data.reportingBranch.email} fieldNumber="3.12" />
              </div>
            </ReportSection>

            {/* Part 4: Linked Individuals */}
            <ReportSection title="LIST OF INDIVIDUALS LINKED TO TRANSACTIONS" partNumber="4">
              <DataTable
                columns={[
                  { header: "Name of Individual", accessor: "name" },
                  { header: "Customer ID/Number", accessor: "customerId" },
                  { header: "Annexure", accessor: "annexure" },
                ]}
                data={data.linkedIndividuals}
              />
            </ReportSection>

            {/* Part 5: Legal Entities */}
            <ReportSection title="LIST OF LEGAL PERSONS/ENTITIES LINKED TO TRANSACTIONS" partNumber="5">
              <DataTable
                columns={[
                  { header: "Name of Legal Person/Entity", accessor: "name" },
                  { header: "Customer ID/Number", accessor: "customerId" },
                  { header: "Annexure", accessor: "annexure" },
                ]}
                data={data.linkedEntities}
              />
            </ReportSection>

            {/* Part 6: Linked Accounts */}
            <ReportSection title="LIST OF ACCOUNTS LINKED TO TRANSACTIONS" partNumber="6">
              <DataTable
                columns={[
                  { header: "Account Number", accessor: "accountNumber" },
                  { header: "Name of First Account Holder", accessor: "accountHolderName" },
                  { header: "Annexure", accessor: "annexure" },
                ]}
                data={data.linkedAccounts}
              />
            </ReportSection>

            {/* Part 7: Suspicious Transaction Details */}
            <ReportSection title="DETAILS OF SUSPICIOUS TRANSACTION" partNumber="7">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    <span className="text-xs text-primary font-semibold mr-2">7.1</span>
                    Reasons for Suspicion
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {data.suspiciousTransaction.reasonsForSuspicion.map((reason) => (
                      <Badge key={reason} variant="secondary" className="px-3 py-1.5">
                        <span className="font-bold mr-1">{reason}</span>
                        {suspicionReasonLabels[reason]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    <span className="text-xs text-primary font-semibold mr-2">7.2</span>
                    Grounds of Suspicion
                  </label>
                  <div className="space-y-2">
                    {data.suspiciousTransaction.groundsOfSuspicion.map((ground, index) => (
                      <div
                        key={index}
                        className="bg-muted/50 border border-border rounded-md px-4 py-3 text-foreground text-sm"
                      >
                        <span className="font-semibold text-primary mr-2">{index + 1}.</span>
                        {ground}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ReportSection>

            {/* Part 8: Action Taken */}
            <ReportSection title="DETAILS OF ACTION TAKEN" partNumber="8">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  <span className="text-xs text-primary font-semibold mr-2">8.1</span>
                  Investigation Details
                </label>
                <div className="space-y-2">
                  {data.actionTaken.investigationDetails.map((detail, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 border border-border rounded-md px-4 py-3 text-foreground text-sm"
                    >
                      <span className="font-semibold text-primary mr-2">{index + 1}.</span>
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </ReportSection>

            {/* Footer Note */}
            <div className="text-center text-sm text-muted-foreground py-6 border-t border-border">
              <p>FOR FIU-IND USE ONLY</p>
              <p className="mt-1">This report is generated in compliance with PMLA 2002 regulations.</p>
            </div>
          </main>
        </div>
      </CardContent>
    </Card>
  );
}
