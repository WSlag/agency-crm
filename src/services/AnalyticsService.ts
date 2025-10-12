import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { performanceMonitor } from '../utils/performanceMonitoring';

export interface MetricFilter {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

export interface MetricDefinition {
  name: string;
  calculation: 'count' | 'sum' | 'average' | 'min' | 'max';
  field: string;
  format: 'number' | 'currency' | 'percentage' | 'duration';
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'financial' | 'document' | 'performance';
  description: string;
  filters: MetricFilter[];
  metrics: MetricDefinition[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

export interface ReportSummary {
  [key: string]: number;
}

export interface AnalyticsResult {
  summary: ReportSummary;
  details: any[];
  metadata: {
    generatedAt: Date;
    filters: MetricFilter[];
    metrics: MetricDefinition[];
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly CACHE_KEY = 'analytics_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async generateReport(config: ReportConfig): Promise<AnalyticsResult> {
    const startTime = performance.now();
    try {
      // Check cache first
      const cachedResult = this.getCachedResult(config.id);
      if (cachedResult) {
        return cachedResult;
      }

      let collectionName: string;
      switch (config.type) {
        case 'financial':
          collectionName = 'expenses';
          break;
        case 'document':
          collectionName = 'documents';
          break;
        case 'performance':
          collectionName = 'audit_logs';
          break;
        default:
          throw new Error(`Unsupported report type: ${config.type}`);
      }

      // Build and execute query
      const querySnapshot = await this.executeQuery(collectionName, config.filters);
      
      // Calculate metrics
      const result = this.calculateMetrics(querySnapshot, config.metrics);

      // Cache result
      this.cacheResult(config.id, result);

      // Record performance
      const duration = performance.now() - startTime;
      performanceMonitor.measureRender('AnalyticsService', startTime);

      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private async executeQuery(
    collectionName: string,
    filters: MetricFilter[]
  ): Promise<QuerySnapshot<DocumentData>> {
    const conditions = filters.map(filter => 
      where(filter.field, filter.operator, filter.value)
    );

    const q = query(collection(firestore, collectionName), ...conditions);
    return getDocs(q);
  }

  private calculateMetrics(
    querySnapshot: QuerySnapshot<DocumentData>,
    metrics: MetricDefinition[]
  ): AnalyticsResult {
    const summary: ReportSummary = {};
    const details: any[] = [];

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      details.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });

      metrics.forEach(metric => {
        const value = data[metric.field];
        if (value === undefined) return;

        switch (metric.calculation) {
          case 'count':
            summary[metric.name] = (summary[metric.name] || 0) + 1;
            break;
          case 'sum':
            summary[metric.name] = (summary[metric.name] || 0) + Number(value);
            break;
          case 'min':
            summary[metric.name] = Math.min(summary[metric.name] ?? Infinity, Number(value));
            break;
          case 'max':
            summary[metric.name] = Math.max(summary[metric.name] ?? -Infinity, Number(value));
            break;
          case 'average':
            if (!summary[`${metric.name}_sum`]) {
              summary[`${metric.name}_sum`] = 0;
              summary[`${metric.name}_count`] = 0;
            }
            summary[`${metric.name}_sum`] += Number(value);
            summary[`${metric.name}_count`] += 1;
            summary[metric.name] = summary[`${metric.name}_sum`] / summary[`${metric.name}_count`];
            break;
        }
      });
    });

    return {
      summary,
      details,
      metadata: {
        generatedAt: new Date(),
        filters,
        metrics
      }
    };
  }

  private getCachedResult(reportId: string): AnalyticsResult | null {
    const cached = localStorage.getItem(`${this.CACHE_KEY}_${reportId}`);
    if (!cached) return null;

    const { result, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(`${this.CACHE_KEY}_${reportId}`);
      return null;
    }

    return result;
  }

  private cacheResult(reportId: string, result: AnalyticsResult): void {
    localStorage.setItem(`${this.CACHE_KEY}_${reportId}`, JSON.stringify({
      result,
      timestamp: Date.now()
    }));
  }

  // Financial Analytics
  async getExpenseMetrics(branchId?: string): Promise<AnalyticsResult> {
    const config: ReportConfig = {
      id: 'expense_metrics',
      name: 'Expense Metrics',
      type: 'financial',
      description: 'Expense statistics and trends',
      filters: branchId ? [{ field: 'branchId', operator: 'eq', value: branchId }] : [],
      metrics: [
        { name: 'total', calculation: 'sum', field: 'amount', format: 'currency' },
        { name: 'count', calculation: 'count', field: 'id', format: 'number' },
        { name: 'average', calculation: 'average', field: 'amount', format: 'currency' },
        { name: 'max', calculation: 'max', field: 'amount', format: 'currency' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    return this.generateReport(config);
  }

  async getCommissionMetrics(branchId?: string): Promise<AnalyticsResult> {
    const config: ReportConfig = {
      id: 'commission_metrics',
      name: 'Commission Metrics',
      type: 'financial',
      description: 'Commission statistics and trends',
      filters: branchId ? [{ field: 'branchId', operator: 'eq', value: branchId }] : [],
      metrics: [
        { name: 'total', calculation: 'sum', field: 'amount', format: 'currency' },
        { name: 'count', calculation: 'count', field: 'id', format: 'number' },
        { name: 'average', calculation: 'average', field: 'amount', format: 'currency' },
        { name: 'max', calculation: 'max', field: 'amount', format: 'currency' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    return this.generateReport(config);
  }

  // Document Analytics
  async getDocumentMetrics(branchId?: string): Promise<AnalyticsResult> {
    const config: ReportConfig = {
      id: 'document_metrics',
      name: 'Document Metrics',
      type: 'document',
      description: 'Document processing statistics',
      filters: branchId ? [{ field: 'branchId', operator: 'eq', value: branchId }] : [],
      metrics: [
        { name: 'total', calculation: 'count', field: 'id', format: 'number' },
        { name: 'verificationTime', calculation: 'average', field: 'verificationTime', format: 'duration' },
        { name: 'rejectionRate', calculation: 'average', field: 'isRejected', format: 'percentage' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    return this.generateReport(config);
  }

  // Performance Analytics
  async getPerformanceMetrics(): Promise<AnalyticsResult> {
    const config: ReportConfig = {
      id: 'performance_metrics',
      name: 'Performance Metrics',
      type: 'performance',
      description: 'System performance statistics',
      filters: [],
      metrics: [
        { name: 'responseTime', calculation: 'average', field: 'duration', format: 'duration' },
        { name: 'errorRate', calculation: 'average', field: 'hasError', format: 'percentage' },
        { name: 'userCount', calculation: 'count', field: 'userId', format: 'number' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    return this.generateReport(config);
  }
}

export const analyticsService = AnalyticsService.getInstance();
