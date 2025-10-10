import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExpenseForm } from '../../components/expenses/ExpenseForm';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import type { Expense } from '../../types/expense';

export const ExpenseEntry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    selectedExpense,
    loading,
    error,
    fetchExpenseById,
    createExpense,
    updateExpense,
  } = useExpenseStore();

  React.useEffect(() => {
    if (id) {
      fetchExpenseById(id);
    }
  }, [id, fetchExpenseById]);

  const handleSubmit = async (data: Partial<Expense>) => {
    try {
      if (id) {
        await updateExpense(id, data);
      } else {
        const newExpenseData = {
          ...data,
          enteredBy: user?.uid || '',
          branchId: user?.branchId || '',
        };
        await createExpense(newExpenseData as Omit<Expense, 'id' | 'status' | 'createdAt' | 'updatedAt'>);
      }
      navigate('/expenses');
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
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
                <div className="mt-2 text-sm text-red-700">{error}</div>
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
              {id ? 'Edit Expense' : 'New Expense'}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <ExpenseForm
            initialData={id ? selectedExpense : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};
