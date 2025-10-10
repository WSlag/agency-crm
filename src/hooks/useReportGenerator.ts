import { useState, useCallback } from 'react';
import { ReportGenerator, type ReportFilter } from '../services/reportGenerator';
import type { Expense } from '../types/expense';
import type { Commission } from '../types/commission';

interface UseReportGeneratorResult {
  generateExpenseReport: (filter: ReportFilter) => Promise<void>;
  generateCommissionReport: (filter: ReportFilter) => Promise<void>;
  exportExpenseReport: (filename: string) => Promise<void>;
  exportCommissionReport: (filename: string) => Promise<void>;
  expenseReport: {
    data: Expense[];
    summary: any;
  } | null;
  commissionReport: {
    data: Commission[];
    summary: any;
  } | null;
  loading: boolean;
  error: string | null;
}

export const useReportGenerator = (): UseReportGeneratorResult => {
  const [expenseReport, setExpenseReport] = useState<{
    data: Expense[];
    summary: any;
  } | null>(null);
  const [commissionReport, setCommissionReport] = useState<{
    data: Commission[];
    summary: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generator = ReportGenerator.getInstance();

  const generateExpenseReport = useCallback(
    async (filter: ReportFilter) => {
      try {
        setLoading(true);
        setError(null);
        const report = await generator.generateExpenseReport(filter);
        setExpenseReport(report);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate expense report');
        setExpenseReport(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateCommissionReport = useCallback(
    async (filter: ReportFilter) => {
      try {
        setLoading(true);
        setError(null);
        const report = await generator.generateCommissionReport(filter);
        setCommissionReport(report);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate commission report');
        setCommissionReport(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportExpenseReport = useCallback(
    async (filename: string) => {
      if (!expenseReport) {
        setError('No expense report data available');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const fields = [
          'id',
          'expenseType',
          'amount',
          'currency',
          'description',
          'expenseDate',
          'status',
          'branchId',
          'applicantId',
          'enteredBy',
          'verifiedBy',
          'verifiedAt',
          'approvedBy',
          'approvedAt',
          'paidBy',
          'paidAt',
        ];

        await generator.exportToCSV(
          expenseReport.data,
          fields,
          `${filename}.csv`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export expense report');
      } finally {
        setLoading(false);
      }
    },
    [expenseReport]
  );

  const exportCommissionReport = useCallback(
    async (filename: string) => {
      if (!commissionReport) {
        setError('No commission report data available');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const fields = [
          'id',
          'commissionType',
          'agentId',
          'applicantId',
          'branchId',
          'baseAmount',
          'bonusAmount',
          'totalAmount',
          'currency',
          'status',
          'requestedBy',
          'requestedAt',
          'verifiedBy',
          'verifiedAt',
          'approvedBy',
          'approvedAt',
          'paidBy',
          'paidAt',
        ];

        await generator.exportToCSV(
          commissionReport.data,
          fields,
          `${filename}.csv`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export commission report');
      } finally {
        setLoading(false);
      }
    },
    [commissionReport]
  );

  return {
    generateExpenseReport,
    generateCommissionReport,
    exportExpenseReport,
    exportCommissionReport,
    expenseReport,
    commissionReport,
    loading,
    error,
  };
};
