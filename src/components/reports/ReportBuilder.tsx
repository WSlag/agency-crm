import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema } from '../../schemas/report';
import { useReportStore } from '../../stores/reportStore';
import { useAuthStore } from '../../stores/authStore';
import type { ReportType, ReportFormat, ReportFilter } from '../../types/report';

interface ReportBuilderProps {
  onGenerate?: (reportId: string) => void;
  onCancel?: () => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  onGenerate,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const { generateReport, loading, error } = useReportStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: '',
      type: 'applicant' as ReportType,
      format: 'pdf' as ReportFormat,
      filters: {} as ReportFilter,
    },
  });

  const reportType = watch('type');

  const handleGenerate = async (data: any) => {
    try {
      const reportId = await generateReport(
        data.name,
        data.type,
        data.format,
        data.filters
      );
      onGenerate?.(reportId);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
      {/* Report Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Report Name
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              {...field}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter report name"
            />
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Report Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Report Type
        </label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="applicant">Applicant Report</option>
              <option value="commission">Commission Report</option>
              <option value="expense">Expense Report</option>
              <option value="deployment">Deployment Report</option>
              <option value="transfer">Transfer Report</option>
              <option value="agent">Agent Report</option>
              <option value="branch">Branch Report</option>
              <option value="officer">Officer Report</option>
            </select>
          )}
        />
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">
            {errors.type.message as string}
          </p>
        )}
      </div>

      {/* Report Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Report Format
        </label>
        <Controller
          name="format"
          control={control}
          render={({ field }) => (
            <div className="mt-1 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...field}
                  value="pdf"
                  checked={field.value === 'pdf'}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">PDF</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...field}
                  value="excel"
                  checked={field.value === 'excel'}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Excel</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...field}
                  value="csv"
                  checked={field.value === 'csv'}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">CSV</span>
              </label>
            </div>
          )}
        />
        {errors.format && (
          <p className="mt-1 text-sm text-red-600">
            {errors.format.message as string}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>

        {/* Date Range */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Controller
              name="filters.startDate"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  value={field.value?.toISOString().split('T')[0] || ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <Controller
              name="filters.endDate"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  value={field.value?.toISOString().split('T')[0] || ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              )}
            />
          </div>
        </div>

        {/* Branch Filter */}
        {user?.role === 'admin' || user?.role === 'president' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <Controller
              name="filters.branchId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Branches</option>
                  {/* Add branch options here */}
                </select>
              )}
            />
          </div>
        ) : null}

        {/* Agent Filter */}
        {reportType === 'commission' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Agent
            </label>
            <Controller
              name="filters.agentId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Agents</option>
                  {/* Add agent options here */}
                </select>
              )}
            />
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <Controller
            name="filters.status"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            )}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </form>
  );
};
