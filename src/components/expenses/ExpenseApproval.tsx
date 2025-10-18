import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { expenseApprovalSchema } from '../../schemas/financial';
import { EXPENSE_CONFIG, type Expense } from '../../types/expense';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';

interface ExpenseApprovalProps {
  expense: Expense;
  onClose: () => void;
}

export const ExpenseApproval: React.FC<ExpenseApprovalProps> = ({
  expense,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { approveExpense, filter, setFilter, fetchExpenses } = useExpenseStore();
  const config = EXPENSE_CONFIG[expense.expenseType];
  const [verifierName, setVerifierName] = React.useState<string>('');

  // Fetch verifier name
  React.useEffect(() => {
    const fetchVerifierName = async () => {
      if (expense.verifiedBy) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', expense.verifiedBy));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setVerifierName(userData.displayName || userData.email || expense.verifiedBy);
          } else {
            setVerifierName(expense.verifiedBy);
          }
        } catch (error) {
          console.error('Error fetching verifier name:', error);
          setVerifierName(expense.verifiedBy);
        }
      }
    };

    fetchVerifierName();
  }, [expense.verifiedBy]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseApprovalSchema),
    defaultValues: {
      expenseId: expense.id,
      status: 'approved' as const,
      notes: '',
      conditions: [],
    },
  });

  const status = watch('status');

  const handleApproval = async (data: any) => {
    try {
      await approveExpense({
        ...data,
        approvedBy: user?.uid || '',
      });
      
      // Clear ONLY the status filter to show the updated expense
      // Keep other filters like branchId, expenseType, etc.
      const { status: _, ...restFilters } = filter;
      setFilter(restFilters);
      
      // Refresh the expenses list
      await fetchExpenses();
      onClose();
    } catch (error) {
      console.error('Failed to approve expense:', error);
      throw error;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Expense Approval
      </h3>

      <div className="mb-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{config.name}</dd>
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
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {verifierName || expense.verifiedBy || 'Not verified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.verifiedAt
                ? new Date(expense.verifiedAt).toLocaleDateString()
                : 'Not verified'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{expense.description}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit(handleApproval)} className="space-y-6">
        {/* Approval Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Approval Status
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
                    value="approved"
                    checked={field.value === 'approved'}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Approve</span>
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

        {/* Approval Conditions */}
        {status === 'approved' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Conditions (Optional)
            </label>
            <Controller
              name="conditions"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  {field.value.map((condition: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={condition.name}
                        onChange={(e) => {
                          const newConditions = [...field.value];
                          newConditions[index] = {
                            ...condition,
                            name: e.target.value,
                          };
                          field.onChange(newConditions);
                        }}
                        placeholder="Condition name"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => {
                          const newConditions = [...field.value];
                          newConditions[index] = {
                            ...condition,
                            value: e.target.value,
                          };
                          field.onChange(newConditions);
                        }}
                        placeholder="Value"
                        className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newConditions = [...field.value];
                          newConditions.splice(index, 1);
                          field.onChange(newConditions);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange([
                        ...field.value,
                        { name: '', value: '' },
                      ]);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    Add Condition
                  </button>
                </div>
              )}
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {status === 'approved' ? 'Approval Notes' : 'Rejection Reason'}
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
                  status === 'approved'
                    ? 'Add any notes or instructions...'
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
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              status === 'approved'
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            } disabled:opacity-50`}
          >
            {isSubmitting
              ? 'Processing...'
              : status === 'approved'
              ? 'Approve Expense'
              : 'Reject Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};
