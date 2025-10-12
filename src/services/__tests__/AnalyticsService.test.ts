import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from '../AnalyticsService';
import { mockAnalyticsData, MockFirestore } from '../../utils/test/mockServices';

describe('AnalyticsService', () => {
  const mockFirestore = new MockFirestore();
  
  beforeEach(() => {
    mockFirestore.clearData();
    vi.clearAllMocks();
  });

  describe('generateReport', () => {
    it('generates report successfully', async () => {
      const config = {
        id: 'test-report',
        name: 'Test Report',
        type: 'financial' as const,
        description: 'Test Description',
        filters: [
          { field: 'branchId', operator: 'eq' as const, value: 'branch-1' }
        ],
        metrics: [
          { name: 'total', calculation: 'sum' as const, field: 'amount', format: 'currency' as const }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const
      };

      const result = await analyticsService.generateReport(config);
      expect(result.summary).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('handles report generation failure', async () => {
      const error = new Error('Failed to generate report');
      vi.spyOn(mockFirestore, 'collection').mockImplementationOnce(() => {
        throw error;
      });

      await expect(
        analyticsService.generateReport({
          id: 'test',
          name: 'Test',
          type: 'financial',
          description: 'Test',
          filters: [],
          metrics: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('getExpenseMetrics', () => {
    it('returns expense metrics for branch', async () => {
      const expenses = [
        { id: 'expense-1', amount: 100, branchId: 'branch-1' },
        { id: 'expense-2', amount: 200, branchId: 'branch-1' },
        { id: 'expense-3', amount: 300, branchId: 'branch-2' }
      ];

      for (const expense of expenses) {
        await mockFirestore.collection('expenses').doc(expense.id).set(expense);
      }

      const metrics = await analyticsService.getExpenseMetrics('branch-1');
      expect(metrics.summary.total).toBe(300);
      expect(metrics.summary.count).toBe(2);
      expect(metrics.summary.average).toBe(150);
    });
  });

  describe('getCommissionMetrics', () => {
    it('returns commission metrics for branch', async () => {
      const commissions = [
        { id: 'commission-1', amount: 50, branchId: 'branch-1' },
        { id: 'commission-2', amount: 100, branchId: 'branch-1' },
        { id: 'commission-3', amount: 150, branchId: 'branch-2' }
      ];

      for (const commission of commissions) {
        await mockFirestore.collection('commissions').doc(commission.id).set(commission);
      }

      const metrics = await analyticsService.getCommissionMetrics('branch-1');
      expect(metrics.summary.total).toBe(150);
      expect(metrics.summary.count).toBe(2);
      expect(metrics.summary.average).toBe(75);
    });
  });

  describe('getDocumentMetrics', () => {
    it('returns document processing metrics', async () => {
      const documents = [
        { id: 'doc-1', verificationTime: 100, isRejected: false },
        { id: 'doc-2', verificationTime: 200, isRejected: true },
        { id: 'doc-3', verificationTime: 300, isRejected: false }
      ];

      for (const doc of documents) {
        await mockFirestore.collection('documents').doc(doc.id).set(doc);
      }

      const metrics = await analyticsService.getDocumentMetrics();
      expect(metrics.summary.total).toBe(3);
      expect(metrics.summary.verificationTime).toBe(200);
      expect(metrics.summary.rejectionRate).toBe(1/3);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('returns system performance metrics', async () => {
      const logs = [
        { id: 'log-1', duration: 100, hasError: false },
        { id: 'log-2', duration: 200, hasError: true },
        { id: 'log-3', duration: 300, hasError: false }
      ];

      for (const log of logs) {
        await mockFirestore.collection('audit_logs').doc(log.id).set(log);
      }

      const metrics = await analyticsService.getPerformanceMetrics();
      expect(metrics.summary.responseTime).toBe(200);
      expect(metrics.summary.errorRate).toBe(1/3);
      expect(metrics.summary.userCount).toBe(3);
    });
  });
});
