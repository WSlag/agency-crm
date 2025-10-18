import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExpenseForm } from '../../components/expenses/ExpenseForm';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import type { Expense } from '../../types/expense';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ExpenseEntry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, customClaims } = useAuthStore();
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
          // branchId is already set in the form from customClaims
          branchId: data.branchId || customClaims?.branchId || '',
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/expenses')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Expenses
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
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/expenses')}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all transform hover:scale-110"
              >
                <ArrowLeftIcon className="h-6 w-6 text-white" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
                  <h1 className="text-3xl font-bold text-white">
                    {id ? 'Edit Expense' : 'New Expense'}
                  </h1>
                </div>
                <p className="text-indigo-100 mt-1">
                  {id ? 'Update expense information' : 'Enter new expense details'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
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
