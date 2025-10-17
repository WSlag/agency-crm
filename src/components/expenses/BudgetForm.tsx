import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '../../stores/budgetStore';
import { useAuth } from '../../contexts/AuthContext';
import { useBranchStore } from '../../stores/branchStore';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { BudgetCategory, BudgetPeriod, Currency } from '../../types/budget';

const budgetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  branchId: z.string().min(1, 'Branch is required'),
  category: z.enum(['branch', 'department', 'project', 'applicant', 'general']),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  allocatedAmount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.enum(['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']).default('PHP'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { createBudget } = useBudgetStore();
  const { branches } = useBranchStore();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      currency: 'PHP',
      category: 'branch',
      period: 'monthly',
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    if (!user) return;

    try {
      setSubmitting(true);
      await createBudget(
        {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
        user.uid,
        user.displayName || user.email || 'Unknown User'
      );
      onSuccess();
    } catch (error) {
      console.error('Failed to create budget:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500" onClick={onClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create Budget</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea {...register('description')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <select {...register('branchId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      <option value="">Select Branch</option>
                      {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                    {errors.branchId && <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select {...register('category')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      <option value="branch">Branch</option>
                      <option value="department">Department</option>
                      <option value="project">Project</option>
                      <option value="applicant">Applicant</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Period</label>
                    <select {...register('period')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select {...register('currency')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      <option value="PHP">PHP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allocated Amount</label>
                    <input type="number" step="0.01" {...register('allocatedAmount', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.allocatedAmount && <p className="mt-1 text-sm text-red-600">{errors.allocatedAmount.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" {...register('startDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" {...register('endDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                    {submitting ? 'Creating...' : 'Create Budget'}
                  </button>
                  <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

