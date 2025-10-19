import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseList } from '../../components/expenses/ExpenseList';
import { useAuthStore } from '../../stores/authStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { PlusIcon, SparklesIcon, BanknotesIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const ExpensesPage = () => {
  const navigate = useNavigate();
  const { user, customClaims } = useAuthStore();
  const { expenses, loading, setFilter, filter, fetchExpenses } = useExpenseStore();

  const canCreateExpense = ['admin', 'branch_manager', 'ho_accountant'].includes(
    customClaims?.role || ''
  );

  // Auto-filter by branch for Branch Managers on mount
  useEffect(() => {
    if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
      setFilter({ ...filter, branchId: customClaims.branchId });
    }
  }, [customClaims]);

  useEffect(() => {
    fetchExpenses();
  }, [filter, fetchExpenses]);

  // Calculate stats
  const stats = [
    {
      name: 'Total Expenses',
      value: expenses?.length || 0,
      color: 'from-blue-500 to-blue-600',
      icon: BanknotesIcon,
    },
    {
      name: 'Pending',
      value: expenses?.filter((e) => e.status === 'pending').length || 0,
      color: 'from-yellow-500 to-yellow-600',
      icon: ClockIcon,
    },
    {
      name: 'Approved',
      value: expenses?.filter((e) => e.status === 'approved' || e.status === 'paid').length || 0,
      color: 'from-green-500 to-green-600',
      icon: CheckCircleIcon,
    },
    {
      name: 'Rejected',
      value: expenses?.filter((e) => e.status === 'rejected').length || 0,
      color: 'from-red-500 to-red-600',
      icon: XCircleIcon,
    },
  ];

  const totalAmount = expenses?.reduce((sum, expense) => {
    if (expense.status === 'approved' || expense.status === 'paid') {
      return sum + expense.amount;
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                <h1 className="text-xl sm:text-3xl font-bold text-white">Expense Management</h1>
              </div>
              <p className="mt-2 text-sm sm:text-base text-indigo-100">
                Track and manage all expenses with approval workflows
              </p>
            </div>
            {canCreateExpense && (
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => navigate('/expenses/new')}
                  className="group relative inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  New Expense
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-4 sm:px-4 sm:py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <dt className="flex items-center space-x-2 truncate text-xs sm:text-sm font-medium text-indigo-100">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{stat.name}</span>
                  </dt>
                  <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                  <div
                    className={`absolute -right-4 -bottom-4 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`}
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
                <BanknotesIcon className="h-12 w-12 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <ExpenseList />
      </div>
    </div>
  );
};
