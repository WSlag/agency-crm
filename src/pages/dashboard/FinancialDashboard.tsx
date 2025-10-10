import React from 'react';
import { Link } from 'react-router-dom';
import { useExpenseStore } from '../../stores/expenseStore';
import { useCommissionStore } from '../../stores/commissionStore';
import { useAuthStore } from '../../stores/authStore';
import { EXPENSE_CONFIG } from '../../types/expense';
import { COMMISSION_CONFIG } from '../../types/commission';

export const FinancialDashboard: React.FC = () => {
  const { user } = useAuthStore();
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
    const filter = {
      dateRange: {
        start: new Date(new Date().setDate(1)), // First day of current month
        end: new Date(),
      },
    };
    fetchExpenses();
    fetchCommissions();
  }, [fetchExpenses, fetchCommissions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
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
      commissionsByType: {} as { [key: string]: number },
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
      summary.totalCommissions += commission.totalAmount;
      if (commission.status === 'pending') {
        summary.pendingCommissions += commission.totalAmount;
      }
      summary.commissionsByType[commission.commissionType] =
        (summary.commissionsByType[commission.commissionType] || 0) +
        commission.totalAmount;
    });

    return summary;
  };

  const summary = calculateSummary();

  if (expenseLoading || commissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (expenseError || commissionError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
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
                <div className="mt-2 text-sm text-red-700">
                  {expenseError || commissionError}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Financial Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 space-x-4">
            <Link
              to="/reports"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Reports
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
                      Total Expenses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.totalExpenses)}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Expenses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.pendingExpenses)}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Commissions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.totalCommissions)}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Commissions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary.pendingCommissions)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Expenses */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Expenses
                </h3>
                <Link
                  to="/expenses"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {summary.recentExpenses.map((expense) => (
                    <li key={expense.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {EXPENSE_CONFIG[expense.expenseType].name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              expense.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : expense.status === 'verified'
                                ? 'bg-blue-100 text-blue-800'
                                : expense.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : expense.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {expense.status.charAt(0).toUpperCase() +
                              expense.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Commissions
                </h3>
                <Link
                  to="/commissions"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {summary.recentCommissions.map((commission) => (
                    <li key={commission.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {
                              COMMISSION_CONFIG[commission.commissionType]
                                .name
                            }
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Agent ID: {commission.agentId}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              commission.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : commission.status === 'verified'
                                ? 'bg-blue-100 text-blue-800'
                                : commission.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : commission.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {commission.status.charAt(0).toUpperCase() +
                              commission.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(commission.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Expenses by Type */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Expenses by Type
              </h3>
              <div className="space-y-4">
                {Object.entries(summary.expensesByType).map(
                  ([type, amount]) => (
                    <div key={type} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {EXPENSE_CONFIG[type as keyof typeof EXPENSE_CONFIG]
                              .name}
                          </p>
                          <p className="ml-auto text-sm font-medium text-gray-900">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                        <div className="mt-1 relative">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{
                                width: `${
                                  (amount / summary.totalExpenses) * 100
                                }%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Commissions by Type */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Commissions by Type
              </h3>
              <div className="space-y-4">
                {Object.entries(summary.commissionsByType).map(
                  ([type, amount]) => (
                    <div key={type} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {
                              COMMISSION_CONFIG[
                                type as keyof typeof COMMISSION_CONFIG
                              ].name
                            }
                          </p>
                          <p className="ml-auto text-sm font-medium text-gray-900">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                        <div className="mt-1 relative">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{
                                width: `${
                                  (amount / summary.totalCommissions) * 100
                                }%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
