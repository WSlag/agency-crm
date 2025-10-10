import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COMMISSION_CONFIG } from '../../types/commission';
import { useCommissionCalculator } from '../../hooks/useCommissionCalculator';

const calculatorSchema = z.object({
  commissionType: z.enum(Object.keys(COMMISSION_CONFIG) as [keyof typeof COMMISSION_CONFIG, ...Array<keyof typeof COMMISSION_CONFIG>]),
  baseAmount: z.number().min(0, 'Base amount must be greater than 0'),
  applicantCount: z.number().min(0).optional(),
  placementDays: z.number().min(0).optional(),
  salary: z.number().min(0).optional(),
  retentionMonths: z.number().min(0).optional(),
  referralCount: z.number().min(0).optional(),
  jobCategory: z.string().optional(),
  employerName: z.string().optional(),
  contractDuration: z.number().min(0).optional(),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

interface CommissionCalculatorProps {
  onCalculate?: (result: any) => void;
}

export const CommissionCalculator: React.FC<CommissionCalculatorProps> = ({
  onCalculate,
}) => {
  const {
    calculate,
    validateData,
    getCalculationSummary,
    result,
    loading,
    error,
  } = useCommissionCalculator();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      commissionType: 'recruitment',
      baseAmount: 0,
    },
  });

  const commissionType = watch('commissionType');
  const config = COMMISSION_CONFIG[commissionType];

  const handleCalculate = (data: CalculatorFormData) => {
    const metadata = {
      applicantCount: data.applicantCount,
      placementDays: data.placementDays,
      salary: data.salary,
      retentionMonths: data.retentionMonths,
      referralCount: data.referralCount,
      jobCategory: data.jobCategory,
      employerName: data.employerName,
      contractDuration: data.contractDuration,
    };

    calculate(data.commissionType, data.baseAmount, metadata);

    if (onCalculate && result) {
      onCalculate(result);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Commission Calculator
      </h3>

      <form onSubmit={handleSubmit(handleCalculate)} className="space-y-6">
        {/* Commission Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Commission Type
          </label>
          <Controller
            name="commissionType"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.entries(COMMISSION_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.commissionType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.commissionType.message}
            </p>
          )}
        </div>

        {/* Base Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Base Amount
          </label>
          <Controller
            name="baseAmount"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
                min={0}
                step={0.01}
              />
            )}
          />
          {errors.baseAmount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.baseAmount.message}
            </p>
          )}
        </div>

        {/* Dynamic Fields based on Commission Type */}
        {commissionType === 'recruitment' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Applicant Count
              </label>
              <Controller
                name="applicantCount"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Placement Days
              </label>
              <Controller
                name="placementDays"
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
          </>
        )}

        {commissionType === 'retention' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Retention Months
              </label>
              <Controller
                name="retentionMonths"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary
              </label>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </div>
          </>
        )}

        {commissionType === 'referral' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Referral Count
            </label>
            <Controller
              name="referralCount"
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
        )}

        {/* Calculate Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Commission'}
          </button>
        </div>
      </form>

      {/* Results */}
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
      )}

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Calculation Results
          </h4>
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
            {getCalculationSummary()}
          </pre>
        </div>
      )}
    </div>
  );
};
