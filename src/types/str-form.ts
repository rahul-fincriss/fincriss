// FIU-IND SBA01 STR Form data structure

export interface STRFormData {
  // PART 1: Details of Report
  dateOfReport: string;
  isReplacement: boolean;
  originalReportDate?: string;

  // PART 2: Details of Principal Officer
  bankName: string;
  bsrCode: string;
  fiuIndId: string;
  bankCategory: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'Z';
  principalOfficerName: string;
  principalOfficerDesignation: string;
  poAddressLine1: string;
  poStreet: string;
  poLocality: string;
  poCityDistrict: string;
  poStateCountry: string;
  poPinCode: string;
  poTelephone: string;
  poFax: string;
  poEmail: string;

  // PART 3: Details of Reporting Branch/Location
  branchName: string;
  branchBsrCode: string;
  branchFiuIndId: string;
  branchAddressLine1: string;
  branchStreet: string;
  branchLocality: string;
  branchCityDistrict: string;
  branchStateCountry: string;
  branchPinCode: string;
  branchTelephone: string;
  branchFax: string;
  branchEmail: string;

  // PART 4: List of Individuals Linked to Transactions
  individuals: STRIndividual[];

  // PART 5: List of Legal Persons/Entities
  legalEntities: STRLegalEntity[];

  // PART 6: List of Accounts Linked to Transactions
  accounts: STRAccount[];

  // PART 7: Details of Suspicious Transaction
  reasonsForSuspicion: {
    identityOfClient: boolean;
    backgroundOfClient: boolean;
    multipleAccounts: boolean;
    activityInAccount: boolean;
    natureOfTransaction: boolean;
    valueOfTransaction: boolean;
    otherReason: boolean;
    otherReasonDetails?: string;
  };
  groundsOfSuspicion: string[];

  // PART 8: Details of Action Taken
  actionTaken: string[];

  // Signature
  signatoryName: string;
  signatureDate: string;
}

export interface STRIndividual {
  name: string;
  customerId: string;
  annexureNumber: string;
}

export interface STRLegalEntity {
  name: string;
  customerId: string;
  annexureNumber: string;
}

export interface STRAccount {
  accountNumber: string;
  accountHolderName: string;
  annexureNumber: string;
}

// Mock data generator for demo purposes
export function generateMockSTRFormData(caseId: string, customerName: string): STRFormData {
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
  return {
    dateOfReport: dateStr,
    isReplacement: false,
    
    bankName: 'DEMO NATIONAL BANK LTD',
    bsrCode: '123456789',
    fiuIndId: 'FIU/BNK/2024/1234',
    bankCategory: 'A',
    principalOfficerName: 'RAHUL SHARMA',
    principalOfficerDesignation: 'CHIEF COMPLIANCE OFFICER',
    poAddressLine1: 'CORPORATE OFFICE, 15TH FLOOR',
    poStreet: 'BANDRA KURLA COMPLEX',
    poLocality: 'BANDRA EAST',
    poCityDistrict: 'MUMBAI',
    poStateCountry: 'MAHARASHTRA, INDIA',
    poPinCode: '400051',
    poTelephone: '022-12345678',
    poFax: '022-12345679',
    poEmail: 'PO@DEMOBANK.COM',

    branchName: 'ANDHERI WEST BRANCH',
    branchBsrCode: '987654321',
    branchFiuIndId: 'FIU/BR/2024/5678',
    branchAddressLine1: 'GROUND FLOOR, COMMERCE HOUSE',
    branchStreet: 'S.V. ROAD',
    branchLocality: 'ANDHERI WEST',
    branchCityDistrict: 'MUMBAI',
    branchStateCountry: 'MAHARASHTRA, INDIA',
    branchPinCode: '400058',
    branchTelephone: '022-98765432',
    branchFax: '022-98765433',
    branchEmail: 'ANDHERI.WEST@DEMOBANK.COM',

    individuals: [
      { name: customerName.toUpperCase(), customerId: caseId, annexureNumber: 'A 1' },
    ],

    legalEntities: [
      { name: 'SUNRISE EXPORTS LTD', customerId: 'ENT-2024-001', annexureNumber: 'B 1' },
    ],

    accounts: [
      { accountNumber: '1234567890', accountHolderName: customerName.toUpperCase(), annexureNumber: 'C 1' },
      { accountNumber: '0987654321', accountHolderName: 'SUNRISE EXPORTS LTD', annexureNumber: 'C 2' },
    ],

    reasonsForSuspicion: {
      identityOfClient: false,
      backgroundOfClient: true,
      multipleAccounts: false,
      activityInAccount: true,
      natureOfTransaction: true,
      valueOfTransaction: true,
      otherReason: false,
    },

    groundsOfSuspicion: [],

    actionTaken: [
      'INTERNAL INVESTIGATION COMPLETED',
      'ACCOUNTS PLACED UNDER ENHANCED MONITORING',
      'TRANSACTION LIMITS REDUCED PENDING REVIEW',
    ],

    signatoryName: 'RAHUL SHARMA',
    signatureDate: dateStr,
  };
}
