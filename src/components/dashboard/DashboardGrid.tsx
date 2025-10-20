import React from 'react';
import { MetricGroup } from './MetricGroup';
import { BreakdownChart } from './BreakdownChart';
import { TrendChart } from './TrendChart';
import { PerformanceTable } from './PerformanceTable';
import { useReportStore } from '../../stores/reportStore';
import { useAuthStore } from '../../stores/authStore';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const DashboardGrid: React.FC = () => {
  const { user, customClaims } = useAuthStore();
  const {
    dashboardMetrics,
    loading,
    error,
    fetchDashboardMetrics,
  } = useReportStore();

  React.useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

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
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
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

  if (!dashboardMetrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Applicant Metrics */}
      <MetricGroup
        title="Applicant Overview"
        metrics={dashboardMetrics.applicants}
      />

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MetricGroup
          title="Expenses"
          metrics={dashboardMetrics.expenses}
          formatValue={formatCurrency}
        />
        <MetricGroup
          title="Commissions"
          metrics={dashboardMetrics.commissions}
          formatValue={formatCurrency}
        />
      </div>

      {/* Transfer Metrics */}
      {(customClaims?.role === 'admin' || customClaims?.role === 'president') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MetricGroup title="Transfers" metrics={dashboardMetrics.transfers} />
          <BreakdownChart
            title="Transfers by Branch"
            data={dashboardMetrics.transfers.byBranch}
          />
        </div>
      )}

      {/* Officer Metrics */}
      {(customClaims?.role === 'admin' || customClaims?.role === 'president') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MetricGroup
            title="Recruitment Officers"
            metrics={dashboardMetrics.officers}
          />
          <TrendChart
            title="Officer Performance Trends"
            metrics={Object.values(dashboardMetrics.officers.byPerformance)}
          />
        </div>
      )}

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownChart
          title="Expenses by Type"
          data={dashboardMetrics.expenses.byType}
          formatValue={formatCurrency}
        />
        <BreakdownChart
          title="Commissions by Type"
          data={dashboardMetrics.commissions.byType}
          formatValue={formatCurrency}
        />
      </div>

      {/* Performance Tables */}
      {(customClaims?.role === 'admin' || customClaims?.role === 'president') && (
        <div className="grid grid-cols-1 gap-6">
          <PerformanceTable
            title="Branch Performance"
            data={[
              {
                id: '1',
                name: 'Branch 1',
                metrics: {
                  applicants: {
                    name: 'Applicants',
                    value: 150,
                    change: 5,
                    changeType: 'increase',
                  },
                  deployments: {
                    name: 'Deployments',
                    value: 45,
                    change: -2,
                    changeType: 'decrease',
                  },
                  revenue: {
                    name: 'Revenue',
                    value: 500000,
                    change: 8,
                    changeType: 'increase',
                  },
                },
              },
              // Add more branches here
            ]}
            formatValue={(value) =>
              value >= 1000
                ? formatCurrency(value)
                : value.toLocaleString()
            }
          />
        </div>
      )}
    </div>
  );
};
