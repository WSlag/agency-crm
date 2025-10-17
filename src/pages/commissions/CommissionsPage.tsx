import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommissionStore } from '../../stores/commissionStore';
import { useAuthStore } from '../../stores/authStore';
import { COMMISSION_CONFIG, type Commission, type CommissionType, type CommissionStatus } from '../../types/commission';
import { 
  PlusIcon, 
  SparklesIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export const CommissionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    commissions,
    loading,
    error,
    filter,
    sort,
    pagination,
    setFilter,
    setSort,
    setPagination,
    fetchCommissions,
  } = useCommissionStore();

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const canCreateCommission = ['admin', 'branch_manager', 'ho_accountant'].includes(
    user?.role || ''
  );

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

  const handleSortChange = (field: keyof Commission) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field, direction: newDirection });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    if (!date) return '—';
    
    // Create a Date object and check if it's valid
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '—';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const getStatusBadgeColor = (status: Commission['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'verified':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'partially_paid':
        return 'bg-gradient-to-r from-orange-100 to-amber-200 text-orange-800 border-orange-300';
      case 'paid':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const renderSortIcon = (field: keyof Commission) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    );
  };

  // Calculate stats
  const stats = [
    {
      name: 'Total Commissions',
      value: commissions?.length || 0,
      color: 'from-blue-500 to-blue-600',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Pending',
      value: commissions?.filter((c) => c.status === 'pending').length || 0,
      color: 'from-yellow-500 to-yellow-600',
      icon: ClockIcon,
    },
    {
      name: 'Approved',
      value: commissions?.filter((c) => c.status === 'approved' || c.status === 'paid').length || 0,
      color: 'from-green-500 to-green-600',
      icon: CheckCircleIcon,
    },
    {
      name: 'Rejected',
      value: commissions?.filter((c) => c.status === 'rejected').length || 0,
      color: 'from-red-500 to-red-600',
      icon: XCircleIcon,
    },
  ];

  const totalAmount = commissions?.reduce((sum, commission) => {
    if (commission.status === 'approved' || commission.status === 'paid') {
      return sum + (commission.amount || 0);
    }
    return sum;
  }, 0) || 0;

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
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Commission Management</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Track and manage agent commissions with approval workflows
              </p>
            </div>
            {canCreateCommission && (
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => navigate('/commissions/request')}
                  className="group relative inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  New Commission
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                    <Icon className="h-5 w-5" />
                    <span>{stat.name}</span>
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                  <div
                    className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Total Amount Card */}
          <div className="mt-4">
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-100">Total Approved Amount</p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    ₱{totalAmount.toLocaleString()}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-12 w-12 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="space-y-6">
          {/* Horizontal Filters */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Commission Type */}
              <div>
                <label htmlFor="commissionType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Commission Type
                </label>
                <select
                  id="commissionType"
                  value={filter.commissionType || ''}
                  onChange={(e) => handleFilterChange('commissionType', e.target.value || undefined as CommissionType | undefined)}
                  className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                >
                  <option value="">All Types</option>
                  {Object.entries(COMMISSION_CONFIG).map(([key, config]) => (
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
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined as CommissionStatus | undefined)}
                  className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="partially_paid">Partially Paid</option>
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
                <p className="mt-4 text-gray-600 font-medium">Loading commissions...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th
                          scope="col"
                          className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange('createdAt')}
                        >
                          <div className="flex items-center hover:text-indigo-600 transition-colors">
                            Date
                            {renderSortIcon('createdAt')}
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
                          Agent
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
                      {commissions.map((commission) => (
                        <tr
                          key={commission.id}
                          className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                        >
                          <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                            {formatDate(commission.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                            {COMMISSION_CONFIG[commission.commissionType]?.name || commission.commissionType || 'Unknown'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(commission.amount || 0, commission.currency || 'PHP')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                            {commission.agentId || '—'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadgeColor(
                                commission.status
                              )} shadow-sm`}
                            >
                              {commission.status ? commission.status.charAt(0).toUpperCase() + commission.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => navigate(`/commissions/${commission.id}`)}
                                className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View
                              </button>
                              {commission.status === 'pending' && commission.requestedBy === user?.uid && (
                                <button
                                  onClick={() => navigate(`/commissions/${commission.id}/edit`)}
                                  className="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!commissions?.length && !loading && (
                        <tr>
                          <td colSpan={6} className="px-3 py-16 text-center text-gray-500">
                            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-lg font-medium text-gray-900">No commissions found</p>
                            <p className="text-sm mt-2 text-gray-600">
                              Try adjusting your filters or add a new commission
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
      </div>
    </div>
  );
};
