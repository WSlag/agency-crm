import { firestore } from '../../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy } from 'firebase/firestore';
import { BaseEntity } from '../../types/common';

export type ReportType = 
  | 'applicant_status'
  | 'transfer_analytics'
  | 'financial_summary'
  | 'commission_report'
  | 'document_verification'
  | 'branch_performance'
  | 'agent_performance';

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: any;
}

export interface ReportMetric {
  name: string;
  calculation: 'count' | 'sum' | 'average' | 'min' | 'max';
  field?: string;
  format?: 'number' | 'currency' | 'percentage' | 'date';
}

export interface ReportDefinition extends BaseEntity {
  name: string;
  type: ReportType;
  description: string;
  filters: ReportFilter[];
  metrics: ReportMetric[];
  groupBy?: string[];
  sortBy?: { field: string; order: 'asc' | 'desc' }[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel';
  };
}

export interface ReportResult {
  definition: ReportDefinition;
  data: any[];
  summary: Record<string, any>;
  generatedAt: Date;
}

export class ReportService {
  private readonly reportsRef = collection(firestore, 'reports');

  async generateReport(definition: ReportDefinition): Promise<ReportResult> {
    try {
      // Determine collection based on report type
      const collectionName = this.getCollectionForReportType(definition.type);
      const baseQuery = collection(firestore, collectionName);

      // Apply filters
      let filteredQuery = this.applyFilters(baseQuery, definition.filters);

      // Execute query
      const snapshot = await getDocs(filteredQuery);
      const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Process data according to metrics
      const processedData = this.processData(rawData, definition);

      // Generate summary
      const summary = this.generateSummary(processedData, definition.metrics);

      // Save report result
      const result: ReportResult = {
        definition,
        data: processedData,
        summary,
        generatedAt: new Date()
      };

      await this.saveReportResult(result);

      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  private getCollectionForReportType(type: ReportType): string {
    const collectionMap: Record<ReportType, string> = {
      applicant_status: 'applicants',
      transfer_analytics: 'transfers',
      financial_summary: 'expenses',
      commission_report: 'commissions',
      document_verification: 'documents',
      branch_performance: 'branches',
      agent_performance: 'agents'
    };
    return collectionMap[type];
  }

  private applyFilters(baseQuery: any, filters: ReportFilter[]): any {
    let filteredQuery = baseQuery;
    
    filters.forEach(filter => {
      switch (filter.operator) {
        case 'eq':
          filteredQuery = query(filteredQuery, where(filter.field, '==', filter.value));
          break;
        case 'gt':
          filteredQuery = query(filteredQuery, where(filter.field, '>', filter.value));
          break;
        case 'lt':
          filteredQuery = query(filteredQuery, where(filter.field, '<', filter.value));
          break;
        case 'between':
          filteredQuery = query(
            filteredQuery,
            where(filter.field, '>=', filter.value[0]),
            where(filter.field, '<=', filter.value[1])
          );
          break;
        // Add more operators as needed
      }
    });

    return filteredQuery;
  }

  private processData(rawData: any[], definition: ReportDefinition): any[] {
    let processedData = rawData;

    // Apply grouping if specified
    if (definition.groupBy && definition.groupBy.length > 0) {
      processedData = this.groupData(processedData, definition.groupBy);
    }

    // Apply sorting if specified
    if (definition.sortBy && definition.sortBy.length > 0) {
      processedData = this.sortData(processedData, definition.sortBy);
    }

    return processedData;
  }

  private groupData(data: any[], groupBy: string[]): any[] {
    return Object.values(data.reduce((acc, item) => {
      const groupKey = groupBy.map(field => item[field]).join('-');
      if (!acc[groupKey]) {
        acc[groupKey] = {
          ...groupBy.reduce((obj, field) => ({ ...obj, [field]: item[field] }), {}),
          items: []
        };
      }
      acc[groupKey].items.push(item);
      return acc;
    }, {}));
  }

  private sortData(data: any[], sortBy: { field: string; order: 'asc' | 'desc' }[]): any[] {
    return data.sort((a, b) => {
      for (const sort of sortBy) {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        
        if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private generateSummary(data: any[], metrics: ReportMetric[]): Record<string, any> {
    return metrics.reduce((summary, metric) => {
      const values = data.map(item => item[metric.field || '']);
      
      switch (metric.calculation) {
        case 'count':
          summary[metric.name] = values.length;
          break;
        case 'sum':
          summary[metric.name] = values.reduce((sum, val) => sum + (val || 0), 0);
          break;
        case 'average':
          summary[metric.name] = values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
          break;
        case 'min':
          summary[metric.name] = Math.min(...values.filter(v => v !== null));
          break;
        case 'max':
          summary[metric.name] = Math.max(...values.filter(v => v !== null));
          break;
      }

      return summary;
    }, {});
  }

  private async saveReportResult(result: ReportResult): Promise<void> {
    const reportRef = doc(this.reportsRef);
    await setDoc(reportRef, {
      ...result,
      id: reportRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'completed'
    });
  }
}

// Export singleton instance
export const reportService = new ReportService();