export const priorityReasonCategories = [
  'Regular High-Value Customer',
  'PEP Relationship',
  'Known Business Cycle',
  'Reported by Branch',
  'Manual Investigation Needed',
  'System False Positive',
  'Previous Case History',
  'Ad-hoc Review',
];

export const queueTypes = [
  { id: 'default_aml', name: 'Default AML Queue' },
  { id: 'pep_sanctions', name: 'PEP & Sanctions' },
  { id: 'high_value', name: 'High-Value Transactions' },
  { id: 'cash_structuring', name: 'Cash Structuring' },
  { id: 'trade_based', name: 'Trade-Based AML' },
  { id: 'behavioral_anomaly', name: 'Behavioral Anomalies' },
];
