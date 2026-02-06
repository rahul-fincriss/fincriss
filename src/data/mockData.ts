import { RawAlert, PrioritizedAlert, Case, STRDraft, CustomerKYC, Transaction, AuditEntry, User } from '@/types';

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

// Mock customer KYC - Indian context
export const mockCustomerKYC: CustomerKYC = {
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
};

// Mock transactions - Indian context with INR
export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    date: new Date('2024-01-14'),
    type: 'debit',
    amount: 2450000,
    currency: 'INR',
    counterparty: 'Global Trade FZE (Dubai)',
    channel: 'Wire - SWIFT',
    country: 'AE',
    description: 'Invoice payment - machinery parts (IEC: AAACA****J)',
  },
  {
    id: 'TXN-002',
    date: new Date('2024-01-13'),
    type: 'credit',
    amount: 1800000,
    currency: 'INR',
    counterparty: 'Eastern Materials Pte Ltd (Singapore)',
    channel: 'Wire - SWIFT',
    country: 'SG',
    description: 'Goods received - textiles',
  },
  {
    id: 'TXN-003',
    date: new Date('2024-01-12'),
    type: 'debit',
    amount: 3200000,
    currency: 'INR',
    counterparty: 'Pacific Holdings Ltd (Hong Kong)',
    channel: 'Wire - SWIFT',
    country: 'HK',
    description: 'Consulting services - trade advisory',
  },
  {
    id: 'TXN-004',
    date: new Date('2024-01-11'),
    type: 'credit',
    amount: 950000,
    currency: 'INR',
    counterparty: 'Domestic - Cash Deposit',
    channel: 'Cash',
    country: 'IN',
    description: 'Cash deposit - Mumbai Fort Branch (IFSC: HDFC0000123)',
  },
  {
    id: 'TXN-005',
    date: new Date('2024-01-10'),
    type: 'credit',
    amount: 980000,
    currency: 'INR',
    counterparty: 'Domestic - Cash Deposit',
    channel: 'Cash',
    country: 'IN',
    description: 'Cash deposit - Nariman Point Branch (IFSC: HDFC0000456)',
  },
  {
    id: 'TXN-006',
    date: new Date('2024-01-09'),
    type: 'debit',
    amount: 4500000,
    currency: 'INR',
    counterparty: 'Al Rashid Trading LLC (UAE)',
    channel: 'Wire - SWIFT',
    country: 'AE',
    description: 'Import payment - electronics components',
  },
  {
    id: 'TXN-007',
    date: new Date('2024-01-08'),
    type: 'credit',
    amount: 890000,
    currency: 'INR',
    counterparty: 'Shree Krishna Enterprises (Delhi)',
    channel: 'RTGS',
    country: 'IN',
    description: 'Domestic sale proceeds',
  },
];

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
