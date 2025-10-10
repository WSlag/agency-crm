import React from 'react';
import { Link } from 'react-router-dom';
import { ExpenseList } from '../../components/expenses/ExpenseList';
import { useAuthStore } from '../../stores/authStore';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuthStore();

  const canCreateExpense = ['admin', 'branch_manager', 'ho_accountant'].includes(
    user?.role || ''
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Expenses
            </h2>
          </div>
          {canCreateExpense && (
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <Link
                to="/expenses/new"
                className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                    clipRule="evenodd"
                  />
                </svg>
                New Expense
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
};
