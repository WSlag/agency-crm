import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseVerificationSchema } from '../../schemas/financial';
import { EXPENSE_CONFIG, type Expense } from '../../types/expense';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';

interface ExpenseVerificationProps {
  expense: Expense;
  onClose: () => void;
}

export const ExpenseVerification: React.FC<ExpenseVerificationProps> = ({
  expense,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { verifyExpense, rejectExpense, filter, setFilter, fetchExpenses } = useExpenseStore();
  const config = EXPENSE_CONFIG[expense.expenseType];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseVerificationSchema),
    defaultValues: {
      expenseId: expense.id,
      status: 'verified' as const,
      notes: '',
      checklistItems: config.verificationChecklist.map((item, index) => ({
        id: `check_${index}`,
        name: item,
        checked: false,
        notes: '',
      })),
    },
  });

  const status = watch('status');
  const checklistItems = watch('checklistItems');
  const allChecked = checklistItems?.every((item) => item.checked);

  const handleVerification = async (data: any) => {
    try {
      if (status === 'verified') {
        await verifyExpense({
          ...data,
          verifiedBy: user?.uid || '',
        });
      } else {
        await rejectExpense(expense.id, data.notes);
      }
      
      // Clear ONLY the status filter to show the updated expense
      // Keep other filters like branchId, expenseType, etc.
      const { status: _, ...restFilters } = filter;
      setFilter(restFilters);
      
      // Refresh the expenses list
      await fetchExpenses();
      onClose();
    } catch (error) {
      console.error('Failed to verify expense:', error);
      throw error;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Expense Verification
      </h3>

      <div className="mb-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: expense.currency,
              }).format(expense.amount)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.description}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit(handleVerification)} className="space-y-6">
        {/* Verification Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Verification Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="verified"
                    checked={field.value === 'verified'}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Verify</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="rejected"
                    checked={field.value === 'rejected'}
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Reject</span>
                </label>
              </div>
            )}
          />
        </div>

        {/* Verification Checklist */}
        {status === 'verified' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Verification Checklist
            </h4>
            <div className="space-y-3">
              <Controller
                name="checklistItems"
                control={control}
                render={({ field }) => (
                  <>
                    {field.value.map((item: any, index: number) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => {
                            const newItems = [...field.value];
                            newItems[index] = {
                              ...item,
                              checked: e.target.checked,
                            };
                            field.onChange(newItems);
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                        />
                        <div className="flex-1">
                          <label className="block text-sm text-gray-700">
                            {item.name}
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => {
                              const newItems = [...field.value];
                              newItems[index] = {
                                ...item,
                                notes: e.target.value,
                              };
                              field.onChange(newItems);
                            }}
                            placeholder="Add notes (optional)"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.checklistItems && (
              <p className="mt-1 text-sm text-red-600">
                {errors.checklistItems.message as string}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {status === 'verified' ? 'Additional Notes' : 'Rejection Reason'}
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={
                  status === 'verified'
                    ? 'Add any additional notes...'
                    : 'Provide reason for rejection...'
                }
              />
            )}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.notes.message as string}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (status === 'verified' && !allChecked)}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              status === 'verified'
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            } disabled:opacity-50`}
          >
            {isSubmitting
              ? 'Processing...'
              : status === 'verified'
              ? 'Verify Expense'
              : 'Reject Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};
