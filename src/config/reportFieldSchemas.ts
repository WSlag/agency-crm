/**
 * Field Schema Definitions for Report Builder
 * Provides metadata for available fields per report type
 */

export interface FieldSchema {
  value: string; // Technical field name
  label: string; // User-friendly display name
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'percentage';
  description: string; // For tooltips
  category?: string; // Group fields by category
  icon?: string; // Icon name for visual indicator
  common?: boolean; // Show in common fields dropdown
}

export interface CalculationType {
  value: string;
  label: string;
  description: string;
  formula?: string;
  example?: string;
  applicableTypes: string[]; // Field types this calculation works with
}

// Calculation types with descriptions
export const CALCULATION_TYPES: CalculationType[] = [
  {
    value: 'count',
    label: 'Count',
    description: 'Count the number of records',
    formula: 'Total number of items',
    example: 'Count of Applicants = 150',
    applicableTypes: ['text', 'number', 'date', 'currency', 'boolean', 'percentage'],
  },
  {
    value: 'sum',
    label: 'Sum',
    description: 'Add up all values',
    formula: 'Field₁ + Field₂ + ... + Fieldₙ',
    example: 'Sum of Expenses = $45,230',
    applicableTypes: ['number', 'currency', 'percentage'],
  },
  {
    value: 'average',
    label: 'Average',
    description: 'Calculate the mean value',
    formula: '(Field₁ + Field₂ + ... + Fieldₙ) ÷ n',
    example: 'Average Salary = $3,500',
    applicableTypes: ['number', 'currency', 'percentage'],
  },
  {
    value: 'min',
    label: 'Minimum',
    description: 'Find the smallest value',
    formula: 'Smallest value in the set',
    example: 'Min Transfer Amount = $500',
    applicableTypes: ['number', 'currency', 'date', 'percentage'],
  },
  {
    value: 'max',
    label: 'Maximum',
    description: 'Find the largest value',
    formula: 'Largest value in the set',
    example: 'Max Commission = $12,000',
    applicableTypes: ['number', 'currency', 'date', 'percentage'],
  },
];

// Common fields available across all report types
export const COMMON_FIELDS: FieldSchema[] = [
  {
    value: 'createdAt',
    label: 'Created Date',
    type: 'date',
    description: 'When the record was created',
    category: 'System',
    icon: '📅',
    common: true,
  },
  {
    value: 'updatedAt',
    label: 'Last Updated',
    type: 'date',
    description: 'When the record was last modified',
    category: 'System',
    icon: '📅',
    common: true,
  },
  {
    value: 'status',
    label: 'Status',
    type: 'text',
    description: 'Current status of the record',
    category: 'System',
    icon: '🏷️',
    common: true,
  },
];

// Transfer Analytics specific fields
export const TRANSFER_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'applicantName',
    label: 'Applicant Name',
    type: 'text',
    description: 'Name of the applicant being transferred',
    category: 'Applicant Info',
    icon: '👤',
    common: true,
  },
  {
    value: 'sourceBranch',
    label: 'From Branch',
    type: 'text',
    description: 'Branch transferring the applicant',
    category: 'Transfer Details',
    icon: '🏢',
    common: true,
  },
  {
    value: 'destinationBranch',
    label: 'To Branch',
    type: 'text',
    description: 'Branch receiving the applicant',
    category: 'Transfer Details',
    icon: '🏢',
    common: true,
  },
  {
    value: 'transferDate',
    label: 'Transfer Date',
    type: 'date',
    description: 'When the transfer occurred',
    category: 'Transfer Details',
    icon: '📅',
    common: true,
  },
  {
    value: 'transferReason',
    label: 'Transfer Reason',
    type: 'text',
    description: 'Reason for the transfer',
    category: 'Transfer Details',
    icon: '📝',
  },
  {
    value: 'processingTime',
    label: 'Processing Time (days)',
    type: 'number',
    description: 'Days taken to process the transfer',
    category: 'Metrics',
    icon: '⏱️',
  },
];

// Officer Performance specific fields
export const OFFICER_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'officerName',
    label: 'Officer Name',
    type: 'text',
    description: 'Name of the recruitment officer',
    category: 'Officer Info',
    icon: '👤',
    common: true,
  },
  {
    value: 'branchName',
    label: 'Branch',
    type: 'text',
    description: 'Branch where officer works',
    category: 'Officer Info',
    icon: '🏢',
    common: true,
  },
  {
    value: 'recruitmentsCount',
    label: 'Total Recruitments',
    type: 'number',
    description: 'Number of successful recruitments',
    category: 'Performance Metrics',
    icon: '📊',
    common: true,
  },
  {
    value: 'targetAchievement',
    label: 'Target Achievement',
    type: 'percentage',
    description: 'Percentage of target achieved',
    category: 'Performance Metrics',
    icon: '🎯',
    common: true,
  },
  {
    value: 'commissionEarned',
    label: 'Commission Earned',
    type: 'currency',
    description: 'Total commission earned',
    category: 'Financial',
    icon: '💰',
    common: true,
  },
  {
    value: 'averageProcessingTime',
    label: 'Avg Processing Time',
    type: 'number',
    description: 'Average days to process applications',
    category: 'Performance Metrics',
    icon: '⏱️',
  },
];

// Deployment Reports specific fields
export const DEPLOYMENT_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'applicantName',
    label: 'Applicant Name',
    type: 'text',
    description: 'Name of deployed applicant',
    category: 'Applicant Info',
    icon: '👤',
    common: true,
  },
  {
    value: 'employerName',
    label: 'Employer',
    type: 'text',
    description: 'Employer company name',
    category: 'Deployment Details',
    icon: '🏢',
    common: true,
  },
  {
    value: 'country',
    label: 'Destination Country',
    type: 'text',
    description: 'Country of deployment',
    category: 'Deployment Details',
    icon: '🌍',
    common: true,
  },
  {
    value: 'deploymentDate',
    label: 'Deployment Date',
    type: 'date',
    description: 'When applicant was deployed',
    category: 'Deployment Details',
    icon: '📅',
    common: true,
  },
  {
    value: 'position',
    label: 'Job Position',
    type: 'text',
    description: 'Position/role of the applicant',
    category: 'Job Details',
    icon: '💼',
  },
  {
    value: 'salary',
    label: 'Monthly Salary',
    type: 'currency',
    description: 'Monthly salary of the applicant',
    category: 'Financial',
    icon: '💰',
    common: true,
  },
  {
    value: 'contractDuration',
    label: 'Contract Duration (months)',
    type: 'number',
    description: 'Length of employment contract',
    category: 'Job Details',
    icon: '📋',
  },
];

// Financial Reports specific fields
export const FINANCIAL_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'expenseCategory',
    label: 'Expense Category',
    type: 'text',
    description: 'Type of expense',
    category: 'Expense Details',
    icon: '🏷️',
    common: true,
  },
  {
    value: 'amount',
    label: 'Amount',
    type: 'currency',
    description: 'Expense or income amount',
    category: 'Financial',
    icon: '💰',
    common: true,
  },
  {
    value: 'transactionDate',
    label: 'Transaction Date',
    type: 'date',
    description: 'When the transaction occurred',
    category: 'Transaction Details',
    icon: '📅',
    common: true,
  },
  {
    value: 'branchName',
    label: 'Branch',
    type: 'text',
    description: 'Branch associated with transaction',
    category: 'Transaction Details',
    icon: '🏢',
    common: true,
  },
  {
    value: 'commissionAmount',
    label: 'Commission',
    type: 'currency',
    description: 'Commission amount',
    category: 'Financial',
    icon: '💵',
    common: true,
  },
  {
    value: 'paymentMethod',
    label: 'Payment Method',
    type: 'text',
    description: 'How payment was made',
    category: 'Transaction Details',
    icon: '💳',
  },
  {
    value: 'approved',
    label: 'Approval Status',
    type: 'boolean',
    description: 'Whether expense was approved',
    category: 'Transaction Details',
    icon: '✅',
  },
];

// Branch Performance specific fields
export const BRANCH_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'branchName',
    label: 'Branch Name',
    type: 'text',
    description: 'Name of the branch',
    category: 'Branch Info',
    icon: '🏢',
    common: true,
  },
  {
    value: 'totalRecruitments',
    label: 'Total Recruitments',
    type: 'number',
    description: 'Number of successful recruitments',
    category: 'Performance Metrics',
    icon: '📊',
    common: true,
  },
  {
    value: 'totalRevenue',
    label: 'Total Revenue',
    type: 'currency',
    description: 'Total revenue generated',
    category: 'Financial',
    icon: '💰',
    common: true,
  },
  {
    value: 'totalExpenses',
    label: 'Total Expenses',
    type: 'currency',
    description: 'Total expenses incurred',
    category: 'Financial',
    icon: '💸',
    common: true,
  },
  {
    value: 'targetAchievement',
    label: 'Target Achievement',
    type: 'percentage',
    description: 'Percentage of target achieved',
    category: 'Performance Metrics',
    icon: '🎯',
    common: true,
  },
  {
    value: 'activeOfficers',
    label: 'Active Officers',
    type: 'number',
    description: 'Number of active recruitment officers',
    category: 'Branch Info',
    icon: '👥',
  },
];

// Agent Performance specific fields
export const AGENT_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'agentName',
    label: 'Agent Name',
    type: 'text',
    description: 'Name of the agent',
    category: 'Agent Info',
    icon: '👤',
    common: true,
  },
  {
    value: 'branchName',
    label: 'Branch',
    type: 'text',
    description: 'Branch where agent operates',
    category: 'Agent Info',
    icon: '🏢',
    common: true,
  },
  {
    value: 'totalReferrals',
    label: 'Total Referrals',
    type: 'number',
    description: 'Number of applicants referred',
    category: 'Performance Metrics',
    icon: '📊',
    common: true,
  },
  {
    value: 'successfulPlacements',
    label: 'Successful Placements',
    type: 'number',
    description: 'Number of successful placements',
    category: 'Performance Metrics',
    icon: '✅',
    common: true,
  },
  {
    value: 'conversionRate',
    label: 'Conversion Rate',
    type: 'percentage',
    description: 'Percentage of referrals that converted',
    category: 'Performance Metrics',
    icon: '📈',
    common: true,
  },
  {
    value: 'commissionEarned',
    label: 'Commission Earned',
    type: 'currency',
    description: 'Total commission earned',
    category: 'Financial',
    icon: '💰',
    common: true,
  },
];

// Applicant Status specific fields
export const APPLICANT_FIELDS: FieldSchema[] = [
  ...COMMON_FIELDS,
  {
    value: 'applicantName',
    label: 'Applicant Name',
    type: 'text',
    description: 'Full name of the applicant',
    category: 'Personal Info',
    icon: '👤',
    common: true,
  },
  {
    value: 'passportNumber',
    label: 'Passport Number',
    type: 'text',
    description: 'Passport number',
    category: 'Personal Info',
    icon: '🛂',
  },
  {
    value: 'applicationStatus',
    label: 'Application Status',
    type: 'text',
    description: 'Current status of application',
    category: 'Application Details',
    icon: '🏷️',
    common: true,
  },
  {
    value: 'branchName',
    label: 'Branch',
    type: 'text',
    description: 'Recruiting branch',
    category: 'Application Details',
    icon: '🏢',
    common: true,
  },
  {
    value: 'officerName',
    label: 'Recruitment Officer',
    type: 'text',
    description: 'Assigned recruitment officer',
    category: 'Application Details',
    icon: '👔',
    common: true,
  },
  {
    value: 'applicationDate',
    label: 'Application Date',
    type: 'date',
    description: 'When application was submitted',
    category: 'Application Details',
    icon: '📅',
    common: true,
  },
];

// Map report types to their field schemas
export const REPORT_TYPE_FIELDS: Record<string, FieldSchema[]> = {
  'transfer-analytics': TRANSFER_FIELDS,
  'officer-performance': OFFICER_FIELDS,
  'deployment': DEPLOYMENT_FIELDS,
  'financial': FINANCIAL_FIELDS,
  'branch-performance': BRANCH_FIELDS,
  'agent-performance': AGENT_FIELDS,
  'applicant-status': APPLICANT_FIELDS,
};

// Preset date ranges
export const DATE_PRESETS = [
  { label: 'Today', value: 'today', description: 'Records from today' },
  { label: 'Yesterday', value: 'yesterday', description: 'Records from yesterday' },
  { label: 'This Week', value: 'this-week', description: 'Monday to today' },
  { label: 'Last Week', value: 'last-week', description: 'Previous Monday to Sunday' },
  { label: 'This Month', value: 'this-month', description: 'First day of month to today' },
  { label: 'Last Month', value: 'last-month', description: 'Previous month' },
  { label: 'This Quarter', value: 'this-quarter', description: 'Current quarter' },
  { label: 'Last Quarter', value: 'last-quarter', description: 'Previous quarter' },
  { label: 'This Year', value: 'this-year', description: 'January 1st to today' },
  { label: 'Last Year', value: 'last-year', description: 'Previous year' },
  { label: 'Last 7 Days', value: 'last-7-days', description: 'Past 7 days' },
  { label: 'Last 30 Days', value: 'last-30-days', description: 'Past 30 days' },
  { label: 'Last 90 Days', value: 'last-90-days', description: 'Past 90 days' },
];

// Operator definitions with examples
export const OPERATORS = [
  {
    value: 'eq',
    label: 'Equals',
    description: 'Exact match',
    example: 'Status equals "Approved"',
    icon: '=',
  },
  {
    value: 'ne',
    label: 'Not Equals',
    description: 'Does not match',
    example: 'Status not equals "Rejected"',
    icon: '≠',
  },
  {
    value: 'gt',
    label: 'Greater Than',
    description: 'Larger than specified value',
    example: 'Amount greater than 1000',
    icon: '>',
  },
  {
    value: 'gte',
    label: 'Greater or Equal',
    description: 'Larger than or equal to value',
    example: 'Count >= 5',
    icon: '≥',
  },
  {
    value: 'lt',
    label: 'Less Than',
    description: 'Smaller than specified value',
    example: 'Days less than 30',
    icon: '<',
  },
  {
    value: 'lte',
    label: 'Less or Equal',
    description: 'Smaller than or equal to value',
    example: 'Percentage <= 100',
    icon: '≤',
  },
  {
    value: 'between',
    label: 'Between',
    description: 'Within a range (inclusive)',
    example: 'Date between Jan 1 and Dec 31',
    icon: '↔',
  },
  {
    value: 'contains',
    label: 'Contains',
    description: 'Text contains specified string',
    example: 'Name contains "John"',
    icon: '⊃',
  },
  {
    value: 'in',
    label: 'In List',
    description: 'Matches any value in list',
    example: 'Branch in ["Main", "North", "South"]',
    icon: '∈',
  },
];

// Helper function to get fields for a report type
export const getFieldsForReportType = (reportType: string): FieldSchema[] => {
  return REPORT_TYPE_FIELDS[reportType] || COMMON_FIELDS;
};

// Helper function to get common (frequently used) fields
export const getCommonFields = (reportType: string): FieldSchema[] => {
  const fields = getFieldsForReportType(reportType);
  return fields.filter((f) => f.common);
};

// Helper function to get applicable calculation types for a field
export const getCalculationsForFieldType = (
  fieldType: string
): CalculationType[] => {
  return CALCULATION_TYPES.filter((calc) =>
    calc.applicableTypes.includes(fieldType)
  );
};

// Helper to get field by value
export const getFieldByValue = (
  reportType: string,
  fieldValue: string
): FieldSchema | undefined => {
  const fields = getFieldsForReportType(reportType);
  return fields.find((f) => f.value === fieldValue);
};
