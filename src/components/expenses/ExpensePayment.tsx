import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Expense } from '../../types/expense';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import {
  XMarkIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const expensePaymentSchema = z.object({
  expenseId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check']),
  paymentReference: z.string().optional(),
  paidBy: z.string(),
  notes: z.string().optional(),
});

type ExpensePaymentFormData = z.infer<typeof expensePaymentSchema>;

interface ExpensePaymentProps {
  expense: Expense;
  onClose: () => void;
}

export const ExpensePayment: React.FC<ExpensePaymentProps> = ({
  expense,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { recordPayment, fetchExpenseById } = useExpenseStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpensePaymentFormData>({
    resolver: zodResolver(expensePaymentSchema),
    defaultValues: {
      expenseId: expense.id,
      amount: expense.amount,
      currency: expense.currency,
      paymentMethod: 'bank_transfer',
      paymentReference: '',
      paidBy: user?.uid || '',
      notes: '',
    },
  });

  const onSubmit = async (data: ExpensePaymentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await recordPayment(data);
      
      // Refresh the expense data
      if (expense.id) {
        await fetchExpenseById(expense.id);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
            <p className="text-sm text-gray-500 mt-1">Record payment for this expense</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Payment Summary */}
      <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Expense Amount:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ₱{expense.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white border-2 border-green-300">
              Approved
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Amount (Read-only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₱</span>
            </div>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="block w-full rounded-lg border-2 border-gray-300 pl-8 pr-4 py-3 bg-gray-50 text-gray-700 font-semibold focus:border-indigo-500 focus:ring-indigo-500"
              readOnly
            />
          </div>
          {errors.amount && (
            <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <select
            {...register('paymentMethod')}
            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
          </select>
          {errors.paymentMethod && (
            <p className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* Payment Reference */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Reference / Receipt No.
          </label>
          <input
            type="text"
            {...register('paymentReference')}
            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
            placeholder="OR-12345, Check #123, etc."
          />
          {errors.paymentReference && (
            <p className="mt-2 text-sm text-red-600">{errors.paymentReference.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
            placeholder="Add any additional notes about this payment..."
          />
          {errors.notes && (
            <p className="mt-2 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

