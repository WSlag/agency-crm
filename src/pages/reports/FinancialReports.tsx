import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useReportGenerator } from '../../hooks/useReportGenerator';
import { EXPENSE_CONFIG } from '../../types/expense';
import { COMMISSION_CONFIG, CommissionType } from '../../types/commission';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

type ReportType = 'expense' | 'commission';

interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
  agentId?: string;
  applicantId?: string;
  type?: string;
  status?: string;
}

export const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = React.useState<ReportType>('expense');
  const {
    generateExpenseReport,
    generateCommissionReport,
    exportExpenseReport,
    exportCommissionReport,
    expenseReport,
    commissionReport,
    loading,
    error,
  } = useReportGenerator();

  const { control, handleSubmit } = useForm<ReportFilter>({
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    },
  });

  const handleGenerateReport = async (data: ReportFilter) => {
    if (reportType === 'expense') {
      await generateExpenseReport(data);
    } else {
      await generateCommissionReport(data);
    }
  };

  const handleExport = async () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (reportType === 'expense') {
      await exportExpenseReport(`expense_report_${timestamp}`);
    } else {
      await exportCommissionReport(`commission_report_${timestamp}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const report = reportType === 'expense' ? expenseReport : commissionReport;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Financial Reports
              </h2>
            </div>
          </div>

          {/* Report Type Selection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="space-x-4">
              <button
                onClick={() => setReportType('expense')}
                className={`px-4 py-2 rounded-md ${
                  reportType === 'expense'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Expense Report
              </button>
              <button
                onClick={() => setReportType('commission')}
                className={`px-4 py-2 rounded-md ${
                  reportType === 'commission'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Commission Report
              </button>
            </div>
          </div>

          {/* Report Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit(handleGenerateReport)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        value={field.value?.toISOString().split('T')[0]}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        value={field.value?.toISOString().split('T')[0]}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    )}
                  />
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">All Types</option>
                        {Object.entries(
                          reportType === 'expense'
                            ? EXPENSE_CONFIG
                            : COMMISSION_CONFIG
                        ).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="paid">Paid</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
                {report && (
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Export to CSV
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
          )}

          {/* Report Results */}
          {report && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Amount
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(report.summary.totalAmount)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Count
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {report.summary.count}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Average Amount
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(report.summary.averageAmount)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Max Amount
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(report.summary.maxAmount)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown by Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Breakdown by Status
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(report.summary.byStatus).map(
                    ([status, data]) => (
                      <div
                        key={status}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="text-sm font-medium text-gray-500">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </h4>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {formatCurrency(data.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} {data.count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Breakdown by Type */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Breakdown by Type
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(report.summary.byType).map(
                    ([type, data]) => (
                      <div
                        key={type}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="text-sm font-medium text-gray-500">
                          {reportType === 'expense'
                            ? EXPENSE_CONFIG[type]?.name
                            : COMMISSION_CONFIG[type as CommissionType]?.name}
                        </h4>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {formatCurrency(data.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} {data.count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Monthly Trend
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(report.summary.byMonth)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([month, data]) => (
                      <div
                        key={month}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="text-sm font-medium text-gray-500">
                          {new Date(month).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                          })}
                        </h4>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {formatCurrency(data.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} {data.count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};