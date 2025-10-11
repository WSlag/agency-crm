import React, { useEffect, useState } from 'react';
import { ReportService, ReportResult } from '../../services/reports/reportService';

interface DashboardMetrics {
  applicants: {
    total: number;
    active: number;
    deployed: number;
    byStage: Record<string, number>;
  };
  transfers: {
    pending: number;
    completed: number;
    rejected: number;
    averageTime: number;
  };
  documents: {
    pending: number;
    verified: number;
    rejected: number;
    expiringSoon: number;
  };
  financial: {
    totalExpenses: number;
    totalCommissions: number;
    pendingApprovals: number;
  };
}

interface AnalyticsDashboardProps {
  branchId?: string;
  userRole: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  branchId,
  userRole,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportService = new ReportService();

  useEffect(() => {
    loadDashboardMetrics();
  }, [branchId, userRole]);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load applicant metrics
      const applicantReport = await reportService.generateReport({
        id: 'applicant_metrics',
        name: 'Applicant Metrics',
        type: 'applicant_status',
        description: 'Current applicant statistics',
        filters: branchId ? [{ field: 'branchId', operator: 'eq', value: branchId }] : [],
        metrics: [
          { name: 'total', calculation: 'count' },
          { name: 'active', calculation: 'count', field: 'status', format: 'number' },
          { name: 'deployed', calculation: 'count', field: 'status', format: 'number' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      });

      // Load transfer metrics
      const transferReport = await reportService.generateReport({
        id: 'transfer_metrics',
        name: 'Transfer Metrics',
        type: 'transfer_analytics',
        description: 'Transfer statistics',
        filters: branchId ? [{ field: 'fromBranchId', operator: 'eq', value: branchId }] : [],
        metrics: [
          { name: 'pending', calculation: 'count', field: 'status', format: 'number' },
          { name: 'completed', calculation: 'count', field: 'status', format: 'number' },
          { name: 'rejected', calculation: 'count', field: 'status', format: 'number' },
          { name: 'averageTime', calculation: 'average', field: 'processingTime', format: 'number' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      });

      // Combine metrics
      setMetrics({
        applicants: {
          total: applicantReport.summary.total || 0,
          active: applicantReport.summary.active || 0,
          deployed: applicantReport.summary.deployed || 0,
          byStage: applicantReport.summary.byStage || {},
        },
        transfers: {
          pending: transferReport.summary.pending || 0,
          completed: transferReport.summary.completed || 0,
          rejected: transferReport.summary.rejected || 0,
          averageTime: transferReport.summary.averageTime || 0,
        },
        documents: {
          pending: 0, // To be implemented
          verified: 0,
          rejected: 0,
          expiringSoon: 0,
        },
        financial: {
          totalExpenses: 0, // To be implemented
          totalCommissions: 0,
          pendingApprovals: 0,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Applicant Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Applicant Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Applicants</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.applicants.total}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Applicants</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.applicants.active}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Deployed</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.applicants.deployed}</dd>
          </div>
        </div>
      </div>

      {/* Transfer Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer Status</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Transfers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.transfers.pending}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Completed Transfers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.transfers.completed}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Rejected Transfers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.transfers.rejected}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Avg. Processing Time (days)</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {Math.round(metrics.transfers.averageTime)}
            </dd>
          </div>
        </div>
      </div>

      {/* Document Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Document Status</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.documents.pending}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Verified Documents</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.documents.verified}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Rejected Documents</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.documents.rejected}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Expiring Soon</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.documents.expiringSoon}</dd>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      {(userRole === 'admin' || userRole === 'ho_accountant') && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ₱{metrics.financial.totalExpenses.toLocaleString()}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Commissions</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ₱{metrics.financial.totalCommissions.toLocaleString()}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {metrics.financial.pendingApprovals}
              </dd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
