import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commissionSchema } from '../../schemas/financial';
import { COMMISSION_CONFIG, type Commission } from '../../types/commission';
import { useCommissionStore } from '../../stores/commissionStore';
import { useAuthStore } from '../../stores/authStore';
import { CommissionCalculator } from './CommissionCalculator';

interface CommissionRequestFormProps {
  initialData?: Partial<Commission>;
  onSubmit: (data: Partial<Commission>) => Promise<void>;
  onCancel: () => void;
}

export const CommissionRequestForm: React.FC<CommissionRequestFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const [calculatedResult, setCalculatedResult] = React.useState<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      ...initialData,
      branchId: initialData?.branchId || user?.branchId || '',
      currency: initialData?.currency || 'PHP',
    },
  });

  const commissionType = watch('commissionType');
  const config = COMMISSION_CONFIG[commissionType];

  const handleCalculatorResult = (result: any) => {
    setCalculatedResult(result);
    setValue('baseAmount', result.baseAmount);
    setValue('bonusAmount', result.bonusAmount);
    setValue('totalAmount', result.totalAmount);
    setValue('calculationDetails', result.calculationDetails);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (!calculatedResult) {
        throw new Error('Please calculate the commission first');
      }
      await onSubmit({
        ...data,
        requestedBy: user?.uid || '',
        requestedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to submit commission request:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Commission Calculator */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Calculate Commission
        </h4>
        <CommissionCalculator onCalculate={handleCalculatorResult} />
      </div>

      {/* Commission Request Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-white p-6 rounded-lg shadow space-y-6"
      >
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Commission Request Details
        </h4>

        {/* Agent Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Agent
          </label>
          <Controller
            name="agentId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Agent</option>
                {/* TODO: Add agent options from context/store */}
              </select>
            )}
          />
          {errors.agentId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.agentId.message as string}
            </p>
          )}
        </div>

        {/* Applicant Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Applicant
          </label>
          <Controller
            name="applicantId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Applicant</option>
                {/* TODO: Add applicant options from context/store */}
              </select>
            )}
          />
          {errors.applicantId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.applicantId.message as string}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">
            Additional Information
          </h5>

          {/* Job Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Category
            </label>
            <Controller
              name="metadata.jobCategory"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter job category"
                />
              )}
            />
          </div>

          {/* Employer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employer Name
            </label>
            <Controller
              name="metadata.employerName"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter employer name"
                />
              )}
            />
          </div>

          {/* Contract Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract Duration (months)
            </label>
            <Controller
              name="metadata.contractDuration"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0"
                  min={0}
                />
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Add any additional notes..."
              />
            )}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.notes.message as string}
            </p>
          )}
        </div>

        {/* Calculation Summary */}
        {calculatedResult && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Commission Summary
            </h5>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Base Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(calculatedResult.baseAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Bonus Amount
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(calculatedResult.bonusAmount)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Total Commission
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(calculatedResult.totalAmount)}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !calculatedResult}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Submitting...'
              : initialData
              ? 'Update Request'
              : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};
