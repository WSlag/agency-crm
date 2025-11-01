import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useReportGenerator } from '../../hooks/useReportGenerator';
import { useAuthStore } from '../../stores/authStore';
import { useAgentStore } from '../../stores/agentStore';
import { useBranchStore } from '../../stores/branchStore';
import { useApplicantStore } from '../../stores/applicantStore';
import { EXPENSE_CONFIG } from '../../types/expense';
import { COMMISSION_CONFIG, CommissionType } from '../../types/commission';
import { ReportIntroCard, MetricTooltip } from '../../components/reports';
import { SearchableApplicantSelect } from '../../components/reports/SearchableApplicantSelect';
import { SearchableAgentSelect } from '../../components/reports/SearchableAgentSelect';
import {
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  ArrowLeftIcon
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
  const navigate = useNavigate();
  const { customClaims } = useAuthStore();
  const { agents, fetchActiveAgents } = useAgentStore();
  const { branches, fetchActiveBranches } = useBranchStore();
  const { applicants, fetchApplicants } = useApplicantStore();
  const [reportType, setReportType] = React.useState<ReportType>('expense');
  const {
    generateExpenseReport,
    generateCommissionReport,
    exportExpenseReport,
    exportCommissionReport,
    exportExpenseReportToExcel,
    exportCommissionReportToExcel,
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

  // Fetch data for dropdown filters
  useEffect(() => {
    fetchActiveAgents();
    fetchActiveBranches();
    fetchApplicants();
  }, [fetchActiveAgents, fetchActiveBranches, fetchApplicants]);

  const handleGenerateReport = async (data: ReportFilter) => {
    // Apply role-based filtering
    const filteredData = { ...data };

    // Branch Managers: Auto-filter by their branch ONLY if no branch is manually selected
    if (customClaims?.role?.toLowerCase() === 'branch_manager' && customClaims?.branchId) {
      if (!data.branchId) {
        filteredData.branchId = customClaims.branchId;
      }
    }
    // HO Accountants and Admins/Presidents see all financial data (no restriction)

    if (reportType === 'expense') {
      await generateExpenseReport(filteredData);
    } else {
      await generateCommissionReport(filteredData);
    }
  };

  const handleExportCSV = async () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (reportType === 'expense') {
      await exportExpenseReport(`expense_report_${timestamp}`);
    } else {
      await exportCommissionReport(`commission_report_${timestamp}`);
    }
  };

  const handleExportExcel = async () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (reportType === 'expense') {
      await exportExpenseReportToExcel(`expense_report_${timestamp}`);
    } else {
      await exportCommissionReportToExcel(`commission_report_${timestamp}`);
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
          <div className="mb-4">
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center text-white hover:text-indigo-100"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Financial Reports</h1>
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

        {/* Help/Info Card */}
        <ReportIntroCard
          title={`What is the ${reportType === 'expense' ? 'Expense' : 'Commission'} Report?`}
          description={
            reportType === 'expense'
              ? 'This report provides a comprehensive analysis of all expenses incurred during the recruitment and deployment process, helping you track costs and manage budgets effectively.'
              : 'This report tracks all commission payments earned by agents and branches, showing detailed breakdowns by type, status, and time period.'
          }
          whatYouWillSee={
            reportType === 'expense'
              ? [
                  'Total expense amounts and counts across all categories',
                  'Expense breakdown by status (pending, verified, approved, paid)',
                  'Expense breakdown by type (application fees, medical fees, training, etc.)',
                  'Monthly expense trends to track spending patterns',
                  'Visual charts showing expense distribution',
                ]
              : [
                  'Total commission amounts and transaction counts',
                  'Commission breakdown by status and payment state',
                  'Commission breakdown by type (agent, branch, recruiter)',
                  'Monthly commission trends and payment history',
                  'Visual charts showing commission distribution',
                ]
          }
          whenToUse={
            reportType === 'expense'
              ? 'Use this report to monitor spending, identify cost-saving opportunities, track pending payments, and ensure expenses align with your budget. Perfect for monthly financial reviews and audit preparation.'
              : 'Use this report to track commission payments, verify agent earnings, monitor payment schedules, and analyze commission distribution across your organization.'
          }
          keyMetrics={[
            {
              name: 'Total Amount',
              description: `Sum of all ${reportType === 'expense' ? 'expenses' : 'commissions'} in the selected date range, regardless of status.`,
            },
            {
              name: 'Average Amount',
              description: `Mean ${reportType === 'expense' ? 'expense' : 'commission'} per transaction, useful for budgeting and forecasting.`,
            },
            {
              name: 'Status Breakdown',
              description: `Shows how ${reportType === 'expense' ? 'expenses' : 'commissions'} are distributed across different approval and payment stages.`,
            },
            {
              name: 'Monthly Trend',
              description: `Visualizes ${reportType === 'expense' ? 'spending' : 'earnings'} patterns over time to identify seasonal variations and trends.`,
            },
          ]}
        />

        {/* Report Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmit(handleGenerateReport)} className="space-y-6">
            <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-${reportType === 'commission' ? '4' : '3'} xl:grid-cols-${reportType === 'commission' ? '4' : '5'}`}>
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

              {/* Agent Filter - Only for Commission Report */}
              {reportType === 'commission' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agent
                  </label>
                  <Controller
                    name="agentId"
                    control={control}
                    render={({ field }) => (
                      <SearchableAgentSelect
                        {...field}
                        agents={agents.filter(agent => {
                          // Filter agents based on role
                          if (customClaims?.role?.toLowerCase() === 'branch_manager' && customClaims?.branchId) {
                            return agent.branchId === customClaims.branchId;
                          }
                          return true;
                        })}
                        placeholder="Search agents by name, email..."
                      />
                    )}
                  />
                </div>
              )}

              {/* Branch Filter - Only for Expense Report */}
              {reportType === 'expense' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
                  </label>
                  <Controller
                    name="branchId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                      >
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name || branch.branchName || 'Unknown Branch'}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              )}

              {/* Applicant Filter - Only for Expense Report */}
              {reportType === 'expense' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Applicant
                  </label>
                  <Controller
                    name="applicantId"
                    control={control}
                    render={({ field }) => (
                      <SearchableApplicantSelect
                        {...field}
                        applicants={applicants}
                        placeholder="Search applicants by name, email..."
                      />
                    )}
                  />
                </div>
              )}
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
                <>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-700 hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                    Export to Excel
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Export to CSV
                  </button>
                </>
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
                        <dt className="text-sm font-medium text-gray-500 truncate flex items-center space-x-1">
                          <span>Total Amount</span>
                          <MetricTooltip
                            title="Total Amount"
                            description={`Sum of all ${reportType === 'expense' ? 'expenses' : 'commissions'} in the selected date range, including all statuses (pending, approved, paid, etc.).`}
                            formula={`Total = ${report.summary.count} items × Average Amount`}
                            example="If you have 10 expenses averaging ₱5,000 each, your total would be ₱50,000."
                          />
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

            {/* Detailed Data Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <DocumentChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  {reportType === 'expense' ? 'Expense' : 'Commission'} Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        {reportType === 'expense' ? 'Type' : 'Agent/Branch'}
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Date
                      </th>
                      {reportType === 'expense' && (
                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Description
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {report.data.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-gray-900">
                          {reportType === 'expense'
                            ? EXPENSE_CONFIG[item.expenseType]?.name || item.expenseType
                            : item.agentName || item.branchName || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'paid' || item.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status === 'verified'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                          {(() => {
                            const date = item.expenseDate || item.dateEarned || item.createdAt;
                            if (!date) return 'N/A';

                            // Handle Firestore Timestamp objects
                            const dateObj = date?.toDate ? date.toDate() : new Date(date);
                            return !isNaN(dateObj.getTime())
                              ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                              : 'Invalid Date';
                          })()}
                        </td>
                        {reportType === 'expense' && (
                          <td className="px-3 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.description || '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
