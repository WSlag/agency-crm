import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseList } from '../../components/expenses/ExpenseList';
import { useAuthStore } from '../../stores/authStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { PlusIcon, SparklesIcon, BanknotesIcon, CheckCircleIcon, ClockIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { EXPENSE_CONFIG } from '../../types/expense';

export const ExpensesPage = () => {
  const navigate = useNavigate();
  const { user, customClaims } = useAuthStore();
  const { expenses, loading, setFilter, filter, fetchExpenses } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expensesWithNames, setExpensesWithNames] = useState<any[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);

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

  // Fetch applicant, branch, and user names when expenses change
  useEffect(() => {
    const fetchNames = async () => {
      if (!expenses || expenses.length === 0) {
        setExpensesWithNames([]);
        return;
      }

      setLoadingNames(true);
      try {
        const expensesWithDetails = await Promise.all(
          expenses.map(async (expense) => {
            const expenseWithNames = { ...expense };

            // Fetch applicant name
            if (expense.applicantId) {
              try {
                const applicantDocRef = doc(firestore, 'applicants', expense.applicantId);
                const applicantSnapshot = await getDoc(applicantDocRef);
                if (applicantSnapshot.exists()) {
                  const applicantData = applicantSnapshot.data();
                  expenseWithNames.applicantName = applicantData.fullName || 'Unknown';
                } else {
                  expenseWithNames.applicantName = 'Not Found';
                }
              } catch (err) {
                console.error('Error fetching applicant:', err);
                expenseWithNames.applicantName = 'Error';
              }
            } else {
              expenseWithNames.applicantName = 'N/A';
            }

            // Fetch branch name
            if (expense.branchId) {
              try {
                const branchDocRef = doc(firestore, 'branches', expense.branchId);
                const branchSnapshot = await getDoc(branchDocRef);
                if (branchSnapshot.exists()) {
                  const branchData = branchSnapshot.data();
                  expenseWithNames.branchName = branchData.name || 'Unknown';
                } else {
                  expenseWithNames.branchName = 'Not Found';
                }
              } catch (err) {
                console.error('Error fetching branch:', err);
                expenseWithNames.branchName = 'Error';
              }
            } else {
              expenseWithNames.branchName = 'N/A';
            }

            // Fetch entered by user name
            if (expense.enteredBy) {
              try {
                const userDocRef = doc(firestore, 'users', expense.enteredBy);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  expenseWithNames.enteredByName = userData.displayName || userData.email || 'Unknown';
                } else {
                  expenseWithNames.enteredByName = 'Not Found';
                }
              } catch (err) {
                console.error('Error fetching user:', err);
                expenseWithNames.enteredByName = 'Error';
              }
            } else {
              expenseWithNames.enteredByName = 'N/A';
            }

            return expenseWithNames;
          })
        );

        setExpensesWithNames(expensesWithDetails);
      } catch (error) {
        console.error('Error fetching names:', error);
        setExpensesWithNames(expenses);
      } finally {
        setLoadingNames(false);
      }
    };

    fetchNames();
  }, [expenses]);

  // Enhanced search with names included
  const filteredExpenses = useMemo(() => {
    if (!expensesWithNames || !searchQuery.trim()) return expensesWithNames;
    
    const query = searchQuery.toLowerCase().trim();
    
    return expensesWithNames.filter(expense => {
      // Search across multiple fields including names
      const matchesAmount = expense.amount.toString().includes(query);
      const matchesDescription = expense.description?.toLowerCase().includes(query);
      const matchesReceiptNumber = expense.receiptNumber?.toLowerCase().includes(query);
      const matchesNotes = expense.notes?.toLowerCase().includes(query);
      const matchesStatus = expense.status?.toLowerCase().includes(query);
      const matchesType = EXPENSE_CONFIG[expense.expenseType]?.name.toLowerCase().includes(query);
      
      // Search in names
      const matchesApplicantName = expense.applicantName?.toLowerCase().includes(query);
      const matchesBranchName = expense.branchName?.toLowerCase().includes(query);
      const matchesEnteredByName = expense.enteredByName?.toLowerCase().includes(query);
      
      return matchesAmount || matchesDescription || matchesReceiptNumber || 
             matchesNotes || matchesStatus || matchesType || 
             matchesApplicantName || matchesBranchName || matchesEnteredByName;
    });
  }, [expensesWithNames, searchQuery]);

  // Calculate stats using filtered expenses
  const stats = [
    {
      name: 'Total Expenses',
      value: filteredExpenses?.length || 0,
      color: 'from-blue-500 to-blue-600',
      icon: BanknotesIcon,
    },
    {
      name: 'Pending',
      value: filteredExpenses?.filter((e) => e.status === 'pending').length || 0,
      color: 'from-yellow-500 to-yellow-600',
      icon: ClockIcon,
    },
    {
      name: 'Approved',
      value: filteredExpenses?.filter((e) => e.status === 'approved' || e.status === 'paid').length || 0,
      color: 'from-green-500 to-green-600',
      icon: CheckCircleIcon,
    },
    {
      name: 'Rejected',
      value: filteredExpenses?.filter((e) => e.status === 'rejected').length || 0,
      color: 'from-red-500 to-red-600',
      icon: XCircleIcon,
    },
  ];

  const totalAmount = filteredExpenses?.reduce((sum, expense) => {
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
                    ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <BanknotesIcon className="h-12 w-12 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-300 pl-11 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm sm:leading-6"
              placeholder="🔍 Search by applicant name, branch, entered by, amount, description, receipt number, notes, or status..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold text-indigo-600">{filteredExpenses?.length || 0}</span> expense(s) matching "<span className="font-medium text-gray-900">{searchQuery}</span>"
              </p>
              {loadingNames && (
                <span className="text-xs text-gray-500 flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading names...
                </span>
              )}
            </div>
          )}
        </div>

        <ExpenseList expenses={filteredExpenses} loadingNames={loadingNames} />
      </div>
    </div>
  );
};
