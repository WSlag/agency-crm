import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commissionSchema } from '../../schemas/financial';
import { COMMISSION_CONFIG, type Commission } from '../../types/commission';
import { useCommissionStore } from '../../stores/commissionStore';
import { useAuthStore } from '../../stores/authStore';
import { CommissionCalculator } from './CommissionCalculator';
import { 
  BanknotesIcon, 
  UserIcon, 
  DocumentTextIcon,
  CalculatorIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

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
    <div className="space-y-6">
      {/* Commission Calculator Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <CalculatorIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Calculate Commission</h3>
        </div>
        <CommissionCalculator onCalculate={handleCalculatorResult} />
      </div>

      {/* Commission Request Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6"
      >
        <div className="flex items-center space-x-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Commission Request Details</h3>
        </div>

        {/* Agent Selection */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
            Agent
          </label>
          <Controller
            name="agentId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                <option value="">Select Agent</option>
                {/* TODO: Add agent options from context/store */}
              </select>
            )}
          />
          {errors.agentId && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.agentId.message as string}
            </p>
          )}
        </div>

        {/* Applicant Selection */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
            Applicant
          </label>
          <Controller
            name="applicantId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                <option value="">Select Applicant</option>
                {/* TODO: Add applicant options from context/store */}
              </select>
            )}
          />
          {errors.applicantId && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.applicantId.message as string}
            </p>
          )}
        </div>

        {/* Metadata Section */}
        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <InformationCircleIcon className="h-5 w-5 text-indigo-600" />
            <h4 className="text-sm font-semibold text-gray-700">Additional Information</h4>
          </div>

          {/* Job Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Category
            </label>
            <Controller
              name="metadata.jobCategory"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  placeholder="Enter job category"
                />
              )}
            />
          </div>

          {/* Employer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employer Name
            </label>
            <Controller
              name="metadata.employerName"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  placeholder="Enter employer name"
                />
              )}
            />
          </div>

          {/* Contract Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  placeholder="0"
                  min={0}
                />
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                placeholder="Add any additional notes..."
              />
            )}
          />
          {errors.notes && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.notes.message as string}
            </p>
          )}
        </div>

        {/* Calculation Summary */}
        {calculatedResult && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
            <div className="flex items-center space-x-2 mb-4">
              <BanknotesIcon className="h-6 w-6 text-indigo-600" />
              <h4 className="text-lg font-bold text-gray-900">Commission Summary</h4>
            </div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <dt className="text-sm font-medium text-gray-600">Base Amount</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(calculatedResult.baseAmount)}
                </dd>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <dt className="text-sm font-medium text-gray-600">
                  Bonus Amount
                </dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(calculatedResult.bonusAmount)}
                </dd>
              </div>
              <div className="sm:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-4 shadow-lg">
                <dt className="text-sm font-medium text-indigo-100">
                  Total Commission
                </dt>
                <dd className="mt-1 text-3xl font-bold text-white">
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
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !calculatedResult}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : initialData ? (
              'Update Request'
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
