import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useReportGenerator } from '../../hooks/useReportGenerator';
import { EXPENSE_CONFIG } from '../../types/expense';
import { COMMISSION_CONFIG, CommissionType } from '../../types/commission';
import { 
  SparklesIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

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
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const report = reportType === 'expense' ? expenseReport : commissionReport;

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          </div>
          <p className="mt-2 text-indigo-100">
            Generate comprehensive financial reports for expenses and commissions
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {/* Report Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <DocumentChartBarIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Select Report Type</h3>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setReportType('expense')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                reportType === 'expense'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expense Report
            </button>
            <button
              onClick={() => setReportType('commission')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                reportType === 'commission'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Commission Report
            </button>
          </div>
        </div>

        {/* Report Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmit(handleGenerateReport)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                    />
                  )}
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
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
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
              {report && (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Export to CSV
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 mb-6">
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
              <div className="relative overflow-hidden rounded-xl bg-white border-2 border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Amount
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatCurrency(report.summary.totalAmount)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white border-2 border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Count
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {report.summary.count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Amount
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatCurrency(report.summary.averageAmount)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white border-2 border-orange-200 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Max Amount
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatCurrency(report.summary.maxAmount)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-20 blur-2xl"></div>
              </div>
            </div>

            {/* Breakdown by Status */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Breakdown by Status
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(report.summary.byStatus).map(
                  ([status, data]) => (
                    <div
                      key={status}
                      className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </h4>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(data.amount)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.count} {data.count === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Breakdown by Type */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <DocumentChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Breakdown by Type
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(report.summary.byType).map(
                  ([type, data]) => (
                    <div
                      key={type}
                      className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {reportType === 'expense'
                          ? EXPENSE_CONFIG[type]?.name
                          : COMMISSION_CONFIG[type as CommissionType]?.name}
                      </h4>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(data.amount)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.count} {data.count === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Monthly Trend
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(report.summary.byMonth)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, data]) => (
                    <div
                      key={month}
                      className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <h4 className="text-sm font-semibold text-gray-600">
                        {new Date(month).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </h4>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(data.amount)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
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
  );
};
