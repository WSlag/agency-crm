import type { QuerySnapshot, DocumentData } from 'firebase/firestore';
import type { DashboardMetric } from '../types/navigation';

/**
 * Real-time data aggregation helpers for dashboard metrics
 */

// Aggregate data by status
export const aggregateByStatus = (
  docs: QuerySnapshot<DocumentData>,
  statusField: string = 'status'
): Record<string, number> => {
  return docs.docs.reduce((acc, doc) => {
    const status = doc.data()[statusField] || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Aggregate amounts by field
export const aggregateAmountsByField = (
  docs: QuerySnapshot<DocumentData>,
  groupByField: string,
  amountField: string = 'amount'
): Record<string, number> => {
  return docs.docs.reduce((acc, doc) => {
    const key = doc.data()[groupByField] || 'Other';
    const amount = doc.data()[amountField] || 0;
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
};

// Count documents by field value
export const countByField = (
  docs: QuerySnapshot<DocumentData>,
  field: string
): Record<string, number> => {
  return docs.docs.reduce((acc, doc) => {
    const value = doc.data()[field] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Convert aggregated data to DashboardMetric array
export const aggregateToMetrics = (
  data: Record<string, number>,
  type: 'number' | 'currency' | 'percentage' = 'number'
): DashboardMetric[] => {
  return Object.entries(data).map(([label, value]) => ({
    label: formatLabel(label),
    value,
    type
  }));
};

// Format label for display
export const formatLabel = (label: string): string => {
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

// Calculate total from documents
export const calculateTotal = (
  docs: QuerySnapshot<DocumentData>,
  field: string = 'amount'
): number => {
  return docs.docs.reduce((sum, doc) => sum + (doc.data()[field] || 0), 0);
};

// Calculate average
export const calculateAverage = (
  docs: QuerySnapshot<DocumentData>,
  field: string
): number => {
  if (docs.size === 0) return 0;
  const total = calculateTotal(docs, field);
  return total / docs.size;
};

// Filter documents by date range
export const filterByDateRange = (
  docs: QuerySnapshot<DocumentData>,
  dateField: string,
  startDate: Date,
  endDate: Date
): DocumentData[] => {
  return docs.docs
    .filter(doc => {
      const date = doc.data()[dateField]?.toDate();
      return date && date >= startDate && date <= endDate;
    })
    .map(doc => doc.data());
};

// Get documents from last N days
export const getRecentDocs = (
  docs: QuerySnapshot<DocumentData>,
  dateField: string,
  days: number
): DocumentData[] => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();
  return filterByDateRange(docs, dateField, startDate, endDate);
};

// Calculate growth rate between two periods
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Get trend direction from growth rate
export const getTrendFromGrowth = (
  growthRate: number
): 'up' | 'down' | 'neutral' => {
  if (Math.abs(growthRate) < 1) return 'neutral';
  return growthRate > 0 ? 'up' : 'down';
};

// Group documents by date period (day, week, month)
export const groupByPeriod = (
  docs: QuerySnapshot<DocumentData>,
  dateField: string,
  period: 'day' | 'week' | 'month' = 'day'
): Record<string, number> => {
  const grouped: Record<string, number> = {};
  
  docs.docs.forEach(doc => {
    const date = doc.data()[dateField]?.toDate();
    if (!date) return;
    
    let key: string;
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekNum = getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNum}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    grouped[key] = (grouped[key] || 0) + 1;
  });
  
  return grouped;
};

// Get week number from date
const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Get top N items from aggregated data
export const getTopN = (
  data: Record<string, number>,
  n: number,
  sortBy: 'asc' | 'desc' = 'desc'
): Record<string, number> => {
  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => sortBy === 'desc' ? b - a : a - b)
    .slice(0, n);
  
  return Object.fromEntries(sorted);
};

// Calculate percentage distribution
export const calculatePercentages = (
  data: Record<string, number>
): Record<string, number> => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  if (total === 0) return data;
  
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = (value / total) * 100;
    return acc;
  }, {} as Record<string, number>);
};

// Create metric with comparison to previous period
export const createComparativeMetric = (
  label: string,
  current: number,
  previous: number,
  type: 'number' | 'currency' | 'percentage' = 'number'
): DashboardMetric => {
  const change = calculateGrowthRate(current, previous);
  const trend = getTrendFromGrowth(change);
  
  return {
    label,
    value: current,
    type,
    trend,
    change: Math.abs(Math.round(change))
  };
};

// Batch create metrics from multiple data sources
export const createMetricsBatch = (
  configs: Array<{
    label: string;
    value: number;
    type?: 'number' | 'currency' | 'percentage';
    previousValue?: number;
    trendData?: number[];
    description?: string;
  }>
): DashboardMetric[] => {
  return configs.map(config => {
    const metric: DashboardMetric = {
      label: config.label,
      value: config.value,
      type: config.type || 'number'
    };
    
    if (config.previousValue !== undefined) {
      const change = calculateGrowthRate(config.value, config.previousValue);
      metric.trend = getTrendFromGrowth(change);
      metric.change = Math.abs(Math.round(change));
    }
    
    if (config.trendData) {
      metric.trendData = config.trendData;
    }
    
    if (config.description) {
      metric.description = config.description;
    }
    
    return metric;
  });
};

