import React from 'react';
import { Link } from 'react-router-dom';
import { useExpenseStore } from '../../stores/expenseStore';
import { useCommissionStore } from '../../stores/commissionStore';
import { EXPENSE_CONFIG } from '../../types/expense';
import {
  SparklesIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export const FinancialDashboard: React.FC = () => {
  const {
    expenses,
    loading: expenseLoading,
    error: expenseError,
    fetchExpenses,
  } = useExpenseStore();
  const {
    commissions,
    loading: commissionLoading,
    error: commissionError,
    fetchCommissions,
  } = useCommissionStore();

  React.useEffect(() => {
    fetchExpenses();
    fetchCommissions();
  }, [fetchExpenses, fetchCommissions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const calculateSummary = () => {
    const summary = {
      totalExpenses: 0,
      pendingExpenses: 0,
      totalCommissions: 0,
      pendingCommissions: 0,
      expensesByType: {} as { [key: string]: number },
      recentExpenses: expenses.slice(0, 5),
      recentCommissions: commissions.slice(0, 5),
    };

    expenses.forEach((expense) => {
      summary.totalExpenses += expense.amount;
      if (expense.status === 'pending') {
        summary.pendingExpenses += expense.amount;
      }
      summary.expensesByType[expense.expenseType] =
        (summary.expensesByType[expense.expenseType] || 0) + expense.amount;
    });

    commissions.forEach((commission) => {
      summary.totalCommissions += commission.amount;
      if (commission.status === 'pending') {
        summary.pendingCommissions += commission.amount;
      }
    });

    return summary;
  };

  const summary = calculateSummary();

  if (expenseLoading || commissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  if (expenseError || commissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Financial Data
              </h3>
              <p className="text-gray-600 mb-6">
                {expenseError || commissionError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-pulse" />
                  <h1 className="text-xl sm:text-3xl font-bold text-white">
                    Financial Dashboard
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-indigo-100 mt-1">
                  Monitor expenses and commissions in real-time
                </p>
              </div>
              <Link
                to="/reports"
                className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 mb-6 sm:mb-8">
          {/* Total Expenses */}
          <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <BanknotesIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Expenses
              </p>
              <p className="text-base sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
          </div>

          {/* Pending Expenses */}
          <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Pending Expenses
              </p>
              <p className="text-base sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                {formatCurrency(summary.pendingExpenses)}
              </p>
            </div>
          </div>

          {/* Total Commissions */}
          <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <BanknotesIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Commissions
              </p>
              <p className="text-base sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(summary.totalCommissions)}
              </p>
            </div>
          </div>

          {/* Pending Commissions */}
          <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <ArrowTrendingUpIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Pending Commissions
              </p>
              <p className="text-base sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {formatCurrency(summary.pendingCommissions)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                    <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Recent Expenses
                  </h3>
                </div>
                <Link
                  to="/expenses"
                  className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {summary.recentExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent expenses</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {summary.recentExpenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {EXPENSE_CONFIG[expense.expenseType].name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            expense.status === 'pending'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
                              : expense.status === 'verified'
                              ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-300'
                              : expense.status === 'approved'
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300'
                              : expense.status === 'rejected'
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-300'
                              : 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white border-purple-300'
                          }`}
                        >
                          {expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Recent Commissions
                  </h3>
                </div>
                <Link
                  to="/commissions"
                  className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {summary.recentCommissions.length === 0 ? (
                <div className="text-center py-12">
                  <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent commissions</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {summary.recentCommissions.map((commission) => (
                    <li
                      key={commission.id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          Commission
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Agent ID: {commission.agentId}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            commission.status === 'pending'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
                              : commission.status === 'verified'
                              ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-300'
                              : commission.status === 'approved'
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300'
                              : commission.status === 'rejected'
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-300'
                              : 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white border-purple-300'
                          }`}
                        >
                          {commission.status.charAt(0).toUpperCase() +
                            commission.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(commission.amount)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Expenses by Type */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Expenses by Type
                </h3>
              </div>
            </div>
            <div className="p-6">
              {Object.keys(summary.expensesByType).length === 0 ? (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No expense data</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(summary.expensesByType).map(
                    ([type, amount]) => (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-700">
                            {EXPENSE_CONFIG[type as keyof typeof EXPENSE_CONFIG]
                              .name}
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${
                                (amount / summary.totalExpenses) * 100
                              }%`,
                            }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full transition-all duration-500"
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {((amount / summary.totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Commissions Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Commissions Summary
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatCurrency(summary.totalCommissions)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <BanknotesIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Amount</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      {formatCurrency(summary.pendingCommissions)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Count</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {commissions.length}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <ChartBarIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
