import { Link } from 'react-router-dom';
import { useExpenseStore } from '../../stores/expenseStore';
import { EXPENSE_CONFIG, type Expense, type ExpenseType, type ExpenseStatus } from '../../types/expense';
import { useAuthStore } from '../../stores/authStore';
import { SparklesIcon, BanknotesIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

interface ExpenseListProps {
  expenses?: any[];
  loadingNames?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses: propExpenses, 
  loadingNames 
}) => {
  const { user } = useAuthStore();
  const {
    expenses: storeExpenses,
    loading,
    error,
    filter,
    sort,
    pagination,
    setFilter,
    setSort,
    setPagination,
  } = useExpenseStore();
  
  // Use prop expenses if provided (for search with names), otherwise use store expenses
  const expenses = propExpenses || storeExpenses;

  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    const newFilters = { ...filter };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value as any;
    }
    setFilter(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSortChange = (field: keyof Expense) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field, direction: newDirection });
  };

  const formatCurrency = (amount: number, currency: string = 'PHP') => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency || 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadgeColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'verified':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'paid':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const renderSortIcon = (field: keyof Expense) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    );
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Expense Type */}
          <div>
            <label htmlFor="expenseType" className="block text-sm font-semibold text-gray-700 mb-2">
              Expense Type
            </label>
            <select
              id="expenseType"
              value={filter.expenseType || ''}
              onChange={(e) => handleFilterChange('expenseType', e.target.value || undefined as ExpenseType | undefined)}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
            >
              <option value="">All Types</option>
              {Object.entries(EXPENSE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={filter.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined as ExpenseStatus | undefined)}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filter.dateRange?.start?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                handleFilterChange('dateRange', {
                  start: e.target.value ? new Date(e.target.value) : undefined,
                  end: filter.dateRange?.end || new Date(),
                })
              }
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filter.dateRange?.end?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                handleFilterChange('dateRange', {
                  start: filter.dateRange?.start || new Date(),
                  end: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading expenses...</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View - Show on screens < 768px */}
            <div className="md:hidden p-4 space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                >
                  {/* Header Row - Date and Amount */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-900">
                        {formatDate(expense.expenseDate)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {EXPENSE_CONFIG[expense.expenseType].name}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadgeColor(
                        expense.status
                      )} shadow-sm`}
                    >
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    {expense.status === 'pending' && expense.enteredBy === user?.uid && (
                      <Link
                        to={`/expenses/${expense.id}/edit`}
                        className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Edit expense"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {!expenses?.length && !loading && (
                <div className="text-center py-16 text-gray-500">
                  <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-900">No expenses found</p>
                  <p className="text-sm mt-2 text-gray-600">
                    Try adjusting your filters or add a new expense
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View - Show on screens >= 768px */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('expenseDate')}
                    >
                      <div className="flex items-center hover:text-indigo-600 transition-colors">
                        Date
                        {renderSortIcon('expenseDate')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('amount')}
                    >
                      <div className="flex items-center hover:text-indigo-600 transition-colors">
                        Amount
                        {renderSortIcon('amount')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative py-4 pl-3 pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        {EXPENSE_CONFIG[expense.expenseType].name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadgeColor(
                            expense.status
                          )} shadow-sm`}
                        >
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/expenses/${expense.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          {expense.status === 'pending' && expense.enteredBy === user?.uid && (
                            <Link
                              to={`/expenses/${expense.id}/edit`}
                              className="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!expenses?.length && !loading && (
                    <tr>
                      <td colSpan={5} className="px-3 py-16 text-center text-gray-500">
                        <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-lg font-medium text-gray-900">No expenses found</p>
                        <p className="text-sm mt-2 text-gray-600">
                          Try adjusting your filters or add a new expense
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <nav
              className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4"
              aria-label="Pagination"
            >
              <div className="flex w-0 flex-1">
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  ← Previous
                </button>
              </div>
              <div className="hidden md:flex">
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
              </div>
              <div className="flex w-0 flex-1 justify-end">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  Next →
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
};
