import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBudgetStore } from '../../stores/budgetStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  BanknotesIcon,
  PlusIcon,
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { BudgetForm } from '../../components/expenses/BudgetForm';
import type { Budget } from '../../types/budget';

export const BudgetManagement = () => {
  const { user } = useAuth();
  const { budgets, loading, error, stats, fetchBudgets, fetchBudgetStats } = useBudgetStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchBudgetStats();
  }, [fetchBudgets, fetchBudgetStats]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 90) return 'bg-orange-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Active
        </span>;
      case 'depleted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          Depleted
        </span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Expired
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <BanknotesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Budget Management</h1>
              </div>
              <p className="mt-2 text-green-100">
                Monitor and manage organizational budgets
              </p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Budget
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Budgets</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <ChartBarIcon className="h-12 w-12 text-indigo-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Allocated</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₱{stats.totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <BanknotesIcon className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₱{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <BanknotesIcon className="h-12 w-12 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₱{stats.totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <BanknotesIcon className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>
          )}

          {/* Budgets List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Budgets</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading budgets...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <XCircleIcon className="h-12 w-12 text-red-400 mx-auto" />
                <p className="mt-2 text-sm text-red-600">{error}</p>
              </div>
            ) : budgets.length === 0 ? (
              <div className="p-12 text-center">
                <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new budget.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {budgets.map((budget) => {
                  const percentage = (budget.spentAmount / budget.allocatedAmount) * 100;
                  return (
                    <div key={budget.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                            {getStatusBadge(budget.status)}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {budget.category}
                            </span>
                          </div>
                          
                          {budget.description && (
                            <p className="mt-1 text-sm text-gray-600">{budget.description}</p>
                          )}

                          <div className="mt-4 grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Allocated</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {budget.currency} {budget.allocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Spent</p>
                              <p className="text-sm font-semibold text-orange-600">
                                {budget.currency} {budget.spentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Remaining</p>
                              <p className="text-sm font-semibold text-green-600">
                                {budget.currency} {budget.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Budget Usage</span>
                              <span className="text-xs font-semibold text-gray-900">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>Period: {budget.period}</span>
                            <span>•</span>
                            <span>
                              {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Budget Dialog */}
      {showCreateDialog && (
        <BudgetForm
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchBudgets();
            fetchBudgetStats();
          }}
        />
      )}
    </div>
  );
};

