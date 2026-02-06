import { 
  RawAlert, 
  PrioritizedAlert, 
  Case, 
  STRDraft, 
  CustomerKYC, 
  Transaction, 
  AuditEntry, 
  User,
  ExtendedCustomerProfile,
  CustomerRiskHistory,
  CustomerDocument,
  CustomerAccount,
  RelatedEntity,
  CommonIdentifier,
  PriorAlert,
  PriorCase,
  PriorSTR,
  InvestigatorNote
} from '@/types';

// Helper function to format INR in Indian numbering system (lakhs, crores)
export const formatINR = (amount: number): string => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    // Crores (1,00,00,000+)
    return `₹${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs (1,00,000+)
    return `₹${(absAmount / 100000).toFixed(2)} L`;
  } else {
    // Format with Indian comma placement (e.g., 45,000)
    return `₹${absAmount.toLocaleString('en-IN')}`;
  }
};

// Full INR formatting with Indian comma placement
export const formatINRFull = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Mock analysts for assignment - Indian names
export const mockAnalysts: User[] = [
  { id: 'usr-001', name: 'Priya Sharma', email: 'priya.sharma@bank.co.in', role: 'analyst' },
  { id: 'usr-006', name: 'Rajesh Kumar', email: 'rajesh.kumar@bank.co.in', role: 'analyst' },
  { id: 'usr-007', name: 'Anjali Iyer', email: 'anjali.iyer@bank.co.in', role: 'analyst' },
  { id: 'usr-008', name: 'Vikram Patel', email: 'vikram.patel@bank.co.in', role: 'analyst' },
];

// Priority override reason categories
export const priorityReasonCategories = [
  'Customer escalation',
  'Regulatory inquiry',
  'Management directive',
  'Pattern similarity to filed STR',
  'Time-sensitive information',
  'External intelligence',
  'Risk appetite adjustment',
  'RBI/FIU-IND directive',
  'Other',
];

// ============================================================================
// CUSTOMER DATA STORE - Single Source of Truth for all customer-related data
// ============================================================================

// Extended customer profiles with all Customer 360 data
export const mockExtendedCustomerProfiles: ExtendedCustomerProfile[] = [
  // ABC Exports Pvt Ltd - CUS-45678 (High Risk Corporate)
  {
    kyc: {
      id: 'CUS-45678',
      name: 'ABC Exports Pvt Ltd',
      type: 'corporate',
      riskRating: 'high',
      industry: 'Import/Export',
      declaredIncome: 20000000,
      actualTurnover: 56700000,
      accountAge: 18,
      nationality: 'India',
      pep: false,
      sanctions: false,
      dateOfBirth: '2018-05-12',
      idType: 'CIN',
      idNumber: 'U51909MH2018PTC******',
      address: '301, Trade Centre, Nariman Point',
      city: 'Mumbai',
      country: 'India',
      postalCode: '400021',
      phoneNumber: '+91 ****-567890',
      email: 'accounts@abc*****.com',
      onboardingDate: '2018-08-15',
      lastKYCReview: '2024-01-15',
      nextKYCReview: '2025-01-15',
      sourceOfWealth: 'Business Income',
      sourceOfFunds: 'Trading Revenue',
      expectedTurnover: '₹2,00,00,000 - ₹5,00,00,000',
    },
    riskRatingHistory: [
      { date: '2024-01-15', rating: 'high', reason: 'Increased transaction volume with high-risk jurisdictions' },
      { date: '2023-06-20', rating: 'medium', reason: 'Annual review - trade volume increase' },
      { date: '2022-01-18', rating: 'low', reason: 'Initial onboarding assessment' },
    ],
    documents: [
      { name: 'Certificate of Incorporation', status: 'verified', date: '2024-01-15' },
      { name: 'GST Registration', status: 'verified', date: '2024-01-15' },
      { name: 'IEC Certificate', status: 'verified', date: '2018-08-15' },
      { name: 'Financial Statements FY24', status: 'pending', date: '2024-06-01' },
      { name: 'Board Resolution', status: 'verified', date: '2024-01-15' },
    ],
    pepScreening: {
      lastScreened: '2024-12-01',
      status: 'clear',
      details: 'No PEP associations found for directors',
    },
    sanctionsScreening: {
      lastScreened: '2024-12-01',
      status: 'clear',
      details: 'No sanctions matches',
    },
    accounts: [
      { id: 'ACC-456-001', type: 'Current Account', currency: 'INR', status: 'active', balance: 14500000 },
      { id: 'ACC-456-002', type: 'CC/OD Facility', currency: 'INR', status: 'active', balance: -2500000 },
      { id: 'ACC-456-003', type: 'EEFC Account', currency: 'USD', status: 'active', balance: 85000 },
    ],
    relatedEntities: [
      { id: 'ENT-001', name: 'Global Trade FZE', relationship: 'Regular Counterparty', jurisdiction: 'UAE', flagged: true },
      { id: 'ENT-002', name: 'Pacific Holdings Pte Ltd', relationship: 'Buyer', jurisdiction: 'Singapore', flagged: false },
      { id: 'ENT-003', name: 'Eastern Materials Ltd', relationship: 'Supplier', jurisdiction: 'Hong Kong', flagged: false },
    ],
    commonIdentifiers: [
      { type: 'Registered Address', value: '301, Trade Centre, Mumbai', sharedWith: ['XYZ Trading Pvt Ltd'] },
      { type: 'Director', value: 'Rajiv Malhotra', sharedWith: ['Global Trade FZE', 'Sunrise Group'] },
      { type: 'Phone Number', value: '+91 22 ****-5678', sharedWith: ['XYZ Trading Pvt Ltd'] },
    ],
    priorAlerts: [
      { id: 'ALT-2024-000892', date: new Date('2024-08-15'), type: 'Structuring', riskLevel: 'medium', resolution: 'Closed - False Positive', resolvedBy: 'Priya Sharma' },
      { id: 'ALT-2023-004521', date: new Date('2023-11-22'), type: 'Rapid Movement', riskLevel: 'high', resolution: 'Escalated to Case', caseId: 'CASE-2023-001245', resolvedBy: 'Arjun Mehta' },
      { id: 'ALT-2023-002189', date: new Date('2023-06-10'), type: 'Geo Anomaly', riskLevel: 'low', resolution: 'Closed - Explained', resolvedBy: 'Priya Sharma' },
    ],
    priorCases: [
      { id: 'CASE-2023-001245', date: new Date('2023-11-25'), linkedAlerts: 2, status: 'closed', outcome: 'STR Filed', strId: 'STR-2023-000456', investigator: 'Arjun Mehta' },
    ],
    priorSTRs: [
      { id: 'STR-2023-000456', filedDate: new Date('2023-12-15'), fiuReference: 'FIU-IND-2023-REF-78901', amount: 18500000, status: 'submitted', filedBy: 'Principal Officer' },
    ],
    investigatorNotes: [
      { id: 'NOTE-001', author: 'Priya Sharma', role: 'AML Analyst', date: new Date('2024-12-10'), content: 'Customer provided documentation explaining increased trading activity. Business expansion into new markets appears legitimate based on IEC amendment and new buyer contracts.' },
      { id: 'NOTE-002', author: 'Arjun Mehta', role: 'Case Investigator', date: new Date('2023-11-28'), content: 'Conducted enhanced due diligence. Found links to shell company in UAE (Global Trade FZE). Transaction pattern consistent with trade-based money laundering typology.' },
      { id: 'NOTE-003', author: 'Arjun Mehta', role: 'Case Investigator', date: new Date('2023-12-01'), content: 'Customer unable to provide satisfactory explanation for source of funds. Recommending STR filing with FIU-IND.' },
    ],
  },
  // Mahadev Impex LLP - CUS-67890 (High Risk Trade Entity)
  {
    kyc: {
      id: 'CUS-67890',
      name: 'Mahadev Impex LLP',
      type: 'corporate',
      riskRating: 'high',
      industry: 'Import/Export - Textiles',
      declaredIncome: 35000000,
      actualTurnover: 125000000,
      accountAge: 24,
      nationality: 'India',
      pep: false,
      sanctions: false,
      dateOfBirth: '2017-03-22',
      idType: 'LLPIN',
      idNumber: 'AAE-****',
      address: '15, GIDC Industrial Estate',
      city: 'Ahmedabad',
      country: 'India',
      postalCode: '382445',
      phoneNumber: '+91 ****-234567',
      email: 'info@mahadev*****.com',
      onboardingDate: '2017-06-10',
      lastKYCReview: '2024-02-01',
      nextKYCReview: '2024-08-01',
      sourceOfWealth: 'Business Operations',
      sourceOfFunds: 'Export Proceeds',
      expectedTurnover: '₹3,00,00,000 - ₹5,00,00,000',
    },
    riskRatingHistory: [
      { date: '2024-02-01', rating: 'high', reason: 'Unusual counterparty network in UAE' },
      { date: '2023-02-15', rating: 'medium', reason: 'Periodic review' },
      { date: '2022-02-10', rating: 'low', reason: 'Standard rating' },
    ],
    documents: [
      { name: 'LLP Agreement', status: 'verified', date: '2024-02-01' },
      { name: 'IEC Certificate', status: 'verified', date: '2017-06-10' },
      { name: 'GST Registration', status: 'verified', date: '2024-02-01' },
      { name: 'PAN Card', status: 'verified', date: '2017-06-10' },
    ],
    pepScreening: { lastScreened: '2024-12-01', status: 'clear', details: 'No PEP associations found' },
    sanctionsScreening: { lastScreened: '2024-12-01', status: 'clear', details: 'No sanctions matches' },
    accounts: [
      { id: 'ACC-678-001', type: 'Current Account', currency: 'INR', status: 'active', balance: 8900000 },
      { id: 'ACC-678-002', type: 'EEFC Account', currency: 'USD', status: 'active', balance: 125000 },
    ],
    relatedEntities: [
      { id: 'ENT-004', name: 'Al Rashid Trading LLC', relationship: 'Buyer', jurisdiction: 'UAE', flagged: true },
      { id: 'ENT-005', name: 'Sunrise Textiles Singapore', relationship: 'Supplier', jurisdiction: 'Singapore', flagged: false },
    ],
    commonIdentifiers: [],
    priorAlerts: [],
    priorCases: [],
    priorSTRs: [],
    investigatorNotes: [],
  },
  // Rahul Sharma - CUS-78901 (Individual - Medium Risk)
  {
    kyc: {
      id: 'CUS-78901',
      name: 'Rahul Sharma',
      type: 'individual',
      riskRating: 'medium',
      occupation: 'Business Owner',
      industry: 'Retail Trade',
      declaredIncome: 2500000,
      actualTurnover: 8900000,
      accountAge: 36,
      nationality: 'India',
      pep: false,
      sanctions: false,
      dateOfBirth: '1985-07-22',
      idType: 'PAN',
      idNumber: 'ABCPS****K',
      address: '45, Sector 18, Noida',
      city: 'Noida',
      country: 'India',
      postalCode: '201301',
      phoneNumber: '+91 ****-123456',
      email: 'rahul.s****@gmail.com',
      onboardingDate: '2021-01-15',
      lastKYCReview: '2024-01-20',
      nextKYCReview: '2025-01-20',
      sourceOfWealth: 'Business Income',
      sourceOfFunds: 'Trading Profits',
      expectedTurnover: '₹20,00,000 - ₹50,00,000',
    },
    riskRatingHistory: [
      { date: '2024-01-20', rating: 'medium', reason: 'Increased transaction volume' },
      { date: '2023-01-15', rating: 'low', reason: 'Annual review' },
    ],
    documents: [
      { name: 'PAN Card', status: 'verified', date: '2024-01-20' },
      { name: 'Aadhaar Card', status: 'verified', date: '2024-01-20' },
      { name: 'Address Proof', status: 'verified', date: '2024-01-20' },
    ],
    pepScreening: { lastScreened: '2024-12-01', status: 'clear', details: 'No PEP associations found' },
    sanctionsScreening: { lastScreened: '2024-12-01', status: 'clear', details: 'No sanctions matches' },
    accounts: [
      { id: 'ACC-789-001', type: 'Savings Account', currency: 'INR', status: 'active', balance: 450000 },
      { id: 'ACC-789-002', type: 'Current Account', currency: 'INR', status: 'active', balance: 1200000 },
    ],
    relatedEntities: [],
    commonIdentifiers: [],
    priorAlerts: [],
    priorCases: [],
    priorSTRs: [],
    investigatorNotes: [],
  },
  // Shree Ganesh Traders - CUS-34521 (Corporate - High Risk)
  {
    kyc: {
      id: 'CUS-34521',
      name: 'Shree Ganesh Traders',
      type: 'corporate',
      riskRating: 'high',
      industry: 'Commodities Trading',
      declaredIncome: 15000000,
      actualTurnover: 34500000,
      accountAge: 30,
      nationality: 'India',
      pep: false,
      sanctions: false,
      dateOfBirth: '2019-02-14',
      idType: 'CIN',
      idNumber: 'U51100GJ2019PTC******',
      address: '12, APMC Market, Vashi',
      city: 'Navi Mumbai',
      country: 'India',
      postalCode: '400703',
      phoneNumber: '+91 ****-345678',
      email: 'contact@shreeganesh*****.com',
      onboardingDate: '2019-05-20',
      lastKYCReview: '2024-01-10',
      nextKYCReview: '2024-07-10',
      sourceOfWealth: 'Business Operations',
      sourceOfFunds: 'Commodity Sales',
      expectedTurnover: '₹1,00,00,000 - ₹2,00,00,000',
    },
    riskRatingHistory: [
      { date: '2024-01-10', rating: 'high', reason: 'Shell company connections identified' },
      { date: '2023-01-15', rating: 'medium', reason: 'Annual review' },
      { date: '2022-01-10', rating: 'low', reason: 'Initial assessment' },
    ],
    documents: [
      { name: 'Certificate of Incorporation', status: 'verified', date: '2024-01-10' },
      { name: 'GST Registration', status: 'verified', date: '2024-01-10' },
      { name: 'PAN Card', status: 'verified', date: '2019-05-20' },
    ],
    pepScreening: { lastScreened: '2024-12-01', status: 'clear', details: 'No PEP associations found' },
    sanctionsScreening: { lastScreened: '2024-12-01', status: 'clear', details: 'No sanctions matches' },
    accounts: [
      { id: 'ACC-345-001', type: 'Current Account', currency: 'INR', status: 'active', balance: 5600000 },
    ],
    relatedEntities: [
      { id: 'ENT-010', name: 'Gulf Commodities FZE', relationship: 'Buyer', jurisdiction: 'UAE', flagged: true },
      { id: 'ENT-011', name: 'Singapore Metals Pte Ltd', relationship: 'Supplier', jurisdiction: 'Singapore', flagged: false },
    ],
    commonIdentifiers: [
      { type: 'Director', value: 'Mahesh Patel', sharedWith: ['Gulf Commodities FZE'] },
    ],
    priorAlerts: [
      { id: 'ALT-2024-001198', date: new Date('2024-01-08'), type: 'Rapid Movement', riskLevel: 'high', resolution: 'Escalated to Case', caseId: 'CASE-2024-0089', resolvedBy: 'Arjun Mehta' },
    ],
    priorCases: [],
    priorSTRs: [],
    investigatorNotes: [
      { id: 'NOTE-010', author: 'Arjun Mehta', role: 'Case Investigator', date: new Date('2024-01-11'), content: 'Initial review completed. Multiple shell company connections identified via Dubai and Singapore.' },
    ],
  },
];

// Lookup functions for consistent data access
export const getCustomerById = (customerId: string): CustomerKYC | undefined => {
  const profile = mockExtendedCustomerProfiles.find(p => p.kyc.id === customerId);
  return profile?.kyc;
};

export const getExtendedCustomerProfile = (customerId: string): ExtendedCustomerProfile | undefined => {
  return mockExtendedCustomerProfiles.find(p => p.kyc.id === customerId);
};

export const getTransactionsByCustomerId = (customerId: string): Transaction[] => {
  return mockTransactionsByCustomer[customerId] || [];
};

// Transaction data by customer ID - Single source of truth
export const mockTransactionsByCustomer: Record<string, Transaction[]> = {
  'CUS-45678': [
    { id: 'TXN-001', date: new Date('2024-01-14'), type: 'debit', amount: 2450000, currency: 'INR', counterparty: 'Global Trade FZE (Dubai)', channel: 'Wire - SWIFT', country: 'AE', description: 'Invoice payment - machinery parts (IEC: AAACA****J)' },
    { id: 'TXN-002', date: new Date('2024-01-13'), type: 'credit', amount: 1800000, currency: 'INR', counterparty: 'Eastern Materials Pte Ltd (Singapore)', channel: 'Wire - SWIFT', country: 'SG', description: 'Goods received - textiles' },
    { id: 'TXN-003', date: new Date('2024-01-12'), type: 'debit', amount: 3200000, currency: 'INR', counterparty: 'Pacific Holdings Ltd (Hong Kong)', channel: 'Wire - SWIFT', country: 'HK', description: 'Consulting services - trade advisory' },
    { id: 'TXN-004', date: new Date('2024-01-11'), type: 'credit', amount: 950000, currency: 'INR', counterparty: 'Domestic - Cash Deposit', channel: 'Cash', country: 'IN', description: 'Cash deposit - Mumbai Fort Branch (IFSC: HDFC0000123)' },
    { id: 'TXN-005', date: new Date('2024-01-10'), type: 'credit', amount: 980000, currency: 'INR', counterparty: 'Domestic - Cash Deposit', channel: 'Cash', country: 'IN', description: 'Cash deposit - Nariman Point Branch (IFSC: HDFC0000456)' },
    { id: 'TXN-006', date: new Date('2024-01-09'), type: 'debit', amount: 4500000, currency: 'INR', counterparty: 'Al Rashid Trading LLC (UAE)', channel: 'Wire - SWIFT', country: 'AE', description: 'Import payment - electronics components' },
    { id: 'TXN-007', date: new Date('2024-01-08'), type: 'credit', amount: 890000, currency: 'INR', counterparty: 'Shree Krishna Enterprises (Delhi)', channel: 'RTGS', country: 'IN', description: 'Domestic sale proceeds' },
  ],
  'CUS-67890': [
    { id: 'TXN-101', date: new Date('2024-01-16'), type: 'debit', amount: 7800000, currency: 'INR', counterparty: 'Al Rashid Trading LLC (Dubai)', channel: 'Wire - SWIFT', country: 'AE', description: 'Textile export advance' },
    { id: 'TXN-102', date: new Date('2024-01-15'), type: 'credit', amount: 4500000, currency: 'INR', counterparty: 'Sunrise Textiles Singapore', channel: 'Wire - SWIFT', country: 'SG', description: 'Raw material supply payment' },
    { id: 'TXN-103', date: new Date('2024-01-14'), type: 'debit', amount: 2200000, currency: 'INR', counterparty: 'Gulf Trading FZE', channel: 'Wire - SWIFT', country: 'AE', description: 'Commission payment' },
  ],
  'CUS-78901': [
    { id: 'TXN-201', date: new Date('2024-01-15'), type: 'credit', amount: 450000, currency: 'INR', counterparty: 'Cash Deposit', channel: 'Cash', country: 'IN', description: 'Cash deposit - Noida Branch' },
    { id: 'TXN-202', date: new Date('2024-01-12'), type: 'debit', amount: 280000, currency: 'INR', counterparty: 'Sharma Electronics', channel: 'NEFT', country: 'IN', description: 'Stock purchase' },
  ],
  'CUS-34521': [
    { id: 'TXN-301', date: new Date('2024-01-10'), type: 'debit', amount: 12500000, currency: 'INR', counterparty: 'Gulf Commodities FZE (Dubai)', channel: 'Wire - SWIFT', country: 'AE', description: 'Commodity export advance' },
    { id: 'TXN-302', date: new Date('2024-01-08'), type: 'credit', amount: 8900000, currency: 'INR', counterparty: 'Singapore Metals Pte Ltd', channel: 'Wire - SWIFT', country: 'SG', description: 'Metal supply payment' },
    { id: 'TXN-303', date: new Date('2024-01-05'), type: 'credit', amount: 950000, currency: 'INR', counterparty: 'Cash Deposit', channel: 'Cash', country: 'IN', description: 'Cash deposit - Vashi Branch' },
  ],
};

// Legacy exports for backward compatibility - point to first customer's data
export const mockCustomerKYC: CustomerKYC = mockExtendedCustomerProfiles[0].kyc;
export const mockTransactions: Transaction[] = mockTransactionsByCustomer['CUS-45678'];

// Generate mock raw alerts - Indian context
export const mockRawAlerts: RawAlert[] = [
  {
    id: 'ALT-2024-001234',
    sourceSystem: 'Core Banking',
    alertType: 'large_cash',
    customerId: 'CUS-78234',
    customerName: 'Bharat Metals & Minerals Ltd',
    amount: 2450000,
    currency: 'INR',
    timestamp: new Date('2024-01-15T09:23:00'),
    status: 'new',
    rawPayload: { txn_id: 'TXN-8923847', branch: 'MUM-FORT-001', ifsc: 'HDFC0000123' },
  },
  {
    id: 'ALT-2024-001235',
    sourceSystem: 'Wire Transfer',
    alertType: 'structuring',
    customerId: 'CUS-45123',
    customerName: 'Amit Verma',
    amount: 975000,
    currency: 'INR',
    timestamp: new Date('2024-01-15T10:45:00'),
    status: 'new',
    rawPayload: { pattern: 'multiple_sub_threshold', ctr_threshold: '₹10,00,000' },
  },
  {
    id: 'ALT-2024-001236',
    sourceSystem: 'Card Monitoring',
    alertType: 'geo_anomaly',
    customerId: 'CUS-89012',
    customerName: 'Neha Iyer',
    amount: 185000,
    currency: 'INR',
    timestamp: new Date('2024-01-15T11:12:00'),
    status: 'in_review',
    rawPayload: { locations: ['AE', 'SG', 'HK'] },
  },
  {
    id: 'ALT-2024-001237',
    sourceSystem: 'Core Banking',
    alertType: 'rapid_movement',
    customerId: 'CUS-23456',
    customerName: 'Sunrise Logistics India Pvt Ltd',
    amount: 8900000,
    currency: 'INR',
    timestamp: new Date('2024-01-15T14:30:00'),
    status: 'new',
    rawPayload: { velocity: 'high', period: '24h', branch: 'DEL-CP-002' },
  },
  {
    id: 'ALT-2024-001238',
    sourceSystem: 'Trade Finance',
    alertType: 'behavior_deviation',
    customerId: 'CUS-67890',
    customerName: 'Mahadev Impex LLP',
    amount: 12500000,
    currency: 'INR',
    timestamp: new Date('2024-01-15T16:00:00'),
    status: 'sent_to_maps',
    rawPayload: { deviation_score: 0.87, iec_code: 'AAACM****X' },
  },
];

// Generate mock prioritized alerts - with multiple alerts per customer for grouping demo
export const mockPrioritizedAlerts: PrioritizedAlert[] = [
  // Mahadev Impex LLP - 2 alerts (High priority customer)
  {
    ...mockRawAlerts[4],
    mapsScore: 92,
    riskLevel: 'high',
    riskDrivers: ['Unusual counterparty network in UAE', 'Trade mispricing signals', 'Shell company indicators'],
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
  },
  {
    id: 'ALT-2024-001245',
    sourceSystem: 'Trade Finance',
    alertType: 'rapid_movement',
    customerId: 'CUS-67890',
    customerName: 'Mahadev Impex LLP',
    amount: 7800000,
    currency: 'INR',
    timestamp: new Date('2024-01-16T09:00:00'),
    status: 'sent_to_maps',
    rawPayload: { velocity: 'critical', period: '12h', iec_code: 'AAACM****X' },
    mapsScore: 88,
    riskLevel: 'high',
    riskDrivers: ['Rapid fund movement', 'High-risk jurisdiction (Dubai)', 'Trade mispricing signals'],
    slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
  },
  // Sunrise Logistics India Pvt Ltd - 3 alerts (High priority customer)
  {
    ...mockRawAlerts[3],
    mapsScore: 85,
    riskLevel: 'high',
    riskDrivers: ['Rapid fund movement', 'New account activity spike', 'Cross-border layering via Singapore'],
    slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
  },
  {
    id: 'ALT-2024-001246',
    sourceSystem: 'Wire Transfer',
    alertType: 'structuring',
    customerId: 'CUS-23456',
    customerName: 'Sunrise Logistics India Pvt Ltd',
    amount: 980000,
    currency: 'INR',
    timestamp: new Date('2024-01-16T11:30:00'),
    status: 'sent_to_maps',
    rawPayload: { pattern: 'round_amounts', ctr_threshold: '₹10,00,000' },
    mapsScore: 68,
    riskLevel: 'medium',
    riskDrivers: ['Structuring pattern below ₹10L CTR threshold', 'Round amount transactions'],
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours
  },
  {
    id: 'ALT-2024-001250',
    sourceSystem: 'Core Banking',
    alertType: 'behavior_deviation',
    customerId: 'CUS-23456',
    customerName: 'Sunrise Logistics India Pvt Ltd',
    amount: 1250000,
    currency: 'INR',
    timestamp: new Date('2024-01-17T08:00:00'),
    status: 'sent_to_maps',
    rawPayload: { deviation_score: 0.72, branch: 'DEL-CP-002' },
    mapsScore: 58,
    riskLevel: 'low',
    riskDrivers: ['Behavior deviation from declared turnover', 'Profile mismatch'],
    slaDeadline: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours
  },
  // Amit Verma - 2 alerts (Medium priority customer)
  {
    ...mockRawAlerts[1],
    mapsScore: 72,
    riskLevel: 'medium',
    riskDrivers: ['Structuring pattern detected', 'Just-below ₹10L CTR threshold transactions'],
    slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
  },
  {
    id: 'ALT-2024-001247',
    sourceSystem: 'Card Monitoring',
    alertType: 'geo_anomaly',
    customerId: 'CUS-45123',
    customerName: 'Amit Verma',
    amount: 285000,
    currency: 'INR',
    timestamp: new Date('2024-01-16T14:00:00'),
    status: 'sent_to_maps',
    rawPayload: { locations: ['AE', 'SG', 'UK'] },
    mapsScore: 55,
    riskLevel: 'low',
    riskDrivers: ['Geo-location anomaly - Dubai, Singapore', 'Travel pattern inconsistent with profile'],
    slaDeadline: new Date(Date.now() + 40 * 60 * 60 * 1000), // 40 hours
  },
  // Bharat Metals & Minerals Ltd - 1 alert (Medium priority customer)
  {
    ...mockRawAlerts[0],
    mapsScore: 65,
    riskLevel: 'medium',
    riskDrivers: ['Large cash deposit approaching ₹10L CTR', 'Business profile mismatch'],
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
  // Neha Iyer - 1 alert (Low priority customer)
  {
    ...mockRawAlerts[2],
    mapsScore: 45,
    riskLevel: 'low',
    riskDrivers: ['Geo-location anomaly - UAE, Singapore, HK', 'Customer travel history unclear'],
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
  },
];

// Mock cases - Indian context
export const mockCases: Case[] = [
  {
    id: 'CASE-2024-0089',
    linkedAlerts: ['ALT-2024-001198', 'ALT-2024-001199'],
    customerId: 'CUS-34521',
    customerName: 'Shree Ganesh Traders',
    investigatorId: 'usr-002',
    investigatorName: 'Arjun Mehta',
    status: 'investigation',
    strStatus: 'draft_in_progress',
    createdAt: new Date('2024-01-10'),
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    totalAmount: 34500000,
    currency: 'INR',
    notes: [
      {
        id: 'note-001',
        authorId: 'usr-002',
        authorName: 'Arjun Mehta',
        content: 'Initial review completed. Multiple shell company connections identified via Dubai and Singapore.',
        timestamp: new Date('2024-01-11T10:30:00'),
      },
    ],
    documents: [],
  },
  {
    id: 'CASE-2024-0090',
    linkedAlerts: ['ALT-2024-001201'],
    customerId: 'CUS-78901',
    customerName: 'Rahul Sharma',
    investigatorId: 'usr-002',
    investigatorName: 'Arjun Mehta',
    status: 'str_draft',
    strStatus: 'str_ready',
    createdAt: new Date('2024-01-12'),
    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    totalAmount: 8900000,
    currency: 'INR',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0091',
    linkedAlerts: ['ALT-2024-001205', 'ALT-2024-001206', 'ALT-2024-001207'],
    customerId: 'CUS-45678',
    customerName: 'ABC Exports Pvt Ltd',
    investigatorId: 'usr-002',
    investigatorName: 'Arjun Mehta',
    status: 'pending_review',
    strStatus: 'str_ready',
    createdAt: new Date('2024-01-08'),
    slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // Overdue
    totalAmount: 56700000,
    currency: 'INR',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0092',
    linkedAlerts: ['ALT-2024-001210'],
    customerId: 'CUS-11234',
    customerName: 'Suresh Patel',
    investigatorId: 'usr-002',
    investigatorName: 'Arjun Mehta',
    status: 'closed',
    strStatus: 'discarded',
    createdAt: new Date('2024-01-05'),
    slaDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalAmount: 1250000,
    currency: 'INR',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0093',
    linkedAlerts: ['ALT-2024-001215'],
    customerId: 'CUS-55678',
    customerName: 'Ankit Gupta Enterprises',
    investigatorId: 'usr-002',
    investigatorName: 'Arjun Mehta',
    status: 'submitted',
    strStatus: 'str_downloaded',
    createdAt: new Date('2024-01-03'),
    slaDeadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    totalAmount: 23400000,
    currency: 'INR',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0094',
    linkedAlerts: ['ALT-2024-001220'],
    customerId: 'CUS-99012',
    customerName: 'Krishna Trading Corp',
    investigatorId: 'usr-002',
    investigatorName: 'Arjun Mehta',
    status: 'open',
    strStatus: 'no_str',
    createdAt: new Date('2024-01-16'),
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    totalAmount: 5600000,
    currency: 'INR',
    notes: [],
    documents: [],
  },
];

// Mock STR drafts - Indian regulatory context
export const mockSTRDrafts: STRDraft[] = [
  {
    id: 'STR-2024-0045',
    caseId: 'CASE-2024-0091',
    status: 'pending_po_review',
    groundsOfSuspicion: 'Multiple high-value transactions with suspected shell companies in UAE and Singapore. Pattern consistent with trade-based money laundering through over/under invoicing of goods. Transactions structured to avoid ₹10,00,000 CTR threshold.',
    transactionNarrative: 'Between January 2024 and present, the subject conducted 47 wire transfers totaling ₹5,67,00,000 to entities in UAE, Singapore, and Hong Kong. Transaction amounts consistently maintained just below ₹10,00,000 reporting thresholds.',
    customerProfile: 'ABC Exports Pvt Ltd is a registered trading company (CIN: U51909MH2018PTC******) with declared annual turnover of ₹2,00,00,000. Actual transaction volume exceeds declared business activity by 280%.',
    riskRationale: 'High-risk indicators: (1) Transactions with suspected shell companies, (2) Use of high-risk jurisdictions (UAE, Singapore), (3) Structuring patterns below CTR threshold, (4) Business activity inconsistent with declared turnover in PAN/GST filings.',
    aiGenerated: {
      groundsOfSuspicion: true,
      transactionNarrative: true,
      customerProfile: true,
      riskRationale: true,
    },
    changes: [],
    investigatorComments: 'Recommend immediate filing with FIU-IND. Clear TBML pattern established.',
  },
];

// Note: mockCustomerKYC is defined earlier in file (line 368) using mockExtendedCustomerProfiles
// This section intentionally removed to avoid duplicate declarations

// Note: mockTransactions is defined earlier in file (line 369) using mockTransactionsByCustomer
// This section intentionally removed to avoid duplicate declarations

// Mock audit entries - Indian context
export const mockAuditEntries: AuditEntry[] = [
  {
    id: 'AUD-001',
    entityType: 'alert',
    entityId: 'ALT-2024-001238',
    action: 'Alert created from Core Banking feed',
    performedBy: 'System',
    performedAt: new Date('2024-01-15T16:00:00'),
    details: 'Auto-ingested from trade finance monitoring - IEC flagged entity',
    modelVersion: 'FinCrisS-v2.3.1',
  },
  {
    id: 'AUD-002',
    entityType: 'alert',
    entityId: 'ALT-2024-001238',
    action: 'FinCrisS processing completed',
    performedBy: 'System',
    performedAt: new Date('2024-01-15T16:05:00'),
    details: 'Risk score: 92, Priority: High, CTR threshold analysis completed',
    modelVersion: 'FinCrisS-v2.3.1',
  },
  {
    id: 'AUD-003',
    entityType: 'case',
    entityId: 'CASE-2024-0089',
    action: 'Case created',
    performedBy: 'Arjun Mehta',
    performedAt: new Date('2024-01-10T09:00:00'),
    details: 'Created from alerts ALT-2024-001198, ALT-2024-001199',
  },
  {
    id: 'AUD-004',
    entityType: 'str',
    entityId: 'STR-2024-0045',
    action: 'STR Draft initiated',
    performedBy: 'Arjun Mehta',
    performedAt: new Date('2024-01-08T14:30:00'),
    details: 'FIU-IND SBA01 template selected, narrative generation started',
  },
];
